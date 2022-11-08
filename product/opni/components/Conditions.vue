<script>
import SortableTable from '@/components/SortableTable';
import Loading from '@/components/Loading';
import { getClusterStatus, getAlertConditions } from '@/product/opni/utils/requests/alerts';
import { getClusters } from '~/product/opni/utils/requests';

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
      isAlertingEnabled: false,
      hasOneMonitoring:  false,
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
          width:    250
        },
        {
          name:          'description',
          labelKey:      'tableHeaders.description',
          value:         'description',
          width:    250
        },
        {
          name:      'type',
          labelKey:  'tableHeaders.type',
          value:     'typeDisplay'
        },
        {
          name:          'tags',
          labelKey:      'tableHeaders.tags',
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
        const isAlertingEnabled = status !== 'NotInstalled';

        this.$set(this, 'isAlertingEnabled', isAlertingEnabled);

        if (!isAlertingEnabled) {
          return;
        }

        const clusters = await getClusters(this);
        const hasOneMonitoring = clusters.some(c => c.isCapabilityInstalled('metrics'));

        this.$set(this, 'hasOneMonitoring', hasOneMonitoring);

        if (!hasOneMonitoring) {
          return;
        }

        this.$set(this, 'conditions', await getAlertConditions(this));
        await this.updateStatuses();
      } finally {
        this.loading = false;
      }
    },
    async updateStatuses() {
      const promises = this.conditions.map(c => c.updateStatus());

      try {
        await Promise.all(promises);
      } catch (ex) {}
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
      <div v-if="isAlertingEnabled && hasOneMonitoring" class="actions-container">
        <n-link class="btn role-primary" :to="{name: 'condition-create'}">
          Create Condition
        </n-link>
      </div>
    </header>
    <SortableTable
      v-if="isAlertingEnabled && hasOneMonitoring"
      :rows="conditions"
      :headers="headers"
      :search="false"
      default-sort-by="expirationDate"
      key-field="id"
    />
    <div v-else-if="!isAlertingEnabled" class="not-enabled">
      <h4>
        Alerting must be enabled to use Conditions. <n-link :to="{name: 'alerting-backend'}">
          Click here
        </n-link> to enable alerting.
      </h4>
    </div>
    <div v-else class="not-enabled">
      <h4>
        At least one cluster must have Monitoring installed to use Conditions. <n-link :to="{name: 'clusters'}">
          Click here
        </n-link> to enable Monitoring.
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
