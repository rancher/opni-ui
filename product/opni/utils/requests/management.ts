import axios from 'axios';

export async function installCapabilityV2(capability: string, clusterId: string) {
  return (await axios.post(`opni-api/management/clusters/${ clusterId }/capabilities/${ capability }/install`)).data;
}

export async function uninstallCapabilityStatusV2(capability: string, clusterId: string) {
  return await axios.get(`opni-api/management/clusters/${ clusterId }/capabilities/${ capability }/uninstall/status`);
}
