<script>
import { ALL_TYPES, getAbsoluteValue } from '@/components/form/SuperDatePicker/util';
import day from 'dayjs';
import Loading from '@/components/Loading';

import { getLogs, getBreakdowns, getOverallBreakdownSeries, getAreasOfInterest } from '@/product/opni/utils/requests';
import Select from '@/components/form/Select';
import InsightsChart from './InsightsChart';
import AreaOfInterstDetail from './AreaOfInterestDetail';
import AreaOfInterestTable from './AreaOfInterestTable';
import Breakdown from './Breakdown';

export default {
  components: {
    Breakdown, InsightsChart, Loading, AreaOfInterstDetail, AreaOfInterestTable, Select
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

    const resolutions = [
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

    return {
      highlightAreaOfInterest: null,
      areaOfInterest:          null,
      insights:                [],
      loading:                 false,
      logs:                    [],
      areasOfInterest:         [],
      podBreakdown:            {},
      namespaceBreakdown:      {},
      workloadBreakdown:       {},
      fromTo,
      highlightAnomalies:      false,
      highlightRange:          null,
      resolutions,
      resolution:              resolutions[0]
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
      const { from, to } = this.requestFromTo;

      const responses = await Promise.all([
        getOverallBreakdownSeries(this.resolution),
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

    onAreaOfInterestSelected(areaOfInterest) {
      this.areaOfInterest = areaOfInterest;
    },

    onAreaOfInterestHover(areaOfInterest) {
      this.highlightAreaOfInterest = areaOfInterest;
    }
  },
  watch: {
    async resolution() {
      try {
        this.loading = true;
        this.insights = await getOverallBreakdownSeries(this.resolution);
      } finally {
        this.loading = false;
      }
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
    <div class="chart">
      <InsightsChart :key="insights.length" :from-to="fromTo" :insights="insights" :area-of-interest="areaOfInterest || highlightAreaOfInterest" :loading="loading" />
      <Select
        v-model="resolution"
        option-key="label"
        :options="resolutions"
        placement="bottom"
      />
    </div>
    <Breakdown :pod-breakdown="podBreakdown" :namespace-breakdown="namespaceBreakdown" :workload-breakdown="workloadBreakdown" />
    <AreaOfInterestTable :logs="logs" :areas-of-interest="areasOfInterest" @areaOfInterestSelect="onAreaOfInterestSelected" @areaOfInterestHover="onAreaOfInterestHover" />
    <AreaOfInterstDetail :open="!!areaOfInterest" :area-of-interest="areaOfInterest" :logs="logs" @close="areaOfInterest=null" />
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

.chart {
  position: relative;

  .unlabeled-select {
    position: absolute;
    right: 30px;
    top: 42px;
    width: 85px;
  }
}
</style>
