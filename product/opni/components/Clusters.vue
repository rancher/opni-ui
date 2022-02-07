<script>
import SortableTable from '@/components/SortableTable';
import { getClusters } from '@/product/opni/utils/requests';
import Loading from '@/components/Loading';
import AddTokenDialog from './dialogs/AddTokenDialog';

export default {
  components: {
    AddTokenDialog, Loading, SortableTable
  },
  async fetch() {
    await this.load();
  },

  data() {
    return {
      loading:  false,
      clusters:  [],
      headers:  [
        {
          name:      'id',
          labelKey:  'tableHeaders.id',
          sort:      ['id'],
          value:     'id',
          width:     undefined
        },
        {
          name:          'labels',
          labelKey:      'tableHeaders.labels',
          sort:          ['labels'],
          value:         'labels',
        },
        {
          name:          'nodes',
          labelKey:      'tableHeaders.nodes',
          sort:          ['nodes'],
          value:         'nodes',
        },
      ]
    };
  },

  created() {
    this.$on('remove', this.onClusterDelete);
  },

  beforeDestroy() {
    this.$off('remove');
  },

  methods: {
    onClusterDelete() {
      this.load();
    },

    openCreateDialog(ev) {
      ev.preventDefault();
      this.$refs.dialog.open();
    },

    async load() {
      try {
        this.loading = true;
        await this.$set(this, 'clusters', await getClusters(this));
      } finally {
        this.loading = false;
      }
    }
  }
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
          Create Cluster
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
    <AddTokenDialog ref="dialog" @save="load" />
  </div>
</template>

<style lang="scss" scoped>
::v-deep {
  .nowrap {
    white-space: nowrap;
  }
}
</style>
