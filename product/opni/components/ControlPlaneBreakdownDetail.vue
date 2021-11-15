<script>
import SortableTable from '@/components/SortableTable';
import { SIMPLE_NAME, ANOMALY, NORMAL, SUSPICIOUS } from '@/config/table-headers';

export default {
  components: { SortableTable },

  props: {
    breakdown: {
      type:    Object,
      default: null,
    },
  },

  data() {
    return {
      headers: [
        {
          ...SIMPLE_NAME,
          width: null,
          value: 'Name'
        },
        ANOMALY(() => 'bubble anomaly', row => this.$emit('select', {
          level: 'Anomaly', key: 'isControlPlane', value: true
        }), 'Insights.Anomaly'),
        SUSPICIOUS(() => 'bubble suspicious', row => this.$emit('select', {
          level: 'Suspicious', key: 'name', value: row.Name
        }), 'Insights.Suspicious'),
        NORMAL(undefined, undefined, 'Insights.Normal'),
      ]
    };
  },
};
</script>
<template>
  <SortableTable
    :rows="breakdown.Components"
    :headers="headers"
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
