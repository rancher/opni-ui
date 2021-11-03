<script>
import { ALL_TYPES, getAbsoluteValue } from '@/components/form/SuperDatePicker/util';
import day from 'dayjs';
import Loading from '@/components/Loading';

import { getLogs, getOverallBreakdownSeries, getAreasOfInterest } from '@/product/opni/utils/requests';
import InsightsChart from './InsightsChart';
import AreaOfInterstDetail from './AreaOfInterestDetail';
import AreaOfInterestTable from './AreaOfInterestTable';
import Configurator, { DEFAULT_CONFIGURATION } from './Configurator.vue';

export default {
  components: {
    Configurator, InsightsChart, Loading, AreaOfInterstDetail, AreaOfInterestTable
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
      highlightAreaOfInterest: null,
      areaOfInterest:          null,
      insights:                [],
      loading:                 false,
      logs:                    [],
      areasOfInterest:         [],
      fromTo,
      highlightAnomalies:      false,
      highlightRange:          null,
      config:                  { ...DEFAULT_CONFIGURATION }
    };
  },

  computed: {
    requestFromTo() {
      return {
        from: getAbsoluteValue(this.fromTo.from),
        to:   getAbsoluteValue(this.fromTo.to)
      };
    },
    regions() {
      if (!this.areaOfInterest && !this.highlightAreaOfInterest) {
        return [];
      }

      return [this.areaOfInterest?.fromTo || this.highlightAreaOfInterest?.fromTo];
    },
  },

  methods: {
    async loadData() {
      const { from, to } = this.requestFromTo;

      const responses = await Promise.all([
        getOverallBreakdownSeries(this.config.granularity),
        getLogs(from, to),
        getAreasOfInterest(from, to),
      ]);

      [
        this.insights,
        this.logs,
        this.areasOfInterest,
      ] = responses;

      const startOf = day().startOf('hour').subtract(30, 'minutes');

      this.areasOfInterest = ([
        {
          from: startOf.subtract(1, 'hours'),
          to:   startOf.valueOf()
        },

        {
          from: startOf.subtract(6, 'hours'),
          to:   startOf.subtract(4, 'hours').valueOf()
        },

        {
          from: startOf.subtract(15, 'hours'),
          to:   startOf.subtract(11, 'hours').valueOf()
        }
      ]);

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
    },
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
        Preempt
      </h1>
    </div>
    <Configurator v-model="config" />
    <div class="chart">
      <InsightsChart
        :key="insights.length"
        :from-to="fromTo"
        :insights="insights"
        :area-of-interest="areaOfInterest || highlightAreaOfInterest"
        :regions="regions"
        :loading="loading"
      />
    </div>
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
