import type { AxiosInstance } from 'axios';
import type { ApiResponse } from '../fetch';
import type { EncounterScene, EncounterSceneSummary, CreateEncounterSceneInput, UpdateEncounterSceneInput, EncounterSceneMutationResult, SceneLifecycleInput, SceneTurnOrderInput, TransferSceneParticipantsInput, SceneHealthActionInput, SceneHealthPreview, ApplySceneHealthInput, EncounterHealthAudit, SceneAttackInput, SceneDefenseInput, EncounterExchange, SceneExchangePage, CharacterHealthAuditPage } from '@tapestry/types';

const base = (c: string) => `/game/campaigns/${c}/encounters`;
const scene = (c: string, e: string, s: string) => `${base(c)}/${e}/scenes/${s}`;
export async function getCampaignEncounterScenes(api: AxiosInstance, c: string) { return (await api.get<ApiResponse<EncounterSceneSummary[]>>(`${base(c)}/scenes`)).data; }
export async function getEncounterScenes(api: AxiosInstance, c: string, e: string) { return (await api.get<ApiResponse<EncounterSceneSummary[]>>(`${base(c)}/${e}/scenes`)).data; }
export async function getEncounterScene(api: AxiosInstance, c: string, e: string, s: string) { return (await api.get<ApiResponse<EncounterScene>>(scene(c,e,s))).data; }
export async function createEncounterScene(api: AxiosInstance, c: string, e: string, input: CreateEncounterSceneInput) { return (await api.post<ApiResponse<EncounterSceneMutationResult>>(`${base(c)}/${e}/scenes`, input)).data; }
export async function updateEncounterScene(api: AxiosInstance, c: string, e: string, s: string, input: UpdateEncounterSceneInput) { return (await api.patch<ApiResponse<EncounterSceneMutationResult>>(scene(c,e,s), input)).data; }
export async function changeEncounterSceneLifecycle(api: AxiosInstance, c: string, e: string, s: string, input: SceneLifecycleInput) { return (await api.post<ApiResponse<EncounterSceneMutationResult>>(`${scene(c,e,s)}/lifecycle`,input)).data; }
export async function endEncounter(api: AxiosInstance, c: string, e: string) { return (await api.post<ApiResponse<{ status: 'ended' }>>(`${base(c)}/${e}/end`)).data; }
export async function updateSceneTurnOrder(api: AxiosInstance, c: string, e: string, s: string, input: SceneTurnOrderInput) { return (await api.post<ApiResponse<EncounterScene>>(`${scene(c,e,s)}/turn-order`,input)).data; }
export async function transferSceneParticipants(api: AxiosInstance, c: string, e: string, s: string, input: TransferSceneParticipantsInput) { return (await api.post<ApiResponse<{ source: EncounterScene; target: EncounterScene }>>(`${scene(c,e,s)}/transfer`,input)).data; }
export async function previewSceneHealth(api: AxiosInstance, c: string, e: string, s: string, input: SceneHealthActionInput) { return (await api.post<ApiResponse<SceneHealthPreview>>(`${scene(c,e,s)}/health/preview`,input)).data; }
export async function applySceneHealth(api: AxiosInstance, c: string, e: string, s: string, input: ApplySceneHealthInput) { return (await api.post<ApiResponse<EncounterHealthAudit>>(`${scene(c,e,s)}/health/apply`,input)).data; }
export async function getCharacterHealthAudit(api: AxiosInstance, characterId: string, cursor?: string) { return (await api.get<ApiResponse<CharacterHealthAuditPage>>(`/game/characters/${characterId}/health-audit`, {params:{cursor}})).data; }
export async function getSceneExchanges(api: AxiosInstance, c: string, e: string, s: string, cursor?: string) { return (await api.get<ApiResponse<SceneExchangePage>>(`${scene(c,e,s)}/exchanges`,{params:{cursor}})).data; }
export async function createSceneAttack(api: AxiosInstance, c: string, e: string, s: string, input: SceneAttackInput) { return (await api.post<ApiResponse<EncounterExchange>>(`${scene(c,e,s)}/exchanges`,input)).data; }
export async function defendSceneExchange(api: AxiosInstance, c: string, e: string, s: string, exchangeId: string, input: SceneDefenseInput) { return (await api.post<ApiResponse<EncounterExchange>>(`${scene(c,e,s)}/exchanges/${exchangeId}/defend`,input)).data; }
