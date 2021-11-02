<script>
import Card from '@/components/Card';
import { formatForTimeseries, findBucket, showTooltip } from '@/product/opni/utils/munging';
import TimeSeries from '@/components/graph/TimeSeries';
import day from 'dayjs';
import Loading from '@/components/Loading';
import LabeledSelect from '@/components/form/LabeledSelect';

export const GRANULARITIES = [
  {
    label: '1h', unit: 'hours', count: 1
  },
  {
    label: '30m', unit: 'minutes', count: 30
  },
  {
    label: '10m', unit: 'minutes', count: 10
  },
];

export const RANGES = [
  {
    label: '24h', unit: 'hours', count: 24
  },
  {
    label: '12h', unit: 'hours', count: 12
  },
  {
    label: '1h', unit: 'hours', count: 1
  }
];

export const REFRESH_RATES = [
  { label: '5s' },
  { label: '1m' },
  { label: '30m' },
];

export default {
  components: {
    Card, Loading, LabeledSelect, TimeSeries
  },

  props: {
    areaOfInterest: {
      type:    Object,
      default: null,
    },

    insights: {
      type:     Array,
      required: true,
    },

    granularity: {
      type:     Object,
      required: true,
    },

    loading: {
      type:    Boolean,
      default: false
    }
  },

  data() {
    return {
      highlightAnomalies: false,
      granularities:      GRANULARITIES,
      ranges:             RANGES,
      refreshRates:       REFRESH_RATES,
    };
  },

  computed: {
    insightSeries() {
      const out = this.formatForTimeseries(this.insights);

      out['Anomalous'].shouldHighlight = true;

      out['Anomalous'].color = 'var(--error)';
      out['Normal'].color = 'var(--primary-low-opacity)';
      out['Suspicious'].color = 'var(--warning)';

      return out;
    },

    regions() {
      if (!this.areaOfInterest) {
        return [];
      }

      return [this.areaOfInterest.fromTo];
    }
  },

  methods: {
    formatForTimeseries,
    findBucket,
    showTooltip,
    mapTimeSeries(data, columns) {
      const index = data.index;
      const fromIndex = index - 1;
      const toIndex = index + 1;
      const timestamps = columns[0];

      return {
        fromTo: {
          from:  fromIndex >= 0 ? day(timestamps[fromIndex]) : null,
          to:    toIndex < timestamps.length ? day(timestamps[toIndex]) : null,
        },
        value: data.value,
        line:  data.id,
        index
      };
    },

    onDataShown(data, api) {
      if (data.includes('Anomalous')) {
        api.highlightData('Anomalous', d => d > 0);
      }
    },

    onDataHidden(data, api) {
      if (data.includes('Anomalous')) {
        api.unHighlightData();
      }
    },
  }
};
</script>
<template>
  <div>
    <div class="row mt-10">
      <div class="col span-1">
        <LabeledSelect
          label="Refresh"
          :value="refreshRates[0]"
          option-key="label"
          :options="refreshRates"
          placement="bottom"
          @input="$emit('onGranularity', $event)"
        />
      </div>
      <div class="col span-7"></div>
      <div class="col span-2">
        <LabeledSelect
          label="Range"
          :value="ranges[0]"
          option-key="label"
          :options="ranges"
          placement="bottom"
          @input="$emit('onGranularity', $event)"
        />
      </div>
      <div class="col span-2">
        <LabeledSelect
          label="Granularity"
          :value="granularity"
          option-key="label"
          :options="granularities"
          placement="bottom"
          @input="$emit('onGranularity', $event)"
        />
      </div>
    </div>
    <Card class="card mt-10" :show-actions="false" :show-highlight-border="false">
      <template #body>
        <TimeSeries
          ref="insights"
          class="timeseries mt-10 mb-10"
          chart-id="insights"
          :colors="{'Anomalous':'var(--error)', 'Normal': 'var(--primary)', 'Suspicious': 'var(--warning)'}"
          x-key="timestamp"
          :data-series="insightSeries"
          :regions="regions"
          @onDataShown="onDataShown"
          @onDataHidden="onDataHidden"
        />
        <Loading v-if="loading" />
      </template>
    </Card>
  </div>
</template>

<style lang="scss" scoped>
::v-deep {
  .card-container {
    position: relative;
  }

  .loading-indicator .overlay {
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }
}

.card {
  margin: 0;
}
</style>
