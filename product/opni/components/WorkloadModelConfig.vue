<script>
import SortableTable from '@/components/SortableTable';
import Loading from '@/components/Loading';
import LabeledSelect from '@/components/form/LabeledSelect';
import Flyout from '@/product/opni/components/Flyout';
import DependencyWall from '@/product/opni/components/DependencyWall';
import {
  getDeployments, getModelStatus, trainModel, getModelTrainingParameters, hasGpu
} from '@/product/opni/utils/requests/workload';
import { isEmpty, sortBy, sum } from 'lodash';
import { getClusters } from '@/product/opni/utils/requests/management';
import Banner from '@/components/Banner';
import { getLoggingCluster } from '@/product/opni/utils/requests/logging';
import { isEnabled as isAiOpsEnabled } from '@/product/opni/components/AiOpsBackend';

export default {
  components: {
    Banner,
    DependencyWall,
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
      lastParameters:   {},
      status:           { statistics: {} },
      hasGpu:           false,
      isLoggingEnabled: false,
      isAiOpsEnabled:   false,
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

        if (!await isAiOpsEnabled()) {
          return;
        }
        this.$set(this, 'isAiOpsEnabled', true);

        if (window.location.search.includes('gpu=false')) {
          this.$set(this, 'hasGpu', false);
        } else if (window.location.search.includes('gpu=true')) {
          this.$set(this, 'hasGpu', true);
        } else {
          this.$set(this, 'hasGpu', await hasGpu());
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
      this.$set(this, 'status', { statistics: {}, ...(await getModelStatus()) });
    },

    selection(selection) {
      if (!this.ignoreSelection && this.deployments[this.cluster]) {
        this.$set(this.queue, this.cluster, [...selection]);
      }
    },

    async train() {
      this.$set(this.status, 'status', 'training');
      document.querySelector('main').scrollTop = 0;
      await trainModel(this.workloadList);
      this.$set(this, 'lastParameters', await getModelTrainingParameters());
    },

    async loadSelection() {
      const params = await getModelTrainingParameters();

      this.$set(this, 'lastParameters', params);
      const queue = {};

      params.items.forEach((workload) => {
        const flatDeployments = Object.values(this.deployments).flat();
        const deployment = flatDeployments.find((deployment) => {
          return workload.clusterId === deployment.clusterId && workload.namespace === deployment.namespace && workload.deployment === deployment.nameDisplay;
        });

        // Model params can still return deployments even if they're not available on the cluster anymore. I'm choosing to not show the deployments in the
        // queue since they can't actually be selected or deselected if they're no longer present
        if (this.deployments[workload.clusterId]) {
          queue[workload.clusterId] = queue[workload.clusterId] || [];
          queue[workload.clusterId].push(deployment);
        }
      });

      this.$set(this, 'queue', queue);
    },

    selectQueue() {
      setTimeout(() => {
        const clusterQueue = this.queue[this.cluster] || [];

        clusterQueue.forEach((deployment) => {
          if (deployment) {
            const a = document.querySelectorAll(`tr[data-node-id='${ deployment.id }'] .checkbox-custom`);

            a?.[0]?.click();
          }
        });

        this.$nextTick(() => {
          this.$set(this, 'ignoreSelection', false);
        });
      }, 0);
    },

    getClusterName(clusterId) {
      const cluster = this.clusters.find(c => c.value === clusterId);

      return cluster.label;
    },

    async removeAll() {
      this.$set(this, 'queue', {});
      this.$set(this, 'lastParameters', {});
      this.$refs.table.clearSelection();
      this.$set(this.status, 'status', 'training');
      document.querySelector('main').scrollTop = 0;
      await trainModel(this.workloadList);
    },

    getEta(secondsFromNow) {
      const secondsInMinute = 60;
      const secondsInHour = secondsInMinute * 60;
      const result = [];

      const hours = Math.floor(secondsFromNow / secondsInHour);

      result.push(hours > 0 ? `${ hours }h` : '');

      secondsFromNow -= hours * secondsInHour;
      const minutes = Math.floor(secondsFromNow / secondsInMinute);

      result.push(minutes > 0 || hours > 0 ? `${ minutes }m` : '');

      secondsFromNow -= minutes * secondsInMinute;
      const seconds = secondsFromNow;

      result.push(seconds > 0 || minutes > 0 || hours > 0 ? `${ seconds }s` : '');

      return result.filter(r => r).join(' ');
    },

    completed() {
      if (this.status?.statistics?.percentageCompleted >= 100) {
        return '';
      }

      return ` It's <b>${ this.status.statistics.percentageCompleted || 0 }% complete</b> and estimated to be done in <b>${ this.getEta(this.status.statistics.remainingTime) }</b>.`;
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
      switch (this.status.status) {
      case 'training':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'info';
      }
    },

    bannerMessage() {
      this.completed();
      switch (this.status.status) {
      case 'training':
        return `The deployment watchlist is being updated.${ this.completed() }`;
      case 'completed':
        return 'There are already deployments on the watchlist. You can update the watchlist if needed.';
      case 'not started':
        return 'You must add deployments to the watchlist before workload insights will be available.';
      default:
        return '';
      }
    },

    hasListChanged() {
      const flat = Object.values(this.queue).flat();
      const params = this.lastParameters?.items || [];

      if (params.length !== flat.length ) {
        return true;
      }

      return !params.some((parameters) => {
        return flat.find((f) => {
          return f.clusterId === parameters.clusterId &&
            f.namespace === parameters.namespace &&
            f.nameDisplay === parameters.deployment;
        });
      });
    },

    updateTooltip() {
      if (!this.hasGpu) {
        return `We can't update the watchlist without a GPU`;
      }

      if (!this.hasListChanged) {
        return `No changes have been selected`;
      }

      return null;
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
    <DependencyWall v-if="!isLoggingEnabled" title="Workload Insights" dependency-name="Logging" route-name="logging-config" />
    <DependencyWall v-else-if="!isAiOpsEnabled" title="Workload Insights" dependency-name="AIOps" route-name="ai-ops" />
    <div v-else>
      <Banner v-if="bannerMessage" :color="bannerColor" class="mt-0" v-html="bannerMessage" />
      <SortableTable
        ref="table"
        class="primary"
        :rows="deployments[cluster] || []"
        :headers="headers"
        :search="false"
        default-sort-by="logs"
        key-field="id"
        :sub-rows="true"
        group-by="namespace"
        :default-sort-descending="true"
        no-rows-key="opni.workloadInsights.noRowsKey"
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
          <div class="buttons">
            <button class="btn role-secondary mr-10" @click="removeAll">
              Clear Watchlist
            </button>
            <button v-tooltip="updateTooltip" class="btn role-primary" :disabled="!hasGpu || status.status === 'training' || !hasListChanged" @click="train">
              Update Watchlist
            </button>
          </div>
        </template>
        <div v-for="s in orderedSelection" :key="s.cluster" class="mt-20">
          <h3>{{ getClusterName(s.cluster) }}</h3>
          <SortableTable
            :rows="s.deployments || []"
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

  .buttons {
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
