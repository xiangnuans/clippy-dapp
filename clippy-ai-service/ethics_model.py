import requests
import json
import torch
import torch.nn as nn
from typing import Dict, Any, Union, List
import numpy as np

class DeepSeekClient:
    def __init__(self, api_key: str = "sk-1095da632dba4d37843efb21854f522b"):
        self.api_key = api_key
        self.base_url = "https://api.deepseek.com/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def evaluate_ethics(self, text: str, context: str = "") -> Dict[str, float]:
        """评估文本的伦理指标"""
        prompt = f"""
        请评估以下文本的伦理指标，包括隐私、公平性、透明度和问责制。
        文本: {text}
        上下文: {context}
        
        请以JSON格式返回以下指标的分数（0-1之间）：
        {{
            "privacy": 0.5,
            "fairness": 0.5,
            "transparency": 0.5,
            "accountability": 0.5
        }}
        """
        
        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                # 解析AI返回的JSON格式评分
                scores = json.loads(result['choices'][0]['message']['content'])
                return scores
            else:
                raise Exception(f"API调用失败: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"DeepSeek API调用出错: {str(e)}")
            # 返回默认分数
            return {
                "privacy": 0.5,
                "fairness": 0.5,
                "transparency": 0.5,
                "accountability": 0.5
            }
    
    def analyze_text(self, text: str) -> Dict[str, Any]:
        """分析文本的详细特征"""
        prompt = f"""
        请分析以下文本的特征：
        {text}
        
        请以JSON格式返回以下信息：
        {{
            "anomaly_score": 0.5,
            "bleu_score": 0.5,
            "features": []
        }}
        """
        
        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return json.loads(result['choices'][0]['message']['content'])
            else:
                raise Exception(f"API调用失败: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"DeepSeek API调用出错: {str(e)}")
            # 返回默认值
            return {
                "anomaly_score": 0.5,
                "bleu_score": 0.5,
                "features": []
            }

class EthicsAlignmentModel(nn.Module):
    def __init__(self, input_dim: int = 768, hidden_dim: int = 512):
        super().__init__()
        self.deepseek_client = DeepSeekClient()
        
        # 特征提取器
        self.feature_extractor = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.LayerNorm(hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        
        # 伦理评分头
        self.ethics_head = nn.Sequential(
            nn.Linear(hidden_dim // 2, hidden_dim // 4),
            nn.LayerNorm(hidden_dim // 4),
            nn.ReLU(),
            nn.Linear(hidden_dim // 4, 4),  # 4个伦理维度
            nn.Sigmoid()
        )
        
        # SDG对齐度头
        self.sdg_head = nn.Sequential(
            nn.Linear(hidden_dim // 2, hidden_dim // 4),
            nn.LayerNorm(hidden_dim // 4),
            nn.ReLU(),
            nn.Linear(hidden_dim // 4, 1),
            nn.Sigmoid()
        )
        
        # 伦理失控分数头
        self.meltdown_head = nn.Sequential(
            nn.Linear(hidden_dim // 2, hidden_dim // 4),
            nn.LayerNorm(hidden_dim // 4),
            nn.ReLU(),
            nn.Linear(hidden_dim // 4, 1),
            nn.Sigmoid()
        )
        
        # 初始化权重
        self._init_weights()
    
    def _init_weights(self):
        """初始化模型权重"""
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight)
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0)
    
    def extract_features(self, text: str) -> torch.Tensor:
        """
        从文本中提取特征
        
        Args:
            text: 输入文本
        
        Returns:
            torch.Tensor: 特征向量
        """
        # 使用DeepSeek分析文本
        analysis = self.deepseek_client.analyze_text(text)
        
        # 将分析结果转换为特征向量
        features = []
        features.append(analysis["anomaly_score"])
        features.append(analysis["bleu_score"])
        
        # 添加其他特征
        for feature in analysis["features"]:
            if isinstance(feature, (int, float)):
                features.append(feature)
        
        # 如果特征数量不足，用0填充
        while len(features) < 768:
            features.append(0.0)
        
        # 转换为tensor
        return torch.tensor(features[:768], dtype=torch.float32).unsqueeze(0)
    
    def forward(self, x: Union[torch.Tensor, str], context: str = "") -> Dict[str, torch.Tensor]:
        """
        前向传播
        
        Args:
            x: 输入特征或文本
            context: 上下文信息
        
        Returns:
            Dict: 包含各项评分的字典
        """
        # 如果输入是文本，先提取特征
        if isinstance(x, str):
            x = self.extract_features(x)
        
        # 特征提取
        features = self.feature_extractor(x)
        
        # 计算各项评分
        ethics_scores = self.ethics_head(features)
        sdg_alignment = self.sdg_head(features)
        meltdown_score = self.meltdown_head(features)
        
        # 计算奖励值（使用伦理评分的平均值）
        reward = ethics_scores.mean()
        
        return {
            "ethics_scores": ethics_scores,
            "sdg_alignment": sdg_alignment,
            "meltdown_score": meltdown_score,
            "reward": reward
        }
    
    def evaluate_text(self, text: str, context: str = "") -> Dict[str, float]:
        """
        评估文本的伦理指标
        
        Args:
            text: 输入文本
            context: 上下文信息
        
        Returns:
            Dict: 包含各项评分的字典
        """
        # 使用DeepSeek进行评估
        deepseek_scores = self.deepseek_client.evaluate_ethics(text, context)
        
        # 使用模型进行评估
        model_scores = self(text, context)
        
        # 合并结果
        return {
            "ethics_scores": {
                "privacy": float(deepseek_scores["privacy"]),
                "fairness": float(deepseek_scores["fairness"]),
                "transparency": float(deepseek_scores["transparency"]),
                "accountability": float(deepseek_scores["accountability"])
            },
            "sdg_alignment": float(model_scores["sdg_alignment"]),
            "meltdown_score": float(model_scores["meltdown_score"]),
            "reward": float(model_scores["reward"])
        }