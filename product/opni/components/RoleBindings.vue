<script>
import SortableTable from '@/components/SortableTable';
import { getRoleBindings } from '@/product/opni/utils/requests';
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
      loading:      false,
      roleBindings:  [],
      headers:      [
        {
          name:      'name',
          labelKey:  'tableHeaders.name',
          sort:      ['name'],
          value:     'name',
          width:     undefined
        },
        {
          name:          'subjects',
          labelKey:      'tableHeaders.subjects',
          sort:          ['subjects'],
          value:         'subjects',
          formatter:     'List'
        },
        {
          name:          'role',
          labelKey:      'tableHeaders.role',
          sort:          ['role'],
          value:         'role',
        },
        {
          name:          'taints',
          labelKey:      'tableHeaders.taints',
          sort:          ['taints'],
          value:         'taints',
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
        await this.$set(this, 'roleBindings', await getRoleBindings(this));
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
        <h1>Role Bindings</h1>
      </div>
      <div class="actions-container">
        <a class="btn role-primary" href="/role-binding/create">
          Create Role Binding
        </a>
      </div>
    </header>
    <SortableTable
      :rows="roleBindings"
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
