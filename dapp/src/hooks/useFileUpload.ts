import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/store/auth";
import { ApiException } from "@/lib/api-error";
import {
  validateFile,
  createFormData,
  FileValidationError,
} from "@/lib/file-upload";
import { API_BASE_URL } from "@/hooks/useAuth";

// 支持的文件类型配置
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
  "text/plain",
];

export const ACCEPTED_MEDIA_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
];

// 文件大小限制（单位：MB）
const SIZE_LIMITS = {
  image: 5,
  document: 10,
  media: 50,
};

interface UploadOptions {
  maxSize?: number; // 自定义大小限制（MB）
  acceptedTypes?: string[]; // 自定义支持的文件类型
  endpoint?: string; // 自定义上传端点
}

interface UploadResponse {
  fileType: string;
  fileName: string;
  url: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseFileUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  endpoint?: string;
  additionalData?: Record<string, any>;
}

const API_BASE_URL = "http://localhost:3000/api";

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  });
  const { toast } = useToast();
  const { token } = useAuthStore();

  // 验证文件
  const validateFile = (file: File, options?: UploadOptions) => {
    const fileSize = file.size / (1024 * 1024); // 转换为 MB
    const maxSize = options?.maxSize || SIZE_LIMITS.media;
    const acceptedTypes = options?.acceptedTypes || [
      ...ACCEPTED_IMAGE_TYPES,
      ...ACCEPTED_DOCUMENT_TYPES,
      ...ACCEPTED_MEDIA_TYPES,
    ];

    if (fileSize > maxSize) {
      throw new Error(`File size should not exceed ${maxSize}MB`);
    }

    if (!acceptedTypes.includes(file.type)) {
      throw new Error("File type not supported");
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      return response.json();
    } catch (error) {
      console.error("Upload file error:", error);
      throw error;
    }
  };

  // 上传多个文件
  const uploadFiles = async (files: File[]): Promise<UploadResponse[]> => {
    const results: UploadResponse[] = [];
    for (const file of files) {
      const result = await uploadFile(file);
      results.push(result);
    }
    return results;
  };

  return {
    uploadFile,
    uploadFiles,
    isUploading,
    progress,
  };
};
