<script>
import Tab from '@/components/Tabbed/Tab';
import Tabbed from '@/components/Tabbed';
import PodBreakdownDetail from './PodBreakdownDetail';
import NamespaceBreakdownDetail from './NamespaceBreakdownDetail';
import WorkloadBreakdownDetail from './WorkloadBreakdownDetail';
import ControlPlaneBreakdownDetail from './ControlPlaneBreakdownDetail';
import LogsDrawer from './LogsDrawer';

export default {
  components: {
    ControlPlaneBreakdownDetail, LogsDrawer, PodBreakdownDetail, NamespaceBreakdownDetail, Tabbed, Tab, WorkloadBreakdownDetail
  },

  props: {
    fromTo: {
      type:     Object,
      required: true,
    },
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

  data() {
    return { selectedBreakdown: null };
  },

  methods: {
    selectBreakdown(breakdown) {
      this.$set(this, 'selectedBreakdown', breakdown);
    },

    deselectBreakdown() {
      this.$set(this, 'selectedBreakdown', null);
    }
  }
};
</script>
<template>
  <div>
    <h3 class="mt-20">
      Breakdowns
    </h3>
    <Tabbed :side-tabs="true">
      <Tab
        name="controlPlane"
        label="Control Plane"
        :show-header="false"
        :weight="4"
      >
        <ControlPlaneBreakdownDetail :breakdown="controlPlaneBreakdown" @select="selectBreakdown" />
      </Tab>
      <Tab
        name="pod"
        label="Pod"
        :show-header="false"
        :weight="3"
      >
        <PodBreakdownDetail :breakdown="podBreakdown" @select="selectBreakdown" />
      </Tab>
      <Tab
        name="namespace"
        label="Namespace"
        :show-header="false"
        :weight="2"
      >
        <NamespaceBreakdownDetail :breakdown="namespaceBreakdown" @select="selectBreakdown" />
      </Tab>
      <Tab
        name="workload"
        label="Workload"
        :show-header="false"
        :weight="1"
      >
        <WorkloadBreakdownDetail :breakdown="workloadBreakdown" @select="selectBreakdown" />
      </Tab>
    </Tabbed>
    <LogsDrawer :open="!!selectedBreakdown" :from-to="fromTo" :filter="selectedBreakdown" @close="deselectBreakdown" />
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

  .bubble {
    cursor: pointer;

    &.anomaly {
      border-color: var(--error);

      &::before {
        background-color: var(--error);
      }
    }

    &.suspicious {
      border-color: var(--warning);

      &::before {
        background-color: var(--warning);
      }
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
