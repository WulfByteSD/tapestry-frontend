import type { AxiosInstance } from 'axios';
import type { AddEncounterParticipantInput, CreateEncounterDraftInput, EncounterCatalogEntry, EncounterCharacterOption, EncounterCombatantSnapshot, EncounterDraft, EncounterDraftSummary, EncounterLibraryEntry, EncounterListQuery, UpdateEncounterDraftInput, UpdateEncounterParticipantInput } from '@tapestry/types';
import type { ApiResponse } from '../fetch';
import type { ApiListResponse } from '../list';
import type { UpdateEncounterTurnOrderInput } from '@tapestry/types';

const drafts = (campaignId: string) => `/game/campaigns/${campaignId}/encounter-drafts`;
const library = '/game/encounter-library';
export async function getEncounterDrafts(api: AxiosInstance, campaignId: string, params: EncounterListQuery = {}) {
  return (await api.get<ApiListResponse<EncounterDraftSummary>>(drafts(campaignId), { params })).data;
}
export async function getEncounterDraft(api: AxiosInstance, campaignId: string, encounterId: string) {
  return (await api.get<ApiResponse<EncounterDraft>>(`${drafts(campaignId)}/${encounterId}`)).data;
}
export async function createEncounterDraft(api: AxiosInstance, campaignId: string, input: CreateEncounterDraftInput) {
  return (await api.post<ApiResponse<EncounterDraft>>(drafts(campaignId), input)).data;
}
export async function updateEncounterDraft(api: AxiosInstance, campaignId: string, encounterId: string, input: UpdateEncounterDraftInput) {
  return (await api.patch<ApiResponse<EncounterDraft>>(`${drafts(campaignId)}/${encounterId}`, input)).data;
}
export async function updateEncounterTurnOrder(api: AxiosInstance, campaignId: string, encounterId: string, input: UpdateEncounterTurnOrderInput) {
  return (await api.post<ApiResponse<EncounterDraft>>(`${drafts(campaignId)}/${encounterId}/turn-order`, input)).data;
}
export async function getEncounterCharacters(api: AxiosInstance, campaignId: string) {
  return (await api.get<ApiResponse<EncounterCharacterOption[]>>(`${drafts(campaignId)}/characters`)).data;
}
export async function addEncounterParticipant(api: AxiosInstance, campaignId: string, encounterId: string, input: AddEncounterParticipantInput) {
  return (await api.post<ApiResponse<EncounterDraft>>(`${drafts(campaignId)}/${encounterId}/participants`, input)).data;
}
export async function updateEncounterParticipant(api: AxiosInstance, campaignId: string, encounterId: string, participantId: string, input: UpdateEncounterParticipantInput) {
  return (await api.patch<ApiResponse<EncounterDraft>>(`${drafts(campaignId)}/${encounterId}/participants/${participantId}`, input)).data;
}
export async function removeEncounterParticipant(api: AxiosInstance, campaignId: string, encounterId: string, participantId: string, revision: number) {
  return (await api.delete<ApiResponse<EncounterDraft>>(`${drafts(campaignId)}/${encounterId}/participants/${participantId}`, { data: { revision } })).data;
}
export async function duplicateEncounterParticipant(api: AxiosInstance, campaignId: string, encounterId: string, participantId: string, revision: number) {
  return (await api.post<ApiResponse<EncounterDraft>>(`${drafts(campaignId)}/${encounterId}/participants/${participantId}/duplicate`, { revision })).data;
}
export async function getEncounterLibrary(api: AxiosInstance, params: EncounterListQuery = {}) {
  return (await api.get<ApiListResponse<EncounterLibraryEntry>>(library, { params })).data;
}
export async function getEncounterCatalog(api: AxiosInstance, params: EncounterListQuery = {}) {
  return (await api.get<ApiListResponse<EncounterCatalogEntry>>(`${library}/catalog`, { params })).data;
}
export async function getEncounterLibraryEntry(api: AxiosInstance, id: string) {
  return (await api.get<ApiResponse<EncounterLibraryEntry>>(`${library}/${id}`)).data;
}
export async function createEncounterLibraryEntry(api: AxiosInstance, snapshot: EncounterCombatantSnapshot) {
  return (await api.post<ApiResponse<EncounterLibraryEntry>>(library, { snapshot })).data;
}
export async function updateEncounterLibraryEntry(api: AxiosInstance, id: string, snapshot: EncounterCombatantSnapshot, revision: number) {
  return (await api.patch<ApiResponse<EncounterLibraryEntry>>(`${library}/${id}`, { snapshot, revision })).data;
}
