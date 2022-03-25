<script>
import SortableTable from '@/components/SortableTable';
import { getClusters, getTokens } from '@/product/opni/utils/requests';
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
      tokens:   [],
      clusters: [],
      headers:  [
        {
          name:          'nameDisplay',
          labelKey:      'tableHeaders.token',
          sort:          ['nameDisplay'],
          value:         'nameDisplay',
          width:         undefined,
          formatter:     'Token',
        },
        {
          name:          'labels',
          labelKey:      'tableHeaders.labels',
          sort:          ['labels'],
          value:         'labels',
          formatter:     'ListBubbles'
        },
        {
          name:      'capabilities',
          labelKey:  'tableHeaders.capabilities',
          sort:      ['capabilities'],
          value:     'capabilities',
          formatter: 'ListBubbles'
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
    this.$on('copy', this.copyToken);
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
      this.$refs.dialog.open(this.clusters);
    },

    copyToken(token) {
      this.$copyText(token.id);
    },

    async load() {
      try {
        this.loading = true;
        this.$set(this, 'tokens', await getTokens(this));
        this.$set(this, 'clusters', await getClusters(this));
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
