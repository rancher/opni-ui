<script>
import LabeledInput from '@/components/form/LabeledInput';

export default {
  components: { LabeledInput },

  props: {
    value: {
      type:     Object,
      required: true
    },

    status: {
      type:     String,
      required: true
    }
  },
};
</script>
<template>
  <div class="mt-20 ml-0 mr-0">
    <header v-if="value.enabled" slot="title" class="text-default-text">
      <div class="col span-4">
        <LabeledInput v-model="value.hostname" label="Hostname" :required="true" />
      </div>
      <button v-if="value.enabled" class="btn role-secondary" :disabled="!(status === 'Installed' || status === 'NotInstalled')" @click="$emit('disable')">
        Disable Grafana
      </button>
    </header>
    <div v-else slot="body" class="not-enabled">
      <h5>Grafana is not currently enabled. Enabling it will install additional resources.</h5>
      <button class="btn role-primary" @click="$emit('enable')">
        Enable
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>

header {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

::v-deep {
  .not-enabled {
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .enabled {
    width: 100%;
  }
}
</style>
