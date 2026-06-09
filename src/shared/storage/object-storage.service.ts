import { AppApiError, httpClient } from "@/shared/api";
import type { ApiResponse } from "@/shared/api";

interface StorageUrlResponse {
  contentType?: string;
  expiresIn?: number;
  key: string;
  url: string;
}

const unwrapStorageUrl = (response: ApiResponse<StorageUrlResponse>, fallbackMessage: string): StorageUrlResponse => {
  if (!response.data?.url || !response.data.key) {
    throw new AppApiError(response.message || fallbackMessage, {
      requestId: response.requestId,
      statusCode: response.statusCode,
    });
  }

  return response.data;
};

export const getStorageDownloadUrl = async (key: string): Promise<string> => {
  const response = await httpClient.get<ApiResponse<StorageUrlResponse>>(
    `/storage/download-url/${encodeURIComponent(key)}`,
  );

  return unwrapStorageUrl(response.data, "The download URL response was incomplete.").url;
};

export const uploadFileToStorage = async (file: File, key: string): Promise<string> => {
  const contentType = file.type || "application/octet-stream";
  const response = await httpClient.post<ApiResponse<StorageUrlResponse>>("/storage/upload-url", {
    key,
    contentType,
  });
  const uploadUrl = unwrapStorageUrl(response.data, "The upload URL response was incomplete.").url;
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new AppApiError("Unable to upload file.", {
      statusCode: uploadResponse.status,
    });
  }

  return key;
};
