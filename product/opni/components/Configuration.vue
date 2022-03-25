<script>
import { nextTick } from 'process';
import jsyaml from 'js-yaml';
import YamlEditor from '@/components/YamlEditor';
import Loading from '@/components/Loading';
import { exceptionToErrorsArray } from '@/utils/error';
import AsyncButton from '@/components/AsyncButton';
import { getGatewayConfig, updateGatewayConfig } from '~/product/opni/utils/requests';

export default {
  components: {
    YamlEditor,
    AsyncButton,
    Loading
  },

  async fetch() {
    await this.load();
  },

  data() {
    return {
      loading:          false,
      documents:        [],
      editorContents:   '',
      errors:           [],
    };
  },

  methods: {
    async load() {
      try {
        this.loading = true;
        this.$set(this, 'documents', await getGatewayConfig(this));
        let contents = '';

        this.documents.forEach((doc, i) => {
          contents += doc.yaml;
          if (i < this.documents.length - 1) {
            if (contents[contents.length - 1] !== '\n') {
              contents += '\n';
            }
            contents += '---\n';
          }
        });
        this.editorContents = contents;
      } finally {
        this.loading = false;
      }
    },
    async save(buttonCallback) {
      try {
        const documents = jsyaml.loadAll(this.editorContents);
        const jsonDocuments = [];

        documents.forEach((doc) => {
          jsonDocuments.push(JSON.stringify(doc));
        });
        await updateGatewayConfig(jsonDocuments);
      } catch (err) {
        buttonCallback(false);
        this.errors = exceptionToErrorsArray(err);
      } finally {
        buttonCallback(this.errors.length === 0);
      }
    },
    async reset() {
      this.errors = [];
      await this.load();
    },
    onInput(yaml) {
      this.editorContents = yaml;
    }
  }
};
</script>
<template>
  <Loading v-if="loading || $fetchState.pending" />
  <div v-else>
    <div slot="actions" class="buttons pb-10">
      <p v-if="errors.length" class="error-message mt-10 pr-10">
        {{ errors.join('; ') }}
      </p>
      <AsyncButton
        ref="saveBtn"
        class="btn role-primary mr-10"
        action-label="Save and Restart"
        waiting-label="Saving..."
        success-label="Restarting..."
        error-label="Error"
        @click="save"
      />
      <button class="btn role-secondary mr-10" @click="reset">
        Reset
      </button>
    </div>
    <div slot="body">
      <YamlEditor
        ref="yamlEditor"
        v-model="editorContents"
        :as-object="false"
        :editor-mode="'EDIT_CODE'"
        :read-only="false"
        class="yaml-editor"
        @onInput="onInput"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.buttons {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
.error-message {
  color: var(--error);
  display: flex;
  justify-content: center;
}
</style>
