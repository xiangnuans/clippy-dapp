import torch
import torch.nn as nn
import numpy as np
from typing import List, Dict, Tuple
from config import MODEL_CONFIG
from services.deepseek_client import DeepSeekClient

class MultiModalTraceModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.deepseek_client = DeepSeekClient()
        
        # 特征提取层
        self.feature_extractor = nn.Sequential(
            nn.Linear(MODEL_CONFIG["feature_dim"], 512),
            nn.ReLU(),
            nn.Linear(512, 256)
        )
        
        # 异常检测层
        self.anomaly_detector = nn.Sequential(
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 1),
            nn.Sigmoid()
        )
        
        # 元数据特征融合层
        self.metadata_fusion = nn.MultiheadAttention(
            embed_dim=256,
            num_heads=MODEL_CONFIG["num_heads"],
            dropout=MODEL_CONFIG["dropout"]
        )
        
        # 初始化权重
        self._init_weights()
        
    def _init_weights(self):
        """初始化模型权重"""
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_uniform_(m.weight)
                if m.bias is not None:
                    nn.init.zeros_(m.bias)
    
    def extract_features(self, text: str) -> torch.Tensor:
        """使用DeepSeek API提取文本特征"""
        analysis = self.deepseek_client.analyze_text(text)
        features = torch.tensor(analysis["features"], dtype=torch.float32)
        return self.feature_extractor(features)
    
    def detect_anomalies(self, features: torch.Tensor) -> torch.Tensor:
        """检测异常引用"""
        return self.anomaly_detector(features)
    
    def extract_metadata_features(self, metadata: Dict) -> torch.Tensor:
        """提取元数据特征"""
        # 创建固定大小的元数据特征向量
        metadata_features = torch.zeros(1, 256)  # 使用与文本特征相同的维度
        
        # 将元数据值转换为数值特征
        for i, (key, value) in enumerate(metadata.items()):
            if i >= 256:  # 防止超出特征维度
                break
                
            if isinstance(value, (int, float)):
                # 数值类型直接使用，但要归一化
                metadata_features[0, i] = float(value) / 1e6  # 简单归一化
            elif isinstance(value, str):
                # 字符串类型转换为数值特征
                metadata_features[0, i] = (
                    len(value) / 100.0 +  # 长度特征
                    len(set(value)) / 100.0  # 唯一字符数特征
                ) / 2.0  # 归一化
            else:
                # 其他类型设为0
                metadata_features[0, i] = 0.0
        
        return metadata_features
    
    def fuse_metadata(self, text_features: torch.Tensor, metadata_features: torch.Tensor) -> torch.Tensor:
        """融合元数据特征"""
        fused_features, _ = self.metadata_fusion(
            text_features.unsqueeze(0),
            metadata_features.unsqueeze(0),
            metadata_features.unsqueeze(0)
        )
        return fused_features.squeeze(0)
    
    def compute_bleu_score(self, text: str) -> float:
        """使用DeepSeek API计算BLEU分数"""
        analysis = self.deepseek_client.analyze_text(text)
        return analysis["bleu_score"]
    
    def forward(self, text: str, metadata: Dict) -> Dict[str, torch.Tensor]:
        # 提取文本特征
        text_features = self.extract_features(text)
        
        # 提取元数据特征
        metadata_features = self.extract_metadata_features(metadata)
        
        # 融合特征
        fused_features = self.fuse_metadata(text_features, metadata_features)
        
        # 检测异常
        anomaly_score = self.detect_anomalies(fused_features)
        
        # 计算BLEU分数
        bleu_score = self.compute_bleu_score(text)
        
        return {
            "anomaly_score": anomaly_score,
            "bleu_score": bleu_score,
            "details": {
                "text_features": text_features,
                "metadata_features": metadata_features,
                "fused_features": fused_features
            }
        }