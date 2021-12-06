<script>
import SortableTable from '@/components/SortableTable';
import Drawer from '@/components/Drawer';
import Banner from '@/components/Banner';
import Loading from '@/components/Loading';
import isEqual from 'lodash/isEqual';
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
    value:         'kubernetesNamespaceName',
    sort:          ['kubernetesNamespaceName']
  },
  {
    name:          'podName',
    labelKey:      'tableHeaders.podName',
    value:         'kubernetesPodName',
    sort:          ['kubernetesPodName']
  },
  {
    name:          'area',
    labelKey:      'tableHeaders.area',
    value:         'area',
    sort:          'area',
    formatter:     'TextWithClass',
    formatterOpts: {
      getClass(row) {
        const level = row.isControlPlaneLog ? 'control-plane' : 'workload';

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
    fromTo: {
      type:     Object,
      required: true,
    }
  },

  data() {
    return {
      LOG_HEADERS,
      showSuspicious:    true,
      showAnomaly:       true,
      showWorkloads:     true,
      showControlPlanes: true,
      logs:              null,
      isOpen:            false,
      lastFilter:        null,
    };
  },

  methods: {
    getColor(log) {
      return log.anomalyLevel === 'Anomaly' ? 'error' : 'warning';
    },

    async loadLogs(newFilter) {
      if (isEqual(newFilter, this.lastFilter)) {
        return;
      }

      this.$set(this, 'logs', null);
      this.$set(this, 'lastFilter', newFilter);

      if (this.fromTo) {
        const filter = {
          is_control_plane_log: newFilter.isControlPlaneLog,
          anomaly_level:        newFilter.level,
          [newFilter.key]:      newFilter.value
        };

        this.logs = await getLogs(this.fromTo.from.valueOf(), this.fromTo.to.valueOf(), filter);
      }
    },

    open(filter) {
      this.$set(this, 'isOpen', true);
      this.loadLogs(filter);
    },

    close() {
      this.$set(this, 'isOpen', false);
    }
  },
};
</script>
<template>
  <Drawer :open="isOpen" @close="close">
    <template #title>
      <div class="p-5 pb-0">
        <h1>{{ t('opni.logsDrawer.title') }}</h1>
      </div>
    </template>
    <Loading v-if="logs === null" mode="relative" />
    <div v-else class="contents">
      <div class="row detail pb-20">
        <div class="col span-12 p-5 pr-20">
          <SortableTable
            class="table"
            :rows="logs || []"
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
                <td :colspan="fullColspan" class="pt-0">
                  <Banner
                    class="m-0"
                    :color="getColor(row)"
                  >
                    {{ row.log }}
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
