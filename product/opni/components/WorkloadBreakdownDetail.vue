<script>
import SortableTable from '@/components/SortableTable';
import {
  SIMPLE_NAME, BREAKDOWN_RESOURCE, ANOMALY, NORMAL, SUSPICIOUS
} from '@/config/table-headers';
import { WorkloadBreakdownAggregation } from '~/product/opni/models/overallBreakdown/WorkloadBreakdownAggregation';

export const HEADERS = [
  {
    ...SIMPLE_NAME,
    width: null,
    value: 'breakdown.name'
  },
  BREAKDOWN_RESOURCE,
  ANOMALY(undefined, undefined, 'breakdown.insights.anomalyFormatted', 'breakdown.insights.anomaly'),
  SUSPICIOUS(undefined, undefined, 'breakdown.insights.suspiciousFormatted', 'breakdown.insights.suspicious'),
  NORMAL(undefined, undefined, 'breakdown.insights.normalFormatted', 'breakdown.insights.normal')
];

export default {
  components: { SortableTable },

  props: {
    breakdown: {
      type:    WorkloadBreakdownAggregation,
      default: null,
    },
  },

  data() {
    return { HEADERS };
  },

  computed: {
    rows() {
      return Object.entries(this.breakdown)
        .flatMap(([resource, resourceBreakdown]) => {
          return resourceBreakdown.map(breakdown => ({
            breakdown,
            resource
          }));
        });
    },
  },
};
</script>
<template>
  <SortableTable
    :rows="rows"
    group-by="breakdown.namespace"
    :headers="HEADERS"
    :search="false"
    :table-actions="false"
    :row-actions="false"
    :paging="true"
    default-sort-by="anomaly"
    :default-sort-descending="true"
    key-field="id"
  />
</template>

<style lang="scss" scoped>
.detail {
  height: 100%;
}

.contents {
  overflow-y: scroll;
  height: 100%;
}

h1, h3 {
  display: inline-block;
}
</style>
