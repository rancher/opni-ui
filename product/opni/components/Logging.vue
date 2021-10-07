<script>
import { ALL_TYPES, getAbsoluteValue } from '@/components/form/SuperDatePicker/util';
import day from 'dayjs';
import Loading from '@/components/Loading';

import { getLogs, getBreakdowns, getOverallBreakdownSeries, getAreasOfInterest } from '@/product/opni/utils/requests';
import InsightsChart from './InsightsChart';
import PointOfInterstDetail from './AreaOfInterestDetail';
import PointOfInterstTable from './AreaOfInterestTable';
import Breakdown from './Breakdown';

export default {
  components: {
    Breakdown, InsightsChart, Loading, PointOfInterstDetail, PointOfInterstTable
  },

  async fetch() {
    await this.loadData();
  },

  data() {
    const fromTo = {
      from: {
        value: day().subtract(1, 'day'),
        type:  ALL_TYPES.ABSOLUTE.key
      },
      to: {
        value: day(),
        type:  ALL_TYPES.ABSOLUTE.key
      }
    };

    return {
      highlightArea:          null,
      areaOfInterest:         null,
      insights:               [],
      logs:                   [],
      areasOfInterest:        [],
      podBreakdown:           {},
      namespaceBreakdown:     {},
      workloadBreakdown:      {},
      fromTo,
      highlightAnomalies:     false,
      highlightRange:         null,
    };
  },

  computed: {
    requestFromTo() {
      return {
        from: getAbsoluteValue(this.fromTo.from),
        to:   getAbsoluteValue(this.fromTo.to)
      };
    }
  },

  methods: {
    async loadData() {
      this.loading = true;
      const { from, to } = this.requestFromTo;

      const responses = await Promise.all([
        getOverallBreakdownSeries(from, to),
        getLogs(from, to),
        getAreasOfInterest(from, to),
        getBreakdowns(from, to)
      ]);

      [
        this.insights,
        this.logs,
        this.areasOfInterest,
        {
          Pods: this.podBreakdown,
          Namespaces: this.namespaceBreakdown,
          Workloads: this.workloadBreakdown,
        }
      ] = responses;

      this.logs = this.logs.map(log => ({
        ...log,
        stateDescription: true,
        stateObj:         {}
      }));
    },
    highlightRow(row) {
      return this.highlightIndices.includes(row);
    },

    onAreaOfInterestSelected(areaOfInterest) {
      this.areaOfInterest = areaOfInterest;
    }
  }
};
</script>
<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <div class="bar">
      <h1>
        {{ t('opni.dashboard.title') }}
      </h1>
    </div>
    <InsightsChart :from-to="fromTo" :insights="insights" />
    <Breakdown :pod-breakdown="podBreakdown" :namespace-breakdown="namespaceBreakdown" :workload-breakdown="workloadBreakdown" />
    <PointOfInterstTable :logs="logs" :areas-of-interest="areasOfInterest" @areaOfInterestSelect="onAreaOfInterestSelected" />
    <PointOfInterstDetail :open="!!areaOfInterest" :area-of-interest="areaOfInterest" :logs="logs" @close="areaOfInterest=null" />
  </div>
</template>

<style lang="scss" scoped>
::v-deep {
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

img {
  $size: 20px;
  width: $size;
  height: $size;
}
</style>
