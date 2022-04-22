<script>
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import CopyCode from '@/components/CopyCode';
import Checkbox from '@/components/form/Checkbox';
import KeyValue from '@/components/form/KeyValue';
import {
  getTokens, createAgent, getClusters, updateCluster, getCapabilities, getClusterFingerprint, getCapabilityInstaller
} from '@/product/opni/utils/requests';
import Loading from '@/components/Loading';
import Card from '@/components/Card';
import Banner from '@/components/Banner';
import _ from 'lodash';

export default {
  components: {
    Banner,
    Card,
    CopyCode,
    LabeledInput,
    LabeledSelect,
    Loading,
    KeyValue,
    Checkbox,
  },

  async fetch() {
    const [tokens, capabilities, clusters, clusterFingerprint] = await Promise.all([
      getTokens(),
      getCapabilities(),
      getClusters(),
      getClusterFingerprint(),
    ]);

    this.$set(this, 'tokens', tokens);
    this.$set(this, 'capabilities', capabilities);
    this.$set(this, 'clusterCount', clusters.length);
    this.$set(this, 'pin', clusterFingerprint);
  },

  data() {
    const placeholderText = 'Select a capability and token to view install command';

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
      placeholderText,
      installCmdData:       {
        tmpl:   '',
        args:            [],
      },
      error: '',
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

    async fetchInstallCommandTemplate() {
      if (!this.capability || !this.token) {
        return;
      }
      const cmd = await getCapabilityInstaller(this.capability, this.token, this.pin);
      // This matches one or more instances of brackets surrounded by
      // % characters on either side, for example %{"foo": "bar"}%
      // The string between the % characters is assumed to be a json object.
      const regex = /\%({.*?\})\%/g;
      const inputArgs = [];

      let match;

      let parsedCmd = cmd;

      while ((match = regex.exec(cmd)) !== null) {
        const json = JSON.parse(match[1]);
        let label;

        switch (json.kind) {
        case 'input':
          label = json.input.label;
          break;
        case 'select':
          label = json.select.label;
          json.select.items = json.select.items.map(item => ({
            label: item || '(none)',
            value: item
          }));
          break;
        case 'toggle':
          label = json.toggle.label;
          break;
        }
        let value;
        let required = false;
        let omitEmpty = false;
        let format = '{{ value }}';

        for (const option of json.options) {
          switch (option.name) {
          case 'default':
            try {
              value = JSON.parse(option.value);
            } catch {
              value = option.value;
            }
            break;
          case 'required':
            required = true;
            break;
          case 'omitEmpty':
            omitEmpty = true;
            break;
          case 'format':
            format = option.value;
            break;
          }
        }
        json['_data'] = {
          label,
          value,
          required,
          omitEmpty,
          format,
        };
        inputArgs.push(json);
        parsedCmd = parsedCmd.replace(match[0], `{{ ${ label } }}`);
      }

      this.$set(this, 'installCmdData', {
        args:     inputArgs,
        tmpl: parsedCmd,
      });
    },
    isArgEmpty(arg) {
      return !arg || arg === 'false';
    },
  },
  computed: {
    installCommand() {
      if (!this.installCmdData.args || !this.installCmdData.tmpl) {
        return this.placeholderText;
      }

      let cmd = this.installCmdData.tmpl;

      for (const input of this.installCmdData.args) {
        const {
          label, value, format, omitEmpty
        } = input._data;

        if (omitEmpty && this.isArgEmpty(value)) {
          cmd = cmd.replace(`{{ ${ label } }}`, '');
        } else if (value !== '') {
          // This evaluates arg template strings as if they were template
          // literals, using the current value of the arg as the name 'value'
          // in the template.
          // For example, if the template string is '--foo={{ value }}' and
          // the current value is 'bar', the result is '--foo=bar'.

          _.templateSettings.interpolate = /{{([\s\S]+?)}}/g; // use go syntax
          const tmpl = _.template(format);

          cmd = cmd.replace(`{{ ${ label } }}`, tmpl({ value }));
        }
      }

      return cmd;
    },
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
        <LabeledInput v-model="name" label="Name (optional)" />
      </div>
      <div class="col span-3">
        <LabeledSelect
          v-model="capability"
          class="mb-20"
          :label="t('opni.monitoring.clusters.tabs.target.capability')"
          :placeholder="t('monitoring.clusterCapability.placeholder')"
          :localized-label="true"
          :options="capabilityOptions"
          :required="true"
          @input="fetchInstallCommandTemplate"
        />
      </div>
      <div class="col span-6">
        <LabeledSelect
          v-model="token"
          class="token-select mb-20"
          :label="t('opni.monitoring.clusters.tabs.target.token')"
          :placeholder="t('monitoring.token.placeholder')"
          :localized-label="true"
          :options="tokenOptions"
          :required="true"
          @input="fetchInstallCommandTemplate"
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
    <Card class="m-0 mb-10" :show-highlight-border="false" :show-actions="false">
      <h4 slot="title" class="text-default-text">
        Install Command
      </h4>
      <div slot="body">
        <div v-if="!!installCmdData.args" class="row">
          <div v-for="item in installCmdData.args" :key="item.key" class="options col span-3 mb-10">
            <LabeledSelect
              v-if="item.kind === 'select'"
              v-model="item._data.value"
              :label="item._data.label"
              :required="item._data.required"
              :options="item.select.items"
            />
            <LabeledInput
              v-if="item.kind === 'input'"
              v-model="item._data.value"
              :label="item._data.label"
              :required="item._data.required"
            />
            <Checkbox
              v-if="item.kind === 'toggle'"
              v-model="item._data.value"
              :label="item._data.label"
              :required="item._data.required"
            />
          </div>
        </div>
        <CopyCode
          class="install-command"
          :class="installCommand === placeholderText && 'placeholder-text'"
        >
          {{ installCommand }}
        </CopyCode>
        <Banner v-if="!newCluster" color="info">
          Copy and run the above command to install the Opni Monitoring agent on the new cluster.
          <a
            v-if="$config.dev"
            class="btn bg-info mr-5"
            @click="createAgent"
          >
            [Developer Mode] Start Agent
          </a>
        </Banner>
        <Banner v-if="newClusterFound" color="success">
          New cluster added successfully
          <a
            class="btn bg-success mr-5"
            @click="save"
          >
            Finish
          </a>
        </Banner>
      </div>
    </Card>
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

.placeholder-text {
  font-family: $body-font;
}

.token-select ::v-deep #vs2__combobox > div.vs__selected-options > span {
  font-family: $mono-font;
}

::v-deep .info, ::v-deep .success {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.options {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
