<script>
import Loading from '@/components/Loading';
import AsyncButton from '@/components/AsyncButton';
import Banner from '@/components/Banner';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import Checkbox from '@/components/form/Checkbox';
import UnitInput from '@/components/form/UnitInput';
import { configureCluster, uninstallCluster, getClusterConfig } from '@/product/opni/utils/requests/monitoring';
import { getClusterStats } from '@/product/opni/utils/requests';
import { exceptionToErrorsArray } from '@/utils/error';
import CapabilityTable from '@/product/opni/components/CapabilityTable';
import { getCapabilities } from '@/product/opni/utils/requests/capability';
import Tab from '@/components/Tabbed/Tab';
import Tabbed from '@/components/Tabbed';
import GrafanaConfig from '~/product/opni/components/GrafanaConfig';

const SECONDS_IN_DAY = 86400;

export default {
  components: {
    AsyncButton,
    Banner,
    Checkbox,
    Loading,
    LabeledInput,
    LabeledSelect,
    UnitInput,
    GrafanaConfig,
    CapabilityTable,
    Tab,
    Tabbed
  },

  async fetch() {
    try {
      await this.load();
    } catch (ex) {}
    this.updateEndpoint();
  },

  data() {
    return {
      error:                      '',
      loading:                    false,
      dashboardEnabled:           false,
      enabled:                    false,
      statsInterval:              null,
      capabilities:               [],
      modes:                      [
        {
          label: 'Standalone',
          value: 0
        },
        {
          label: 'Highly Available',
          value: 1
        },
      ],
      signatureVersionOptions: [
        {
          label: 'v4',
          value: 'v4'
        },
        {
          label: 'v2',
          value: 'v2'
        },
      ],
      regions: [
        'us-east-2',
        'us-east-1',
        'us-west-1',
        'us-west-2',
        'af-south-1',
        'ap-east-1',
        'ap-southeast-3',
        'ap-south-1',
        'ap-northeast-3',
        'ap-northeast-2',
        'ap-southeast-1',
        'ap-southeast-2',
        'ap-northeast-1',
        'ca-central-1',
        'eu-central-1',
        'eu-west-1',
        'eu-west-2',
        'eu-south-1',
        'eu-west-3',
        'eu-north-1',
        'me-south-1',
        'me-central-1',
        'sa-east-1',
        'us-gov-east-1',
        'us-gov-west-1',
      ],
      sseTypes: [
        { label: 'None', value: '' },
        { label: 'SSE-KMS', value: 'SSE-KMS' },
        { label: 'SSE-S3', value: 'SSE-S3' },
      ],
      status:     '',
      filesystem: { directory: '' },
      s3:         {
        endpoint:         '',
        region:           'us-east-1',
        bucketName:       '',
        secretAccessKey:  '',
        accessKeyID:      '',
        insecure:         false,
        signatureVersion: 'v4',
        sse:              {
          type:                 '',
          kmsKeyID:             '',
          kmsEncryptionContext: '',
        },
        http: {
          idleConnTimeout:       '90s',
          responseHeaderTimeout: '120s',
          insecureSkipVerify:    false,
          tlsHandshakeTimeout:   '10s',
          expectContinueTimeout: '10s',
          maxIdleConns:          100,
          maxIdleConnsPerHost:   0,
          maxConnsPerHost:       100,
        },
      },
      config:           {
        mode:          0,
        storage:       { backend: 'filesystem', retentionPeriod: `${ 30 * SECONDS_IN_DAY }s` },
        grafana:       { enabled: true }
      }
    };
  },

  methods: {
    async load() {
      try {
        await this.loadStatus();
        this.$set(this, 'enabled', this.status !== 'NotInstalled');
        if (this.status !== 'NotInstalled') {
          const config = await getClusterConfig();

          this.$set(this.config, 'mode', config.mode || 0);
          this.$set(this, config.storage.backend, config.storage[config.storage.backend]);
          this.$set(this.config.storage, 'backend', config.storage.backend);
          this.$set(this.config, 'grafana', config.grafana || { enabled: false });
        }
      } catch (ex) {}
    },

    async updateStatus(capabilities = []) {
      try {
        if (this.enabled) {
          const stats = await getClusterStats(this);

          capabilities.forEach(c => c.updateStats(stats));
        }
      } catch (ex) {}
    },

    async loadCapabilities(parent) {
      return await getCapabilities('metrics', parent);
    },

    enable() {
      this.$set(this, 'enabled', true);
    },

    headerProvider(headers) {
      const newHeaders = [...headers];

      newHeaders.push(...[
        {
          name:      'numSeries',
          labelKey:  'tableHeaders.numSeries',
          sort:      ['numSeries'],
          value:     'numSeries',
          formatter: 'Number'
        },
        {
          name:          'sampleRate',
          labelKey:      'tableHeaders.sampleRate',
          sort:          ['sampleRate'],
          value:         'sampleRate',
          formatter:     'Number',
          formatterOpts: { suffix: '/s' }
        }
      ]);

      return newHeaders;
    },

    async disable(buttonCallback) {
      try {
        this.$set(this, 'error', '');
        await uninstallCluster();
        this.$set(this, 'enabled', false);
        this.$set(this, 's3.secretAccessKey', '');
        buttonCallback(true);
      } catch (err) {
        buttonCallback(false);
        this.$set(this, 'error', exceptionToErrorsArray(err).join('; '));
      }
    },

    async save(buttonCallback) {
      if (this.config.storage.backend === '') {
        this.$set(this, 'error', 'Backend is required');
        buttonCallback(false);

        return;
      }

      if (this.config.storage.backend === 's3') {
        if (this.s3.endpoint === '') {
          this.$set(this, 'error', 'Endpoint is required');
          buttonCallback(false);

          return;
        }

        if (this.s3.bucketName === '') {
          this.$set(this, 'error', 'Bucketname is required');
          buttonCallback(false);

          return;
        }

        if (this.s3.secretAccessKey === '') {
          this.$set(this, 'error', 'Secret Access Key is required');
          buttonCallback(false);

          return;
        }
      }

      if (this.config.grafana.enabled) {
        // check if hostname is set and not empty
        if (!this.config.grafana.hostname || this.config.grafana.hostname === '') {
          this.$set(this, 'error', 'Grafana hostname is required');
          buttonCallback(false);

          return;
        }
      }

      try {
        this.config.storage[this.config.storage.backend] = this[this.config.storage.backend];

        await configureCluster(this.config);
        this.load();

        this.$set(this, 'error', '');
        buttonCallback(true);
        this.$router.replace({ name: 'monitoring' });
      } catch (err) {
        this.$set(this, 'error', exceptionToErrorsArray(err).join('; '));
        buttonCallback(false);
      }
    },

    updateEndpoint() {
      const endpoints = {
        'us-east-2':      's3.us-east-2.amazonaws.com',
        'us-east-1':      's3.us-east-1.amazonaws.com',
        'us-west-1':      's3.us-west-1.amazonaws.com',
        'us-west-2':      's3.us-west-2.amazonaws.com',
        'af-south-1':     's3.af-south-1.amazonaws.com',
        'ap-east-1':      's3.ap-east-1.amazonaws.com',
        'ap-south-1':     's3.ap-south-1.amazonaws.com',
        'ap-northeast-3': 's3.ap-northeast-3.amazonaws.com',
        'ap-northeast-2': 's3.ap-northeast-2.amazonaws.com',
        'ap-southeast-1': 's3.ap-southeast-1.amazonaws.com',
        'ap-southeast-2': 's3.ap-southeast-2.amazonaws.com',
        'ap-northeast-1': 's3.ap-northeast-1.amazonaws.com',
        'ca-central-1':   's3.ca-central-1.amazonaws.com',
        'cn-northwest-1': 's3.cn-northwest-1.amazonaws.com.cn',
        'eu-central-1':   's3.eu-central-1.amazonaws.com',
        'eu-west-1':      's3.eu-west-1.amazonaws.com',
        'eu-west-2':      's3.eu-west-2.amazonaws.com',
        'eu-south-1':     's3.eu-south-1.amazonaws.com',
        'eu-west-3':      's3.eu-west-3.amazonaws.com',
        'eu-north-1':     's3.eu-north-1.amazonaws.com',
        'ap-southeast-3': 's3.ap-southeast-3.amazonaws.com',
        'me-south-1':     's3.me-south-1.amazonaws.com',
        'me-central-1':   's3.me-central-1.amazonaws.com',
        'sa-east-1':      's3.sa-east-1.amazonaws.com',
        'us-gov-east-1':  's3.us-gov-east-1.amazonaws.com',
        'us-gov-west-1':  's3.us-gov-west-1.amazonaws.com',
      };

      if (this.s3.region) {
        return this.$set(this.s3, 'endpoint', `${ endpoints[this.s3.region] }`);
      }
    },

    enableGrafana() {
      this.$set(this.config, 'grafana', { enabled: true });
    },

    disableGrafana() {
      this.$set(this.config, 'grafana', { enabled: false });
    }
  },
  computed: {
    bannerMessage() {
      switch (this.status) {
      case 'Updating':
        return `Monitoring is currently updating on the cluster. You can't make changes right now.`;
      case 'Uninstalling':
        return `Monitoring is currently uninstalling from the cluster . You can't make changes right now.`;
      case 'Installed':
        return `Monitoring is currently installed on the cluster.`;
      default:
        return `Monitoring is currently in an unknown state on the cluster. You can't make changes right now.`;
      }
    },

    storageOptions() {
      // only enable filesystem in standalone mode (0)
      if (this.config.mode === 0) {
        return [
          { label: 'Filesystem', value: 'filesystem' },
          { label: 'S3', value: 's3' }
        ];
      }

      return [
        { label: 'S3', value: 's3' }
      ];
    },

    mode: {
      get() {
        return this.config.mode;
      },
      set(val) {
        this.$set(this.config, 'mode', val);
        if (val !== 0 && this.config.storage.backend === 'filesystem') {
          // switch to the next available mode
          this.$set(this.config.storage, 'backend', this.storageOptions[0].value);
        }
      }
    },

    bannerColor() {
      switch (this.status) {
      case 'Updating':
      case 'Uninstalling':
        return 'warning';
      case 'Installed':
        return `success`;
      default:
        return `error`;
      }
    },

    s3RetentionPeriod: {
      get() {
        return Number.parseInt(this.config.storage.retentionPeriod || '0') / SECONDS_IN_DAY;
      },

      set(value) {
        this.$set(this.config.storage, 'retentionPeriod', `${ (value || 0) * SECONDS_IN_DAY }s`);
      }
    },

    s3IdleConnTimeout: {
      get() {
        return Number.parseInt(this.s3?.http?.idleConnTimeout || '0');
      },

      set(value) {
        this.$set(this.s3.http, 'idleConnTimeout', `${ value || 0 }s`);
      }
    },

    s3ResponseHeaderTimeout: {
      get() {
        return Number.parseInt(this.s3?.http?.responseHeaderTimeout || '0');
      },

      set(value) {
        this.$set(this.s3.http, 'responseHeaderTimeout', `${ value || 0 }s`);
      }
    },

    s3TlsHandshakeTimeout: {
      get() {
        return Number.parseInt(this.s3?.http?.tlsHandshakeTimeout || '0');
      },

      set(value) {
        this.$set(this.s3.http, 'tlsHandshakeTimeout', `${ value || 0 }s`);
      }
    },

    s3ExpectContinueTimeout: {
      get() {
        return Number.parseInt(this.s3?.http?.expectContinueTimeout || '0');
      },

      set(value) {
        this.$set(this.s3.http, 'expectContinueTimeout', `${ value || 0 }s`);
      }
    },
  }
};
</script>
<template>
  <Loading v-if="loading || $fetchState.pending" />
  <div v-else>
    <header>
      <h1>Monitoring</h1>
      <AsyncButton
        v-if="enabled && status !== 'NotInstalled'"
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
        <Tabbed class="mb-20">
          <Tab name="options" label="Options" :weight="2">
            <div class="row mb-10">
              <div class="col span-12">
                <LabeledSelect v-model="mode" :options="modes" label="Mode" />
              </div>
            </div>

            <div class="m-0">
              <div>
                <div class="row" :class="{border: config.storage.backend === 's3'}">
                  <div class="col span-6">
                    <LabeledSelect v-model="config.storage.backend" :options="storageOptions" label="Storage Type" />
                  </div>
                  <div class="col span-6">
                    <UnitInput v-model="s3RetentionPeriod" class="retention-period" label="Data Retention Period" suffix="days" tooltip="A value of 0 will retain data indefinitely" />
                  </div>
                </div>
                <div v-if="config.storage.backend === 's3'" class="mt-15">
                  <h3>Target</h3>
                  <div class="row mb-10">
                    <div class="col span-6">
                      <LabeledSelect v-model="s3.region" :options="regions" label="Region" @input="updateEndpoint" />
                    </div>
                    <div class="col span-6">
                      <LabeledInput v-model="s3.bucketName" label="Bucket Name" :required="true" />
                    </div>
                  </div>
                  <div class="row mb-10 border">
                    <div class="col span-6">
                      <LabeledInput v-model="s3.endpoint" label="Endpoint" :required="true" />
                    </div>
                    <div class="col span-6 middle">
                      <Checkbox v-model="s3.insecure" label="Insecure" />
                    </div>
                  </div>
                  <h3>Access</h3>
                  <div class="row mb-10">
                    <div class="col span-6">
                      <LabeledInput v-model="s3.accessKeyID" label="Access Key ID" :required="true" />
                    </div>
                    <div class="col span-6">
                      <LabeledInput v-model="s3.secretAccessKey" label="Secret Access Key" :required="true" type="password" />
                    </div>
                  </div>
                  <div class="row mb-10">
                    <div class="col span-6">
                      <LabeledSelect v-model="s3.signatureVersion" :options="signatureVersionOptions" label="Signature Version" />
                    </div>
                  </div>
                  <h3>Server Side Encryption</h3>
                  <div class="row mb-10">
                    <div class="col span-6">
                      <LabeledSelect v-model="s3.sse.type" :options="sseTypes" label="Type" />
                    </div>
                  </div>
                  <div v-if="s3.sse.type === 'SSE-KMS'" class="row mb-10">
                    <div class="col span-6">
                      <LabeledInput v-model="s3.sse.kmsKeyID" label="KMS Key Id" :required="true" />
                    </div>
                    <div class="col span-6">
                      <LabeledInput v-model="s3.sse.kmsEncryptionContext" label="KMS Encryption Context" :required="true" />
                    </div>
                  </div>
                  <h3>Connection</h3>
                  <div class="row mb-10">
                    <div class="col span-6">
                      <UnitInput v-model="s3IdleConnTimeout" label="Idle Connection Timeout" placeholder="e.g. 30, 60" suffix="s" />
                    </div>
                    <div class="col span-6">
                      <UnitInput v-model="s3ResponseHeaderTimeout" label="Response Header Timeout" placeholder="e.g. 30, 60" suffix="s" />
                    </div>
                  </div>
                  <div class="row mb-10">
                    <div class="col span-4">
                      <UnitInput v-model="s3TlsHandshakeTimeout" label="TLS Handshake Timeout" placeholder="e.g. 30, 60" suffix="s" />
                    </div>
                    <div class="col span-2 middle">
                      <Checkbox v-model="s3.http.insecureSkipVerify" label="Insecure Skip Verify" />
                    </div>
                    <div class="col span-6">
                      <UnitInput v-model="s3ExpectContinueTimeout" label="Expect Continue Timeout" placeholder="e.g. 30, 60" suffix="s" />
                    </div>
                  </div>
                  <div class="row mb-10">
                    <div class="col span-4">
                      <UnitInput v-model="s3.http.maxIdleConns" label="Max Idle Connections" suffix="" />
                    </div>
                    <div class="col span-4">
                      <UnitInput v-model="s3.http.maxIdleConnsPerHost" label="Max Idle Connections Per Host" suffix="" />
                    </div>
                    <div class="col span-4">
                      <UnitInput v-model="s3.http.maxConnsPerHost" label="Max Connections Per Host" suffix="" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tab>
          <Tab name="grafana-options" label="Grafana Options" :weight="1">
            <GrafanaConfig v-model="config.grafana" :status="status" @enable="enableGrafana" @disable="disableGrafana" />
          </Tab>
          <Tab name="capability-installations" label="Capability Installations" :weight="0">
            <CapabilityTable :capability-provider="loadCapabilities" :header-provider="headerProvider" :update-status-provider="updateStatus" />
          </Tab>
        </Tabbed>
      </div>
      <div v-else class="not-enabled">
        <h4>Monitoring is not currently enabled. Enabling it will install additional resources on this cluster.</h4>
        <button class="btn role-primary" @click="enable">
          Enable
        </button>
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
