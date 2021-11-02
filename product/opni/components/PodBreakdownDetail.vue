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
          value: 'Name'
        },
        ANOMALY(() => 'bubble anomaly', row => this.$emit('select', {
          level: 'Anomaly', key: 'podName', value: row.Name
        })),
        SUSPICIOUS(() => 'bubble suspicious', row => this.$emit('select', {
          level: 'Suspicious', key: 'podName', value: row.Name
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
