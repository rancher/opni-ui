<script>
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import UnitInput from '@/components/form/UnitInput';
import AsyncButton from '@/components/AsyncButton';
import ArrayListSelect from '@/components/form/ArrayListSelect';
import ArrayList from '@/components/form/ArrayList';
import Loading from '@/components/Loading';
import Tab from '@/components/Tabbed/Tab';
import Tabbed from '@/components/Tabbed';
import Banner from '@/components/Banner';
import Checkbox from '@/components/form/Checkbox';
import TextAreaAutoGrow from '@/components/form/TextAreaAutoGrow';
import { exceptionToErrorsArray } from '@/utils/error';
import dayjs from 'dayjs';
import { AlertType, Severity } from '~/product/opni/models/alerting/Condition';
import {
  createAlertCondition, getAlertConditionChoices, getAlertEndpoints, getAlertCondition, updateAlertCondition, deactivateSilenceAlertCondition, silenceAlertCondition
} from '~/product/opni/utils/requests/alerts';
import { getClusters } from '~/product/opni/utils/requests';

const DEFAULT_CONFIG = {
  name:              '',
  description:       '',
  labels:            [],
  severity:          Severity.INFO,
  attachedEndpoints: {
    items:              [],
    initialDelay:       '30s',
    repeatInterval:     '30s',
    throttlingDuration: '30s',
    details:            {
      title: '', body: '', sendResolved: false
    }
  }
};

export default {
  components: {
    ArrayList,
    ArrayListSelect,
    AsyncButton,
    Checkbox,

    LabeledInput,
    LabeledSelect,
    Loading,
    Tab,
    Tabbed,
    TextAreaAutoGrow,
    UnitInput,
    Banner,
  },

  async fetch() {
    await Promise.all([this.loadChoices(), this.loadEndpoints(), this.loadClusters()]);

    await this.load();
  },

  data() {
    return {
      conditionTypes: [
        {
          label: 'System',
          value: 'system'
        },
        {
          label: 'Kube State',
          value: 'kubeState'
        }
      ],
      type: 'kubeState',

      system: {
        choices: { },
        config:  { clusterId: { id: { id: '' } }, timeout: '30s' }
      },
      kubeState: {
        choices: { },
        config:  {
          clusterId: '', objectType: '', objectName: '', namespace: '', state: '', for: '30s'
        }
      },

      config: DEFAULT_CONFIG,

      options: {
        severityOptions: [
          {
            label: 'Info',
            value: Severity.INFO
          },
          {
            label: 'Warning',
            value: Severity.WARNING
          },
          {
            label: 'Error',
            value: Severity.ERROR
          },
          {
            label: 'Critical',
            value: Severity.CRITICAL
          },
        ],
        endpointOptions: [],
        clusterOptions:  [],
        silenceOptions:         [
          {
            label: '30 minutes',
            value: '30m'
          },
          {
            label: '1 hour',
            value: '1h'
          },
          {
            label: '3 hours',
            value: '3h'
          },
          {
            label: '1 day',
            value: '24h'
          },
          { label: 'Until resumed' }
        ],
      },
      silenceFor: '1h',
      error:      '',
    };
  },

  methods: {
    async load() {
      const conditionRequest = this.$route.params.id && this.$route.params.id !== 'create' ? getAlertCondition(this.$route.params.id, this) : Promise.resolve(false);

      if (await conditionRequest) {
        const condition = await conditionRequest;

        this.$set(this, 'type', condition.type);
        this.$set(this[condition.type], 'config', condition.alertType );

        this.$set(this, 'config', {
          ...DEFAULT_CONFIG,
          ...condition.base.alertCondition,
          attachedEndpoints: {
            ...DEFAULT_CONFIG.attachedEndpoints,
            details: { ...DEFAULT_CONFIG.attachedEndpoints.details, ...condition.base.alertCondition.attachedEndpoints.details },
            ...condition.base.alertCondition.attachedEndpoints
          },
          alertType: undefined
        });
      }
    },
    async save(buttonCallback) {
      if (this.name === '') {
        this.$set(this, 'error', 'Name is required');
        buttonCallback(false);

        return;
      }
      try {
        const condition = { ...this.config, alertType: { [this.type]: this[this.type].config } };

        if (this.$route.params.id && this.$route.params.id !== 'create') {
          const updateConfig = {
            id:          { id: this.$route.params.id },
            updateAlert: condition
          };

          await updateAlertCondition(updateConfig);
        } else {
          await createAlertCondition(condition);
        }
      } catch (err) {
        this.$set(this, 'error', exceptionToErrorsArray(err).join('; '));
        buttonCallback(false);

        return;
      }
      this.$set(this, 'error', '');
      buttonCallback(true);
      this.$router.replace({ name: 'conditions' });
    },

    cancel() {
      this.$router.replace({ name: 'conditions' });
    },

    async loadChoices() {
      const map = {
        system:      {
          value: AlertType.SYSTEM,
          // handler: this.loadSystem
        },
        kubeState:   {
          value: AlertType.KUBE_STATE,
          // handler: this.loadKubeState
        },
        composition: {
          value: AlertType.COMPOSITION,
          // handler: this.loadComposition
        },
        controlFlow: {
          value: AlertType.CONTROL_FLOW,
          // handler: this.loadControlFlow
        },
      };
      const allChoices = await getAlertConditionChoices({ alertType: map[this.type].value });
      const choices = allChoices[this.type];

      this.$set(this[this.type], 'choices', choices);
    },

    async loadEndpoints() {
      const endpoints = await getAlertEndpoints(this);

      this.$set(this.options, 'endpointOptions', endpoints.map(e => ({
        label: e.nameDisplay,
        value: e.id
      })));
    },

    async loadClusters() {
      const clusters = await getClusters(this);

      this.$set(this.options, 'clusterOptions', clusters.map(c => ({
        label: c.nameDisplay,
        value: c.id
      })));
    },

    async silence() {
      const request = {
        conditionId: { id: this.id },
        duration:    this.silenceFor
      };

      await silenceAlertCondition(request);
      this.load();
    },

    async resume() {
      if (this.silenceId) {
        await deactivateSilenceAlertCondition(this.silenceId);
        this.load();
      }
    }
  },

  computed: {
    id() {
      return this.$route.params.id && this.$route.params.id !== 'create' ? this.$route.params.id : undefined;
    },

    silenceId() {
      return this.config?.silence?.silenceId;
    },

    matchLabelsToSave() {
      return {
        matchLabels:      this.matchLabels,
        matchExpressions: this.matchExpressions,
      };
    },

    systemClusterOptions() {
      const options = this.options.clusterOptions;

      if (!this.options.clusterOptions.find(o => o.value === this.system.config.clusterId.id.id)) {
        this.$set(this.system.config.clusterId.id, 'id', options[0]?.value || '');
      }

      return options;
    },

    kubeStateClusterOptions() {
      const options = this.options.clusterOptions;

      if (!this.options.clusterOptions.find(o => o.value === this.kubeState.config.clusterId)) {
        this.$set(this.kubeState.config, 'clusterId', options[0]?.value || '');
      }

      return options;
    },

    kubeStateObjectTypeOptions() {
      if (!this.kubeState.config.clusterId) {
        return [];
      }

      const options = Object.keys(this.kubeState.choices.clusters[this.kubeState.config.clusterId]?.resourceTypes || {});

      if (!options.find(o => o === this.kubeState.config.objectType)) {
        this.$set(this.kubeState.config, 'objectType', options[0] || '');
      }

      return options;
    },

    kubeStateNamespaceOptions() {
      if (!this.kubeState.config.objectType) {
        return [];
      }

      const options = Object.keys(this.kubeState.choices.clusters[this.kubeState.config.clusterId]?.resourceTypes?.[this.kubeState.config.objectType].namespaces || {});

      if (!options.find(o => o === this.kubeState.config.namespace)) {
        this.$set(this.kubeState.config, 'namespace', options[0] || '');
      }

      return options;
    },

    kubeStateObjectNameOptions() {
      if (!this.kubeState.config.namespace) {
        return [];
      }

      const options = this.kubeState.choices.clusters[this.kubeState.config.clusterId]?.resourceTypes?.[this.kubeState.config.objectType].namespaces?.[this.kubeState.config.namespace].objects || [];

      if (!options.find(o => o === this.kubeState.config.objectName)) {
        this.$set(this.kubeState.config, 'objectName', options[0] || '');
      }

      return options;
    },

    kubeStateStateOptions() {
      const options = this.kubeState.choices.states || [];

      if (!options.find(o => o === this.kubeState.config.state)) {
        this.$set(this.kubeState.config, 'state', options[0] || '');
      }

      return options;
    },

    attachedEndpoints: {
      get() {
        return this.config.attachedEndpoints.items.map(item => item.endpointId);
      },

      set(value) {
        this.$set(this.config.attachedEndpoints, 'items', value.map(v => ({ endpointId: v })));
      }
    },

    systemTimeout: {
      get() {
        return Number.parseInt(this.system.config.timeout || '0');
      },

      set(value) {
        this.$set(this.system.config, 'timeout', `${ (value || 0) }s`);
      }
    },

    kubeStateFor: {
      get() {
        return Number.parseInt(this.kubeState.config.for || '0');
      },

      set(value) {
        this.$set(this.kubeState.config, 'for', `${ (value || 0) }s`);
      }
    },

    initialDelay: {
      get() {
        return Number.parseInt(this.config.attachedEndpoints.initialDelay || '0');
      },

      set(value) {
        this.$set(this.config.attachedEndpoints, 'initialDelay', `${ (value || 0) }s`);
      }
    },

    repeatInterval: {
      get() {
        return Number.parseInt(this.config.attachedEndpoints.repeatInterval || '0');
      },

      set(value) {
        this.$set(this.config.attachedEndpoints, 'repeatInterval', `${ (value || 0) }s`);
      }
    },

    throttlingDuration: {
      get() {
        return Number.parseInt(this.config.attachedEndpoints.throttlingDuration || '0');
      },

      set(value) {
        this.$set(this.config.attachedEndpoints, 'throttlingDuration', `${ (value || 0) }s`);
      }
    },

    silenceUntil() {
      if (!this.config?.silence?.endsAt) {
        return 'until resumed';
      }

      return dayjs(this.config?.silence?.endsAt || undefined).format('dddd, MMMM Do YYYY, h:mm:ss a');
    }
  },

  watch: {
    type() {
      this.loadChoices();
    }
  }
};
</script>
<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledInput
          v-model="config.name"
          label="Name"
          :required="true"
        />
      </div>
      <div class="col span-6">
        <LabeledInput
          v-model="config.description"
          label="Description"
        />
      </div>
    </div>
    <Tabbed :side-tabs="true" class="mb-20">
      <Tab
        name="options"
        label="Condition Options"
        :weight="3"
      >
        <div class="row bottom">
          <div class="col span-12">
            <LabeledSelect v-model="type" label="Type" :options="conditionTypes" :required="true" />
          </div>
        </div>
        <div v-if="type == 'system'" class="row mt-20">
          <div class="col span-6">
            <LabeledSelect v-model="system.config.clusterId.id.id" label="Cluster" :options="systemClusterOptions" :required="true" />
          </div>
          <div class="col span-6">
            <UnitInput v-model="systemTimeout" label="Timeout" suffix="s" :required="true" />
          </div>
        </div>
        <div v-if="type == 'kubeState'">
          <h4 class="mt-20">
            Target Metric
          </h4>
          <div class="row mt-10">
            <div class="col span-12">
              <LabeledSelect v-model="kubeState.config.clusterId" label="Cluster" :options="kubeStateClusterOptions" :required="true" />
            </div>
          </div>
          <div class="row mt-20">
            <div class="col span-6">
              <LabeledSelect v-model="kubeState.config.objectType" label="Object Type" :disabled="kubeStateObjectTypeOptions.length === 0" :options="kubeStateObjectTypeOptions" :required="true" />
            </div>
            <div class="col span-6">
              <LabeledSelect v-model="kubeState.config.namespace" label="Namespace" :disabled="kubeStateNamespaceOptions.length === 0" :options="kubeStateNamespaceOptions" :required="true" />
            </div>
          </div>
          <div class="row mt-10">
            <div class="col span-6">
              <LabeledSelect v-model="kubeState.config.objectName" label="Object Name" :disabled="kubeStateObjectNameOptions.length === 0" :options="kubeStateObjectNameOptions" :required="true" />
            </div>
          </div>
          <h4 class="mt-20">
            Threshold
          </h4>
          <div class="row mt-10">
            <div class="col span-6">
              <LabeledSelect v-model="kubeState.config.state" label="State" :disabled="kubeStateStateOptions.length === 0" :options="kubeStateStateOptions" :required="true" />
            </div>
            <div class="col span-6">
              <UnitInput v-model="kubeStateFor" label="Duration" suffix="s" :required="true" />
            </div>
          </div>
        </div>
      </Tab>
      <Tab
        name="messaging"
        label="Message Options"
        :weight="2"
      >
        <h4 class="mt-20">
          Destination
        </h4>
        <div class="row mt-10">
          <div class="col span-12">
            <ArrayListSelect v-model="attachedEndpoints" add-label="Add Endpoint" :options="options.endpointOptions" />
          </div>
        </div>
        <div class="row mt-10">
          <div class="col span-4">
            <UnitInput v-model="initialDelay" label="Initial Delay" suffix="s" />
          </div>
          <div class="col span-4">
            <UnitInput v-model="repeatInterval" label="Repeat Interval" suffix="s" />
          </div>
          <div class="col span-4">
            <UnitInput v-model="throttlingDuration" label="Throttling Duration" suffix="s" />
          </div>
        </div>
        <h4 class="mt-20">
          Message
        </h4>
        <div class="row mt-10">
          <div class="col span-6">
            <LabeledInput v-model="config.attachedEndpoints.details.title" label="Title" :required="true" />
          </div>
          <div class="col span-6">
            <LabeledSelect v-model="config.severity" label="Severity" :options="options.severityOptions" />
          </div>
        </div>
        <div class="row mt-10">
          <div class="col span-12">
            <TextAreaAutoGrow v-model="config.attachedEndpoints.details.body" :min-height="250" :required="true" />
          </div>
        </div>
        <div class="row mt-10">
          <div class="col span-12">
            <Checkbox v-model="config.attachedEndpoints.details.sendResolved" label="Send Resolved" />
          </div>
        </div>
      </Tab>
      <Tab
        name="labels"
        label="Labels"
        :weight="1"
      >
        <div class="row">
          <div class="col span-12">
            <ArrayList v-model="config.labels" label="labels" add-label="Add Label" :read-allowed="false" />
          </div>
        </div>
      </Tab>
      <Tab
        v-if="id"
        name="silence"
        label="Silence"
        :weight="1"
      >
        <div v-if="silenceId" class="row">
          <div class="col span-12 middle">
            Silenced until {{ silenceUntil }}
            <button class="btn role-primary ml-10" @click="resume">
              Resume Now
            </button>
          </div>
        </div>
        <div v-else class="row">
          <div class="col span-4">
            <LabeledSelect v-model="silenceFor" :options="options.silenceOptions" label="Silence For" />
          </div>
          <div class="col span-3 middle">
            <button class="btn role-primary" @click="silence">
              Silence Now
            </button>
          </div>
        </div>
      </Tab>
    </Tabbed>
    <div class="resource-footer">
      <button class="btn btn-secondary mr-10" @click="cancel">
        Cancel
      </button>
      <AsyncButton mode="edit" @click="save" />
    </div>
    <Banner
      v-if="error"
      color="error"
      :label="error"
    />
  </div>
</template>

<style lang="scss" scoped>
.resource-footer {
  display: flex;
  flex-direction: row;

  justify-content: flex-end;
}

.middle {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.install-command {
  width: 100%;
}

::v-deep .warning {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.bottom {
  border-bottom: 1px solid var(--header-border);
  padding-bottom: 20px;
}
</style>
