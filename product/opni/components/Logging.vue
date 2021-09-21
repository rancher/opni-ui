<script>
import Card from '@/components/Card';
import { getInsights, getLogs, getPointsOfInterest } from '@/utils/opni';
import { ALL_TYPES, getAbsoluteValue } from '@/components/form/SuperDatePicker/util';
import TimeSeries from '@/components/graph/TimeSeries';
import Checkbox from '@/components/form/Checkbox';
import day from 'dayjs';
import { formatForTimeseries, findBucket, showTooltip } from '../util';
import PointOfInterstDetail from './PointOfInterestDetail';
import PointOfInterstTable from './PointOfInterestTable';

export const POINT_OF_INTEREST_HEADERS = [
  {
    name:      'daterange',
    labelKey:  'tableHeaders.dateRange',
    formatter: 'DateRange',
    value:     'fromTo',
    sort:      ['timestamp'],
    width:     '300px'
  },
  {
    name:      'levels',
    labelKey:  'tableHeaders.levels',
    value:     'levels',
    sort:      ['levels'],
    formatter: 'List'
  },
  {
    name:      'components',
    labelKey:  'tableHeaders.components',
    value:     'components',
    sort:      ['components'],
    formatter: 'List'
  },
  {
    name:     'count',
    labelKey: 'tableHeaders.count',
    value:    'count',
    sort:     ['count'],
  },
];

export default {
  components: {
    Card, PointOfInterstDetail, PointOfInterstTable, TimeSeries, Checkbox,
  },

  async fetch() {
    await this.loadData();
  },

  data() {
    const fromTo = {
      from: {
        value: day('2021-07-20T08:45:00.000-07:00'),
        type:  ALL_TYPES.ABSOLUTE.key
      },
      to: {
        value: day('2021-07-21T08:45:00.000-07:00'),
        type:  ALL_TYPES.ABSOLUTE.key
      }
    };

    return {
      highlightGraphIndex: null,
      highlightTime:       null,
      pointOfInterest:        null,
      insights:               [],
      logs:                   [],
      pointsOfInterest:       [],
      loading:                false,
      POINT_OF_INTEREST_HEADERS,
      fromTo,
      loadedFromTo:           { from: { ...fromTo.from }, to: { ...fromTo.to } },
      highlightAnomalies:     false,
      thumbsDown:             require('~/assets/images/thumb_down.svg'),
      highlightRange:         null
    };
  },

  computed: {
    requestFromTo() {
      return {
        from: getAbsoluteValue(this.fromTo.from),
        to:   getAbsoluteValue(this.fromTo.to)
      };
    },
    insightSeries() {
      const out = this.formatForTimeseries(this.insights);

      out['Anomalous'].shouldHighlight = true;

      out['Anomalous'].color = 'var(--error)';
      out['Normal'].color = 'var(--primary)';
      out['Suspicious'].color = 'var(--warning)';

      return out;
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.fromTo.from = { ...this.loadedFromTo.from };
      this.fromTo.to = { ...this.loadedFromTo.to };
    });
  },

  methods: {
    async loadData() {
      this.loading = true;
      const { from, to } = this.requestFromTo;
      const responses = await Promise.all([getInsights(from, to), getLogs(from, to), getPointsOfInterest(from, to)]);

      [this.insights, this.logs, this.pointsOfInterest] = responses;
      this.logs = this.logs.map((log, i) => ({
        ...log,
        stateDescription: true,
        stateObj:         {},
        remove:           () => {
          this.logs.splice(i, 1, { ...this.logs[i], removed: true });
        },
        undo: () => {
          this.logs.splice(i, 1, { ...this.logs[i], removed: false });
        }
      }));
      this.loadedFromTo.from = { ...this.fromTo.from };
      this.loadedFromTo.to = { ...this.fromTo.to };
      this.loading = false;
    },
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
    onOver(data, columns) {
      this.$set(this, 'highlightTime', day(data.x));
    },
    onOut() {
      this.$set(this, 'highlightTime', null);
    },
    highlightRow(row) {
      return this.highlightIndices.includes(row);
    },

    onPointOfInterestHover(pointOfInterest) {
      this.highlightGraphIndex = pointOfInterest?.highlightGraphIndex;
    },

    onPointOfInterestSelected(pointOfInterest) {
      this.pointOfInterest = pointOfInterest;
    }
  }
};
</script>
<template>
  <div>
    <div class="bar">
      <h1>
        {{ t('opni.dashboard.title') }} Hello
      </h1>
    </div>
    <Card class="card mt-20" :show-actions="false" :show-highlight-border="false">
      <template #body>
        <div v-if="loading" class="initial-load-spinner-container">
          <i class="initial-load-spinner"></i>
        </div>
        <TimeSeries
          v-else
          ref="insights"
          class="mt-20 mb-20"
          chart-id="insights"
          :from="loadedFromTo.from"
          :to="loadedFromTo.to"
          :colors="{'Anomalous':'var(--error)', 'Normal': 'var(--primary)', 'Suspicious': 'var(--warning)'}"
          x-key="timestamp"
          :data-series="insightSeries"
          :highlight-index="pointOfInterest ? pointOfInterest.highlightGraphIndex : highlightGraphIndex"
          @over="onOver"
          @out="onOut"
        >
          <template v-slot:inputs="{highlightData, unHighlightData}">
            <Checkbox v-model="highlightAnomalies" class="pull-right" label="Highlight Anomalies" @input="e=>e?highlightData('Anomalous', d=>d>0):unHighlightData()" />
          </template>
        </TimeSeries>
      </template>
    </Card>
    <PointOfInterstTable :points-of-interest="pointsOfInterest" :hightlight-time="highlightTime" @pointOfInterestHover="onPointOfInterestHover" @pointOfInterestSelect="onPointOfInterestSelected" />
    <PointOfInterstDetail :open="!!pointOfInterest" :point-of-interest="pointOfInterest" :logs="logs" @close="pointOfInterest=null" />
  </div>
</template>

<style lang="scss" scoped>
::v-deep {
  .card-body {
    height: 380px;
    position: relative;
  }

  .bubble {
    &.workload {
      border-color: var(--app-other-accent);

      &::before {
        background-color: var(--app-other-accent);
      }
    }

    &.control-plane {
      border-color: var(--app-rancher-accent);

      &::before {
        background-color: var(--app-rancher-accent);
      }
    }
  }
}

.card {
  margin: 0;
}

.bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.initial-load-spinner-container {
  align-items: center;
  display: flex;
  justify-content: center;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}

.initial-load-spinner {
  animation: initial-load-animate 1s infinite linear;
  background-color: #fff;
  box-sizing: border-box;
  border: 5px solid #008ACF;
  border-radius: 50%;
  border-top-color: #00B2E2;
  display: inline-block;
  height: 80px;
  margin: 0 auto;
  width: 80px;
}

@keyframes initial-load-animate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(359deg);
  }
}

.feedback {
  margin-right: 15px;
  padding-right: 0;
  padding-top: 5px;
}

img {
  $size: 20px;
  width: $size;
  height: $size;
}

.point-of-interest {
  cursor: pointer;
}
</style>
