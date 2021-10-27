<script>
import sumBy from 'lodash/sumBy';
import Tab from '@/components/Tabbed/Tab';
import Tabbed from '@/components/Tabbed';
import PodBreakdownDetail from './PodBreakdownDetail';
import NamespaceBreakdownDetail from './NamespaceBreakdownDetail';
import WorkloadBreakdownDetail from './WorkloadBreakdownDetail';

export default {
  components: {
    PodBreakdownDetail, NamespaceBreakdownDetail, Tabbed, Tab, WorkloadBreakdownDetail
  },

  props: {
    podBreakdown: {
      type:     Array,
      required: true
    },
    namespaceBreakdown: {
      type:     Array,
      required: true
    },
    workloadBreakdown: {
      type:     Object,
      required: true
    },
  },

  data() {
    return {
      showPodBreakdownDetail:          false,
      showNamespaceBreakdownDetail:    false,
      showWorkloadBreakdownDetail:     false,
    };
  },

  computed: {
    podCount() {
      return sumBy(this.podBreakdown, breakdown => breakdown.Insights.Anomaly);
    },

    namespaceCount() {
      return sumBy(this.namespaceBreakdown, breakdown => breakdown.Insights.Anomaly);
    },

    workloadCount() {
      const breakdown = Object.values(this.workloadBreakdown).flat();

      return sumBy(breakdown, breakdown => breakdown?.Insights?.Anomaly || 0);
    }
  },

  methods: {}
};
</script>
<template>
  <div>
    <h3 class="mt-20">
      Breakdowns
    </h3>
    <Tabbed :side-tabs="true">
      <Tab
        name="pod"
        label="Pod"
        :show-header="false"
        :weight="3"
      >
        <PodBreakdownDetail :breakdown="podBreakdown" />
      </Tab>
      <Tab
        name="namespace"
        label="Namespace"
        :show-header="false"
        :weight="2"
      >
        <NamespaceBreakdownDetail :breakdown="namespaceBreakdown" />
      </Tab>
      <Tab
        name="workload"
        label="Workload"
        :show-header="false"
        :weight="1"
      >
        <WorkloadBreakdownDetail :breakdown="workloadBreakdown" />
      </Tab>
    </Tabbed>
  </div>
</template>

<style lang="scss" scoped>
::v-deep {
  .breakdown-card {
    cursor: pointer;

    .card-body {
      height: 100px;
    }
  }
}

.breakdown {
  display: flex;
  flex-direction: row;

  justify-content: space-between;
  align-items: center;
}

.card {
  margin: 0;
}
</style>
