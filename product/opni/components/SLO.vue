<script>
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import ArrayListSelect from '@/components/form/ArrayListSelect';
import ArrayList from '@/components/form/ArrayList';
import UnitInput from '@/components/form/UnitInput';
import AsyncButton from '@/components/AsyncButton';
import Loading from '@/components/Loading';
import Banner from '@/components/Banner';
import Tab from '@/components/Tabbed/Tab';
import Tabbed from '@/components/Tabbed';
import isEqual from 'lodash/isEqual';
import { exceptionToErrorsArray } from '@/utils/error';
import {
  createSLO, getMetrics, getServices, getSLO, updateSLO
} from '~/product/opni/utils/requests/slo';

export default {
  components: {
    AsyncButton,
    LabeledInput,
    LabeledSelect,
    ArrayListSelect,
    ArrayList,
    Loading,
    Banner,
    Tab,
    Tabbed,
    UnitInput
  },

  async fetch() {
    const servicesRequest = getServices();
    const sloRequest = this.$route.params.id ? getSLO(this.$route.params.id, this) : Promise.resolve(false);

    this.$set(this, 'rawServices', (await servicesRequest).filter(s => s.jobId));
    this.$set(this, 'serviceOptions', this.rawServices.map((s, i) => ({ label: s.nameDisplay, value: `${ i }` })));

    if (await sloRequest) {
      const slo = await sloRequest;

      this.$set(this, 'id', slo.id);
      this.$set(this, 'name', slo.name);
      this.$set(this, 'timeWindow', slo.period);
      this.$set(this, 'metricName', slo.metric);
      this.$set(this, 'tags', slo.tags);
      this.$set(this, 'threshold', slo.threshold);
      this.$set(this, 'budgetingInterval', slo.budgetingInterval);

      const serviceIndex = this.rawServices.findIndex(s => s.jobId === slo.service.jobId && s.clusterId === slo.service.clusterId);

      if (serviceIndex >= 0) {
        this.$set(this, 'serviceIndex', `${ serviceIndex }`);
      }
    }
  },

  data() {
    return {
      id:                       '',
      name:                     '',
      loadingMetrics:           false,
      metricOptions:            [],
      rawMetrics:               [],
      serviceOptions:           [],
      timeWindowOptions:        ['7d', '28d', '30d'],
      timeWindow:               '7d',
      datasourceOptions:        ['monitoring', 'logging'],
      serviceIndices:           [],
      rawServices:              [],
      serviceIndex:             -1,
      tags:                     [],
      metricName:               '',
      error:                    '',
      threshold:                0,
      budgetingIntervalOptions: ['1m', '5m', '10m', '30m', '60m'],
      budgetingInterval:        '5m',

    };
  },

  methods: {
    async save(buttonCallback) {
      if (this.name === '') {
        this.$set(this, 'error', 'Name is required');
        buttonCallback(false);

        return;
      }

      if (this.services.length === 0 || !this.services[0]) {
        this.$set(this, 'error', 'A Service is required');
        buttonCallback(false);

        return;
      }

      if (this.metricName === '') {
        this.$set(this, 'error', 'Metric is required');
        buttonCallback(false);

        return;
      }

      if (this.timeWindow === '') {
        this.$set(this, 'error', 'Period is required');
        buttonCallback(false);

        return;
      }

      if (this.budgetingInterval === '') {
        this.$set(this, 'error', 'Alerting Window is required');
        buttonCallback(false);

        return;
      }

      try {
        if (this.id) {
          await updateSLO(this.id, this.name, this.services, this.metricName, this.timeWindow, this.budgetingInterval, this.threshold, this.tags);
        } else {
          await createSLO(this.name, this.services, this.metricName, this.timeWindow, this.budgetingInterval, this.threshold, this.tags);
        }

        this.$set(this, 'error', '');
        buttonCallback(true);
        this.$router.replace({ name: 'slos' });
      } catch (err) {
        this.$set(this, 'error', exceptionToErrorsArray(err).join('; '));
        buttonCallback(false);
      }
    },
  },

  computed: {
    services() {
      const indices = this.serviceIndex < 0 ? this.serviceIndices : [this.serviceIndex];

      return indices.map(i => this.rawServices[Number.parseInt(i)]);
    },

    metric() {
      return this.rawMetrics.find(metric => metric.name === this.metricName) || {};
    },

    metricDescription() {
      return this.metric?.description;
    }
  },

  watch: {
    async services(neu, old) {
      if (isEqual(neu, old)) {
        return;
      }

      this.$set(this, 'loadingMetrics', true);
      this.$set(this, 'rawMetrics', (await getMetrics()));
      this.$set(this, 'metricOptions', this.rawMetrics.map(m => ({ label: m.name, value: m.name })));
      this.$set(this, 'loadingMetrics', false);

      if (!this.metricOptions.find(metric => metric.value === this.metricName)) {
        this.$set(this, 'metricName', '');
        this.$set(this, 'timeWindow', this.timeWindowOptions[0]);
        this.$set(this, 'budgetingInterval', this.budgetingIntervalOptions[1]);
      }
    }
  },
};
</script>
<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else-if="serviceOptions.length === 0" class="no-services">
    There aren't any services available to watch. Try adding a cluster.
  </div>
  <div v-else>
    <div class="row mb-20">
      <div class="col span-12">
        <LabeledInput
          v-model="name"
          label="Name"
        />
      </div>
    </div>
    <Tabbed class="mb-20" :side-tabs="true">
      <Tab
        name="options"
        :label="'Options'"
        :weight="2"
      >
        <div class="row mb-20 bottom">
          <div v-if="id" class="col span-12">
            <h3>Service</h3>
            <LabeledSelect
              v-model="serviceIndex"
              label="Service"
              :options="serviceOptions"
              :searchable="true"
            />
          </div>
          <div v-else class="col span-12">
            <h3>Services</h3>
            <ArrayListSelect
              v-model="serviceIndices"
              label="Service"
              :options="serviceOptions"
              :searchable="true"
            />
          </div>
        </div>
        <div class="row">
          <div class="col span-12">
            <h3>Metric</h3>
          </div>
        </div>
        <div class="row mb-20 bottom">
          <div class="col span-6">
            <LabeledSelect
              v-model="metricName"
              :disabled="services.length === 0 || !services[0]"
              label="Metric"
              :loading="loadingMetrics"
              :options="metricOptions"
            />
            <div class="text-muted text-small">
              {{ metric.description }}
            </div>
          </div>
          <div class="col span-6">
            <UnitInput
              v-model="threshold"
              :disabled="!metricName"
              :suffix="false"
              label="Threshold"
            />
          </div>
        </div>
        <div class="row">
          <div class="col span-12">
            <h3>Timing</h3>
          </div>
        </div>
        <div class="row mb-20">
          <div class="col span-6">
            <LabeledSelect
              v-model="timeWindow"
              :disabled="!metricName"
              label="Period"
              :options="timeWindowOptions"
            />
          </div>
          <div class="col span-6">
            <LabeledSelect
              v-model="budgetingInterval"
              :disabled="!metricName"
              label="Alerting Window"
              :options="budgetingIntervalOptions"
            />
          </div>
        </div>
      </Tab>
      <Tab
        name="tags"
        :label="'Tags'"
        :weight="1"
      >
        <ArrayList
          v-model="tags"
          mode="edit"
          label="Tags"
        />
      </Tab>
    </Tabbed>
    <div class="resource-footer">
      <a class="btn role-secondary mr-10" href="/slos">
        Cancel
      </a>
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
.bottom {
  border-bottom: 1px solid var(--header-border);
  padding-bottom: 20px;
}

.resource-footer {
  display: flex;
  flex-direction: row;

  justify-content: flex-end;
}

.no-services {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: row;

  justify-content: center;
  align-items: center;

  font-size: 20px;
}
</style>
