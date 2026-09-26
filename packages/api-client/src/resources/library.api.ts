import type { AxiosInstance } from "axios";
import type { ApiResponse } from "../fetch";
import type { ApiListResponse, ListQueryParams } from "../list";
import { cleanParams } from "../list";
import type { CloudinaryUploadAsset, CreateLibraryResourceInput, LibraryResource, LibraryResourceSummary } from "../../../types/src";

export async function getLibraryResources(api: AxiosInstance, params?: ListQueryParams): Promise<ApiListResponse<LibraryResourceSummary>> {
  const res = await api.get("/library/resources", {
    params: cleanParams(params || {}),
  });
  return res.data;
}

export async function getLibraryResource(api: AxiosInstance, id: string): Promise<ApiResponse<LibraryResource>> {
  const res = await api.get(`/library/resources/${encodeURIComponent(id)}`);
  return res.data;
}

export async function createLibraryResource(api: AxiosInstance, input: CreateLibraryResourceInput): Promise<ApiResponse<string>> {
  const res = await api.post("/library/resources", input);
  return res.data;
}

export async function updateLibraryResource(api: AxiosInstance, id: string, input: Partial<CreateLibraryResourceInput>): Promise<ApiResponse<LibraryResource>> {
  const res = await api.put(`/library/resources/${encodeURIComponent(id)}`, input);
  return res.data;
}

export async function deleteLibraryResource(api: AxiosInstance, id: string): Promise<{ success: boolean; message?: string }> {
  const res = await api.delete(`/library/resources/${encodeURIComponent(id)}`);
  return res.data;
}

export async function uploadLibraryResourceFile(api: AxiosInstance, file: File | Blob, type: string, filename?: string): Promise<{ payload: CloudinaryUploadAsset[] }> {
  const formData = new FormData();
  formData.append("document", file, filename ?? (file instanceof File ? file.name : "resource-upload"));
  formData.append("type", type);

  const res = await api.post("/upload/cloudinary/file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}
