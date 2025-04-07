/**
 * 包含文档URL的代理接口
 * 用于内部API返回带有文档下载链接的代理列表
 */
export interface AgentWithDocuments {
  id: string;
  name: string;
  industry: string;
  description: string;
  score: number | null;
  feedback: string | null;
  documents: {
    id: string;
    name: string;
    fileType: string;
    downloadUrl: string;
  }[];
} 