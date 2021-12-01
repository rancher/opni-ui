<script>
import Tab from '@/components/Tabbed/Tab';
import Tabbed from '@/components/Tabbed';
import { getBreakdowns } from '@/product/opni/utils/requests';
import Loading from '@/components/Loading';
import PodBreakdownDetail from './PodBreakdownDetail';
import NamespaceBreakdownDetail from './NamespaceBreakdownDetail';
import WorkloadBreakdownDetail from './WorkloadBreakdownDetail';
import ControlPlaneBreakdownDetail from './ControlPlaneBreakdownDetail';
import LogsDrawer from './LogsDrawer';

export default {
  components: {
    ControlPlaneBreakdownDetail, Loading, LogsDrawer, PodBreakdownDetail, NamespaceBreakdownDetail, Tabbed, Tab, WorkloadBreakdownDetail
  },

  props: {
    selection: {
      type:     Object,
      required:  true,
    },

    potentialSelection: {
      type:     Object,
      default: null
    }
  },

  fetch() {
    this.load();
  },

  data() {
    return {
      loading:               true,
      selectedBreakdown:     null,
      podBreakdown:          null,
      namespaceBreakdown:    null,
      workloadBreakdown:     null,
      controlPlaneBreakdown: null,
    };
  },

  methods: {
    selectBreakdown(breakdown) {
      this.$set(this, 'selectedBreakdown', breakdown);
    },

    deselectBreakdown() {
      this.$set(this, 'selectedBreakdown', null);
    },

    async load() {
      this.loading = true;

      const { from, to } = this.selection;

      const breakdowns = await getBreakdowns(from.subtract(1, 'hour'), to);

      this.podBreakdown = breakdowns.pods;
      this.namespaceBreakdown = breakdowns.namespaces;
      this.workloadBreakdown = breakdowns.workloads;
      this.controlPlaneBreakdown = breakdowns.controlPlanes;

      this.loading = false;
    }
  },

  computed: {
    selectionDisplay() {
      const format = 'MMM D HH:mm';

      const selection = this.potentialSelection || this.selection;
      const from = selection.from.format(format);
      const to = selection.to.format(format);

      return `${ from } - ${ to }`;
    }
  },

  watch: {
    selection() {
      this.load();
    }
  }
};
</script>
<template>
  <div>
    <h3 class="mt-20">
      {{ t('opni.breakdowns.title') }} <span v-if="selection">({{ selectionDisplay }})</span>
    </h3>
    <Tabbed :side-tabs="true">
      <Tab
        name="controlPlane"
        :label="t('opni.breakdowns.tabs.controlPlane')"
        :show-header="false"
        :weight="4"
      >
        <Loading v-if="loading" />
        <ControlPlaneBreakdownDetail v-else :breakdown="controlPlaneBreakdown" @select="selectBreakdown" />
      </Tab>
      <Tab
        name="pod"
        :label="t('opni.breakdowns.tabs.pod')"
        :show-header="false"
        :weight="3"
      >
        <Loading v-if="loading" />
        <PodBreakdownDetail v-else :breakdown="podBreakdown" @select="selectBreakdown" />
      </Tab>
      <Tab
        name="namespace"
        :label="t('opni.breakdowns.tabs.namespace')"
        :show-header="false"
        :weight="2"
      >
        <Loading v-if="loading" />
        <NamespaceBreakdownDetail v-else :breakdown="namespaceBreakdown" @select="selectBreakdown" />
      </Tab>
      <Tab
        name="workload"
        :label="t('opni.breakdowns.tabs.workload')"
        :show-header="false"
        :weight="1"
      >
        <Loading v-if="loading" />
        <WorkloadBreakdownDetail v-else :breakdown="workloadBreakdown" @select="selectBreakdown" />
      </Tab>
    </Tabbed>
    <LogsDrawer :open="!!selectedBreakdown" :from-to="selection" :filter="selectedBreakdown" @close="deselectBreakdown" />
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

  .loading-indicator .overlay {
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }

  .tab-container {
    position: relative;
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
