import axios from 'axios';

import {
  AlertCondition, AlertConditionList, AlertDetailChoicesRequest, AlertStatusResponse, Condition, ListAlertTypeDetails, SilenceRequest, TimelineRequest, TimelineResponse, UpdateAlertConditionRequest
} from '~/product/opni/models/alerting/Condition';
import {
  AlertEndpoint, AlertEndpointList, Endpoint, TestAlertEndpointRequest, UpdateAlertEndpointRequest
} from '~/product/opni/models/alerting/Endpoint';

export async function createAlertEndpoint(endpoint: AlertEndpoint) {
  await axios.post('opni-api/AlertEndpoints/configure', endpoint);
}

export async function updateAlertEndpoint(endpoint: UpdateAlertEndpointRequest) {
  await axios.put('opni-api/AlertEndpoints/configure', endpoint);
}

export async function getAlertEndpoints(vue: any): Promise<Endpoint[]> {
  const response = (await axios.get <AlertEndpointList>('opni-api/AlertEndpoints/list')).data;

  return (response.items || []).map(item => new Endpoint(item, vue));
}

export async function getAlertEndpoint(id: string, vue: any): Promise<Endpoint> {
  const response = (await axios.post<AlertEndpoint>(`opni-api/AlertEndpoints/list/${ id }`, { id })).data;

  return new Endpoint({ id: { id }, endpoint: response }, vue);
}

export async function testAlertEndpoint(request: TestAlertEndpointRequest) {
  await axios.post<AlertEndpoint>(`opni-api/AlertEndpoints/test`, request);
}

export function deleteEndpoint(id: string) {
  return axios.post(`opni-api/AlertEndpoints/delete/`, { id: { id }, forceDelete: false });
}

export function createAlertCondition(alertCondition: AlertCondition) {
  return axios.post(`opni-api/AlertConditions/configure`, alertCondition);
}

export async function getAlertCondition(id: string, vue: any): Promise<Condition> {
  const response = (await axios.post<AlertCondition>(`opni-api/AlertConditions/list/${ id }`, { id })).data;

  return new Condition({ id: { id }, alertCondition: response }, vue);
}

export async function getAlertConditions(vue: any): Promise<Condition[]> {
  const response = (await axios.get<AlertConditionList>('opni-api/AlertConditions/list')).data;

  return (response.items || []).map(item => new Condition(item, vue));
}

export async function updateAlertCondition(condition: UpdateAlertConditionRequest): Promise<any> {
  return await axios.put('opni-api/AlertConditions/configure', condition);
}

export async function getAlertConditionChoices(request: AlertDetailChoicesRequest): Promise<ListAlertTypeDetails> {
  return (await axios.post<ListAlertTypeDetails>('opni-api/AlertConditions/choices', request)).data;
}

export function deleteAlertCondition(id: string) {
  return axios.delete(`opni-api/AlertConditions/configure`, { data: { id } });
}

export function getAlertConditionStatus(id: string): Promise<AlertStatusResponse> {
  return axios.post(`opni-api/AlertConditions/status/${ id }`, { id });
}

export function silenceAlertCondition(request: SilenceRequest) {
  return axios.post(`opni-api/AlertConditions/silences`, request);
}

export function deactivateSilenceAlertCondition(id: string) {
  return axios.delete(`opni-api/AlertConditions/silences/${ id }`);
}

export async function getConditionTimeline(request: TimelineRequest): Promise<TimelineResponse> {
  return (await axios.post<TimelineResponse>(`opni-api/AlertConditions/timeline`, request)).data;
}
