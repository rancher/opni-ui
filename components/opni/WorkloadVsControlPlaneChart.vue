<script>
import bb, { bar } from 'billboard.js';

export default {
  name:       'WorkloadVsControlPlaneChart',
  components: { },
  props:      {
    workloadCount: {
      type:    Number,
      default: 0
    },
    controlPlaneCount: {
      type:    Number,
      default: 0
    }
  },
  data() {
    return {
      chart:        null,
      workload:     this.t('opni.workloadVsControlPlaneChart.workload'),
      controlPlane: this.t('opni.workloadVsControlPlaneChart.controlPlane')
    };
  },

  mounted() {
    this.createChart();
  },

  watch: {
    workloadCount() {
      this.createChart();
    },
    controlPlaneCount() {
      this.createChart();
    }
  },

  methods: {
    createChart() {
      this.chart = bb.generate(
        {
          data: {
            type:    bar(),
            colors:  {
              [this.controlPlane]: '#3D98D3',
              [this.workload]:     '#614EA2'
            },
            columns: [
              [this.controlPlane, this.controlPlaneCount || 0.01],
              [this.workload, this.workloadCount || 0.01],
            ],
          },
          axis: {
            rotated: true,
            y:       { show: true },
            x:       { show: false }
          },
          tooltip: { show: false },
          bindto:  this.$refs.chart,
        }
      );
    }
  }
};
</script>

<template>
  <div ref="chart" class="workload-vs-control-plane-chart" />
</template>

<style lang="scss">
.workload-vs-control-plane-chart {
    .bb-main {
        fill: var(--input-label);

        .domain {
            fill: none;
            stroke: var(--default-text);
            stroke-width: 1px;
        }
    }
}
</style>
