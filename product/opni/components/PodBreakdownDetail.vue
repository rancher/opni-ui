<script>
import SortableTable from '@/components/SortableTable';
import { ANOMALY, NORMAL, SUSPICIOUS } from '@/config/table-headers';
import LogsDrawer from './LogsDrawer';
import { getPodLogs } from '~/product/opni/utils/requests';

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
          name:          'Name',
          label:         'Name',
          value:         'name',
          sort:          `name`,
          formatter:     'KibanaLink',
          formatterOpts: { options: { internal: true } },
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

    async logGetter(level, row, scrollId) {
      return await getPodLogs(this.fromTo.from, this.fromTo.to, level, row.name, row.namesapce, scrollId);
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
