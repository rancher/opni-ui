<script>
import LoggingPools, { createEmptyPool } from '@/product/opni/components/LoggingPools/index';
import Loading from '@/components/Loading';
import DashboardDetails from '@/product/opni/components/DashboardDetails';
import AsyncButton from '@/components/AsyncButton';
import {
  deleteLoggingCluster, getLoggingCluster, upsertLoggingCluster, upgradeLoggingCluster, isLoggingClusterUpgradeAvailable
} from '@/product/opni/utils/requests/logging';
import { exceptionToErrorsArray } from '@/utils/error';
import Banner from '@/components/Banner';
import LabeledInput from '@/components/form/LabeledInput';
import { isEmpty } from 'lodash';

export default {
  components: {
    AsyncButton,
    Banner,
    LoggingPools,
    Loading,
    DashboardDetails,
    LabeledInput
  },

  async fetch() {
    const cluster = await getLoggingCluster();

    if (!isEmpty(cluster)) {
      const upgradeable = await isLoggingClusterUpgradeAvailable();

      this.$set(this, 'upgradeable', !isEmpty(upgradeable) || window.location.search.includes('upgradeable'));

      cluster.NodePools.forEach((node) => {
        node.CPUResources = node.CPUResources || { Request: '', Limit: '' };
        node.Persistence = { ...{ Enabled: false, StorageClass: '' }, ...(node.Persistence || {}) };
        node.NodeSelector = node.NodeSelector || {};
        node.EnableAntiAffinity = node.EnableAntiAffinity || false;
      });
      this.$set(this, 'enabled', true);
      this.$set(this, 'config', { Dashboards: {}, ...cluster });
    }
  },

  data() {
    return {
      error:            '',
      loading:          false,
      dashboardEnabled: false,
      enabled:          false,
      statsInterval:    null,
      upgradeable:      false,
      config:           {
        ExternalURL:   '',
        DataRetention: '7d',
        NodePools:     [createEmptyPool(1)],
        Dashboards:    {
          Enabled: false, Replicas: 1, Resources: { Limits: {}, Requests: {} }
        },
      }
    };
  },

  methods: {
    enable() {
      this.$set(this, 'enabled', true);
    },

    async disable() {
      this.$set(this, 'error', '');
      try {
        await deleteLoggingCluster();
        this.$set(this, 'enabled', false);
      } catch (err) {
        this.$set(this, 'error', exceptionToErrorsArray(err).join('; '));
      }
    },

    enableDashboard() {
      this.$set(this.config.Dashboards, 'Enabled', true);
    },

    disableDashboard() {
      this.$set(this.config.Dashboards, 'Enabled', false);
      this.save(() => {});
    },

    numberSuffix(i) {
      const j = i % 10;
      const k = i % 100;

      if (j === 1 && k !== 11) {
        return `${ i }st`;
      }
      if (j === 2 && k !== 12) {
        return `${ i }nd`;
      }
      if (j === 3 && k !== 13) {
        return `${ i }rd`;
      }

      return `${ i }th`;
    },

    isStringMissing(s) {
      return s === '' || typeof s === 'undefined';
    },

    upgrade() {
      upgradeLoggingCluster();
      this.$set(this, 'upgradeable', false);
    },

    async save(buttonCallback) {
      if (this.config.ExternalURL === '') {
        this.$set(this, 'error', 'External URL is required');
        buttonCallback(false);

        return;
      }

      if (this.config.DataRetention === '') {
        this.$set(this, 'error', 'Data Retention is required');
        buttonCallback(false);

        return;
      }

      if (!(/\d+(d|m)/g).test(this.config.DataRetention)) {
        this.$set(this, 'error', 'Data Retention must be of the form <integer><time unit> i.e. 7d, 30d, 6m');
        buttonCallback(false);

        return;
      }

      for (let i = 0; i < this.config.NodePools.length; ++i) {
        const pool = this.config.NodePools[i];

        if (this.isStringMissing(pool.Name)) {
          this.$set(this, 'error', `Name is required on the ${ this.numberSuffix(i + 1) } node pool`);
          buttonCallback(false);

          return;
        }

        if (pool.Roles.length <= 0) {
          this.$set(this, 'error', `At least one role must be selected on the "${ pool.Name }" node pool`);
          buttonCallback(false);

          return;
        }

        if (this.isStringMissing(pool.DiskSize)) {
          this.$set(this, 'error', `Disk Size is required on the "${ pool.Name }" node pool`);
          buttonCallback(false);

          return;
        }

        if (this.isStringMissing(pool.MemoryLimit)) {
          this.$set(this, 'error', `Memory is required on the "${ pool.Name }" node pool`);
          buttonCallback(false);

          return;
        }
      }

      try {
        await upsertLoggingCluster(this.config);

        this.$set(this, 'error', '');
        buttonCallback(true);
        this.$router.replace({ name: 'logging-config' });
      } catch (err) {
        this.$set(this, 'error', exceptionToErrorsArray(err).join('; '));
        buttonCallback(false);
      }
    }
  },
};
</script>
<template>
  <Loading v-if="loading || $fetchState.pending" />
  <div v-else>
    <header>
      <h1>Logging</h1>
      <button v-if="enabled" class="btn bg-error" @click="disable">
        Disable
      </button>
    </header>
    <div class="body">
      <div v-if="enabled" class="enabled">
        <div v-if="upgradeable" class="row mb-10">
          <div class="col span-12">
            <Banner color="success">
              <div class="banner-message">
                <span>There's an upgrade available for your cluster.</span>
                <button class="btn bg-success" @click="upgrade">
                  Upgrade Now
                </button>
              </div>
            </Banner>
          </div>
        </div>
        <div class="row mb-20">
          <div class="col span-6">
            <LabeledInput v-model="config.ExternalURL" label="External URL" placeholder="e.g. example.com" :required="true" />
          </div>
          <div class="col span-6">
            <LabeledInput v-model="config.DataRetention" label="Data Retention" placeholder="e.g. 7d, 30d, 6m" :required="true" />
          </div>
        </div>
        <LoggingPools v-model="config.NodePools" />
        <DashboardDetails v-model="config.Dashboards" @disable="disableDashboard" @enable="enableDashboard" />
      </div>
      <div v-else class="not-enabled">
        <h4>Logging is not currently enabled. Enabling it will install additional resources on this cluster.</h4>
        <button class="btn role-primary" @click="enable">
          Enable
        </button>
      </div>
      <div v-if="enabled" class="resource-footer">
        <n-link class="btn role-secondary mr-10" :to="{name: 'clusters'}">
          Cancel
        </n-link>
        <AsyncButton mode="edit" @click="save" />
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
