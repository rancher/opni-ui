<script>
import SortableTable from '@/components/SortableTable';
import { getJobs } from '@/product/opni/utils/requests/aiops/metrics';
import Loading from '@/components/Loading';
import Banner from '@/components/Banner';
import JobResultsTable from './JobResultsTable';
import AddTokenDialog from './dialogs/AddTokenDialog';

export default {
  components: {
    AddTokenDialog, Banner, Loading, SortableTable, JobResultsTable
  },
  async fetch() {
    await this.load();
  },

  data() {
    return {
      loading:  false,
      jobs:    [],
      headers:  [
        {
          name:      'nameDisplay',
          labelKey:  'tableHeaders.name',
          sort:      ['nameDisplay'],
          value:     'nameDisplay',
          width:     100
        },
        {
          name:      'description',
          labelKey:  'tableHeaders.description',
          sort:      ['description'],
          value:     'description',
        },
        {
          name:          'clusterNames',
          labelKey:      'tableHeaders.namespaces',
          sort:          ['namespaces'],
          value:         'namespaces',
          formatter:     'List'
        },
        {
          name:          'lastRun',
          labelKey:      'tableHeaders.lastRun',
          sort:          ['lastRun'],
          value:         'lastRun',
          formatter:     'LiveDate',
          align:         'right',
          width:         100
        }
      ],
    };
  },

  created() {
    this.$on('remove', this.loadJobs);
  },

  beforeDestroy() {
    this.$off('remove');
  },

  methods: {
    async load() {
      try {
        this.loading = true;
        await this.loadJobs();
      } finally {
        this.loading = false;
      }
    },

    async loadJobs() {
      this.$set(this, 'jobs', await getJobs(this));
    },
  }
};
</script>
<template>
  <Loading v-if="loading || $fetchState.pending" />
  <div v-else>
    <header>
      <div class="title">
        <h1>Jobs</h1>
      </div>
      <div class="actions-container">
        <n-link class="btn role-primary" :to="{ name: 'task-create' }">
          Create
        </n-link>
      </div>
    </header>
    <Banner color="info" label="Metric Anomaly is currently an experimental feature." />
    <SortableTable
      :rows="jobs"
      :headers="headers"
      :search="false"
      default-sort-by="expirationDate"
      :sub-rows="true"
      :sub-expandable="true"
      :sub-expand-column="true"
      key-field="id"
    >
      <template #sub-row="{row, fullColspan}">
        <tr class="sub-row">
          <td :colspan="fullColspan">
            <JobResultsTable :row="row" />
          </td>
        </tr>
      </template>
    </SortableTable>
    <AddTokenDialog ref="dialog" @save="load" />
  </div>
</template>

<style lang="scss" scoped>
::v-deep {
  .nowrap {
    white-space: nowrap;
  }

  .sub-row td {
    background-color: #f4f5fa;
  }

  .sub-table table {
    border: none;
    outline: none;

    thead {
      border-bottom: 1px solid #dcdee7;
      th {
        background-color: #f4f5fa;
      }
    }
  }
}
</style>
