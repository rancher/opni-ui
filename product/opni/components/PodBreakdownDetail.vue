<script>
import SortableTable from '@/components/SortableTable';
import { SIMPLE_NAME, ANOMALY, NORMAL, SUSPICIOUS } from '@/config/table-headers';

export default {
  components: { SortableTable },

  props: {
    breakdown: {
      type:    Array,
      default: null,
    },
  },

  data() {
    return {
      headers: [
        {
          ...SIMPLE_NAME,
          width: null,
          value: 'name'
        },
        ANOMALY(() => 'bubble anomaly', row => this.$emit('select', {
          level: 'Anomaly', key: 'pod_name', value: row.name
        })),
        SUSPICIOUS(() => 'bubble suspicious', row => this.$emit('select', {
          level: 'Suspicious', key: 'pod_name', value: row.name
        })),
        NORMAL(),
      ]
    };
  },
};
</script>
<template>
  <SortableTable
    :rows="breakdown"
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
