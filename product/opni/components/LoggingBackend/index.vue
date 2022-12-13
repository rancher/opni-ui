<script>
import CapabilityTable from '@/product/opni/components/CapabilityTable';
import Backend from '@/product/opni/components/Backend';
import {
  getOpensearchCluster, GetOpensearchStatus, createOrUpdateOpensearchCluster, upgradeLoggingCluster, upgradeAvailable, Status, deleteOpensearchCluster
} from '@/product/opni/utils/requests/loggingv2';
import LabeledInput from '@/components/form/LabeledInput';
import { cloneDeep, isEmpty } from 'lodash';
import { getCapabilities } from '@/product/opni/utils/requests/capability';
import Tab from '@/components/Tabbed/Tab';
import Tabbed from '@/components/Tabbed';
import DataPods from './DataPods';
import IngestPods from './IngestPods';
import ControlplanePods from './ControlplanePods';
import Dashboard from './Dashboard';
import { getStorageClassOptions } from './Storage';

export default {
  components: {
    Backend,
    CapabilityTable,
    IngestPods,
    DataPods,
    ControlplanePods,
    Dashboard,
    LabeledInput,
    Tabbed,
    Tab
  },

  async fetch() {
    await this.load();
  },

  data() {
    return {
      dashboardEnabled: false,
      enabled:          false,
      loading:          true,
      config:           {
        externalURL:   '',
        DataRetention: '7d',

        dataNodes: {
          replicas:     '0',
          diskSize:     '20Gi',
          memoryLimit:  '1024Mi',
          cpuResources: {
            Request: '',
            Limit:   ''
          },
          enableAntiAffinity: false,
          nodeSelector:       {},
          tolerations:        [],
          Persistence:        {
            Enabled:      false,
            StorageClass: undefined
          }
        },

        ingestNodes: {
          Enabled:      false,
          replicas:     '0',
          memoryLimit:  '1024Mi',
          cpuResources: {
            Request: '',
            Limit:   ''
          },
          enableAntiAffinity: false,
          nodeSelector:       { },
          tolerations:        [],
        },

        controlplaneNodes: {
          Enabled:      false,
          replicas:     '',
          nodeSelector: { },
          tolerations:  [],
          Persistence:  {
            Enabled:      false,
            StorageClass: undefined
          },
        },

        Dashboards:    {
          Enabled: true, Replicas: '', Resources: { limits: {}, requests: {} }
        },

      },
      storageClassOptions: []
    };
  },

  methods: {
    enable() {
      this.$set(this, 'enabled', true);
    },

    async disable() {
      await deleteOpensearchCluster();
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

    async save() {
      if (this.config.externalURL === '') {
        throw new Error('External URL is required');
      }

      if (this.config.DataRetention === '') {
        throw new Error('Data Retention is required');
      }

      if (!(/\d+(d|m)/g).test(this.config.DataRetention)) {
        throw new Error('Data Retention must be of the form <integer><time unit> i.e. 7d, 30d, 6m');
      }
      const modifiedConfig = cloneDeep(this.config);

      if (modifiedConfig.ingestNodes?.Enabled) {
        delete modifiedConfig.ingestNodes.Enabled;
      } else if (modifiedConfig.ingestNodes && !modifiedConfig.ingestNodes.Enabled) {
        delete modifiedConfig.ingestNodes;
      }

      if (modifiedConfig.controlplaneNodes?.Enabled) {
        delete modifiedConfig.controlplaneNodes.Enabled;
      } else if (modifiedConfig.controlplaneNodes && !modifiedConfig.controlplaneNodes.Enabled) {
        delete modifiedConfig.controlplaneNodes;
      }

      if (!modifiedConfig.Dashboards?.Enabled) {
        modifiedConfig.Dashboards = { Enabled: false };
      }

      await createOrUpdateOpensearchCluster(modifiedConfig);
    },

    async loadCapabilities(parent) {
      return await getCapabilities('logging', parent);
    },

    async isEnabled() {
      const cluster = await getOpensearchCluster();

      return !isEmpty(cluster);
    },

    async isUpgradeAvailable() {
      const upgradeable = await upgradeAvailable();

      return upgradeable.UpgradePending;
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
        const status = await GetOpensearchStatus();

        return {
          state:   this.bannerState(status.status),
          message: this.bannerMessage(status)
        };
      } catch (ex) {
        return null;
      }
    },

    async load() {
      try {
        const cluster = await getOpensearchCluster();
        const config = { ...this.config, ...cluster };

        config.ingestNodes.Enabled = !!cluster.ingestNodes;
        config.controlplaneNodes.Enabled = !!cluster.controlplaneNodes;

        this.$set(this, 'config', config );
        this.$set(this, 'storageClassOptions', await getStorageClassOptions());
      } catch (ex) {}
    }
  }
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
          <LabeledInput v-model="config.externalURL" label="External URL" placeholder="e.g. example.com" :required="true" />
        </div>
        <div class="col span-6">
          <LabeledInput v-model="config.DataRetention" label="Data Retention" placeholder="e.g. 7d, 30d, 6m" :required="true" />
        </div>
      </div>
      <Tabbed :side-tabs="true">
        <Tab :weight="4" name="data-pods" label="Data Pods" tooltip="Data Pods are responsible for storing the data and running search and indexing operations.">
          <DataPods v-model="config.dataNodes" :storage-class-options="storageClassOptions" />
        </Tab>
        <Tab :weight="3" name="ingest-pods" label="Ingest Pods" tooltip="Ingest Pods are responsible for running the Opni ingest plugins, as well as indexing data.">
          <IngestPods v-model="config.ingestNodes" />
        </Tab>
        <Tab :weight="2" name="controlplane-pods" label="Controlplane Pods" tooltip="Controlplane Pods are responsible for maintaining cluster metadata.">
          <ControlplanePods v-model="config.controlplaneNodes" :storage-class-options="storageClassOptions" />
        </Tab>
        <Tab :weight="1" name="dashboard" label="Dashboard" tooltip="This is responsible for running the OpenSearch Dashboard UI.">
          <Dashboard v-model="config.Dashboards" />
        </Tab>
      </Tabbed>
    </template>
    <template #details>
      <CapabilityTable :capability-provider="loadCapabilities" />
    </template>
  </Backend>
</template>

<style lang="scss" scoped>
::v-deep .tab-container {
  position: relative;
}
</style>
