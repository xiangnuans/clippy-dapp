const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const SUPPORTED_FILE_TYPES = ["pdf", "jpg", "png", "gif", "mov", "mp4"];

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileValidationError";
  }
}

export function validateFile(file: File): void {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new FileValidationError(
      `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
    );
  }

  // Check file type
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  if (!fileExtension || !SUPPORTED_FILE_TYPES.includes(fileExtension)) {
    throw new FileValidationError(
      `Unsupported file type. Supported types: ${SUPPORTED_FILE_TYPES.join(", ")}`
    );
  }
}

export function createFormData(
  file: File,
  additionalData?: Record<string, any>
): FormData {
  const formData = new FormData();
  formData.append("file", file);

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, JSON.stringify(value));
    });
  }

  return formData;
}
