import { Resource } from './Resource';
import { deleteCluster } from '~/product/opni/utils/requests';

export interface ClusterResponse {
    id: string;
    labels: { [key: string]: string };
}

export interface ClustersResponse {
    items: ClusterResponse[];
}

export class Cluster extends Resource {
    private base: ClusterResponse;

    constructor(base: ClusterResponse, vue: any) {
      super(vue);
      this.base = base;
    }

    get type(): string {
      return 'cluster';
    }

    get nameDisplay(): string {
      return this.base.id;
    }

    get id(): string {
      return this.base.id;
    }

    get labels(): string[] {
      return Object.entries(this.base.labels).map(([key, value]) => `${ key }=${ value }`);
    }

    get nodes(): [] {
      return [];
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
        }
      ];
    }

    async remove() {
      await deleteCluster(this.base.id);
      super.remove();
    }
}
