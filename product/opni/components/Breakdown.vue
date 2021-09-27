<script>
import Card from '@/components/Card';
import sumBy from 'lodash/sumBy';
import PodBreakdownDetail from './PodBreakdownDetail';
import NamespaceBreakdownDetail from './NamespaceBreakdownDetail';
import WorkloadBreakdownDetail from './WorkloadBreakdownDetail';

export default {
  components: {
    Card, PodBreakdownDetail, NamespaceBreakdownDetail, WorkloadBreakdownDetail
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

      return sumBy(breakdown, breakdown => breakdown.Insights.Anomaly);
    }
  },

  methods: {}
};
</script>
<template>
  <div class="row">
    <div class="col span-4" @click="showPodBreakdownDetail = true">
      <Card class="card mt-20 breakdown-card" :show-actions="false" :show-highlight-border="showPodBreakdownDetail">
        <template #body>
          <div class="breakdown pl-15 pr-15">
            <h1>{{ podCount }}</h1>
            <h3>Pod</h3>
            <div />
          </div>
        </template>
      </Card>
    </div>
    <div class="col span-4" @click="showNamespaceBreakdownDetail = true">
      <Card class="card mt-20 breakdown-card" :show-actions="false" :show-highlight-border="showNamespaceBreakdownDetail">
        <template #body>
          <div class="breakdown p-15">
            <h1>{{ namespaceCount }}</h1>
            <h3>Namespace</h3>
            <div />
          </div>
        </template>
      </Card>
    </div>
    <div class="col span-4" @click="showWorkloadBreakdownDetail = true">
      <Card class="card mt-20 breakdown-card" :show-actions="false" :show-highlight-border="showWorkloadBreakdownDetail">
        <template #body>
          <div class="breakdown p-15">
            <h1>{{ workloadCount }}</h1>
            <h3>Workload</h3>
            <div />
          </div>
        </template>
      </Card>
    </div>
    <PodBreakdownDetail :open="showPodBreakdownDetail" :breakdown="podBreakdown" @close="showPodBreakdownDetail=false" />
    <NamespaceBreakdownDetail :open="showNamespaceBreakdownDetail" :breakdown="namespaceBreakdown" @close="showNamespaceBreakdownDetail=false" />
    <WorkloadBreakdownDetail :open="showWorkloadBreakdownDetail" :breakdown="workloadBreakdown" @close="showWorkloadBreakdownDetail=false" />
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
