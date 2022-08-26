<script>
import { Line as LineChart } from 'vue-chartjs/legacy';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
} from 'chart.js';
import day from 'dayjs';
import { previewSLO } from '~/product/opni/utils/requests/slo';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale
);

export default {
  components: { LineChart },
  props:      {
    name: {
      type:    String,
      default: ''
    },
    clusterId: {
      type:    String,
      default: ''
    },
    serviceId: {
      type:    String,
      default: ''
    },
    goodMetricName: {
      type:    String,
      default: ''
    },
    goodEvents: {
      type:    Array,
      default: () => [],
    },
    totalMetricName: {
      type:    String,
      default: ''
    },
    totalEvents: {
      type:    Array,
      default: () => [],
    },
    period: {
      type:    String,
      default: ''
    },
    budgetingInterval: {
      type:    String,
      default: ''
    },
    targetValue: {
      type:    Number,
      default: 95
    },
  },

  data() {
    const chartOptions = {
      responsive:          true,
      maintainAspectRatio: false,
      plugins:             { legend: { position: 'bottom' } },
      scales:              { y: { suggestedMin: 0 } }

    };

    return {
      chartOptions,
      preview:      null,
      loading:      false
    };
  },

  created() {
    this.loadPreview();
  },

  methods: {
    async loadPreview() {
      if (this.name && this.clusterId && this.serviceId && this.goodMetricName && this.totalMetricName && this.goodEvents && this.totalEvents && this.period && this.budgetingInterval && this.targetValue) {
        this.$set(this, 'loading', true);
        const preview = await previewSLO(this.name, this.clusterId, this.serviceId, this.goodMetricName, this.totalMetricName, this.goodEvents, this.totalEvents, this.period, this.budgetingInterval, this.targetValue, []);

        this.$set(this, 'preview', preview);
        this.$set(this, 'loading', false);
      }
    }
  },

  computed: {
    props() {
      return {
        name:              this.name,
        clusterId:         this.clusterId,
        serviceId:         this.serviceId,
        goodMetricName:    this.goodMetricName,
        totalMetricName:   this.totalMetricName,
        period:            this.period,
        budgetingInterval: this.budgetingInterval,
        targetValue:       this.targetValue
      };
    },
    items() {
      return this.preview?.plotVector?.items || [];
    },

    trackedValues() {
      const showRandomData = window.location.search.includes('test');

      return this.items.map((item) => {
        if (!showRandomData) {
          return item.sli;
        }

        const rand = Math.random() * 10 + 80;

        return item.sli === 'NaN' ? rand : item.sli;
      });
    },

    thresholdValues() {
      return this.labels.map(() => this.targetValue);
    },

    labels() {
      return this.items.map(item => day(item.timestamp).format('MMM D - h:mm'));
    },

    chartData() {
      return {
        labels:   this.labels,
        datasets: [
          {
            label:           'Tracked Value',
            backgroundColor: '#a453b9',
            borderColor:     '#a453b9',
            data:            this.trackedValues
          },
          {
            label:           'Threshold',
            backgroundColor: '#dcdee7',
            borderColor:     '#dcdee7',
            pointRadius:     0,
            borderWidth:     3,
            data:            this.thresholdValues
          }
        ]
      };
    },
    showNoPreview() {
      return this.trackedValues.every(v => v === 'NaN');
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler() {
        this.$refs.chart.updateChart();
      }
    },

    props: {
      deep: true,
      handler() {
        this.loadPreview();
      }
    }
  }
};
</script>
<template>
  <div class="slo-preview">
    <LineChart ref="chart" :chart-data="chartData" :chart-options="chartOptions" />
    <div v-if="!loading && showNoPreview" class="no-preview backdrop">
      <div>
        <h1>Preview Unavailable</h1>
        <p>Either change the settings above or wait for more data to become available.</p>
      </div>
    </div>
    <div v-if="loading" class="backdrop loading">
      <div>
        <i class="icon icon-spinner icon-lg" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .slo-preview {
    position: relative;

    .backdrop {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;

      display: flex;
      justify-content: center;

      background-color: rgba(220, 222, 231, 0.75);
    }

    .no-preview {
      padding-top: 100px;
    }

    .loading {
      align-items: center;

      & > div {
        position: relative;
        width: 120px;
        height: 120px;
        animation:spin 4s linear infinite;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      i {
        margin-top: -6px;
        transform: scale(5);
        color: var(--primary);
      }

      @keyframes spin {
          100% {
              transform: rotate(360deg);
          }
      }
    }
  }
</style>
