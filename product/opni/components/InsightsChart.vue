<script>
import Card from '@/components/Card';
import { formatForTimeseries, findBucket, showTooltip } from '@/product/opni/utils/munging';
import TimeSeries from '@/components/graph/TimeSeries';
import Checkbox from '@/components/form/Checkbox';
import day from 'dayjs';

export default {
  components: {
    Card, TimeSeries, Checkbox
  },

  props: {
    fromTo: {
      type:     Object,
      required: true
    },

    insights: {
      type:     Array,
      required: true,
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
        @onDataShown="onDataShown"
        @onDataHidden="onDataHidden"
      />
    </template>
  </Card>
</template>

<style lang="scss" scoped>
::v-deep {
  .timesries .card-body {
    height: 380px;
    position: relative;
  }
}

.card {
  margin: 0;
}
</style>
