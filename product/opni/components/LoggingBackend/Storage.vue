<script>
import UnitInput from '@/components/form/UnitInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import Checkbox from '@/components/form/Checkbox';
import { get, set } from '@/utils/object';
import { getStorageClasses } from '@/product/opni/utils/requests/logging';

export async function getStorageClassOptions() {
  const storageClasses = await getStorageClasses();

  return storageClasses.map(sc => ({ value: sc, label: sc || ' ' }));
}

export default {
  components: {
    UnitInput,
    LabeledSelect,
    Checkbox,
  },

  props: {
    value: {
      type:     Object,
      required: true
    },

    storageClassOptions: {
      type:     Array,
      required: true
    },

    hasDiskSize: {
      type:    Boolean,
      default: true
    }
  },

  created() {
    if (!this.value.Persistence) {
      this.$set(this.value, 'Persistence', {});
    }
  },

  methods: {
    updateUnit(key, suffix, value) {
      const val = value === null ? '' : `${ value }${ suffix }`;

      set(this, `value.${ key }`, val);
    },

    getUnit(key, suffix) {
      try {
        const value = get(this, `value.${ key }`);

        if (value.includes('Gi') && suffix === 'Mi') {
          return value.replace('Gi', '') * 1024;
        }

        return value.replace(suffix, '');
      } catch (ex) {
        return '';
      }
    }
  },

  computed: {
    diskSize: {
      get() {
        return this.getUnit('diskSize', 'Gi');
      },

      set(value) {
        return this.updateUnit('diskSize', 'Gi', value);
      }
    },
  }
};
</script>
<template>
  <div>
    <div class="row">
      <div class="col span-12">
        <h4>Storage</h4>
      </div>
    </div>
    <div class="row">
      <div v-if="hasDiskSize" class="col span-4">
        <UnitInput v-model="diskSize" label="Disk Size" suffix="GiB" placeholder="e.g. 24" :required="true" />
      </div>
      <div class="col span-4 middle">
        <Checkbox v-model="value.Persistence.Enabled" class="role" label="Persistent" />
      </div>
      <div class="col span-4">
        <LabeledSelect v-model="value.Persistence.StorageClass" :options="storageClassOptions" label="Storage Class" :disabled="!value.Persistence.Enabled" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
