<script>
import SortableTable from '@/components/SortableTable';
import Loading from '@/components/Loading';
import EditClusterDialog from './dialogs/EditClusterDialog';
import { getSLOs } from '~/product/opni/utils/requests/slo';

export default {
  components: {
    EditClusterDialog, Loading, SortableTable
  },
  async fetch() {
    await this.load();
    await this.updateStatuses();
  },

  data() {
    return {
      loading:       false,
      statsInterval: null,
      clusters:      [],
      slos:          [],
      headers:       [
        {
          name:          'status',
          labelKey:      'tableHeaders.status',
          value:         'status',
          formatter:     'StatusBadge',
          width:     100
        },
        {
          name:          'nameDisplay',
          labelKey:      'tableHeaders.name',
          value:         'nameDisplay',
          width:         undefined
        },
        {
          name:          'tags',
          labelKey:      'tableHeaders.tags',
          value:         'tags',
          formatter:     'ListBubbles'
        },
        {
          name:      'period',
          labelKey:  'tableHeaders.period',
          value:     'period'
        },
      ]
    };
  },

  created() {
    this.$on('remove', this.onRemove);
    this.$on('clone', this.onClone);
    this.statsInterval = setInterval(this.updateStatuses, 10000);
  },

  beforeDestroy() {
    this.$off('remove');
    this.$off('clone');
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
  },

  methods: {
    onRemove() {
      this.load();
    },

    onClone() {
      this.load();
    },

    async load() {
      try {
        this.loading = true;
        this.$set(this, 'slos', await getSLOs(this));
        await this.updateStatuses();
      } finally {
        this.loading = false;
      }
    },
    async updateStatuses() {
      const promises = this.slos.map(slo => slo.updateStatus());

      await Promise.all(promises);
    }
  },
};
</script>
<template>
  <Loading v-if="loading || $fetchState.pending" />
  <div v-else>
    <header>
      <div class="title">
        <h1>SLOs</h1>
      </div>
      <div class="actions-container">
        <a class="btn role-primary" href="/slo/create">
          Create SLO
        </a>
      </div>
    </header>
    <SortableTable
      :rows="slos"
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
