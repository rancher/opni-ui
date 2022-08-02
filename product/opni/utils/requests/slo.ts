import axios from 'axios';
import { Slo, SlosResponse, SloStatusResponse } from '~/product/opni/models/Slo';
import { SloMetric, SloMetricResponse, SloMetricsResponse } from '~/product/opni/models/SloMetric';
import { SloService, SloServicesResponse } from '~/product/opni/models/SloService';
import { getClusters } from '~/product/opni/utils/requests';

export type Datasource = 'monitoring' | 'logging';

export async function getServices(): Promise<SloService[]> {
  const clustersRequest = getClusters(null);
  const response = (await axios.post<SloServicesResponse>(`opni-api/SLO/services`, { datasource: 'monitoring' }))?.data || { items: [] };
  const clusters = await clustersRequest;

  return response.items.map(item => new SloService(item, clusters, null) );
}

export async function getMetrics(): Promise<SloMetricResponse[]> {
  const response = (await axios.post<SloMetricsResponse>(`opni-api/SLO/metrics`))?.data || { items: [] };

  return response.items.map(item => new SloMetric(item, null));
}

export function createSLO(name: string, services: SloService[], metric: string, monitorWindow: string, budgetingInterval: string, threshold: number, tags: string[] ) {
  const body = {
    SLO: {
      name,
      datasource:        'monitoring',
      monitorWindow,
      budgetingInterval,
      metricName:        metric,
      target:     { value: threshold },
      labels:     tags.map(tag => ({ name: tag }))
    },
    services: services.map(s => ({ jobId: s.jobId, clusterId: s.clusterId })),
  };

  return axios.post(`opni-api/SLO/slos`, body);
}

export function updateSLO(id: string, name: string, services: SloService[], metric: string, monitorWindow: string, budgetingInterval: string, threshold: number, tags: string[]) {
  const body = {
    id,
    SLO: {
      name,
      datasource: 'monitoring',
      monitorWindow,
      budgetingInterval,
      metricName: metric,
      target:     { value: threshold },
      labels:     tags.map(tag => ({ name: tag }))
    },
    service: services.map(s => ({ jobId: s.jobId, clusterId: s.clusterId }))[0],
  };

  return axios.put(`opni-api/SLO/slos/${ id }`, body);
}

export function deleteSLO(id: string) {
  return axios.delete(`opni-api/SLO/slos/`, { data: { id } });
}

export function cloneSLO(id: string) {
  return axios.post(`opni-api/SLO/slos/${ id }/clone`, { id });
}

export async function getSLO(id: string, vue: any) {
  // This doesn't work currently because the service doesn't support params being a part of the url and get requests can't have a body from browsers.
  // const response = (await axios.get<SloResponse>(`opni-api/SLO/slos/${ id }`))?.data;

  const slos = await getSLOs(vue);
  const slo = slos.find(s => s.id === id);

  if (!slo) {
    return false;
  }

  return slo;
}

export async function getSLOs(vue: any) {
  const response = (await axios.get<SlosResponse>('opni-api/SLO/slos'))?.data || { items: [] };

  return response?.items?.map(item => new Slo(item, vue)) || [];
}

export async function getSLOStatus(id: string): Promise<SloStatusResponse> {
  const randomResult = ['NoData', 'Ok', 'Warning', 'Breaching', 'InternalError'];
  const result = (await axios.post(`opni-api/SLO/slos/${ id }/status`, { id })).data;

  return result?.sloSLOStatusState ? result : { sloSLOStatusState: randomResult[Math.floor(Math.random() * (randomResult.length - 1))] };
}
