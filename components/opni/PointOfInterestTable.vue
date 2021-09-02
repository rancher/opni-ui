<script>
import SortableTable from '@/components/SortableTable';
import List from '@/components/formatter/List';
import { uniq } from '@/utils/array';

export const POINT_OF_INTEREST_HEADERS = [
  {
    name:      'daterange',
    labelKey:  'tableHeaders.dateRange',
    formatter: 'DateRange',
    value:     'fromTo',
    sort:      ['timestamp'],
    width:     '300px',
  },
  {
    name:      'levels',
    labelKey:  'tableHeaders.levels',
    value:     'levels',
    sort:      ['levels'],
    formatter: 'List',
  },
  {
    name:      'components',
    labelKey:  'tableHeaders.components',
    value:     'components',
    sort:      ['components'],
    formatter: 'List',
  },
  {
    name:     'workloadCount',
    labelKey: 'tableHeaders.workloadCount',
    value:    'workloadCount',
    sort:     ['workloadCount'],
  },
  {
    name:     'controlPlaneCount',
    labelKey: 'tableHeaders.controlPlaneCount',
    value:    'controlPlaneCount',
    sort:     ['controlPlaneCount'],
  },
  {
    name:     'count',
    labelKey: 'tableHeaders.count',
    value:    'count',
    sort:     ['count'],
  },
];

const POINT_OF_INTEREST_HOVER = 'pointOfInterestHover';
const POINT_OF_INTEREST_SELECT = 'pointOfInterestSelect';

export default {
  components: {
    List,
    SortableTable,
  },

  props: {
    pointsOfInterest: {
      type:    Array,
      default: () => [],
    },

    pointOfInterestHighlight: {
      type:    Object,
      default: null
    }
  },

  data() {
    return { POINT_OF_INTEREST_HEADERS };
  },

  computed: {
    buckets() {
      const from = 1626795900000;
      const to = 1626796770000;
      const step = 30000;

      const bucketCount = Math.floor((to - from) / step);

      return [...Array(bucketCount)].map((_, i) => ({
        from: from + i * step,
        to:   from + (i + 1) * step - 1,
      }));
    },
    aggregatedPointsOfInterest() {
      return this.buckets
        .map(this.aggregatePointsOfInterest)
        .filter(agg => agg.count > 0);
    },
  },

  methods: {
    aggregatePointsOfInterest(bucket) {
      const pointsInBucket = this.pointsOfInterest.filter((point) => {
        return point.timestamp >= bucket.from && point.timestamp <= bucket.to;
      });

      const aggregate = {
        fromTo:              bucket,
        count:               0,
        levels:              [],
        components:          [],
        workloadCount:       0,
        controlPlaneCount:   0,
        highlightGraphIndex:
          this.pointsOfInterest.indexOf(pointsInBucket[0]) ===
          this.pointsOfInterest.length - 1 ? 20 : 10,
      };

      pointsInBucket.forEach((point) => {
        aggregate.count += 1;
        aggregate.levels.push(point.level);
        aggregate.components.push(point.component);
        aggregate.workloadCount += point.target === 'workload' ? 1 : 0;
        aggregate.controlPlaneCount += point.target === 'control' ? 1 : 0;
      });

      aggregate.levels = uniq(aggregate.levels);
      aggregate.components = uniq(aggregate.components);

      return aggregate;
    },
    highlightRow(row) {
      return this.pointOfInterestHighlight === row;
    },
    onMouseEnter(pointOfInterest) {
      this.$emit(POINT_OF_INTEREST_HOVER, pointOfInterest);
    },
    onMouseLeave() {
      this.$emit(POINT_OF_INTEREST_HOVER, null);
    },
    onClick(pointOfInterest) {
      this.$emit(POINT_OF_INTEREST_SELECT, pointOfInterest);
    }
  },
};
</script>
<template>
  <SortableTable
    class="point-of-interest-table mt-20"
    :rows="aggregatedPointsOfInterest"
    :headers="POINT_OF_INTEREST_HEADERS"
    :search="false"
    :table-actions="false"
    :row-actions="false"
    :paging="true"
    default-sort-by="name"
    key-field="id"
  >
    <template #main-row="{ row }">
      <tr
        class="main-row has-sub-row point-of-interest"
        :class="{ highlight: highlightRow(row) }"
        @click="onClick(row)"
        @mouseenter="onMouseEnter(row)"
        @mouseleave="onMouseLeave(row)"
      >
        <td>
          <DateRange :value="row.fromTo" />
        </td>
        <td>
          <List :value="row.levels" />
        </td>
        <td>
          <List :value="row.components" />
        </td>
        <td>
          <span class="bubble" :class="{workload: row.workloadCount > row.controlPlaneCount}">{{ row.workloadCount }}</span>
        </td>
        <td>
          <span class="bubble" :class="{'control-plane': row.controlPlaneCount > row.workloadCount }">{{ row.controlPlaneCount }}</span>
        </td>
        <td>
          {{ row.count }}
        </td>
      </tr>
    </template>
  </SortableTable>
</template>

<style lang="scss" scoped>
.point-of-interest-table {
  cursor: pointer;

  &.highlight {
    background-color: var(--sortable-table-hover-bg);
  }

  .bubble {
    position: relative;
    padding: 1px 4px;

    border: 1px solid rgba(0, 0, 0, 0);
    border-radius: var(--border-radius);

    &::before {
      content: "";
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;

      opacity: 0.3;
    }

    &.workload {
      border-color: var(--app-other-accent);

      &::before {
        background-color: var(--app-other-accent);
      }
    }

    &.control-plane {
      border-color: var(--app-rancher-accent);

      &::before {
        background-color: var(--app-rancher-accent);
      }
    }
  }
}
</style>
