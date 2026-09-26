import type { AxiosInstance } from "axios";
import type { ApiResponse } from "../fetch";
import type { ApiListResponse, ListQueryParams } from "../list";
import { cleanParams } from "../list";
import type { CommerceClaimResult, CommerceProduct, CreateProductInput } from "../../../types/src";

export async function getCommerceProducts(api: AxiosInstance, params?: ListQueryParams): Promise<ApiListResponse<CommerceProduct>> {
  const res = await api.get("/commerce/products", {
    params: cleanParams(params || {}),
  });
  return res.data;
}

export async function getCommerceProductBySlug(api: AxiosInstance, slug: string): Promise<ApiResponse<CommerceProduct>> {
  const res = await api.get(`/commerce/products/slug/${encodeURIComponent(slug)}`);
  return res.data;
}

export async function getCommerceProductById(api: AxiosInstance, id: string): Promise<ApiResponse<CommerceProduct>> {
  const res = await api.get(`/commerce/products/${encodeURIComponent(id)}`);
  return res.data;
}

export async function claimFreeProduct(api: AxiosInstance, productId: string): Promise<ApiResponse<CommerceClaimResult>> {
  const res = await api.post(`/commerce/products/${encodeURIComponent(productId)}/claim`);
  return res.data;
}

export async function getAdminProducts(api: AxiosInstance, params?: ListQueryParams): Promise<ApiListResponse<CommerceProduct>> {
  const res = await api.get("/commerce/admin/products", {
    params: cleanParams(params || {}),
  });
  return res.data;
}

export async function getAdminProduct(api: AxiosInstance, id: string): Promise<ApiResponse<CommerceProduct>> {
  const res = await api.get(`/commerce/admin/products/${encodeURIComponent(id)}`);
  return res.data;
}

export async function createCommerceProduct(api: AxiosInstance, input: CreateProductInput): Promise<ApiResponse<string>> {
  const res = await api.post("/commerce/admin/products", input);
  return res.data;
}

export async function updateCommerceProduct(api: AxiosInstance, id: string, input: Partial<CreateProductInput>): Promise<ApiResponse<CommerceProduct>> {
  const res = await api.put(`/commerce/admin/products/${encodeURIComponent(id)}`, input);
  return res.data;
}

export async function deleteCommerceProduct(api: AxiosInstance, id: string): Promise<{ success: boolean; message?: string }> {
  const res = await api.delete(`/commerce/admin/products/${encodeURIComponent(id)}`);
  return res.data;
}
