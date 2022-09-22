import Vue from 'vue';
import { Resource } from './Resource';
import { deleteCluster, getCluster, uninstallCapabilityStatus } from '~/product/opni/utils/requests';
import { LABEL_KEYS } from '~/product/opni/models/shared';
import { installCapabilityV2 } from '~/product/opni/utils/requests/management';

export interface ClusterResponse {
  id: string;
  metadata: {
    labels: { [key: string]: string };
    capabilities: {
      name: string;
    }[];
  }
}

export type State = 'success' | 'warning' | 'error';

export interface Status {
  state: State;
  message: string;
}

export interface HealthResponse {
  health: {
    ready: boolean;
    conditions: string[];
  },
  status: {
    connected: boolean;
  }
}

export interface ClustersResponse {
    items: ClusterResponse[];
}

export interface ClusterStats {
  userID: string;
  ingestionRate: number;
  numSeries: number;
  APIIngestionRate: number;
  RuleIngestionRate: number;
}

export interface ClusterStatsList {
  items: ClusterStats[];
}

export interface CapabilityLog {
  capability: string;
  state: string;
  message: string;
}

export interface CapabilityStatusLogResponse {
  msg: string;
  level: number;
  timestamp: string;
}

export interface CapabilityStatusTransitionResponse {
  state: string;
  timestamp: string;
}

export interface CapabilityStatusResponse {
  state: string;
  progress: null;
  metadata: 'string';
  logs: CapabilityStatusLogResponse[];
  transitions: CapabilityStatusTransitionResponse[];
}

export type CapabilityStatusState = 'info' | 'success' | 'warning' | 'error' | null;
export interface CapabilityStatus {
  state: CapabilityStatusState;
  message: string;
  pending: boolean;
}

export interface CapabilityStatuses {
  metrics?: CapabilityStatus;
  logging?: CapabilityStatus;
}

export class Cluster extends Resource {
  private base: ClusterResponse;
  private healthBase: HealthResponse;
  private clusterStats: ClusterStats;
  private capLogs: CapabilityLog[];
  private capabilityStatus: CapabilityStatuses;

  constructor(base: ClusterResponse, healthBase: HealthResponse, vue: any) {
    super(vue);
    this.base = base;
    this.healthBase = healthBase;
    this.clusterStats = {
      ingestionRate: 0,
      numSeries:     0,
    } as ClusterStats;
    this.capLogs = [];
    this.capabilityStatus = {};
    Vue.set(this, 'capabilityStatus', {});
  }

  get status(): Status {
    if (!this.healthBase.status.connected) {
      return {
        state:   'error',
        message: 'Disconnected'
      };
    }

    if (!this.healthBase.health.ready) {
      return {
        state:   'warning',
        message: this.healthBase.health.conditions.join(', ')
      };
    }

    return {
      state:   'success',
      message: 'Ready'
    };
  }

  get type(): string {
    return 'cluster';
  }

  get nameDisplay(): string {
    return this.name || this.base.id;
  }

  get name(): string {
    return this.base.metadata.labels[LABEL_KEYS.NAME];
  }

  get id(): string {
    return this.base.id;
  }

  get labels(): any {
    return this.base.metadata.labels;
  }

  get hiddenLabels(): any {
    const labels: any = {};

    Object.entries(this.base.metadata.labels)
      .filter(([key]) => key.includes('opni.io'))
      .forEach(([key, value]) => {
        labels[key] = value;
      });

    return labels;
  }

  get displayLabels(): string[] {
    return Object.entries(this.base.metadata.labels)
      .filter(([key]) => !key.includes('opni.io'))
      .map(([key, value]) => `${ key }=${ value }`);
  }

  get capabilities(): string[] {
    return this.base.metadata.capabilities.map(capability => capability.name);
  }

  get nodes(): [] {
    return [];
  }

  get numSeries(): number {
    return this.clusterStats?.numSeries;
  }

  get sampleRate(): number | undefined {
    return Math.floor(this.clusterStats?.ingestionRate || 0);
  }

  get rulesRate(): number | undefined {
    return this.clusterStats?.RuleIngestionRate;
  }

  get stats(): ClusterStats {
    return this.clusterStats;
  }

  set stats(stats: ClusterStats) {
    this.clusterStats = stats;
  }

  get capabilityLogs(): CapabilityLog[] {
    return this.capLogs;
  }

  async updateCapabilities(): Promise<void> {
    const newCluster = await getCluster(this.id, this.vue);

    this.base.metadata.capabilities = newCluster.base.metadata.capabilities;
  }

  async updateCabilityLogs(): Promise<void> {
    const logs:CapabilityLog[] = [];

    function getState(state: string): CapabilityStatusState {
      switch (state) {
      case 'Completed':
        return null;
      case 'Running':
      case 'Pending':
      case 'Cancelled':
        return 'info';
      default:
        return 'error';
      }
    }

    for (const i in this.capabilities) {
      try {
        const capability = this.capabilities[i] as (keyof CapabilityStatuses);
        const log = await uninstallCapabilityStatus(this.id, capability, this.vue);
        const pending = log.state === 'Pending' || log.state === 'Running' || this.capabilityStatus[capability]?.pending || false;

        Vue.set(this.capabilityStatus, capability, {
          state:   getState(log.state),
          message: (log.logs || []).reverse()[0]?.msg,
          pending
        });
      } catch (ex) {}
    }

    this.capLogs = logs;

    await this.updateCapabilities();
  }

  get availableActions(): any[] {
    return [
      {
        action:   'promptEdit',
        label:    'Edit',
        icon:     'icon icon-edit',
        bulkable: false,
        enabled:  true,
      },
      {
        action:   'copy',
        label:    'Copy ID',
        icon:     'icon icon-copy',
        bulkable: false,
        enabled:  true,
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

  uninstallCapabilities() {
    this.vue.$emit('uninstallCapabilities', this, this.capabilities);
  }

  get version() {
    return this.hiddenLabels[LABEL_KEYS.VERSION] || 'v1';
  }

  isCapabilityInstalled(capability: string) {
    return this.capabilities.includes(capability);
  }

  async installCapability(capability: keyof CapabilityStatuses) {
    Vue.set(this.capabilityStatus, capability, {
      state:   null,
      message: 'Currently installing',
      pending: true
    });

    const result = await installCapabilityV2(capability, this.id);
    const statusRaw = result.status;
    const status = statusRaw === 'Unknown' ? 'Error' : statusRaw;

    Vue.set(this.capabilityStatus, capability, {
      state:   status.toLowerCase(),
      message: status === 'success' ? 'Installation succeeded' : `Installation problem: ${ result.message }`,
      pending: false
    });
  }

  clearCapabilityStatus(capabilities: (keyof CapabilityStatuses)[]) {
    capabilities.forEach((capability) => {
      Vue.set(this.capabilityStatus, capability, {
        state:   null,
        message: null,
        pending: false
      });
    });
  }

  toggleCapability(capability: keyof CapabilityStatuses) {
    if (this.isCapabilityInstalled(capability)) {
      Vue.set(this.capabilityStatus, capability, {
        state:   null,
        message: 'Currently uninstalling',
        pending: true
      });

      this.vue.$emit('uninstallCapabilities', this, [capability]);
    }

    this.vue.$emit('installCapabilities', this, [capability]);
    this.installCapability(capability);
  }

  async remove() {
    await deleteCluster(this.base.id);
    super.remove();
  }

  public promptRemove(resources = this) {
    if (this.capabilities.length > 0) {
      this.vue.$emit('cantDeleteCluster', this);
    } else {
      this.vue.$store.commit('action-menu/togglePromptRemove', resources, { root: true });
    }
  }
}
