<script>
import SortableTable from '@/components/SortableTable';
import { getClusters, getClusterStats } from '@/product/opni/utils/requests';
import Loading from '@/components/Loading';
import EditClusterDialog from './dialogs/EditClusterDialog';

export default {
  components: {
    EditClusterDialog, Loading, SortableTable
  },
  async fetch() {
    await this.load();
    await this.loadStats();
  },

  data() {
    return {
      loading:       false,
      statsInterval: null,
      clusters:      [],
      headers:       [
        {
          name:          'nameDisplay',
          labelKey:      'tableHeaders.name',
          sort:          ['nameDisplay'],
          value:         'nameDisplay',
          width:         undefined,
          formatter:     'Monospace',
          formatterOpts: {
            condition: (text) => {
              return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text);
            }
          }
        },
        {
          name:          'labels',
          labelKey:      'tableHeaders.labels',
          sort:          ['labels'],
          value:         'labels',
          formatter:     'ListBubbles'
        },
        {
          name:          'capabilities',
          labelKey:      'tableHeaders.capabilities',
          sort:          ['capabilities'],
          value:         'capabilities',
          formatter:     'ListBubbles'
        },
        {
          name:      'numSeries',
          labelKey:  'tableHeaders.numSeries',
          sort:      ['numSeries'],
          value:     'numSeries',
          formatter: 'Number'
        },
        {
          name:      'sampleRate',
          labelKey:  'tableHeaders.sampleRate',
          sort:      ['sampleRate'],
          value:     'sampleRateDisplay',
        },
        {
          name:      'rulesRate',
          labelKey:  'tableHeaders.rulesRate',
          sort:      ['rulesRate'],
          value:     'rulesRateDisplay',
        },
      ]
    };
  },

  created() {
    this.$on('remove', this.onClusterDelete);
    this.$on('edit', this.openEditDialog);
    this.$on('copy', this.copyClusterID);
    this.statsInterval = setInterval(this.loadStats, 10000);
  },

  beforeDestroy() {
    this.$off('remove');
    this.$off('edit');
    this.$off('copy');
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
  },

  methods: {
    onClusterDelete() {
      this.load();
    },

    openEditDialog(cluster) {
      this.$refs.dialog.open(cluster);
    },

    copyClusterID(cluster) {
      this.$copyText(cluster.id);
    },

    async load() {
      try {
        this.loading = true;
        this.$set(this, 'clusters', await getClusters(this));
      } finally {
        this.loading = false;
      }
    },
    async loadStats() {
      const details = await getClusterStats(this);

      this.clusters.forEach((cluster) => {
        cluster.stats = details.find(d => d.userID === cluster.id);
      });
    }
  },
};
</script>
<template>
  <Loading v-if="loading || $fetchState.pending" />
  <div v-else>
    <header>
      <div class="title">
        <h1>Clusters</h1>
      </div>
      <div class="actions-container">
        <a class="btn role-primary" href="/cluster/create">
          Add Cluster
        </a>
      </div>
    </header>
    <SortableTable
      :rows="clusters"
      :headers="headers"
      :search="false"
      default-sort-by="expirationDate"
      key-field="id"
    />
    <EditClusterDialog ref="dialog" @save="load" />
  </div>
</template>

<style lang="scss" scoped>
::v-deep {
  .nowrap {
    white-space: nowrap;
  }
}
</style>
