import { WorkloadBreakdown, WorkloadBreakdownResponse } from './WorkloadBreakdown';

export interface WorkloadBreakdownAggregationResponse {
    CustomResource: WorkloadBreakdownResponse[];
    DaemonSet: WorkloadBreakdownResponse[];
    Deployment: WorkloadBreakdownResponse[];
    Independent: WorkloadBreakdownResponse[];
    Job: WorkloadBreakdownResponse[];
    ReplicaSet: WorkloadBreakdownResponse[];
    StatefulSet: WorkloadBreakdownResponse[];
}

export class WorkloadBreakdownAggregation {
    customResource: WorkloadBreakdown[];
    daemonSet: WorkloadBreakdown[];
    deployment: WorkloadBreakdown[];
    independent: WorkloadBreakdown[];
    job: WorkloadBreakdown[];
    replicaSet: WorkloadBreakdown[];
    statefulSet: WorkloadBreakdown[];

    constructor(response: WorkloadBreakdownAggregationResponse) {
      this.customResource = response?.CustomResource?.map(b => new WorkloadBreakdown(b, 'CustomResource')) || [];
      this.daemonSet = response?.DaemonSet?.map(b => new WorkloadBreakdown(b, 'DaemonSet')) || [];
      this.deployment = response?.Deployment?.map(b => new WorkloadBreakdown(b, 'Deployment')) || [];
      this.independent = response?.Independent?.map(b => new WorkloadBreakdown(b, 'Independent')) || [];
      this.job = response?.Job?.map(b => new WorkloadBreakdown(b, 'Job')) || [];
      this.replicaSet = response?.ReplicaSet?.map(b => new WorkloadBreakdown(b, 'ReplicaSet')) || [];
      this.statefulSet = response?.StatefulSet?.map(b => new WorkloadBreakdown(b, 'StatefulSet')) || [];
    }
}
