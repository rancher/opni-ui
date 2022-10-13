<script>
import SortableTable from '@/components/SortableTable';
import Loading from '@/components/Loading';
import { getClusterStatus } from '@/product/opni/utils/requests/monitoring';
import { getAlertConditions } from '~/product/opni/utils/requests/alerts';

export default {
  components: { Loading, SortableTable },
  async fetch() {
    await this.load();
    await this.updateStatuses();
  },

  data() {
    return {
      loading:             false,
      statsInterval:       null,
      conditions:          [],
      isMonitoringEnabled: false,
      headers:             [
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
        },
        {
          name:          'description',
          labelKey:      'tableHeaders.description',
          value:         'description',
        },
        {
          name:      'type',
          labelKey:  'tableHeaders.type',
          value:     'typeDisplay'
        },
        {
          name:          'labels',
          labelKey:      'tableHeaders.labels',
          value:         'labels',
          formatter:     'ListBubbles'
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

        const status = (await getClusterStatus()).state;
        const isMonitoringEnabled = status !== 'NotInstalled';

        this.$set(this, 'isMonitoringEnabled', isMonitoringEnabled);

        if (isMonitoringEnabled) {
          this.$set(this, 'conditions', await getAlertConditions(this));
          await this.updateStatuses();
        }
      } finally {
        this.loading = false;
      }
    },
    async updateStatuses() {
      const promises = this.conditions.map(c => c.updateStatus());

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
        <h1>Conditions</h1>
      </div>
      <div v-if="isMonitoringEnabled" class="actions-container">
        <n-link class="btn role-primary" :to="{name: 'condition-create'}">
          Create Condition
        </n-link>
      </div>
    </header>
    <SortableTable
      v-if="isMonitoringEnabled"
      :rows="conditions"
      :headers="headers"
      :search="false"
      default-sort-by="expirationDate"
      key-field="id"
    />
    <div v-else class="not-enabled">
      <h4>
        Monitoring must be enabled to use Conditions. <n-link :to="{name: 'monitoring'}">
          Click here
        </n-link> to enable monitoring.
      </h4>
    </div>
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

.not-enabled {
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
</style>
