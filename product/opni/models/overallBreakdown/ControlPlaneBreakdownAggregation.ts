import { WorkloadBreakdown, WorkloadBreakdownResponse } from './WorkloadBreakdown';

export interface ControlPlaneBreakdownAggregationResponse {
  Components: WorkloadBreakdownResponse[];
}

export class ControlPlaneBreakdownAggregation {
  components: WorkloadBreakdown[];

  constructor(response: ControlPlaneBreakdownAggregationResponse) {
    this.components = response.Components.map(c => new WorkloadBreakdown(c, null as any));
  }
}
