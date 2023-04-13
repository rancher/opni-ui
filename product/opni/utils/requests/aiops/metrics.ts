import axios from 'axios';

import { Job } from '../../../models/AIMetrics/Job';
export interface MetricAIJobStatus {
    clusterId: string;
    jobCreateTime: string;
    jobId: string;
    namespaces: string[];
    jobDescription: string;
}

export interface MetricAIJobRunResult {
    jobId: string;
    jobRunId: string;
    jobRunResult: string;
    jobRunCreateTime: string;
    jobRunBaseTime: string;
    status: string;
}

export interface MetricAIIdList {
    items: string[];
}

export interface MetricAICreateJobRequest {
    clusterId: string;
    namespaces: string[];
    jobId: string;
    jobDescription: string;
}

export interface MetricAIId {
    id: string;
}

export interface MetricAIAPIResponse {
    status: string;
    submittedTime: string;
    description: string;
}
export interface MetricAIRunJobResponse {
    status: string;
    submittedTime: string;
    description: string;
    jobRunId: string;
}

export async function ListClusters(): Promise<MetricAIIdList> {
  return (await axios.get<MetricAIIdList>('opni-api/MetricAI/metricai/listclusters')).data;
}

export async function ListNamespaces(id: MetricAIId): Promise<MetricAIIdList> {
  return (await axios.get<MetricAIIdList>(`opni-api/MetricAI/metricai/listnamespaces/${ id.id }`)).data;
}

export async function ListJobs(): Promise<MetricAIIdList> {
  return (await axios.get<MetricAIIdList>('opni-api/MetricAI/metricai/listjobs')).data;
}

export async function ListJobRuns(id: MetricAIId): Promise<MetricAIIdList> {
  return (await axios.get<MetricAIIdList>(`opni-api/MetricAI/metricai/listjobruns/${ id.id }`)).data;
}

export async function CreateJob(request: MetricAICreateJobRequest): Promise<MetricAIAPIResponse> {
  return (await axios.post<MetricAIAPIResponse>(`opni-api/MetricAI/metricai/createjob/${ request.clusterId }`, request)).data;
}

export async function RunJob(id: MetricAIId): Promise<MetricAIRunJobResponse> {
  return (await axios.post<MetricAIRunJobResponse>(`opni-api/MetricAI/metricai/runjob/${ id.id }`, id)).data;
}

export async function DeleteJob(id: MetricAIId) {
  await axios.delete(`opni-api/MetricAI/metricai/deletejob/${ id.id }`);
}

export async function GetJobRunResult(id: MetricAIId): Promise<MetricAIJobRunResult> {
  return (await axios.get<MetricAIJobRunResult>(`opni-api/MetricAI/metricai/getjobrunresult/${ id.id }`)).data;
}

export async function DeleteJobRun(id: MetricAIId) {
  await axios.delete(`opni-api/MetricAI/metricai/deletejobrun/${ id.id }`);
}

export async function GetJob(id: MetricAIId): Promise<MetricAIJobStatus> {
  return (await axios.get<MetricAIJobStatus>(`opni-api/MetricAI/metricai/getjob/${ id.id }`)).data;
}

export async function getJobs(vue: any): Promise<Job[]> {
  const jobIdsRequest = await ListJobs();
  const jobIds = (await jobIdsRequest)?.items || [];
  const idObjects = jobIds.map(id => ({ id }));

  const jobsRequests = idObjects.map(GetJob);
  const jobsRaw = await Promise.all(jobsRequests) || [];

  return jobsRaw.map(job => new Job(job, vue));
}
