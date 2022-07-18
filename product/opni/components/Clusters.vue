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
          name:          'status',
          labelKey:      'tableHeaders.status',
          sort:          ['status.message'],
          value:         'status',
          formatter:     'StatusBadge'
        },
        {
          name:          'nameDisplay',
          labelKey:      'tableHeaders.name',
          sort:          ['nameDisplay'],
          value:         'nameDisplay',
          width:         undefined,
          formatter:     'TextWithClass',
          formatterOpts: {
            getClass(row, value) {
              // Value could either be a cluster ID in a UUID format or a
              // friendly name set by the user, if available. If the value is
              // a cluster ID, display it in a monospace font.
              // This regex will match UUID versions 1-5.
              const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

              return uuidRegex.test(value) ? 'monospace' : '';
            }
          }
        },
        {
          name:          'labels',
          labelKey:      'tableHeaders.labels',
          sort:          ['labels'],
          value:         'displayLabels',
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
          name:          'sampleRate',
          labelKey:      'tableHeaders.sampleRate',
          sort:          ['sampleRate'],
          value:         'sampleRate',
          formatter:     'Number',
          formatterOpts: { suffix: '/s' }
        }
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
        this.$set(cluster, 'stats', details.find(d => d.userID === cluster.id));
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

  .monospace {
    font-family: $mono-font;
  }
}
</style>
