<script>
import UnitInput from '@/components/form/UnitInput';
import EnabledDisabled from '@/product/opni/components/EnabledDisabled';
import Resources from './Resources';

export default {
  components: {
    EnabledDisabled, Resources, UnitInput
  },

  props: {
    value: {
      type:     Object,
      required: true
    }
  },

  created() {
    if (!this.value.Resources) {
      this.$set(this.value, 'Resources', { Limits: {}, Requests: {} });
    }
  }
};
</script>
<template>
  <EnabledDisabled v-model="value.Enabled" disabled-message="The Dashboard is not currently enabled. Enabling it will install additional resources.">
    <div class="row border-bottom mb-10">
      <div class="col span-6">
        <UnitInput v-model="value.Replicas" label="Replicas" :suffix="false" />
      </div>
    </div>
    <Resources v-model="value.Resources" :use-resource-requirements="true" />
  </EnabledDisabled>
</template>
