import { Resource } from './Resource';
import { deleteCluster, getCluster, uninstallCapabilityStatus } from '~/product/opni/utils/requests';
import { LABEL_KEYS } from '~/product/opni/models/shared';

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

export class Cluster extends Resource {
  private base: ClusterResponse;
  private healthBase: HealthResponse;
  private clusterStats: ClusterStats;
  private capLogs: CapabilityLog[];

  constructor(base: ClusterResponse, healthBase: HealthResponse, vue: any) {
    super(vue);
    this.base = base;
    this.healthBase = healthBase;
    this.clusterStats = {
      ingestionRate: 0,
      numSeries:     0,
    } as ClusterStats;
    this.capLogs = [];
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

  get displayLabels(): string[] {
    return Object.entries(this.base.metadata.labels)
      .filter(([key]) => !Object.values(LABEL_KEYS).includes(key))
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

    for (const i in this.capabilities) {
      try {
        const capability = this.capabilities[i];
        const log = await uninstallCapabilityStatus(this.id, capability, this.vue);

        logs.push({
          capability,
          state:   log.state,
          message: (log.logs || []).reverse()[0].msg
        });
      } catch (ex) {}
    }

    this.capLogs = logs;

    await this.updateCapabilities();
  }

  get availableActions(): any[] {
    const capabilityActions = [
      { divider: true },
      {
        action:   'uninstallMetrics',
        label:    'Uninstall Metrics',
        icon:     'icon icon-close',
        bulkable: false,
        enabled:  this.capabilities.includes('metrics'),
      },
      {
        action:   'uninstallLogging',
        label:    'Uninstall Logging',
        icon:     'icon icon-close',
        bulkable: false,
        enabled:  this.capabilities.includes('logging'),
      },
      {
        action:   'uninstallCapabilities',
        label:    'Uninstall All Capabilities',
        icon:     'icon icon-close',
        bulkable: false,
        enabled:  this.capabilities.length > 0,
      },
      { divider: true },
    ];

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
      ...(this.capabilities.length > 0 ? capabilityActions : []),
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

  uninstallMetrics() {
    this.vue.$emit('uninstallCapabilities', this, ['metrics']);
  }

  uninstallLogging() {
    this.vue.$emit('uninstallCapabilities', this, ['logging']);
  }

  uninstallCapabilities() {
    this.vue.$emit('uninstallCapabilities', this, this.capabilities);
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
