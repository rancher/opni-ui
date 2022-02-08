<script>
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import AsyncButton from '@/components/AsyncButton';
import { createRoleBinding, getRoles } from '@/product/opni/utils/requests';
import Loading from '@/components/Loading';
import Tab from '@/components/Tabbed/Tab';
import Tabbed from '@/components/Tabbed';
import Taints from '@/components/form/Taints';
import ArrayList from '@/components/form/ArrayList';

export default {
  components: {
    AsyncButton,
    LabeledInput,
    LabeledSelect,
    Loading,
    Tab,
    Tabbed,
    Taints,
    ArrayList
  },

  async fetch() {
    const roles = await getRoles();

    this.$set(this, 'roles', roles);
  },

  data() {
    return {
      name:      '',
      roleName:  '',
      subjects:  [],
      taints:    [],
      roles:     [],
    };
  },

  methods: {
    async save() {
      await createRoleBinding(this.name, this.roleName, this.subjects, this.taintsToSave);

      this.$router.replace({ name: 'roleBindings' });
    }
  },

  computed: {
    taintsToSave() {
      return this.taints.map(taint => `${ taint.key }=${ taint.value }:${ taint.effect }`);
    },

    roleOptions() {
      return this.roles.map(role => role.name);
    }
  }
};
</script>
<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <div class="row">
      <div class="col span-6">
        <LabeledInput v-model="name" label="Name" />
      </div>
      <div class="col span-6">
        <LabeledSelect
          v-model="roleName"
          class="mb-20"
          :label="t('opni.monitoring.roleBindings.role')"
          :options="roleOptions"
        />
      </div>
    </div>
    <Tabbed :side-tabs="true" class="mb-20">
      <Tab
        name="subjects"
        c
        :label="t('opni.monitoring.roleBindings.tabs.subjects.label')"
        :weight="2"
      >
        <ArrayList
          v-model="subjects"
          :protip="false"
          add-label="Add Subject"
        />
      </Tab>
      <Tab
        name="taints"
        :label="t('opni.monitoring.roleBindings.tabs.taints.label')"
        :weight="1"
      >
        <Taints v-model="taints" mode="edit" :show-title="false" />
      </Tab>
    </Tabbed>
    <div class="resource-footer">
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
