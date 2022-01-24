<script>
import SortableTable from '@/components/SortableTable';
import { ANOMALY, NORMAL, SUSPICIOUS } from '@/config/table-headers';
import LogsDrawer from './LogsDrawer';
import { getControlPlaneLogs } from '~/product/opni/utils/requests';

export default {
  components: { LogsDrawer, SortableTable },

  props: {
    breakdown: {
      type:    Object,
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
          formatterOpts: { options: { fromTo: this.fromTo, type: 'control-plane' } },
        },
        ANOMALY(this.select, undefined, 'insights.anomalyFormatted', 'insights.anomaly'),
        SUSPICIOUS(this.select, undefined, 'insights.suspiciousFormatted', 'insights.suspicious'),
        NORMAL(undefined, undefined, 'insights.normalFormatted', 'insights.normal'),
      ]
    };
  },

  methods: {
    select(level, row) {
      this.$refs.drawer.open({ level, row });
    },
    async logGetter(level, row, scrollId) {
      return await getControlPlaneLogs(this.fromTo.from, this.fromTo.to, level, row.name, scrollId);
    }
  }
};
</script>
<template>
  <div>
    <SortableTable
      :rows="breakdown.components"
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
