import { Breakdown, BreakdownResponse } from './Breakdown';

export interface WorkloadBreakdownResponse extends BreakdownResponse {
    Namespace: String;
}

export class WorkloadBreakdown extends Breakdown {
    namespace: String;

    constructor(response: WorkloadBreakdownResponse) {
      super(response);

      this.namespace = response.Namespace;
    }
}
