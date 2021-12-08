<script>
import SortableTable from '@/components/SortableTable';
import { SIMPLE_NAME, ANOMALY, NORMAL, SUSPICIOUS } from '@/config/table-headers';
import LogsDrawer from './LogsDrawer';
import { getNamespaceLogs } from '~/product/opni/utils/requests';

export default {
  components: { LogsDrawer, SortableTable },

  props: {
    breakdown: {
      type:    Array,
      default: null,
    },

    fromTo: {
      type:     Object,
      required:  true,
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
        ANOMALY(this.select),
        SUSPICIOUS(this.select),
        NORMAL(),
      ]
    };
  },

  methods: {
    select(level, row) {
      this.$refs.drawer.open({ level, row });
    },
    async logGetter(level, row) {
      return await getNamespaceLogs(this.fromTo.from, this.fromTo.to, level, row.name, row.namesapce);
    }
  }
};
</script>
<template>
  <div>
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
    <LogsDrawer ref="drawer" :from-to="fromTo" :log-getter="logGetter" />
  </div>
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
