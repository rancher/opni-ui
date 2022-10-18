<script>
import SortableTable from '@/components/SortableTable';
import Loading from '@/components/Loading';
import LabeledSelect from '@/components/form/LabeledSelect';
import Flyout from '@/product/opni/components/Flyout';
import {
  getDeployments, getModelStatus, trainModel, getModelTrainingParameters, hasGpu
} from '@/product/opni/utils/requests/workload';
import { isEmpty, sortBy, sum } from 'lodash';
import { getClusters } from '@/product/opni/utils/requests';
import Banner from '@/components/Banner';
import { getLoggingCluster } from '@/product/opni/utils/requests/logging';

export default {
  components: {
    Banner,
    Flyout,
    Loading,
    SortableTable,
    LabeledSelect
  },
  async fetch() {
    await this.load();
  },

  data() {
    return {
      loading:          false,
      statusInterval:   null,
      deployments:          {},
      cluster:          '',
      clusters:         [],
      queue:            {},
      status:           '',
      hasGpu:           false,
      isLoggingEnabled: false,
      ignoreSelection:  true,
      headers:          [
        {
          name:          'nameDisplay',
          labelKey:      'tableHeaders.name',
          sort:          ['nameDisplay'],
          value:         'nameDisplay',
          width:         340,
        },
        {
          name:          'logs',
          labelKey:      'tableHeaders.logs',
          sort:          ['logs'],
          value:         'logs',
        },
      ]
    };
  },

  created() {
    this.$set(this, 'statusInterval', setInterval(this.loadStatus, 10000));
  },

  beforeDestroy() {
    clearInterval(this.statusInterval);
  },

  methods: {
    async load() {
      try {
        this.loading = true;

        const loggingCluster = await getLoggingCluster();

        if (isEmpty(loggingCluster)) {
          return;
        }
        this.$set(this, 'isLoggingEnabled', true);

        if (window.location.search.includes('gpu=false')) {
          this.$set(this, 'hasGpu', false);
        } else if (window.location.search.includes('gpu=true')) {
          this.$set(this, 'hasGpu', true);
        } else {
          this.$set(this, 'hasGpu', await hasGpu());
        }

        if (!this.hasGpu) {
          return;
        }

        const clusters = await getClusters();

        this.$set(this, 'clusters', clusters.map(c => ({ label: c.nameDisplay, value: c.id })));
        this.$set(this, 'cluster', this.clusters[0].value);
        await Promise.all([this.loadDeployments(), this.loadStatus()]);
        await this.loadSelection();
        this.selectQueue();
      } finally {
        this.loading = false;
      }
    },

    async loadDeployments() {
      const clusterIds = this.clusters.map(c => c.value);
      const deployments = (await Promise.all(clusterIds.map(clusterId => getDeployments(clusterId)))).flat();
      const index = {};

      deployments.forEach((deployment) => {
        index[deployment.clusterId] = index[deployment.clusterId] || [];
        index[deployment.clusterId].push(deployment);
      });

      this.$set(this, 'deployments', index);
    },

    async loadStatus() {
      this.$set(this, 'status', (await getModelStatus()).id);
    },

    selection(selection) {
      if (!this.ignoreSelection) {
        this.$set(this.queue, this.cluster, selection);
      }
    },

    async train() {
      this.$set(this, 'status', 'training');
      document.querySelector('main').scrollTop = 0;
      await trainModel(this.workloadList);
    },

    async loadSelection() {
      const params = await getModelTrainingParameters();
      const queue = {};

      params.list.forEach((workload) => {
        const flatDeployments = Object.values(this.deployments).flat();
        const deployment = flatDeployments.find((deployment) => {
          return workload.clusterId === deployment.clusterId && workload.namespace === deployment.namespace && workload.deployment === deployment.nameDisplay;
        });

        queue[workload.clusterId] = queue[workload.clusterId] || [];
        queue[workload.clusterId].push(deployment);
      });

      this.$set(this, 'queue', queue);
    },

    selectQueue() {
      this.$nextTick(() => {
        const clusterQueue = this.queue[this.cluster] || [];

        clusterQueue.forEach((deployment) => {
          const a = document.querySelectorAll(`tr[data-node-id='${ deployment.id }'] .checkbox-custom`);

          a?.[0]?.click();
        });

        this.$nextTick(() => {
          this.$set(this, 'ignoreSelection', false);
        });
      });
    },

    getClusterName(clusterId) {
      const cluster = this.clusters.find(c => c.value === clusterId);

      return cluster.label;
    }
  },

  computed: {
    selectionCount() {
      return sum(Object.values(this.queue).flatMap(v => v.length));
    },

    orderedSelection() {
      return sortBy(Object.entries(this.queue).map(([cluster, deployments]) => ({ cluster, deployments })), 'cluster');
    },

    workloadList() {
      return Object.entries(this.queue).flatMap(([clusterId, deployments]) => {
        return deployments.map(deployment => ({
          clusterId,
          deployment: deployment.nameDisplay,
          namespace:  deployment.namespace
        }));
      });
    },

    bannerColor() {
      switch (this.status) {
      case 'training':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'info';
      }
    },

    bannerMessage() {
      switch (this.status) {
      case 'training':
        return 'The deployment watchlist is being updated.';
      case 'completed':
        return 'There are already deployments on the watchlist. You can update the watchlist if needed.';
      case 'not started':
        return 'You must add deployments to the watchlist before workload insights will be available.';
      default:
        return '';
      }
    }
  },

  watch: {
    cluster() {
      this.$set(this, 'ignoreSelection', true);
      this.selectQueue();
    }
  }
};
</script>
<template>
  <Loading v-if="loading || $fetchState.pending" />
  <div v-else>
    <header class="mb-0">
      <div class="title">
        <h1>Workload Insights</h1>
      </div>
    </header>
    <div v-if="!isLoggingEnabled" class="not-enabled">
      <h4>
        Logging must be enabled to use Workload Insights. <n-link :to="{name: 'logging-config'}">
          Click here
        </n-link> to enable logging.
      </h4>
    </div>
    <div v-else-if="!hasGpu" class="not-enabled">
      <h4>Workload Insights are only available when a Nvidia GPU is present in the cluster that Opni is installed in.</h4>
    </div>
    <div v-else>
      <Banner v-if="bannerMessage" :color="bannerColor" class="mt-0">
        {{ bannerMessage }}
      </Banner>
      <SortableTable
        class="primary"
        :rows="deployments[cluster]"
        :headers="headers"
        :search="false"
        default-sort-by="logs"
        key-field="id"
        :sub-rows="true"
        group-by="namespace"
        :default-sort-descending="true"
        @selection="selection"
      >
        <template #header-right>
          <div :style="{width: '350px'}">
            <LabeledSelect v-model="cluster" label="Cluster" :options="clusters" />
          </div>
        </template>
      </SortableTable>
      <Flyout :is-open="true">
        <template #title>
          <h4>There are <b>{{ selectionCount }}</b> deployments currently selected to be watched</h4>
          <button class="btn role-primary update-watchlist" :disabled="status === 'training' || selectionCount === 0" @click="train">
            Update Watchlist
          </button>
        </template>
        <div v-for="s in orderedSelection" :key="s.cluster" class="mt-10">
          <h3>{{ getClusterName(s.cluster) }}</h3>
          <SortableTable
            :rows="s.deployments"
            :headers="headers"
            :search="false"
            default-sort-by="logs"
            key-field="id"
            :sub-rows="true"
            :table-actions="false"
            group-by="namespace"
            :default-sort-descending="true"
          />
        </div>
      </Flyout>
    </div>
  </div>
</template>

<style lang="scss" scoped>
::v-deep {
  .primary {
    margin-bottom: 100px;
  }

  .title-bar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .fixed-header-actions .search {
    text-align: initial;
  }

  .main-row td:last-of-type button {
    display: none;
  }

  .fixed-header-actions .bulk {
    display: none;
  }

  .nowrap {
    white-space: nowrap;
  }

  .monospace {
    font-family: $mono-font;
  }

  .cluster-status {
    padding-left: 40px;
  }

  .capability-status {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }

  .update-watchlist {
    position: relative;

    z-index: 10;
  }
}

.not-enabled {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
