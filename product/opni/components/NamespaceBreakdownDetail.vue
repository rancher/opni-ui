<script>
import SortableTable from '@/components/SortableTable';
import { ANOMALY, SIMPLE_NAME, NORMAL, SUSPICIOUS } from '@/config/table-headers';

export const HEADERS = [
  {
    ...SIMPLE_NAME,
    width: null,
    value: 'Name'
  },
  ANOMALY,
  SUSPICIOUS,
  NORMAL,
];
export default {
  components: { SortableTable },

  props: {
    breakdown: {
      type:    Array,
      default: null,
    },
  },

  data() {
    return { HEADERS };
  },
};
</script>
<template>
  <SortableTable
    :rows="breakdown"
    :headers="HEADERS"
    :search="false"
    :table-actions="false"
    :row-actions="false"
    :paging="true"
    default-sort-by="anomaly"
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
