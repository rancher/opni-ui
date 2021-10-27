<script>
import Tab from '@/components/Tabbed/Tab';
import Tabbed from '@/components/Tabbed';
import PodBreakdownDetail from './PodBreakdownDetail';
import NamespaceBreakdownDetail from './NamespaceBreakdownDetail';
import WorkloadBreakdownDetail from './WorkloadBreakdownDetail';
import ControlPlaneBreakdownDetail from './ControlPlaneBreakdownDetail';

export default {
  components: {
    ControlPlaneBreakdownDetail, PodBreakdownDetail, NamespaceBreakdownDetail, Tabbed, Tab, WorkloadBreakdownDetail
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
    controlPlaneBreakdown: {
      type:     Object,
      required: true
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

      <Tab
        name="controlPlane"
        label="Control Plane"
        :show-header="false"
        :weight="0"
      >
        <ControlPlaneBreakdownDetail :breakdown="controlPlaneBreakdown" />
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
