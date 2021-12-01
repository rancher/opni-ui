import { formatSi } from '@/utils/units';

export interface InsightsResponse {
  Anomaly: Number;
  Normal: Number;
  Suspicious: Number;
}

export class Insights {
  response: InsightsResponse;

  constructor(response: InsightsResponse) {
    this.response = response;
  }

  get anomaly(): Number {
    return this.response.Anomaly;
  }

  get anomalyFormatted(): String {
    return formatSi(this.anomaly);
  }

  get normal(): Number {
    return this.response.Normal;
  }

  get normalFormatted(): String {
    return formatSi(this.normal);
  }

  get suspicious(): Number {
    return this.response.Suspicious;
  }

  get suspiciousFormatted(): String {
    return formatSi(this.suspicious);
  }
}
