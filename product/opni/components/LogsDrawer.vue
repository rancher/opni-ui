<script>
import SortableTable from '@/components/SortableTable';
import Drawer from '@/components/Drawer';
import Banner from '@/components/Banner';
import Loading from '@/components/Loading';
import { getLogs } from '~/product/opni/utils/requests';

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
    name:          'namespace',
    labelKey:      'tableHeaders.namespace',
    value:         'namespace',
    sort:          ['namespace']
  },
  {
    name:          'podName',
    labelKey:      'tableHeaders.podName',
    value:         'podName',
    sort:          ['podName']
  },
  {
    name:          'area',
    labelKey:      'tableHeaders.area',
    value:         'area',
    sort:          'area',
    formatter:     'TextWithClass',
    formatterOpts: {
      getClass(row) {
        console.log('aaaa', row);
        const level = row.isControlPlane ? 'control-plane' : 'workload';

        return `bubble ${ level }`;
      }
    }
  },
];

export default {
  components: {
    Banner, Drawer, Loading, SortableTable
  },

  props: {
    open: {
      type:     Boolean,
      required: true
    },

    fromTo: {
      type:     Object,
      required: true,
    },

    filter: {
      type:    Object,
      default: () => ({
        level: 'Suspicious',
        key:   'namespace',
        value: 'kube-system'
      })
    },
  },

  data() {
    return {
      LOG_HEADERS,
      showSuspicious:    true,
      showAnomaly:       true,
      showWorkloads:     true,
      showControlPlanes: true,
      logs:              null
    };
  },

  computed: {
    filteredLogs() {
      if (!this.filter || !this.logs) {
        return null;
      }

      return this.logs.filter((log) => {
        return log.level === this.filter.level &&
          log[this.filter.key] === this.filter.value;
      });
    },

    mappedLogs() {
      if (!this.filter || !this.filteredLogs) {
        return null;
      }

      return this.filteredLogs.map(log => ({
        ...log,
        area:             log.isControlPlane ? 'Control Plane' : 'Workload',
        stateDescription: true,
        stateObj:         {}
      }));
    },
  },
  methods: {
    getColor(message) {
      return message.level === 'Anomaly' ? 'error' : 'warning';
    },

    async loadLogs() {
      this.logs = null;

      if (this.fromTo) {
        this.logs = await getLogs(this.fromTo.from.valueOf(), this.fromTo.to.valueOf());
      }
    }
  },

  watch: {
    fromTo() {
      this.loadLogs();
    },
    filter() {
      this.loadLogs();
    }
  }
};
</script>
<template>
  <Drawer :open="open" @close="$emit('close')">
    <template #title>
      <div class="p-5 pb-0">
        <h1>Logs</h1>
        <div v-if="open">
          <h3>{{ filter.level }} - {{ filter.key }}: {{ filter.value }}</h3>
        </div>
      </div>
    </template>
    <Loading v-if="mappedLogs === null" mode="relative" />
    <div v-else class="contents">
      <div class="row detail mb-10">
        <div class="col span-12 p-5 pr-20">
          <SortableTable
            class="table"
            :rows="mappedLogs"
            :headers="LOG_HEADERS"
            :search="false"
            :table-actions="false"
            :row-actions="false"
            :paging="true"
            :rows-per-page="8"
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

    .sortable-table {
      table-layout: fixed;
    }
  }
}

h1, h3 {
  display: inline-block;
}
</style>
