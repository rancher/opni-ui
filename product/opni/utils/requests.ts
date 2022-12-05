import axios from 'axios';
import { ClusterStats, ClusterStatsList } from '@/product/opni/models/Cluster';

import { RoleBinding, RoleBindingsResponse } from '~/product/opni/models/RoleBinding';
import { getCerts } from '~/product/opni/utils/requests/management';

export interface DashboardGlobalSettings {
  defaultImageRepository?: string;
  defaultTokenTtl?: string;
  defaultTokenLabels?: { [key: string]: string };
}
export interface DashboardSettings {
  global?: DashboardGlobalSettings;
  user?: { [key: string]: string};
}
export interface CertResponse {
  issuer: string;
  subject: string;
  isCA: boolean;
  notBefore: string;
  notAfter: string;
  fingerprint: string;
}

export interface CertsResponse {
  chain: CertResponse[];
}

export async function getClusterFingerprint() {
  const certs = await getCerts();

  return certs.length > 0 ? certs[certs.length - 1].fingerprint : {};
}

export async function createAgent(tokenId: string) {
  const fingerprint = await getClusterFingerprint();

  (await axios.post<any>(`opni-test/agents`, { token: tokenId, pins: [fingerprint] }));
}

export async function getClusterStats(vue: any): Promise<ClusterStats[]> {
  const clustersResponse = (await axios.get<ClusterStatsList>(`opni-api/CortexAdmin/all_user_stats`)).data.items;

  return clustersResponse;
}

export async function getRoleBindings(vue: any): Promise<RoleBinding[]> {
  const roleBindingsResponse = (await axios.get<RoleBindingsResponse>(`opni-api/management/rolebindings`)).data.items;

  return roleBindingsResponse.map( roleBindingResponse => new RoleBinding(roleBindingResponse, vue));
}
