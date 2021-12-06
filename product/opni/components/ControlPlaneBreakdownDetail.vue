<script>
import SortableTable from '@/components/SortableTable';
import { SIMPLE_NAME, ANOMALY, NORMAL, SUSPICIOUS } from '@/config/table-headers';
import LogsDrawer from './LogsDrawer';

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
          ...SIMPLE_NAME,
          width: null,
          value: 'name'
        },
        ANOMALY(() => 'bubble anomaly', row => this.select('Anomaly', row), 'insights.anomalyFormatted', 'insights.anomaly'),
        SUSPICIOUS(() => 'bubble suspicious', row => this.select('Suspicious', row), 'insights.suspiciousFormatted', 'insights.suspicious'),
        NORMAL(undefined, undefined, 'insights.normalFormatted', 'insights.normal'),
      ]
    };
  },

  methods: {
    select(level, row) {
      this.$refs.drawer.open({
        level,
        isControlPlaneLog: true
      });
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
    <LogsDrawer ref="drawer" :from-to="fromTo" />
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
