import { Breakdown, BreakdownResponse } from './Breakdown';

export interface WorkloadBreakdownResponse extends BreakdownResponse {
    Namespace: String;
}

type WorkloadBreakdownType = 'CustomResource' | 'DaemonSet' | 'Deployment' | 'Independent' | 'Job' | 'ReplicaSet' | 'StatefulSet';
export class WorkloadBreakdown extends Breakdown {
    namespace: String;
    type: WorkloadBreakdownType;

    constructor(response: WorkloadBreakdownResponse, type: WorkloadBreakdownType) {
      super(response);

      this.namespace = response.Namespace;
      this.type = type;
    }
}
