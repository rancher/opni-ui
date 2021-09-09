<script>
import SortableTable from '@/components/SortableTable';
import Checkbox from '@/components/form/Checkbox';
import Drawer from '@/components/Drawer';
import DateRange from '@/components/formatter/DateRange';
import Banner from '@/components/Banner';
import WorkloadVsControlPlaneChart from '@/components/opni/WorkloadVsControlPlaneChart';

export const LOG_HEADERS = [
  {
    name:      'date',
    labelKey:  'tableHeaders.date',
    formatter: 'Date',
    value:     'timestamp',
    sort:      ['timestamp'],
    width:     '300px'
  },
  {
    name:     'level',
    labelKey: 'tableHeaders.level',
    value:    'level',
    sort:     ['level']
  },
  {
    name:          'component',
    labelKey:      'tableHeaders.component',
    value:         'component',
    sort:          ['component']
  },
  {
    name:          'area',
    labelKey:      'tableHeaders.area',
    value:         'area',
    sort:          'area',
    formatter:     'TextWithClass',
    formatterOpts: {
      getClass(row) {
        const level = row.isControlPlane ? 'control-plane' : 'workload';

        return `bubble ${ level }`;
      }
    }
  },
  {
    name:      'feedback',
    labelKey:  'tableHeaders.feedback',
    formatter: 'Feedback',
    width:     '80px',
    align:     'right'
  },
];

export default {
  components: {
    Banner, DateRange, Drawer, SortableTable, Checkbox, WorkloadVsControlPlaneChart
  },

  props: {
    pointOfInterest: {
      type:    Object,
      default: null,
    },

    logs: {
      type:     Array,
      required: true
    },

    open: {
      type:     Boolean,
      required: true
    }
  },

  data() {
    return {
      LOG_HEADERS,
      showSuspicious: true,
      showAnomaly:    true,
      showEtcd:       true,
      showWorkloads:  true,
      showPods:       true,
    };
  },

  computed: {
    pointOfInterestLogs() {
      return this.logs
        .filter((log) => {
          if (!this.pointOfInterest) {
            return false;
          }

          const { from, to } = this.pointOfInterest.fromTo;

          if (log.timestamp < from || log.timestamp > to) {
            return false;
          }

          return true;
        });
    },
    filteredLogs() {
      return this.pointOfInterestLogs.filter((log) => {
        if (!this.showAnomaly && log.level === 'Anomaly') {
          return false;
        }

        if (!this.showSuspicious && log.level === 'Suspicious') {
          return false;
        }

        if (!this.showEtcd && log.component === 'etcd') {
          return false;
        }

        if (!this.showWorkloads && log.component === 'workload') {
          return false;
        }

        if (!this.showPods && log.component === 'pod') {
          return false;
        }

        return true;
      });
    },

    anomalyLogCount() {
      return this.pointOfInterestLogs.filter(log => log.level === 'Anomaly').length;
    },

    suspiciousLogCount() {
      return this.pointOfInterestLogs.filter(log => log.level === 'Suspicious').length;
    },

    etcdLogCount() {
      return this.pointOfInterestLogs.filter(log => log.component === 'etcd').length;
    },

    workloadLogCount() {
      return this.pointOfInterestLogs.filter(log => log.component === 'workload').length;
    },

    podLogCount() {
      return this.pointOfInterestLogs.filter(log => log.component === 'pod').length;
    },
  },
  methods: {
    getColor(message) {
      return message.level === 'Anomaly' ? 'error' : 'warning';
    }
  }
};
</script>
<template>
  <Drawer :open="open" @close="$emit('close')">
    <template #title>
      <div class="p-5 pb-0">
        <h1>{{ t('opni.pointOfInterestDetail.title') }}</h1> &nbsp;
        <h3 v-if="pointOfInterest">
          (<DateRange :value="pointOfInterest.fromTo" />)
        </h3>
      </div>
    </template>
    <div class="contents">
      <div class="row detail mb-10">
        <div class="col span-7 p-5 pr-20">
          <div class="filters">
            <div class="mb-5">
              <label>{{ t('opni.pointOfInterestDetail.level.label') }}:</label>
              <Checkbox v-model="showSuspicious" :label="t('opni.pointOfInterestDetail.level.suspicious', { count: suspiciousLogCount})" />
              <Checkbox v-model="showAnomaly" :label="t('opni.pointOfInterestDetail.level.anomaly', { count: anomalyLogCount})" />
            </div>
            <div class="mb-5">
              <label>{{ t('opni.pointOfInterestDetail.component.label') }} </label>
              <Checkbox v-model="showEtcd" :label="t('opni.pointOfInterestDetail.component.etcd', { count: etcdLogCount})" />
              <Checkbox v-model="showWorkloads" :label="t('opni.pointOfInterestDetail.component.workloads', { count: workloadLogCount})" />
              <Checkbox v-model="showPods" :label="t('opni.pointOfInterestDetail.component.pods', { count: podLogCount})" />
            </div>
          </div>
          <SortableTable
            :rows="filteredLogs"
            :headers="LOG_HEADERS"
            :search="false"
            :table-actions="false"
            :row-actions="false"
            :paging="true"
            default-sort-by="name"
            key-field="id"
          >
            <template #sub-row="{row, fullColspan}">
              <tr class="opni sub-row">
                <td :colspan="fullColspan" :class="{[row.level.toLowerCase()]: true}" class="pt-0">
                  <Banner
                    class="m-0"
                    :color="getColor(row)"
                  >
                    {{ row.message }}
                  </Banner>
                </td>
              </tr>
            </template>
          </SortableTable>
        </div>
        <div class="col span-5">
          <WorkloadVsControlPlaneChart v-if="pointOfInterest" class="chart" :workload-count="pointOfInterest.workloadCount" :control-plane-count="pointOfInterest.controlPlaneCount" />
        </div>
      </div>
    </div>
  </drawer>
</template>

<style lang="scss" scoped>
.contents {
  display: flex;
  flex-direction: column;
  height: 380px;
  overflow: hidden;
}

.chart {
  width: calc(100% - 30px - 1.75%);
}

.detail {
  height: 100%;

  .col:nth-of-type(2) {
    border-left: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-left: calc(20px + 1.75%);
  }

  .col {
    overflow-y: scroll;
    padding-bottom: 30px;
  }

  ::v-deep {
    .anomaly {
      color: var(--error);
    }

    .suspicious {
      color: var(--warning);
    }
  }
}

h1, h3 {
  display: inline-block;
}
</style>
