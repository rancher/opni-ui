import axios, { AxiosResponse } from 'axios';
import day, { Dayjs, UnitType } from 'dayjs';
import { AreaOfInterestResponse } from '@/product/opni/models/areasOfInterest';
import { FromTo } from '@/product/opni/models/fromTo';
import { TokensResponse, Token } from '@/product/opni/models/Token';
import { CapabilitiesResponse, CapabilityInstallerResponse } from '@/product/opni/models/Capability';
import {
  Cluster, ClusterStats, ClusterStatsList, ClustersResponse, HealthResponse, CapabilityStatusResponse, ClusterResponse
} from '@/product/opni/models/Cluster';
import { Breakdowns, BreakdownsResponse } from '~/product/opni/models/overallBreakdown/Breakdowns';
import { Log } from '~/product/opni/models/log/Log';
import { Logs, LogsResponse } from '~/product/opni/models/log/Logs';
import { MatchLabel, Role, RolesResponse } from '~/product/opni/models/Role';
import { RoleBinding, RoleBindingsResponse } from '~/product/opni/models/RoleBinding';
import { GatewayConfig, ConfigDocument } from '~/product/opni/models/Config';
import { LABEL_KEYS } from '~/product/opni/models/shared';
import { base64Encode } from '~/utils/crypto';

interface UnitCount {
  unit: UnitType,
  count: number
}

type Granularity = UnitCount;

type LogLevel = 'Normal' | 'Anomalous' | 'Suspicious';

export async function getAreasOfInterest(now: Dayjs, range: UnitCount, granularity: Granularity): Promise<FromTo[]> {
  const from = getStartTime(now, range, granularity);
  const to = now;
  const response = (await axios.get<AreaOfInterestResponse[]>(`opni-api/areas_of_interest?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`))?.data || [];

  return (response)
    .filter(r => r.start_ts > 0 && r.end_ts > 0)
    .map(r => new FromTo(r.start_ts, r.end_ts));
}

export async function getBreakdowns(from: Dayjs, to: Dayjs): Promise<Breakdowns> {
  const response = (await axios.get<BreakdownsResponse>(`opni-api/insights_breakdown?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`))?.data;

  return new Breakdowns(response);
}

export async function getOverallBreakdownSeries(now: Dayjs, range: UnitCount, granularity: Granularity) {
  const from = getStartTime(now, range, granularity);
  const to = now;
  const response = (await axios.get(`opni-api/overall_insights?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }&granularity_level=${ granularity.count }${ granularity.unit }`));

  response.data.from = from;
  response.data.to = to;

  const mapped = response.data.Insights.map((r: any) => ({
    timestamp:  day(r.time_start).add(granularity.count, granularity.unit).valueOf(),
    normal:     r.Normal || 0,
    suspicious: r.Suspicious || 0,
    anomaly:    r.Anomaly || 0
  }));

  if (mapped.length > 0) {
    mapped[mapped.length - 1].timestamp = now.valueOf();
  }

  return mapped;
}

export function getStartTime(now: Dayjs, range: UnitCount, granularity: Granularity) {
  const firstAlignedPoint = getFirstAlignedPoint(now, granularity);

  return firstAlignedPoint.subtract(range.count, range.unit);
}

export function getFirstAlignedPoint(now: Dayjs, granularity: Granularity ) {
  const remainder = now.get(granularity.unit) % granularity.count;
  const first = granularity.count > 1 ? now.subtract(remainder, granularity.unit) : now;

  return first.startOf(granularity.unit);
}

export async function getOverallBreakdown(from: Dayjs, to: Dayjs) {
  const response = (await axios.get(`opni-api/overall_insights?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }&granularity_level=junk`));

  response.data.from = from;
  response.data.to = to;

  return response.data;
}

export async function getLogs(from: Dayjs, to: Dayjs, filter: Object): Promise<Log[]> {
  const filterString = Object.entries(filter)
    .map(([key, value]) => `${ key }=${ value }`)
    .join('&');
  const logs = (await axios.get<LogsResponse>(`opni-api/logs?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }&${ filterString }`)).data.Logs;
  // const logs = await require('./logs.json').Logs;

  return logs.map(l => new Log(l) );
}

function query(params: Object) {
  return Object.entries(params)
    .filter(([, value]) => value)
    .map(([key, value]) => `${ key }=${ value }`)
    .join('&');
}

export async function getPodLogs(from: Dayjs, to: Dayjs, logLevel: LogLevel, name: String, namespaceName: String, scrollId?: String):Promise<Logs> {
  const params = {
    start_ts:       from.valueOf(),
    end_ts:         to.valueOf(),
    anomaly_level:  logLevel,
    scroll_id:      scrollId,
    pod_name:       name,
    namespace_name: namespaceName
  };
  const logs = (await axios.get<LogsResponse>(`opni-api/logs_pod?${ query(params) }`)).data;

  return new Logs(logs);
}

export async function getNamespaceLogs(from: Dayjs, to: Dayjs, logLevel: LogLevel, name: String, scrollId: String) {
  const params = {
    start_ts:       from.valueOf(),
    end_ts:         to.valueOf(),
    anomaly_level:  logLevel,
    scroll_id:      scrollId,
    namespace_name: name
  };
  const logs = (await axios.get<LogsResponse>(`opni-api/logs_namespace?${ query(params) }`)).data;

  return new Logs(logs);
}

export async function getWorkloadLogs(from: Dayjs, to: Dayjs, logLevel: LogLevel, name: String, namespaceName: String, workloadType: String, scrollId: String) {
  const params = {
    start_ts:       from.valueOf(),
    end_ts:         to.valueOf(),
    anomaly_level:  logLevel,
    scroll_id:      scrollId,
    namespace_name: namespaceName,
    workload_type:  workloadType,
    workload_name:  name
  };
  const logs = (await axios.get<LogsResponse>(`opni-api/logs_workload?${ query(params) }`)).data;

  return new Logs(logs);
}

export async function getControlPlaneLogs(from: Dayjs, to: Dayjs, logLevel: LogLevel, name: String, scrollId: String) {
  const params = {
    start_ts:                from.valueOf(),
    end_ts:                  to.valueOf(),
    anomaly_level:           logLevel,
    scroll_id:               scrollId,
    control_plane_component: name
  };
  const logs = (await axios.get<LogsResponse>(`opni-api/logs_control_plane?${ query(params) }`)).data;

  return new Logs(logs);
}

export async function getTokens(vue: any) {
  const tokensResponse = (await axios.get<TokensResponse>(`opni-api/management/tokens`)).data.items;

  return tokensResponse.map(tokenResponse => new Token(tokenResponse, vue));
}

export async function getCapabilities(vue: any) {
  const capabilitiesResponse = (await axios.get<CapabilitiesResponse>(`opni-api/management/capabilities`)).data.items;

  return capabilitiesResponse;
}

export function uninstallCapability(clusterId: string, capability: string, deleteStoredData: boolean, vue: any) {
  return axios.post<CapabilitiesResponse>(`opni-api/management/clusters/${ clusterId }/capabilities/${ capability }/uninstall`, { options: { initialDelay: '15m', deleteStoredData } });
}

export async function uninstallCapabilityStatus(clusterId: string, capability: string, vue: any) {
  return (await axios.get<CapabilityStatusResponse>(`opni-api/management/clusters/${ clusterId }/capabilities/${ capability }/uninstall/status`)).data;
}

export async function getCapabilityInstaller(capability: string, token: string, pin: string) {
  return (await axios.post<CapabilityInstallerResponse>(`opni-api/management/capabilities/${ capability }/installer`, {
    token,
    pin,
  })).data.command;
}

export async function createToken(ttlInSeconds: string, name: string | null, capabilities: any[]) {
  const labels = name ? { labels: { [LABEL_KEYS.NAME]: name } } : { labels: {} };

  const raw = (await axios.post<any>(`opni-api/management/tokens`, {
    ttl: ttlInSeconds,
    ...labels,
    capabilities,
  })).data;

  return new Token(raw, null);
}

export function deleteToken(id: string): Promise<undefined> {
  return axios.delete(`opni-api/management/tokens/${ id }`);
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

export async function getCerts(): Promise<CertResponse[]> {
  return (await axios.get<CertsResponse>(`opni-api/management/certs`)).data.chain;
}

export async function getClusterFingerprint() {
  const certs = await getCerts();

  return certs.length > 0 ? certs[certs.length - 1].fingerprint : {};
}

export async function updateCluster(id: string, name: string, labels: { [key: string]: string }) {
  labels = { ...labels, [LABEL_KEYS.NAME]: name };
  if (name === '') {
    delete labels[LABEL_KEYS.NAME];
  }
  (await axios.put<any>(`opni-api/management/clusters/${ id }`, {
    cluster: { id },
    labels
  }));
}

export async function createAgent(tokenId: string) {
  const fingerprint = await getClusterFingerprint();

  (await axios.post<any>(`opni-test/agents`, { token: tokenId, pins: [fingerprint] }));
}

export async function getClusters(vue: any): Promise<Cluster[]> {
  const clustersResponse = (await axios.get<ClustersResponse>(`opni-api/management/clusters`)).data.items;
  const healthResponses = await Promise.allSettled(clustersResponse.map(clustersResponse => axios.get<HealthResponse>(`opni-api/management/clusters/${ clustersResponse.id }/health`)));

  const notConnected: HealthResponse = {
    status: { connected: false },
    health: { ready: false, conditions: [] }
  };

  return clustersResponse.map((clusterResponse, i) => {
    if (healthResponses[i].status === 'fulfilled') {
      return new Cluster(clusterResponse, (healthResponses[i] as PromiseFulfilledResult<AxiosResponse<HealthResponse>>).value.data, vue);
    }

    return new Cluster(clusterResponse, notConnected, vue);
  });
}

export async function getCluster(id: string, vue: any) {
  const clusterResponse = (await axios.get<ClusterResponse>(`opni-api/management/clusters/${ id }`)).data;

  return new Cluster(clusterResponse, null as any, vue);
}

export async function getClusterStats(vue: any): Promise<ClusterStats[]> {
  const clustersResponse = (await axios.get<ClusterStatsList>(`opni-api/CortexAdmin/all_user_stats`)).data.items;

  return clustersResponse;
}

export function deleteCluster(id: string): Promise<undefined> {
  return axios.delete(`opni-api/management/clusters/${ id }`);
}

export async function getRoles(vue: any): Promise<Role[]> {
  const rolesResponse = (await axios.get<RolesResponse>(`opni-api/management/roles`)).data.items;

  return rolesResponse.map( roleResponse => new Role(roleResponse, vue));
}

export function deleteRole(id: string): Promise<undefined> {
  return axios.delete(`opni-api/management/roles/${ id }`);
}

export async function createRole(name: string, clusterIDs: string[], matchLabels: MatchLabel) {
  (await axios.post<any>(`opni-api/management/roles`, {
    id: name, clusterIDs, matchLabels
  }));
}

export async function getRoleBindings(vue: any): Promise<RoleBinding[]> {
  const roleBindingsResponse = (await axios.get<RoleBindingsResponse>(`opni-api/management/rolebindings`)).data.items;

  return roleBindingsResponse.map( roleBindingResponse => new RoleBinding(roleBindingResponse, vue));
}

export function deleteRoleBinding(id: string): Promise<undefined> {
  return axios.delete(`opni-api/management/rolebindings/${ id }`);
}

export async function createRoleBinding(name: string, roleName: string, subjects: string[]) {
  (await axios.post<any>(`opni-api/management/rolebindings`, {
    id: name, roleId: roleName, subjects
  }));
}

export async function getGatewayConfig(vue: any): Promise<ConfigDocument[]> {
  const config = (await axios.get<GatewayConfig>(`opni-api/management/config`)).data;

  return config.documents.map(configDocument => new ConfigDocument(configDocument, vue));
}

export function updateGatewayConfig(jsonDocuments: string[]): Promise<undefined> {
  const documents = [];

  for (const jsonDocument of jsonDocuments) {
    documents.push({ json: base64Encode(jsonDocument) });
  }

  return axios.put(`opni-api/management/config`, { documents });
}
