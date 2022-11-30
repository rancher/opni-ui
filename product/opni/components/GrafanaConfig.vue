<script>
import Card from '@/components/Card';
import LabeledInput from '@/components/form/LabeledInput';

export default {
  components: { Card, LabeledInput },

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
  <Card class="mt-20 ml-0 mr-0" :show-highlight-border="false" :show-actions="false">
    <header v-if="value.enabled" slot="title" class="text-default-text">
      <h4>Grafana</h4>
      <button v-if="value.enabled" class="btn role-secondary" @click="$emit('disable')">
        Disable Grafana
      </button>
    </header>
    <div v-if="value.enabled" slot="body">
      <div class="row">
        <div class="col span-4">
          <LabeledInput v-model="value.hostname" label="Hostname" :required="true" />
        </div>
      </div>
    </div>
    <div v-else slot="body" class="not-enabled">
      <h5>Grafana is not currently enabled. Enabling it will install additional resources.</h5>
      <button class="btn role-primary" @click="$emit('enable')">
        Enable
      </button>
    </div>
  </Card>
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
