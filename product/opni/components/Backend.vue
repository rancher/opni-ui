<script>
import Loading from '@/components/Loading';
import AsyncButton from '@/components/AsyncButton';
import { exceptionToErrorsArray } from '@/utils/error';
import Banner from '@/components/Banner';

export default {
  components: {
    AsyncButton,
    Banner,
    Loading,
  },

  props: {
    title: {
      type:     String,
      required: true
    },

    showDetail: {
      type:    Boolean,
      default: true
    },

    isEnabled: {
      type:     Function,
      required: true
    },

    isUpgradeAvailable: {
      type:    Function,
      default: () => false
    },

    upgrade: {
      type:    Function,
      default: () => {}
    },

    getStatus: {
      type:    Function,
      default: () => null
    },

    save: {
      type:     Function,
      required: true
    },

    disable: {
      type:     Function,
      required: true
    },

    capabilityType: {
      type:    String,
      default: null
    }
  },

  async fetch() {
    await this.load();
  },

  created() {
    this.$set(this, 'statusInterval', setInterval(this.loadStatus, 10000));
  },

  beforeDestroy() {
    clearInterval(this.statusInterval);
  },

  data() {
    return {
      editing:          false,
      enabled:          false,
      error:            '',
      upgradeable:      false,
      status:           null,

      statsInterval:    null,
      statusInterval:   null,
    };
  },

  methods: {
    async tryFn(fn) {
      try {
        return await fn();
      } catch (ex) {
        this.$set(this, 'error', exceptionToErrorsArray(ex).join(';'));
      }
    },

    enable() {
      this.$set(this, 'editing', true);
    },

    editFn() {
      this.$set(this, 'editing', true);
    },

    async loadStatus() {
      if (this.enabled || this.editing) {
        this.$set(this, 'status', await this.getStatus());
      }
    },

    async saveFn(cb) {
      await this.tryFn(async() => {
        await this.save(cb);
        this.$set(this, 'editing', false);
        this.$set(this, 'enabled', true);
      });
    },

    async disableFn() {
      await this.tryFn(async() => {
        await this.disable();
        this.$set(this, 'editing', false);
        this.$set(this, 'enabled', false);
      });
    },

    cancel() {
      this.$set(this, 'editing', false);
    },

    showActions() {
      this.$store.commit('action-menu/show', {
        resources: {
          edit:             this.editFn,
          disable:          this.disableFn,
          availableActions: [
            {
              action:     'edit',
              enabled:    true,
              icon:       'icon icon-fw icon-edit',
              label:      'Edit',
            },
            {
              action:     'disable',
              enabled:    true,
              icon:       'icon icon-fw icon-delete',
              label:      'Disable',
            },
          ]
        },
        elem: this.$refs.actions,
      });
    },

    async load() {
      const isEnabled = await this.isEnabled();

      this.$set(this, 'enabled', isEnabled);

      if (isEnabled) {
        const isUpgradeAvailable = await this.isUpgradeAvailable();

        this.$set(this, 'upgradeable', isUpgradeAvailable || window.location.search.includes('upgradeable'));
      }
    }
  },
};
</script>
<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <header>
      <h1>{{ title }}</h1>
      <button
        v-if="(enabled && !editing)"
        ref="actions"
        type="button"
        class="btn role-multi-action actions"
        aria-haspopup="true"
        @click="showActions"
      >
        <i class="icon icon-actions"></i>
      </button>
      <button v-if="(enabled && editing)" class="btn bg-error" @click="disable">
        Disable
      </button>
    </header>
    <Banner v-if="((enabled || editing) && status && status.message)" :color="status.state" class="mt-0">
      {{ status.message }}
    </Banner>
    <Banner v-if="(enabled && upgradeable)" color="success" class="mt-0">
      <div class="banner-message">
        <span>There's an upgrade available for your cluster.</span>
        <button class="btn bg-success" @click="upgrade">
          Upgrade Now
        </button>
      </div>
    </Banner>
    <div v-if="(!enabled && !editing)" class="body">
      <div class="not-enabled">
        <h4>{{ title }} is not currently enabled. Enabling it will install additional resources on this cluster.</h4>
        <button class="btn role-primary" @click="enable">
          Enable
        </button>
      </div>
    </div>
    <div v-if="(enabled && !editing)" class="body">
      <slot name="details" />
    </div>
    <div v-if="(editing || (enabled && !showDetail))" class="body">
      <slot name="editing" />
      <div v-if="editing" class="resource-footer">
        <button class="btn role-secondary mr-10" @click="cancel">
          Cancel
        </button>
        <AsyncButton mode="edit" @click="saveFn" />
      </div>
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

.banner-message {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.border {
    border-bottom: 1px solid #dcdee7;
    padding-bottom: 15px;
}

header {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

::v-deep {
  .nowrap {
    white-space: nowrap;
  }

  .monospace {
    font-family: $mono-font;
  }

  .cluster-status {
    padding-left: 40px;
  }

  .capability-status {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }

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
