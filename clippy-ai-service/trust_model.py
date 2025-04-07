import torch
import torch.nn as nn
import numpy as np
from typing import Dict, List
from config import MODEL_CONFIG

class AHINTrustModel(nn.Module):
    def __init__(self, input_dim: int = 256, hidden_dim: int = 256):  # 修改默认hidden_dim为256
        super().__init__()
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        
        # 动态信任计算层
        self.trust_layer = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, 1),
            nn.Sigmoid()
        )
        
        # 多模态特征融合层
        self.fusion_layer = nn.MultiheadAttention(
            embed_dim=hidden_dim,  # 使用与输入维度相同的hidden_dim
            num_heads=MODEL_CONFIG["num_heads"],
            dropout=MODEL_CONFIG["dropout"]
        )
        
        # 伦理指标评估层
        self.ethics_layer = nn.Sequential(
            nn.Linear(hidden_dim, 4),  # 4个伦理维度
            nn.Sigmoid()
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
    
    def compute_chain_rank(self, features: torch.Tensor) -> torch.Tensor:
        """计算ChainRank分数"""
        return self.trust_layer(features)
    
    def compute_dp_score(self, features: torch.Tensor) -> torch.Tensor:
        """计算差分隐私分数"""
        return torch.mean(torch.abs(features), dim=1)
    
    def compute_fraud_flag(self, features: torch.Tensor) -> torch.Tensor:
        """计算欺诈标志"""
        return torch.max(features, dim=1)[0]
    
    def forward(self, features: torch.Tensor) -> Dict[str, torch.Tensor]:
        # 动态信任值计算
        chain_rank = self.compute_chain_rank(features)
        dp_score = self.compute_dp_score(features)
        fraud_flag = self.compute_fraud_flag(features)
        
        # 融合特征
        fused_features, _ = self.fusion_layer(
            features.unsqueeze(0),
            features.unsqueeze(0),
            features.unsqueeze(0)
        )
        
        # 计算伦理指标
        ethics_scores = self.ethics_layer(fused_features.squeeze(0))
        
        # 动态信任值计算公式
        trust_value = (0.6 * chain_rank + 0.3 * dp_score.unsqueeze(1)) / (0.1 * fraud_flag.unsqueeze(1) + 1)
        
        return {
            "trust_value": trust_value,
            "ethics_scores": ethics_scores,
            "chain_rank": chain_rank,
            "dp_score": dp_score,
            "fraud_flag": fraud_flag
        }