import { Resource } from './Resource';
import { SloServiceResponse } from '~/product/opni/models/SloService';
import { cloneSLO, deleteSLO, getSLOStatus } from '~/product/opni/utils/requests/slo';

export type SloStatusStateResponse = 'InProgress' | 'Creating' | 'NoData' | 'Ok' | 'Warning' | 'Breaching' | 'PartialDataOk' | 'InternalError';

export interface SloStatusResponse {
  state: SloStatusStateResponse;
}

export interface SloAlertResponse {
    name: string,
    notificationTarget: string,
    notificationDescription: string,
    description: string,
    conditionType: string,
    thresholdType: string,
    onNoData: boolean,
    onCreate: boolean,
    onBreach: boolean,
    onResolved: boolean
}

export interface SloTagResponse {
  name: string;
}

export interface SloTargetResponse {
    value: number;
}

export interface SloMetadataResponse {
    name: string,
    datasource: string,
    budgetingInterval: string,
    sloPeriod: string;
    serviceId: string;
    clusterId: string;
    target: SloTargetResponse,
    labels: SloTagResponse[],
    alerts: SloAlertResponse[]
    goodEvents: any[];
    goodMetricName: string;
    totalEvents?: any[];
    totalMetricName?: string;
}

export interface SloResponse {
    id: string,
    SLO: SloMetadataResponse,
    service: SloServiceResponse
}

export interface SlosResponse {
    items: SloResponse[];
}

export class Slo extends Resource {
    private base: SloResponse;
    private state: SloStatusStateResponse;

    constructor(base: SloResponse, vue: any) {
      super(vue);
      this.base = base;
      this.state = 'Ok';
    }

    get nameDisplay(): string {
      return this.name;
    }

    get name(): string {
      return this.base.SLO.name;
    }

    get id(): string {
      return this.base.id;
    }

    get metadata(): SloMetadataResponse {
      return this.base.SLO;
    }

    get serviceId(): string {
      return this.base.SLO.serviceId;
    }

    get clusterId(): string {
      return this.base.SLO.clusterId;
    }

    get period(): string {
      return this.base.SLO.sloPeriod;
    }

    get goodMetricName(): string {
      return this.base.SLO.goodMetricName;
    }

    get goodEvents(): any[] {
      return this.base.SLO.goodEvents;
    }

    get totalMetricName(): string {
      return this.base.SLO.totalMetricName || '';
    }

    get totalEvents(): any[] {
      return this.base.SLO.totalEvents || [];
    }

    get status(): any {
      const stateMap = {
        InProgress:    'warning',
        Creating:      'warning',
        NoData:        'error',
        Ok:            'success',
        Warning:       'warning',
        Breaching:     'warning',
        PartialDataOk: 'success',
        InternalError: 'error',
      };

      return { state: stateMap[this.state] || 'error', message: this.state };
    }

    async updateStatus(): Promise<void> {
      this.state = (await getSLOStatus(this.base.id)) || 'InternalError';
    }

    get tags(): string[] {
      return (this.base.SLO?.labels || []).map(l => l.name);
    }

    get threshold(): number {
      return this.base.SLO.target.value;
    }

    get budgetingInterval(): string {
      return `${ Number.parseInt(this.base.SLO.budgetingInterval) / 60 }m`;
    }

    get availableActions(): any[] {
      return [
        {
          action:    'edit',
          altAction: 'edit',
          label:     'Edit',
          icon:      'icon icon-edit',
          enabled:   true,
        },
        {
          action:    'clone',
          altAction: 'clone',
          label:     'Clone',
          icon:      'icon icon-copy',
          enabled:   true,
        },
        {
          action:     'promptRemove',
          altAction:  'delete',
          label:      'Delete',
          icon:       'icon icon-trash',
          bulkable:   true,
          enabled:    true,
          bulkAction: 'promptRemove',
          weight:     -10, // Delete always goes last
        }
      ];
    }

    edit() {
      this.vue.$router.replace({
        name:   'slo',
        params: { id: this.base.id }
      });
    }

    async remove() {
      await deleteSLO(this.base.id);
      super.remove();
    }

    async clone() {
      await cloneSLO(this.base.id);
      super.clone();
    }
}
