import axios from 'axios';

import { Deployment, DeploymentResponse } from '~/product/opni/models/Deployment';

export async function getDeployments(clusterId: string): Promise<Deployment[]> {
  const deployments = (await axios.post<{ list: DeploymentResponse[] }>(`opni-api/ModelTraining/workloadLogCount/${ clusterId }`, { id: clusterId })).data;

  return deployments.list.map(d => new Deployment(d, null));
}

export interface ModelStatus {
  id: 'not started' | 'training' | 'completed';
}

export async function getModelStatus(): Promise<ModelStatus> {
  return await (await axios.get <ModelStatus>(`opni-api/ModelTraining/modelStatus`)).data;
}

export interface WorkloadResponse {
  clusterId: string;
  namespace: string;
  deployment: string;
}

export interface WorkloadList {
  list: WorkloadResponse[];
}

export async function trainModel(workloads: WorkloadResponse[]) {
  await axios.post(`opni-api/ModelTraining/trainModel`, { list: workloads });
}

export async function getModelTrainingParameters(): Promise<WorkloadList> {
  return (await axios.get<WorkloadList>(`opni-api/ModelTraining/modelTrainingParameters`)).data;
}

export interface GPUInfo {
  name: string;
  capacity: string;
  allocatable: string;
}

export interface GPUInfoList {
  list: GPUInfo[];
}

export async function hasGpu(): Promise<Boolean> {
  const gpuList = (await axios.get<GPUInfoList>(`opni-api/ModelTraining/gpuPresentCluster`)).data;
  const gpus = gpuList.list || [];

  return gpus.some(gpu => Number.parseInt(gpu.allocatable) > 0);
}
