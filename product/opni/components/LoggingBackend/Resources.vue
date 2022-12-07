<script>
import UnitInput from '@/components/form/UnitInput';
import { get, set } from '@/utils/object';

export default {
  components: { UnitInput },

  props: {
    value: {
      type:     Object,
      required: true
    },

    useResourceRequirements: {
      type:     Boolean,
      required: false
    }
  },

  methods: {
    updateUnit(key, suffix, value = 0) {
      set(this, `value.${ key }`, `${ value || 0 }${ suffix }`);
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
    memoryKey() {
      return this.useResourceRequirements ? 'Limits.Memory' : 'memoryLimit';
    },
    cpuLimitKey() {
      return this.useResourceRequirements ? 'Limits.CPU' : 'cpuResources.Limit';
    },
    cpuRequiredKey() {
      return this.useResourceRequirements ? 'Requests.CPU' : 'cpuResources.Request';
    },
    memory: {
      get() {
        return this.getUnit(this.memoryKey, 'Mi');
      },

      set(value) {
        return this.updateUnit(this.memoryKey, 'Mi', value);
      }
    },
    cpuLimit: {
      get() {
        return this.getUnit(this.cpuLimitKey, 'm');
      },

      set(value) {
        return this.updateUnit(this.cpuLimitKey, 'm', value);
      }
    },
    cpuRequired: {
      get() {
        return this.getUnit(this.cpuRequiredKey, 'm');
      },

      set(value) {
        return this.updateUnit(this.cpuRequiredKey, 'm', value);
      }
    },
  }
};
</script>
<template>
  <div>
    <div class="row">
      <div class="col span-12">
        <h4>Resources</h4>
      </div>
    </div>
    <div class="row">
      <div class="col span-4">
        <UnitInput v-model="memory" label="Memory" suffix="MiB" />
      </div>
      <div class="col span-4">
        <UnitInput v-model="cpuLimit" label="CPU Limit" suffix="miliCpu" />
      </div>
      <div class="col span-4">
        <UnitInput v-model="cpuRequired" label="CPU Required" suffix="miliCpu" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
