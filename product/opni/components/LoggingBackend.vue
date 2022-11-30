<script>
import LoggingPools, { createEmptyPool } from '@/product/opni/components/LoggingPools/index';
import CapabilityTable from '@/product/opni/components/CapabilityTable';
import DashboardDetails from '@/product/opni/components/DashboardDetails';
import Backend from '@/product/opni/components/Backend';
import {
  deleteLoggingCluster, getLoggingCluster, getLoggingStatus, upsertLoggingCluster, upgradeLoggingCluster, isLoggingClusterUpgradeAvailable, Status
} from '@/product/opni/utils/requests/logging';
import { exceptionToErrorsArray } from '@/utils/error';
import LabeledInput from '@/components/form/LabeledInput';
import { isEmpty } from 'lodash';
import { getCapabilities } from '@/product/opni/utils/requests/capability';

export default {
  components: {
    Backend,
    CapabilityTable,
    LoggingPools,
    DashboardDetails,
    LabeledInput,
  },

  async fetch() {
    try {
      const cluster = await getLoggingCluster();

      cluster.NodePools.forEach((node) => {
        node.CPUResources = node.CPUResources || { Request: '', Limit: '' };
        node.Persistence = { ...{ Enabled: false, StorageClass: '' }, ...(node.Persistence || {}) };
        node.NodeSelector = node.NodeSelector || {};
        node.EnableAntiAffinity = node.EnableAntiAffinity || false;
      });
      this.$set(this, 'config', {
        ...this.config, Dashboards: {}, ...cluster
      });
    } catch (ex) {}
  },

  data() {
    return {
      dashboardEnabled: false,
      enabled:          false,
      config:           {
        ExternalURL:   '',
        DataRetention: '7d',
        NodePools:     [createEmptyPool(1)],
        Dashboards:    {
          Enabled: true, Replicas: 1, Resources: { Limits: {}, Requests: {} }
        },
      }
    };
  },

  methods: {
    enable() {
      this.$set(this, 'enabled', true);
    },

    async disable() {
      await deleteLoggingCluster();
    },

    enableDashboard() {
      this.$set(this.config.Dashboards, 'Enabled', true);
    },

    disableDashboard() {
      this.$set(this.config.Dashboards, 'Enabled', false);
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
        document.querySelector('main').scrollTop = 0;

        this.$set(this, 'error', '');
        buttonCallback(true);
        this.$router.replace({ name: 'logging-config' });
      } catch (err) {
        this.$set(this, 'error', exceptionToErrorsArray(err).join('; '));
        buttonCallback(false);
      }
    },

    async loadCapabilities(parent) {
      return await getCapabilities('logging', parent);
    },

    async isEnabled() {
      const cluster = await getLoggingCluster();

      return !isEmpty(cluster);
    },

    async isUpgradeAvailable() {
      const upgradeable = await isLoggingClusterUpgradeAvailable();

      return !isEmpty(upgradeable);
    },

    bannerState(status) {
      if (!status) {
        return '';
      }

      switch (status) {
      case Status.ClusterStatusGreen:
        return 'success';
      case Status.ClusterStatusPending:
      case Status.ClusterStatusYellow:
        return 'warning';
      default:
        return 'error';
      }
    },

    bannerMessage(status) {
      return status ? status.details : '';
    },

    async getStatus() {
      try {
        const status = await getLoggingStatus();

        return {
          state:   this.bannerState(status.status),
          message: this.bannerMessage(status.status)
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
    title="Logging"
    :is-enabled="isEnabled"
    :disable="disable"
    :is-upgrade-available="isUpgradeAvailable"
    :get-status="getStatus"
    :save="save"
  >
    <template #editing>
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
    </template>
    <template #details>
      <CapabilityTable :capability-provider="loadCapabilities" />
    </template>
  </Backend>
</template>

<style lang="scss" scoped>
</style>
