import { Capability, CapabilityStatuses } from '~/product/opni/models/Capability';
import { getClusters } from '~/product/opni/utils/requests/management';

export async function getCapabilities(type: keyof CapabilityStatuses, vue: any): Promise<Capability[]> {
  const clusters = getClusters(vue);

  return (await clusters).map(c => new Capability(type, c, vue));
}
