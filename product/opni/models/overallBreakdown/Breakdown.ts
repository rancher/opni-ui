import { Insights, InsightsResponse } from './Insights';

export interface BreakdownResponse {
    Insights: InsightsResponse;
    Name: String;
}

export class Breakdown {
  response: BreakdownResponse;

  constructor(response: BreakdownResponse) {
    this.response = response;
  }

  get name(): String {
    return this.response.Name;
  }

  get insights(): Insights {
    return new Insights(this.response.Insights);
  }
}
