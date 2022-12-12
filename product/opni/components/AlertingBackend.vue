<script>
import LabeledSelect from '@/components/form/LabeledSelect';
import {
  getClusterConfiguration, configureCluster, getClusterStatus, installCluster, uninstallCluster
} from '@/product/opni/utils/requests/alerts';
import Backend from '@/product/opni/components/Backend';

export default {
  components: {
    Backend,
    LabeledSelect,
  },

  async fetch() {
    try {
      await this.load();
    } catch (ex) {}
  },

  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
      this.$set(this, 'interval', null);
    }
  },

  data() {
    return {
      interval:                   null,
      loading:                    false,
      statsInterval:              null,
      modes:                      [
        {
          label: 'Standalone',
          value: 1
        },
        {
          label: 'Highly Available',
          value: 3
        },
      ],
      status:     '',
      config: { numReplicas: 1 }
    };
  },

  methods: {
    async load() {
      this.$set(this, 'config', await getClusterConfiguration());
    },

    async disable(buttonCallback) {
      await uninstallCluster();
    },

    async save() {
      await installCluster();
      const config = await getClusterConfiguration();

      await configureCluster({ ...config, ...this.config });
      this.load();
    },
    bannerMessage(status) {
      switch (status) {
      case 'InstallUpdating':
        return `Alerting is currently updating on the cluster. You can't make changes right now.`;
      case 'Uninstalling':
        return `Alerting is currently uninstalling from the cluster . You can't make changes right now.`;
      case 'Installed':
        return `Alerting is currently installed on the cluster.`;
      default:
        return `Alerting is currently in an unknown state on the cluster. You can't make changes right now.`;
      }
    },

    bannerState(status) {
      switch (status) {
      case 'InstallUpdating':
      case 'Uninstalling':
        return 'warning';
      case 'Installed':
        return `success`;
      default:
        return `error`;
      }
    },

    async isEnabled() {
      const status = (await getClusterStatus()).state;

      return status !== 'NotInstalled';
    },

    async isUpgradeAvailable() {
      return await false;
    },

    async getStatus() {
      try {
        const status = (await getClusterStatus()).state;

        if (status === 'NotInstalled') {
          return null;
        }

        return {
          state:   this.bannerState(status),
          message: this.bannerMessage(status)
        };
      } catch (ex) {
        return null;
      }
    }
  },
};
</script>
<template>
  <Backend
    title="Alerting"
    :is-enabled="isEnabled"
    :disable="disable"
    :is-upgrade-available="isUpgradeAvailable"
    :get-status="getStatus"
    :save="save"
  >
    <template #editing>
      <div class="row mb-20">
        <div class="col span-12">
          <LabeledSelect v-model="config.numReplicas" :options="modes" label="Mode" />
        </div>
      </div>
    </template>
  </Backend>
</template>

<style lang="scss" scoped>
</style>
