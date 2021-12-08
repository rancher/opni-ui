import { Log, LogResponse } from './Log';

/* eslint-disable camelcase */
export interface LogsResponse {
    Logs: LogResponse[];
    scroll_id: String;
    total_logs_count: Number;
}
/* eslint-enable camelcase */

export class Logs {
    logs: Log[];
    scrollId: String;
    count: Number;

    constructor(response: LogsResponse) {
      this.logs = response.Logs.map(l => new Log(l));
      this.scrollId = response.scroll_id;
      this.count = response.total_logs_count;
    }
}
