<script>
import AsyncButton from '@/components/AsyncButton';
import Card from '@/components/Card';
import { exceptionToErrorsArray } from '@/utils/error';
import RadioGroup from '@/components/form/RadioGroup';
import { uninstallCapability } from '@/product/opni/utils/requests';
import Banner from '@/components/Banner';

export default {
  components: {
    Banner,
    Card,
    AsyncButton,
    RadioGroup
  },
  data() {
    return {
      errors:       [],
      capabilities: [],
      deleteData:   false,
      cluster:      null,
      confirm:      ''
    };
  },
  methods: {
    close(cancel = true) {
      this.$modal.hide('uninstall-capabilities-dialog');
      if (cancel) {
        this.$emit('cancel', this.cluster, this.capabilities);
      }
    },

    open(cluster, capabilities) {
      this.$set(this, 'cluster', cluster);
      this.$set(this, 'capabilities', capabilities);
      this.$set(this, 'confirm', '');
      this.$modal.show('uninstall-capabilities-dialog');
    },

    async save(buttonDone) {
      try {
        await Promise.all(this.capabilities.map(cap => uninstallCapability(this.cluster.id, cap, this.deleteData)));
        buttonDone(true);
        this.$emit('save');
        this.close(false);
      } catch (err) {
        this.errors = exceptionToErrorsArray(err);
        buttonDone(false);
      }
    },
  },
  computed: {
    clusterName() {
      return this.cluster?.nameDisplay;
    }
  }
};
</script>

<template>
  <modal
    ref="editClusterDialog"
    class="uninstall-capabilities-dialog"
    name="uninstall-capabilities-dialog"
    styles="background-color: var(--nav-bg); border-radius: var(--border-radius); max-height: 90vh;"
    height="auto"
    width="600"
    :scrollable="true"
    @closed="close()"
  >
    <Card
      class="edit-cluster-card"
      :show-highlight-border="false"
    >
      <div slot="body" class="pt-10">
        <h4 class="text-default-text pt-4 mb-20" v-html="`Uninstall <b>${capabilities.join(' and ')}</b> from <b>${ clusterName }</b>`" />
        <div class="row">
          <div class="col span-12">
            <RadioGroup
              v-model="deleteData"
              name="deletedData"
              label="Do you also want to delete the data?"
              :labels="['Yes', 'No']"
              :options="[true, false]"
            />
          </div>
        </div>
        <div class="row">
          <div class="col span-12">
            <Banner color="warning">
              Uninstalling capabilities will permentantly remove them. Are you sure you want to uninstall <b>{{ capabilities.join(' and ') }}</b>?
            </Banner>
            To confirm uninstall enter <b>{{ capabilities[0] }}</b> below:
            <input v-model="confirm" class="no-label mt-5" type="text" />
          </div>
        </div>
      </div>
      <div slot="actions" class="buttons">
        <button class="btn role-secondary mr-10" @click="close">
          {{ t("generic.cancel") }}
        </button>

        <AsyncButton mode="edit" :disabled="capabilities[0] !== confirm" @click="save" />
      </div>
    </Card>
  </modal>
</template>
<style lang='scss' scoped>
.edit-cluster-card {
  margin: 0;

  ::v-deep {
    .kv-container {
      max-height: 500px;
      overflow-y: auto;
      padding-right: 10px;
    }

    .kv-item.key {
      padding-left: 1px;
    }
  }
}

.buttons {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.uninstall-capabilities-dialog {
  border-radius: var(--border-radius);
  overflow-y: scroll;
  max-height: 100vh;
  & ::-webkit-scrollbar-corner {
    background: rgba(0, 0, 0, 0);
  }
}

.capability {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  color: var(--body-text);

  &.strike span{
    text-decoration: line-through;
  }
}

input.no-label {
  height: 54px;
}

::v-deep h3 {
  font-size: 14px;
}
</style>
