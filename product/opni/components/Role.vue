<script>
import LabeledInput from '@/components/form/LabeledInput';
import AsyncButton from '@/components/AsyncButton';
import { createRole, getClusters } from '@/product/opni/utils/requests';
import Loading from '@/components/Loading';
import Tab from '@/components/Tabbed/Tab';
import Tabbed from '@/components/Tabbed';
import Banner from '@/components/Banner';
import ArrayListSelect from '@/components/form/ArrayListSelect';
import KeyValue from '@/components/form/KeyValue';
import MatchExpressions from '@/components/form/MatchExpressions';

export default {
  components: {
    ArrayListSelect,
    AsyncButton,
    KeyValue,
    LabeledInput,
    Loading,
    MatchExpressions,
    Tab,
    Tabbed,
    Banner,
  },

  async fetch() {
    const clusters = await getClusters();

    this.$set(
      this,
      'clusterIdOptions',
      clusters.map(cluster => ({
        label: cluster.nameDisplay,
        value: cluster.id,
      }))
    );
  },

  data() {
    return {
      name:             '',
      roleName:         '',
      subjects:         [],
      taints:           [],
      clusterIds:       [],
      clusterIdOptions: [],
      matchLabels:      {},
      matchExpressions: [],
      error:            '',
    };
  },

  methods: {
    async save(buttonCallback) {
      if (this.name === '') {
        this.$set(this, 'error', 'Name is required');
        buttonCallback(false);

        return;
      }
      await createRole(this.name, this.clusterIds, this.matchLabelsToSave);
      buttonCallback(true);
      this.$router.replace({ name: 'roles' });
    },
  },

  computed: {
    matchLabelsToSave() {
      return {
        matchLabels:      this.matchLabels,
        matchExpressions: this.matchExpressions,
      };
    },
  },
};
</script>
<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <div class="row mb-20">
      <div class="col span-12">
        <LabeledInput
          v-model="name"
          label="Name"
          :required="true"
        />
      </div>
    </div>
    <Tabbed :side-tabs="true" class="mb-20">
      <Tab
        name="clusters"
        c
        :label="t('opni.monitoring.role.tabs.clusters.label')"
        :weight="3"
      >
        <ArrayListSelect
          v-model="clusterIds"
          :options="clusterIdOptions"
          :array-list-props="{
            addLabel: t('opni.monitoring.role.tabs.clusters.add'),
          }"
        />
      </Tab>
      <Tab
        name="matchLabels"
        :label="t('opni.monitoring.role.tabs.matchLabels.label')"
        :weight="2"
      >
        <KeyValue
          v-model="matchLabels"
          mode="edit"
          :read-allowed="false"
          :value-multiline="false"
          label="Labels"
          add-label="Add Label"
        />
      </Tab>
      <Tab
        name="matchExpressions"
        :label="t('opni.monitoring.role.tabs.matchExpressions.label')"
        :weight="1"
      >
        <MatchExpressions
          v-model="matchExpressions"
          :initial-empty-row="false"
        />
      </Tab>
    </Tabbed>
    <div class="resource-footer">
      <AsyncButton mode="edit" @click="save">
      </AsyncButton>
    </div>
    <Banner
      v-if="error"
      color="error"
      :label="error"
    />
  </div>
</template>

<style lang="scss" scoped>
.resource-footer {
  display: flex;
  flex-direction: row;

  justify-content: flex-end;
}

.install-command {
  width: 100%;
}

::v-deep .warning {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
