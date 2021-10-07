<script>
import SortableTable from '@/components/SortableTable';
import List from '@/components/formatter/List';

export const AREA_OF_INTEREST_HEADERS = [
  {
    name:      'daterange',
    labelKey:  'tableHeaders.dateRange',
    formatter: 'DateRange',
    value:     'fromTo',
    sort:      ['timestamp'],
    width:     '320px',
  },
  {
    name:      'levels',
    labelKey:  'tableHeaders.levels',
    value:     'levels',
    sort:      ['levels'],
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

const AREA_OF_INTEREST_HOVER = 'areaOfInterestHover';
const AREA_OF_INTEREST_SELECT = 'areaOfInterestSelect';

export default {
  components: {
    List,
    SortableTable,
  },

  props: {
    logs: {
      type:    Array,
      default: () => [],
    },
    areasOfInterest: {
      type:    Array,
      default: () => [],
    },

    hightlightTime: {
      type:    Object,
      default: null
    }
  },

  data() {
    return { AREA_OF_INTEREST_HEADERS };
  },

  methods: {
    highlightRow(row) {
      if (!this.hightlightTime) {
        return false;
      }

      const hightlightTimeMs = this.hightlightTime.valueOf();

      return hightlightTimeMs >= row.fromTo.from && hightlightTimeMs < row.fromTo.to;
    },
    onMouseEnter(areaOfInterest) {
      this.$emit(AREA_OF_INTEREST_HOVER, areaOfInterest);
    },
    onMouseLeave() {
      this.$emit(AREA_OF_INTEREST_HOVER, null);
    },
    onClick(areaOfInterest) {
      this.$emit(AREA_OF_INTEREST_SELECT, areaOfInterest);
    },
  },

  computed: {
    rows() {
      const buckets = this.areasOfInterest.map(aoi => ({
        fromTo:            aoi,
        levels:            [],
        components:        [],
        workloadCount:     0,
        controlPlaneCount: 0,
        count:             0
      }));

      this.logs.forEach((log) => {
        buckets.find((bucket) => {
          if (bucket.fromTo.from <= log.timestamp && bucket.fromTo.to > log.timestamp) {
            bucket.workloadCount += log.isControlPlane ? 0 : 1;
            bucket.controlPlaneCount += log.isControlPlane ? 1 : 0;
            bucket.count += 1;
            if (!bucket.levels.includes(log.level)) {
              bucket.levels.push(log.level);
            }
          }
        });
      });

      return buckets;
    }
  }
};
</script>
<template>
  <SortableTable
    class="area-of-interest-table mt-20"
    :rows="rows"
    :headers="AREA_OF_INTEREST_HEADERS"
    :search="false"
    :table-actions="false"
    :row-actions="false"
    :paging="true"
    default-sort-by="name"
    key-field="id"
  >
    <template #main-row="{ row }">
      <tr
        class="main-row has-sub-row area-of-interest"
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
.area-of-interest-table {
  cursor: pointer;

  & .highlight {
    background-color: var(--sortable-table-hover-bg);
  }
}
</style>
