import Vue from 'vue';
import { Resource } from '../Resource';
import {
  DeleteJob,
  DeleteJobRun,
  GetJobRunResult, ListJobRuns, MetricAIJobRunResult, MetricAIJobStatus, RunJob
} from '../../utils/requests/aiops/metrics';

export interface MatchExpression {
    key: string;
    operator: string;
    values: string[]
}

export interface MatchLabel {
    matchLabels: { [key: string]: string };
    matchExpressions: MatchExpression[]
}

export interface RoleResponse {
    id: string;
    clusterIDs: string[];
    matchLabels: MatchLabel
}

export interface RolesResponse {
    items: RoleResponse[];
}

export interface JobResult {
    id: string;
    success: boolean;
    description: string;
    metadata: MetricAIJobStatus;
    status: any;
}

export class Job extends Resource {
  private base: MetricAIJobStatus;
  private jobRuns: MetricAIJobRunResult[];

  constructor(base: MetricAIJobStatus, vue: any) {
    super(vue);
    this.base = base;
    this.jobRuns = [];
  }

  get id() {
    return this.base.jobId;
  }

  get nameDisplay() {
    return this.base.jobId;
  }

  get description() {
    return this.base.jobDescription;
  }

  get lastRun() {
    return this.base.jobCreateTime.replace(/\..*/, 'Z');
  }

  get namespaces() {
    return this.base.namespaces || [];
  }

  async loadJobRuns() {
    const jobRunIds = (await ListJobRuns({ id: this.id })).items || [];
    const idObjects = jobRunIds.map(id => ({ id }));

    Vue.set(this, 'jobRuns', await Promise.all(idObjects.map(GetJobRunResult)));
  }

  get results(): any[] {
    return this.jobRuns.map((j) => {
      const parsedDescription = [...(j?.jobRunResult || '').matchAll(/\d+/g)].flat();
      const metricCount = parsedDescription?.[0] || '-';
      const anomalousMetricCount = parsedDescription?.[1] || '-';

      return {
        grafanaUrl:         'https://grafana.com',
        grafanaLabel:       'Grafana',
        id:               j.jobRunId,
        description:      j.jobRunResult,
        metricCount,
        anomalousMetricCount,
        success:          true,
        jobSubmittedTime: (new Date(Number.parseInt(j.jobRunCreateTime.replace(/\..*/, '')) * 1000)).toUTCString(),
        metadata:         {
          jobId:            j.jobId,
          jobStatus:        'Success'
        },
        status:      {
          state:   j.status.includes('Completed') ? 'success' : 'warning',
          message: j.status.includes('Completed') ? 'Completed' : 'Running',
        },
        get availableActions(): any[] {
          return [
            {
              action:     'remove',
              altAction:  'delete',
              label:      'Delete',
              icon:       'icon icon-trash',
              bulkable:   true,
              enabled:    true,
              bulkAction: 'remove',
              weight:     -10, // Delete always goes last
            }
          ];
        },
        remove: async() => {
          await DeleteJobRun({ id: j.jobRunId });
          this.loadJobRuns();
        }
      };
    });
  }

  get availableActions(): any[] {
    return [
      {
        action:     'promptRemove',
        altAction:  'delete',
        label:      'Delete',
        icon:       'icon icon-trash',
        bulkable:   true,
        enabled:    true,
        bulkAction: 'promptRemove',
        weight:     -10, // Delete always goes last
      },
      {
        action:     'run',
        label:      'Run',
        icon:       'icon icon-play',
        bulkable:   true,
        enabled:    true,
        bulkAction: 'promptRemove',
        weight:     -10, // Delete always goes last
      }
    ];
  }

  async remove() {
    await DeleteJob({ id: this.id });
    await super.remove();
  }

  async run() {
    await RunJob({ id: this.id });
    await this.loadJobRuns();
  }
}
