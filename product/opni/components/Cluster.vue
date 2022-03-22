<script>
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import AsyncButton from '@/components/AsyncButton';
import CopyCode from '@/components/CopyCode';
import KeyValue from '@/components/form/KeyValue';
import {
  getTokens, createAgent, getClusters, updateCluster, getCapabilities, getClusterFingerprint, getCapabilityInstaller
} from '@/product/opni/utils/requests';
import Loading from '@/components/Loading';
import Card from '@/components/Card';
import Banner from '@/components/Banner';

export default {
  components: {
    AsyncButton,
    Banner,
    Card,
    CopyCode,
    LabeledInput,
    LabeledSelect,
    Loading,
    KeyValue,
  },

  async fetch() {
    this.$set(this, 'tokens', await getTokens());
    this.$set(this, 'token', this.tokens[0].id || null);
    this.$set(this, 'capabilities', await getCapabilities());
    this.$set(this, 'clusterCount', (await getClusters()).length);
    this.$set(this, 'pin', await getClusterFingerprint());
  },

  data() {
    return {
      tokens:               [],
      token:                null,
      capabilities:         [],
      capability:           null,
      labels:               {},
      name:                 '',
      clusterCount:         0,
      clusterCountInterval: null,
      newCluster:           null,
      newClusterFound:      false,
      pin:                  null,
      installCommand:       'select a capability'
    };
  },

  created() {
    const twoSeconds = 2000;

    this.clusterCountInterval = setInterval(this.lookForNewCluster, twoSeconds);
  },

  beforeDestroy() {
    if (this.clusterCountInterval) {
      clearInterval(this.clusterCountInterval);
    }
  },

  methods: {
    save() {
      updateCluster(this.newCluster.id, this.name, this.labels);

      this.$router.replace({ name: 'clusters' });
    },

    createAgent() {
      createAgent(this.token);
    },

    async lookForNewCluster() {
      const clusters = await getClusters();
      const newClusterCount = clusters.length;

      if (newClusterCount > this.clusterCount) {
        clearInterval(this.clusterCountInterval);
        this.newCluster = clusters[clusters.length - 1];
        this.clusterCountInterval = null;
        this.newClusterFound = true;
      }
    },

    async renderInstallCommand(capability) {
      this.installCommand = await getCapabilityInstaller(
        capability, this.token, this.pin, window.location.hostname);
    }
  },

  computed: {
    tokenOptions() {
      return this.tokens.map(token => ({
        label: token.nameDisplay,
        value: token.id
      }));
    },
    capabilityOptions() {
      return this.capabilities.map(capability => ({
        label: capability,
        value: capability
      }));
    }
  }
};
</script>
<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <div class="row">
      <div class="col span-3">
        <LabeledInput v-model="name" label="Name (Optional)" />
      </div>
      <div class="col span-3">
        <LabeledSelect
          v-model="capability"
          class="mb-20"
          :label="t('opni.monitoring.clusters.tabs.target.capability')"
          :placeholder="t('monitoring.clusterCapability.placeholder')"
          :localized-label="true"
          :options="capabilityOptions"
          @input="renderInstallCommand"
        />
      </div>
      <div class="col span-6">
        <LabeledSelect
          v-model="token"
          class="mb-20"
          :label="t('opni.monitoring.clusters.tabs.target.token')"
          :placeholder="t('monitoring.token.placeholder')"
          :localized-label="true"
          :options="tokenOptions"
        />
      </div>
    </div>
    <div class="mb-20">
      <h4 class="text-default-text">
        Labels
      </h4>
      <KeyValue
        v-model="labels"
        mode="edit"
        :read-allowed="false"
        :value-multiline="false"
        label="Labels"
        add-label="Add Label"
      />
    </div>
    <Card class="m-0 mb-20" :show-highlight-border="false" :show-actions="false">
      <h4 slot="title" class="text-default-text">
        Install Command
      </h4>
      <div slot="body" class="">
        <CopyCode class="install-command">
          {{ installCommand }}
        </CopyCode>
        <Banner v-if="!newCluster" color="warning">
          You must run this install command before you can save this cluster. <a class="btn bg-warning mr-10" @click="createAgent">Hack Create Agent</a>
        </Banner>
      </div>
    </Card>
    <div v-if="newClusterFound" class="resource-footer">
      <AsyncButton
        mode="edit"
        @click="save"
      >
      </asyncbutton>
    </div>
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
