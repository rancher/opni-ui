import capitalize from 'lodash/capitalize';
import { Resource } from './Resource';
import { deleteCluster } from '~/product/opni/utils/requests';
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

export class Cluster extends Resource {
  private base: ClusterResponse;
  private healthBase: HealthResponse;
  private clusterStats: ClusterStats;

  constructor(base: ClusterResponse, healthBase: HealthResponse, vue: any) {
    super(vue);
    this.base = base;
    this.healthBase = healthBase;
    this.clusterStats = {
      ingestionRate: 0,
      numSeries:     0,
    } as ClusterStats;
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
    return this.clusterStats?.ingestionRate;
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

  async remove() {
    await deleteCluster(this.base.id);
    super.remove();
  }
}
