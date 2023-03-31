<script>
import LoadingSpinner from '@/product/opni/components/LoadingSpinner';
import SortableTable from '@/components/SortableTable';

export default {
  components: { LoadingSpinner, SortableTable },
  props:      {
    row: {
      type:     Object,
      required: true
    }
  },
  data() {
    return {
      headers: [
        {
          name:          'state',
          labelKey:      'tableHeaders.state',
          sort:          ['status'],
          value:         'status',
          formatter:     'StatusBadge',
        },
        {
          name:          'metricCount',
          labelKey:      'tableHeaders.metricCount',
          sort:          ['metricCount'],
          value:         'metricCount'
        },
        {
          name:          'anomalousMetricCount',
          labelKey:      'tableHeaders.anomalousMetricCount',
          sort:          ['anomalousMetricCount'],
          value:         'anomalousMetricCount'
        },
        {
          name:          'grafana',
          labelKey:      'tableHeaders.grafana',
          sort:          ['grafana'],
          value:         'grafana',
          formatter:      'Link',
          formatterOpts: { urlKey: 'grafanaUrl', labelKey: 'grafanaLabel' },
        },
        {
          name:          'jobSubmittedTime',
          labelKey:      'tableHeaders.started',
          sort:          ['jobSubmittedTime'],
          value:         'jobSubmittedTime',
          formatter:     'LiveDate',
          align:         'right',
          width:         100
        },
        // We're using this instead of available actions because the sub table uses the parent table's actions and there isn't a
        // good reason to resolve this issue in this fork. We should fix this when we finish migrating to an extension.
        {
          name:          'delete',
          labelKey:      'tableHeaders.delete',
          value:         'delete',
          formatter:      'Delete',
          align:         'right',
          width:     20
        },
      ]
    };
  },
  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
      this.$set(this, 'interval', null);
    }
  },
  async fetch() {
    await this.row.loadJobRuns();

    const interval = setInterval(() => {
      this.row.loadJobRuns();
    }, 10000);

    this.$set(this, 'interval', interval);
  }
};
</script>
<template>
  <LoadingSpinner v-if="$fetchState.pending" />
  <SortableTable
    v-else
    name="test"
    class="sub-table"
    :rows="row.results"
    :headers="headers"
    :search="false"
    :row-actions="false"
    :table-actions="false"
    key-field="id"
    default-sort-by="jobSubmittedTime"
    :default-sort-descending="true"
  />
</template>
