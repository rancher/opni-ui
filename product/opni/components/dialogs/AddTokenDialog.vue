<script>
import AsyncButton from '@/components/AsyncButton';
import Card from '@/components/Card';
import { exceptionToErrorsArray } from '@/utils/error';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import { createToken } from '@/product/opni/utils/requests';

export default {
  components: {
    Card,
    AsyncButton,
    LabeledInput,
    LabeledSelect
  },
  data() {
    const expirationOptions = [
      {
        label: '10 min',
        value: '600s'
      },
      {
        label: '30 min',
        value: '1800s'
      },
      {
        label: '1 day',
        value: '86400s'
      },
      {
        label: '7 days',
        value: '604800s'
      }
    ];

    return {
      name:       null,
      expirationOptions,
      expiration: expirationOptions[0].value
    };
  },
  methods: {
    close() {
      this.$modal.hide('add-token-dialog');
    },

    open() {
      this.$set(this, 'expiration', this.expirationOptions[0]);
      this.$modal.show('add-token-dialog');
    },

    async apply(buttonDone) {
      try {
        await createToken(this.expiration, this.name || undefined);
        buttonDone(true);
        this.$emit('save');
        this.close();
      } catch (err) {
        this.errors = exceptionToErrorsArray(err);
        buttonDone(false);
      }
    }
  }
};
</script>

<template>
  <modal
    class="add-token-dialog"
    name="add-token-dialog"
    styles="background-color: var(--nav-bg); border-radius: var(--border-radius); max-height: 100vh;"
    height="auto"
    :width="400"
    :scrollable="true"
    @closed="close()"
  >
    <Card class="prompt-restore" :show-highlight-border="false" title="Create Token">
      <h4 slot="title" class="text-default-text" v-html="'Create Token'" />
      <div slot="body" class="pt-10">
        <div class="row mb-10">
          <div class="col span-12">
            <LabeledInput v-model.trim="name" label="Name (Optional)" />
          </div>
        </div>
        <div class="row">
          <div class="col span-12">
            <LabeledSelect
              v-model="expiration"
              label="Expiration"
              :options="expirationOptions"
            />
          </div>
        </div>
      </div>

      <div slot="actions" class="buttons">
        <button class="btn role-secondary mr-10" @click="close">
          {{ t('generic.cancel') }}
        </button>

        <AsyncButton
          mode="create"
          @click="apply"
        />
      </div>
    </Card>
  </modal>
</template>
<style lang='scss' scoped>
  .prompt-restore {
    margin: 0;
  }
  .buttons {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }

  .add-token-dialog {
    border-radius: var(--border-radius);
    overflow: scroll;
    max-height: 100vh;
    & ::-webkit-scrollbar-corner {
      background: rgba(0,0,0,0);
    }
  }
</style>
