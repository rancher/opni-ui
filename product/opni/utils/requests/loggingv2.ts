import axios from 'axios';

export interface CPUResource {
    Request: string;
    Limit: string;
}

export interface DataPersistence {
    Enabled?: boolean;
    StorageClass?: string;
}

export interface Toleration {
  key: string;
  operator: string;
  value: string;
  taintEffect: string;
}

export interface ComputeResourceQuantities {
  CPU: string;
  Memory: string;
}

export interface ResourceRequirements {
  Requests: ComputeResourceQuantities;
  Limits: ComputeResourceQuantities;
}

export interface DataDetails {
  replicas?: string;
  diskSize: string;
  memoryLimit: string;
  cpuResources?: CPUResource;
  enableAntiAffinity ?: boolean;
  nodeSelector: {[key: string]: string};
  tolerations: Toleration[];
  Persistence?: DataPersistence;
}

export interface DashboardsDetails {
    Enabled?: boolean;
    Replicas?: string;
    Resources: ResourceRequirements;
}

export interface IngestDetails {
  replicas?: string;
  memoryLimit: string;
  cpuResources ?: CPUResource;
  enableAntiAffinity ?: boolean;
  nodeSelector: { [key: string]: string };
  tolerations: Toleration[];
}

export interface ControlplaneDetails {
  replicas?: string;
  nodeSelector: { [key: string]: string };
  tolerations: Toleration[];
  Persistence?: DataPersistence;
}

export interface OpensearchClusterV2 {
  externalURL: string;
  dataNodes: DataDetails;
  ingestNodes?: IngestDetails;
  controlplaneNodes?: ControlplaneDetails;
  Dashboards?: DashboardsDetails;
  DataRetention?: string;
}

export interface UpgradeAvailableResponse {
  UpgradePending: boolean;
}

export interface StorageClassResponse {
  StorageClasses: string[];
}

export interface StatusResponse {
  status: string;
  details: string;
}

export async function getOpensearchCluster(): Promise<OpensearchClusterV2> {
  return (await axios.get('opni-api/LoggingAdminV2/logging/cluster')).data;
}

export async function deleteOpensearchCluster() {
  return (await axios.delete('opni-api/LoggingAdminV2/logging/cluster')).data;
}

export async function createOrUpdateOpensearchCluster(options: OpensearchClusterV2) {
  return (await axios.put('opni-api/LoggingAdminV2/logging/cluster', options)).data;
}

export async function upgradeAvailable(): Promise<UpgradeAvailableResponse> {
  return (await axios.get('opni-api/LoggingAdminV2/logging/upgrade/available')).data;
}

export async function doUpgrade() {
  return (await axios.post('opni-api/LoggingAdminV2/logging/upgrade/do')).data;
}

export async function getStorageClasses(): Promise<StorageClassResponse> {
  return (await axios.get('opni-api/LoggingAdminV2/logging/storageclasses')).data;
}

export async function GetOpensearchStatus(): Promise <StatusResponse> {
  return (await axios.get('opni-api/LoggingAdminV2/logging/status')).data;
}
