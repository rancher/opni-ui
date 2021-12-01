import { Breakdown, BreakdownResponse } from './Breakdown';
import { WorkloadBreakdownAggregation, WorkloadBreakdownAggregationResponse } from './WorkloadBreakdownAggregation';
import { ControlPlaneBreakdownAggregation, ControlPlaneBreakdownAggregationResponse } from './ControlPlaneBreakdownAggregation';

export interface BreakdownsResponse {
    Namespaces: BreakdownResponse[];
    Pods: BreakdownResponse[];
    Workloads: WorkloadBreakdownAggregationResponse;
    'Control Plane': ControlPlaneBreakdownAggregationResponse;
}

export class Breakdowns {
  response: BreakdownsResponse;

  constructor(response: BreakdownsResponse) {
    this.response = response;
  }

  get namespaces(): Breakdown[] {
    return this.response.Namespaces.map(n => new Breakdown(n));
  }

  get pods(): Breakdown[] {
    return this.response.Pods.map(n => new Breakdown(n));
  }

  get workloads(): WorkloadBreakdownAggregation {
    return new WorkloadBreakdownAggregation(this.response.Workloads);
  }

  get controlPlanes(): ControlPlaneBreakdownAggregation {
    return new ControlPlaneBreakdownAggregation(this.response['Control Plane']);
  }
}
