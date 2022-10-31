<script>
import ArrayList from '@/components/form/ArrayList';
import Select from '@/components/form/Select';

export default {
  components: { ArrayList, Select },
  props:      {
    value: {
      type:     Array,
      required: true
    },
    options: {
      default:   null,
      type:      Array
    },
    selectProps: {
      type:    Object,
      default: null,
    },
    arrayListProps: {
      type:    Object,
      default: null
    },
    loading: {
      type:    Boolean,
      default: false
    },
    searchable: {
      type:    Boolean,
      default: false
    },
    taggable: {
      type:    Boolean,
      default: false
    },
    addLabel: {
      type: String,
      default() {
        return this.$store.getters['i18n/t']('generic.add');
      },
    },
  },
  computed:   {
    filteredOptions() {
      return this.options
        .filter(option => !this.value.find(v => v === option));
    },

    addAllowed() {
      return this.filteredOptions.length > 0;
    }
  },

  methods: {
    updateRow(index, value) {
      this.value.splice(index, 1, value);
      this.$emit('input', this.value || []);
    },
    calculateOptions(value) {
      const valueOption = this.options.find(o => o.value === value);

      if (!valueOption) {
        return [valueOption, ...this.filteredOptions];
      }

      return this.filteredOptions;
    }
  }
};
</script>

<template>
  <ArrayList
    v-bind="arrayListProps"
    :value="value"
    class="array-list-select"
    :add-allowed="!loading"
    :loading="loading"
    :add-label="addLabel"
    :disabled="filteredOptions.length === 0"
    @input="$emit('input', $event)"
  >
    <template v-slot:columns="scope">
      <Select
        :value="scope.row.value"
        v-bind="selectProps"
        :options="calculateOptions(scope.row.value)"
        :searchable="searchable || taggable"
        :taggable="taggable"
        @input="updateRow(scope.i, $event)"
      />
    </template>
  </ArrayList>
</template>

<style lang="scss" scoped>
::v-deep .unlabeled-select {
    height: 61px;
}
</style>
