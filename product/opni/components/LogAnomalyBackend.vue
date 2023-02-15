<script>
import Loading from '@/components/Loading';
import AsyncButton from '@/components/AsyncButton';
import Banner from '@/components/Banner';
import { getAISettings, upgrade, updateAISettings, deleteAISettings } from '@/product/opni/utils/requests/aiops';
import { exceptionToErrorsArray } from '@/utils/error';
import isEmpty from 'lodash/isEmpty';
import { isEnabled as isAiOpsEnabled } from '@/product/opni/components/AiOpsBackend';

export async function isEnabled() {
  const config = await getAISettings();

  return !isEmpty(config);
}

export default {
  components: {
    AsyncButton,
    Banner,
    Loading,
  },

  async fetch() {
    try {
      await this.load();
    } catch (ex) {}
  },

  data() {
    return {
      isAiOpsEnabled:     false,
      interval:           null,
      error:              '',
      loading:            false,
      enabled:            false,

      isUpgradeAvailable: false,
    };
  },

  methods: {
    async load() {
      if (!await isAiOpsEnabled()) {
        return;
      }

      this.$set(this, 'isAiOpsEnabled', true);
    },

    async enable(cb) {
      await this.save(cb);
    },

    async disable(buttonCallback) {
      try {
        await deleteAISettings();
        buttonCallback(true);
        this.$set(this, 'isAiOpsEnabled', false);
      } catch (err) {
        buttonCallback(false);
        this.$set(this, 'error', exceptionToErrorsArray(err).join('; '));
      }
    },

    async save(buttonCallback) {
      try {
        await updateAISettings({
          controlplane: { },
          rancher:      { },
          longhorn:     { }
        });
        await this.load();

        this.$set(this, 'error', '');
        buttonCallback(true);
        this.$router.replace({ name: 'ai-ops' });
      } catch (err) {
        this.$set(this, 'error', exceptionToErrorsArray(err).join('; '));
        buttonCallback(false);
      }
    },

    async upgrade() {
      try {
        await upgrade(this.config);
        this.load();

        this.$set(this, 'error', '');
      } catch (err) {
        this.$set(this, 'error', exceptionToErrorsArray(err).join('; '));
      }
    },
  },
};
</script>
<template>
  <Loading v-if="loading || $fetchState.pending" />
  <div v-else>
    <header>
      <h1>Log Anomaly</h1>
      <AsyncButton
        v-if="isAiOpsEnabled"
        class="btn bg-error"
        mode="edit"
        action-label="Disable"
        waiting-label="Disabling"
        @click="disable"
      />
    </header>
    <Banner v-if="isAiOpsEnabled && isUpgradeAvailable" color="info">
      <div>There's an upgrade currently available.</div>
      <button class="btn role-primary" @click="upgrade">
        Upgrade
      </button>
    </Banner>
    <div class="body">
      <div v-if="isAiOpsEnabled" class="enabled center">
        <h4>Log Anomaly is already installed. No further configuration required.</h4>
      </div>
      <div v-else class="not-enabled">
        <h4>Log Anomaly is not currently enabled. Installing it will add additional resources on this cluster.</h4>
        <AsyncButton
          class="btn role-primary"
          mode="edit"
          action-label="Install"
          waiting-label="Installing"
          @click="enable"
        />
      </div>
      <Banner
        v-if="error"
        color="error"
        :label="error"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.middle {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.banner {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

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
  .card-container {
    min-height: initial;
  }

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
    text-align: center;
  }
}
</style>
