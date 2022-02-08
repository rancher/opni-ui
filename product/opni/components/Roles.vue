<script>
import SortableTable from '@/components/SortableTable';
import { getRoles } from '@/product/opni/utils/requests';
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
      roles:   [],
      headers:  [
        {
          name:      'name',
          labelKey:  'tableHeaders.name',
          sort:      ['name'],
          value:     'name',
          width:     undefined
        },
        {
          name:          'clusterIds',
          labelKey:      'tableHeaders.clusters',
          sort:          ['clusterIds'],
          value:         'clusterIds',
          formatter:     'List'
        },
        {
          name:          'matchLabels',
          labelKey:      'tableHeaders.matchLabels',
          sort:          ['matchLabels'],
          value:         'matchLabelsDisplay',
          formatter:     'ListBubbles'
        },
        {
          name:          'matchExpressions',
          labelKey:      'tableHeaders.matchExpressions',
          sort:          ['matchExpressions'],
          value:         'matchExpressionsDisplay',
          formatter:     'ListBubbles'
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
        await this.$set(this, 'roles', await getRoles(this));
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
        <h1>Roles</h1>
      </div>
      <div class="actions-container">
        <a class="btn role-primary" href="/role/create">
          Create Role
        </a>
      </div>
    </header>
    <SortableTable
      :rows="roles"
      :headers="headers"
      :search="false"
      default-sort-by="expirationDate"
      key-field="name"
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
