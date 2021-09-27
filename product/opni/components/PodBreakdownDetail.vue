<script>
import SortableTable from '@/components/SortableTable';
import Drawer from '@/components/Drawer';
import { ANOMALY, SIMPLE_NAME, NORMAL, SUSPICIOUS } from '@/config/table-headers';

export const HEADERS = [
  {
    ...SIMPLE_NAME,
    width: null,
    value: 'Name'
  },
  ANOMALY,
  NORMAL,
  SUSPICIOUS
];

export default {
  components: { Drawer, SortableTable },

  props: {
    breakdown: {
      type:    Array,
      default: null,
    },

    open: {
      type:     Boolean,
      required: true
    }
  },

  data() {
    return { HEADERS };
  },
};
</script>
<template>
  <Drawer :open="open" @close="$emit('close')">
    <template #title>
      <div class="p-5 pb-0">
        <h1>Pod Breakdown</h1> &nbsp;
      </div>
    </template>
    <div class="contents">
      <div class="row detail mb-10">
        <div class="col span-12 p-5">
          <SortableTable
            :rows="breakdown"
            :headers="HEADERS"
            :search="false"
            :table-actions="false"
            :row-actions="false"
            :paging="true"
            default-sort-by="name"
            key-field="id"
          />
          <div class="spacer mt-10" />
        </div>
      </div>
    </div>
  </drawer>
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
