<script>
import Loading from '@/components/Loading';
import AsyncButton from '@/components/AsyncButton';
import Banner from '@/components/Banner';
import LabeledSelect from '@/components/form/LabeledSelect';
import {
  getClusterConfiguration, configureCluster, getClusterStatus, installCluster, uninstallCluster
} from '@/product/opni/utils/requests/alerts';
import { exceptionToErrorsArray } from '@/utils/error';

export default {
  components: {
    AsyncButton,
    Banner,
    Loading,
    LabeledSelect,
  },

  async fetch() {
    try {
      await this.load();
    } catch (ex) {}
  },

  created() {
    this.$set(this, 'interval', setInterval(this.loadStatus, 2000));
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
      error:                      '',
      loading:                    false,
      enabled:                    false,
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
      config: {}
    };
  },

  methods: {
    async load() {
      await this.loadStatus();
      this.$set(this, 'enabled', this.status !== 'NotInstalled');
      if (this.status !== 'NotInstalled') {
        this.$set(this, 'config', await getClusterConfiguration());
      }
    },

    async loadStatus() {
      const status = (await getClusterStatus()).state;

      this.$set(this, 'status', status);
    },

    async enable() {
      await installCluster();
      await this.load();
      this.$set(this, 'enabled', true);
    },

    async disable(buttonCallback) {
      try {
        await uninstallCluster();
        buttonCallback(true);
        this.$set(this, 'enabled', false);
      } catch (err) {
        buttonCallback(false);
        this.$set(this, 'error', exceptionToErrorsArray(err).join('; '));
      }
    },

    async save(buttonCallback) {
      try {
        await configureCluster(this.config);
        this.load();

        this.$set(this, 'error', '');
        buttonCallback(true);
        this.$router.replace({ name: 'alerting-backend' });
      } catch (err) {
        this.$set(this, 'error', exceptionToErrorsArray(err).join('; '));
        buttonCallback(false);
      }
    },

  },
  computed: {
    bannerMessage() {
      switch (this.status) {
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

    bannerColor() {
      switch (this.status) {
      case 'InstallUpdating':
      case 'Uninstalling':
        return 'warning';
      case 'Installed':
        return `success`;
      default:
        return `error`;
      }
    },
  }
};
</script>
<template>
  <Loading v-if="loading || $fetchState.pending" />
  <div v-else>
    <header>
      <h1>Alerting</h1>
      <AsyncButton
        v-if="enabled"
        class="btn bg-error"
        mode="edit"
        action-label="Disable"
        waiting-label="Disabling"
        :disabled="!(status === 'Installed' || status === 'NotInstalled')"
        @click="disable"
      />
    </header>
    <Banner v-if="enabled && status !== 'NotInstalled'" :color="bannerColor">
      {{ bannerMessage }}
    </Banner>
    <div class="body">
      <div v-if="enabled" class="enabled">
        <div class="row mb-20">
          <div class="col span-12">
            <LabeledSelect v-model="config.numReplicas" :options="modes" label="Mode" />
          </div>
        </div>
      </div>
      <div v-else class="not-enabled">
        <h4>Alerting is not currently enabled. Enabling it will install additional resources on this cluster.</h4>
        <AsyncButton
          class="btn role-primary"
          mode="edit"
          action-label="Enable"
          waiting-label="Enabling"
          :disabled="!(status === 'Installed' || status === 'NotInstalled')"
          @click="enable"
        />
      </div>
      <div v-if="enabled" class="resource-footer">
        <n-link class="btn role-secondary mr-10" :to="{name: 'clusters'}">
          Cancel
        </n-link>
        <AsyncButton mode="edit" :disabled="!enabled || !(status === 'Installed' || status === 'NotInstalled')" @click="save" />
      </div>
      <Banner
        v-if="error"
        color="error"
        :label="error"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.middle {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.resource-footer {
  display: flex;
  flex-direction: row;

  justify-content: flex-end;
}

.banner-message {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.border {
    border-bottom: 1px solid #dcdee7;
    padding-bottom: 15px;
}

header {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

::v-deep {
  .card-container {
    min-height: initial;
  }

  .nowrap {
    white-space: nowrap;
  }

  .monospace {
    font-family: $mono-font;
  }

  .cluster-status {
    padding-left: 40px;
  }

  .capability-status {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }

  .not-enabled {
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .enabled {
    width: 100%;
  }
}
</style>
