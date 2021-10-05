<script>
import SortableTable from '@/components/SortableTable';
import List from '@/components/formatter/List';

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

    hightlightTime: {
      type:    Object,
      default: null
    }
  },

  data() {
    return { POINT_OF_INTEREST_HEADERS };
  },

  methods: {
    highlightRow(row) {
      if (!this.hightlightTime) {
        return false;
      }

      const hightlightTimeMs = this.hightlightTime.valueOf();

      return hightlightTimeMs >= row.fromTo.from && hightlightTimeMs < row.fromTo.to;
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
    :rows="pointsOfInterest"
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

  & .highlight {
    background-color: var(--sortable-table-hover-bg);
  }
}
</style>
