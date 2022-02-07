<script>
import SortableTable from '@/components/SortableTable';
import { getTokens } from '@/product/opni/utils/requests';
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
      loading: false,
      tokens:  [],
      headers: [
        {
          name:      'id',
          labelKey:  'tableHeaders.id',
          sort:      ['id'],
          value:     'id',
          width:     undefined
        },
        {
          name:          'used',
          labelKey:      'tableHeaders.used',
          sort:          ['used'],
          value:         'usedDisplay',
          formatter:     'TextWithClass',
          formatterOpts: {
            getClass() {
              return 'nowrap';
            }
          },
        },
        {
          name:          'expirationDate',
          labelKey:      'tableHeaders.expiration',
          sort:          ['expirationDate'],
          value:         'expirationDate',
          formatter:     'LiveExpirationDate',
        },
      ]
    };
  },

  created() {
    this.$on('remove', this.onTokenDelete);
  },

  beforeDestroy() {
    this.$off('remove');
  },

  methods: {
    onTokenDelete() {
      this.load();
    },

    openCreateDialog(ev) {
      ev.preventDefault();
      this.$refs.dialog.open();
    },

    async load() {
      try {
        this.loading = true;
        await this.$set(this, 'tokens', await getTokens(this));
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
        <h1>Tokens</h1>
      </div>
      <div class="actions-container">
        <a class="btn role-primary" @click="openCreateDialog">
          Create Token
        </a>
      </div>
    </header>
    <SortableTable
      :rows="tokens"
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
