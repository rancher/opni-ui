<script>
import Card from '@/components/Card';
import { formatForTimeseries, findBucket, showTooltip } from '@/product/opni/utils/munging';
import TimeSeries from '@/components/graph/TimeSeries';
import day from 'dayjs';
import Loading from '@/components/Loading';

export default {
  components: {
    Card, Loading, TimeSeries
  },

  props: {
    areaOfInterest: {
      type:    Object,
      default: null,
    },

    fromTo: {
      type:     Object,
      required: true
    },

    insights: {
      type:     Array,
      required: true,
    },

    loading: {
      type:    Boolean,
      default: false
    }
  },

  data() {
    return { highlightAnomalies: false };
  },

  computed: {
    insightSeries() {
      const out = this.formatForTimeseries(this.insights);

      out['Anomalous'].shouldHighlight = true;

      out['Anomalous'].color = 'var(--error)';
      out['Normal'].color = 'var(--primary)';
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
  <Card class="card mt-20" :show-actions="false" :show-highlight-border="false">
    <template #body>
      <TimeSeries
        ref="insights"
        class="timeseries mt-20 mb-20"
        chart-id="insights"
        :from="fromTo.from"
        :to="fromTo.to"
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
