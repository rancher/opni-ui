<script>
import LabeledInput from '@/components/form/LabeledInput';
import AsyncButton from '@/components/AsyncButton';
import { getClusters } from '@/product/opni/utils/requests/management';
import { exceptionToErrorsArray } from '@/utils/error';
import Loading from '@/components/Loading';
import Banner from '@/components/Banner';
import LabeledSelect from '@/components/form/LabeledSelect';
import SortableTable from '@/components/SortableTable';
import { ListNamespaces, CreateJob } from '~/product/opni/utils/requests/aiops/metrics';

export default {
  components: {
    AsyncButton,
    LabeledInput,
    LabeledSelect,
    Loading,
    SortableTable,
    Banner,
  },

  async fetch() {
    const clusters = await getClusters();
    const namespacesRequests = clusters.map(({ id }) => ListNamespaces({ id }) );
    const namespaces = await Promise.all(namespacesRequests);
    const namespaceMap = {};

    clusters.forEach((c, i) => {
      namespaceMap[c.id] = (namespaces[i].items || []).map(nameDisplay => ({ nameDisplay, id: nameDisplay }));
    });

    this.$set(
      this,
      'clusterIdOptions',
      clusters.map(cluster => ({
        label: cluster.nameDisplay,
        value: cluster.id,
      }))
    );

    this.$set(this, 'namespaces', namespaceMap);
    this.$set(this, 'cluster', clusters?.[0]?.id);
  },

  data() {
    return {
      name:             '',
      namespaces:       { },
      headers:    [
        {
          name:      'nameDisplay',
          labelKey:  'tableHeaders.namespace',
          sort:      ['nameDisplay'],
          value:     'nameDisplay',
          width:     undefined
        },
      ],
      cluster:          '',
      clusterIds:       [],
      clusterIdOptions: [],
      description:      '',
      selection:        [],

      error: '',
    };
  },

  methods: {
    async save(buttonCallback) {
      if (this.name === '') {
        this.$set(this, 'error', 'Name is required');

        return;
      }

      try {
        await CreateJob({
          clusterId:      this.cluster,
          namespaces:     this.selection.map(s => s.id),
          jobId:          this.name,
          jobDescription: this.description
        });

        await buttonCallback(false);
      } catch (err) {
        this.$set(this, 'error', exceptionToErrorsArray(err).join('; '));
        buttonCallback(false);

        return;
      }
      this.$set(this, 'error', '');
      buttonCallback(true);
      this.$router.replace({ name: 'tasks' });
    },

    cancel() {
      this.$router.replace({ name: 'tasks' });
    },

    onSelection(selection) {
      this.$set(this, 'selection', selection);
    }
  },

  watch: {
    cluster() {
      this.$set(this, 'selection', []);
    }
  }
};
</script>
<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <header class="mb-0">
      <div class="title">
        <h1>Job</h1>
      </div>
    </header>
    <div class="row mb-10">
      <div class="col span-4">
        <LabeledInput
          v-model="name"
          label="Name"
          :required="true"
        />
      </div>
      <div class="col span-4">
        <LabeledInput
          v-model="description"
          label="Description"
        />
      </div>
      <div class="col span-4">
        <LabeledSelect v-model="cluster" label="Cluster" :options="clusterIdOptions" />
      </div>
    </div>
    <Banner
      class="mb-10"
      color="info"
      label="Select the namespaces that you would like to have analyzed when running this job."
    />
    <SortableTable
      ref="table"
      class="primary"
      :rows="namespaces[cluster] || []"
      :headers="headers"
      :search="false"
      :row-actions="false"
      default-sort-by="logs"
      key-field="id"
      no-rows-key="opni.namespaces.noRowsKey"
      @selection="onSelection"
    />
    <div class="resource-footer mt-20">
      <button class="btn btn-secondary mr-10" @click="cancel">
        Cancel
      </button>
      <AsyncButton mode="edit" @click="save" />
    </div>
    <Banner
      v-if="error"
      color="error"
      :label="error"
    />
  </div>
</template>

<style lang="scss" scoped>

::v-deep .fixed-header-actions {
  display: none;
}

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
