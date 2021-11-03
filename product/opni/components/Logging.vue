<script>
import { ALL_TYPES, getAbsoluteValue } from '@/components/form/SuperDatePicker/util';
import day from 'dayjs';
import Loading from '@/components/Loading';

import { getLogs, getBreakdowns, getOverallBreakdownSeries } from '@/product/opni/utils/requests';
import InsightsChart from './InsightsChart';
import Configurator, { DEFAULT_CONFIGURATION } from './Configurator';
import Breakdown from './Breakdown';

export default {
  components: {
    Breakdown, Configurator, InsightsChart, Loading
  },

  async fetch() {
    await this.loadData();
  },

  data() {
    const fromTo = {
      from: {
        value: day().subtract(2, 'day'),
        type:  ALL_TYPES.ABSOLUTE.key
      },
      to: {
        value: day(),
        type:  ALL_TYPES.ABSOLUTE.key
      }
    };

    return {
      insights:                [],
      loading:                 false,
      logs:                    [],
      podBreakdown:            {},
      namespaceBreakdown:      {},
      workloadBreakdown:       {},
      controlPlaneBreakdown:   {},
      fromTo,
      highlightAnomalies:      false,
      highlightRange:          null,
      config:                { ...DEFAULT_CONFIGURATION }
    };
  },

  computed: {
    requestFromTo() {
      return {
        from: getAbsoluteValue(this.fromTo.from),
        to:   getAbsoluteValue(this.fromTo.to)
      };
    },
  },

  methods: {
    async loadData() {
      const { from, to } = this.requestFromTo;

      const responses = await Promise.all([
        getOverallBreakdownSeries(this.config.granularity),
        getLogs(from, to),
        getBreakdowns(from, to)
      ]);

      [
        this.insights,
        this.logs,
        {
          Pods: this.podBreakdown,
          Namespaces: this.namespaceBreakdown,
          Workloads: this.workloadBreakdown,
          'Control Plane': this.controlPlaneBreakdown
        }
      ] = responses;

      this.logs = this.logs.map(log => ({
        ...log,
        stateDescription: true,
        stateObj:         {}
      }));
    },
  },
  watch: {
    async granularity() {
      try {
        this.loading = true;
        this.insights = await getOverallBreakdownSeries(this.granularity);
      } finally {
        this.loading = false;
      }
    },
    range() {
      const to = day();

      this.fromTo = {
        from: to.subtract(this.range.count, this.range.unit),
        to
      };
    }
  }
};
</script>
<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <div class="bar">
      <h1>
        Respond
      </h1>
    </div>
    <Configurator v-model="config" />
    <InsightsChart
      :key="insights.length"
      :granularity="config.granularity"
      :from-to="fromTo"
      :insights="insights"
      :loading="loading"
    />
    <Breakdown :from-to="requestFromTo" :pod-breakdown="podBreakdown" :namespace-breakdown="namespaceBreakdown" :workload-breakdown="workloadBreakdown" :control-plane-breakdown="controlPlaneBreakdown" />
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
