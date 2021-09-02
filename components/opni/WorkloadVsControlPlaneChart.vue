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
    return { chart: null };
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
              Workload:        '#614EA2',
              'Control Plane': '#3D98D3'
            },
            columns: [
              ['Control Plane', this.controlPlaneCount || 0.01],
              ['Workload', this.workloadCount || 0.01],
            ],
            axes: {
              Workload:        'y',
              'Control Plane': 'y'
            }
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
