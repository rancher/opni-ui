<script>
import LabeledInput from '@/components/form/LabeledInput';
import UnitInput from '@/components/form/UnitInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import KeyValue from '@/components/form/KeyValue';
import Checkbox from '@/components/form/Checkbox';
import { get, set } from '@/utils/object';
import Tolerations from '@/components/form/Tolerations';
import { getStorageClasses } from '@/product/opni/utils/requests/logging';

export default {
  components: {
    LabeledInput,
    UnitInput,
    KeyValue,
    LabeledSelect,
    Checkbox,
    Tolerations
  },
  async fetch() {
    const storageClasses = await getStorageClasses();

    this.$set(this, 'storageClasses', storageClasses.map(sc => ({ value: sc, label: sc || ' ' })));
  },

  props: {
    value: {
      type:     Object,
      required: true
    }
  },

  data() {
    return { storageClasses: [] };
  },

  methods: {
    updateRole(key, value) {
      if (value) {
        this.value.Roles.push(key);
      } else {
        const index = this.value.Roles.indexOf(key);

        if (index >= 0) {
          this.value.Roles.splice(index, 1);
        }
      }
    },

    getRole(key) {
      return this.value.Roles.includes(key);
    },

    updateUnit(key, suffix, value) {
      const val = value === null ? '' : `${ value }${ suffix }`;

      set(this, `value.${ key }`, val);
    },

    getUnit(key, suffix) {
      try {
        const value = get(this, `value.${ key }`);

        if (value.includes('Gi') && suffix === 'Mi') {
          return value.replace('Gi', '') * 1024;
        }

        return value.replace(suffix, '');
      } catch (ex) {
        return '';
      }
    }
  },

  computed: {
    controlplane: {
      get() {
        return this.getRole('controlplane');
      },
      set(value) {
        this.updateRole('controlplane', value);
      }
    },
    data: {
      get() {
        return this.getRole('data');
      },
      set(value) {
        this.updateRole('data', value);
      }
    },
    ingest: {
      get() {
        return this.getRole('ingest');
      },
      set(value) {
        this.updateRole('ingest', value);
      }
    },
    diskSize: {
      get() {
        return this.getUnit('DiskSize', 'Gi');
      },

      set(value) {
        return this.updateUnit('DiskSize', 'Gi', value);
      }
    },
    memory: {
      get() {
        return this.getUnit('MemoryLimit', 'Mi');
      },

      set(value) {
        return this.updateUnit('MemoryLimit', 'Mi', value);
      }
    },
    cpuLimit: {
      get() {
        return this.getUnit('CPUResources.Limit', 'm');
      },

      set(value) {
        return this.updateUnit('CPUResources.Limit', 'm', value);
      }
    },
    cpuRequired: {
      get() {
        return this.getUnit('CPUResources.Request', 'm');
      },

      set(value) {
        return this.updateUnit('CPUResources.Request', 'm', value);
      }
    }
  }
};
</script>
<template>
  <div>
    <div class="row border">
      <div class="col span-4">
        <LabeledInput v-model="value.Name" label="Name" :required="true" />
      </div>
      <div class="col span-4">
        <UnitInput v-model="value.Replicas" label="Replicas" :suffix="false" />
      </div>
      <div class="col span-4">
        <div>
          <h3>Role<span class="required">*</span></h3>
          <div class="role-container">
            <Checkbox v-model="controlplane" label="Controlplane" />
            <Checkbox v-model="data" label="Data" />
            <Checkbox v-model="ingest" label="Ingest" />
          </div>
        </div>
      </div>
    </div>
    <div class="row mt-10">
      <div class="col span-12">
        <h4>Storage</h4>
      </div>
    </div>
    <div class="row border">
      <div class="col span-4">
        <UnitInput v-model="diskSize" label="Disk Size" suffix="GiB" placeholder="e.g. 24" :required="true" />
      </div>
      <div class="col span-4">
        <Checkbox v-model="value.Persistence.Enabled" class="role" label="Persistent" />
      </div>
      <div class="col span-4">
        <LabeledSelect v-model="value.Persistence.StorageClass" :options="storageClasses" label="Storage Class" />
      </div>
    </div>
    <div class="row mt-10">
      <div class="col span-12">
        <h4>Resources</h4>
      </div>
    </div>
    <div class="row border">
      <div class="col span-4">
        <UnitInput v-model="memory" label="Memory" suffix="MiB" placeholder="e.g. 128" :required="true" />
      </div>
      <div class="col span-4">
        <UnitInput v-model="cpuLimit" label="CPU Limit" suffix="miliCpu" placeholder="e.g. 1000" />
      </div>
      <div class="col span-4">
        <UnitInput v-model="cpuRequired" label="CPU Required" suffix="miliCpu" placeholder="e.g. 1000" />
      </div>
    </div>
    <div class="row mt-10">
      <div class="col span-12">
        <h4>Scheduling</h4>
      </div>
    </div>
    <div class="row">
      <div class="col span-10">
        <KeyValue v-model="value.NodeSelector" add-label="Add Node Selector" :read-allowed="false" />
      </div>
      <div class="col span-2 middle">
        <Checkbox v-model="value.EnableAntiAffinity" class="check" label="Anti Affinity" />
      </div>
    </div>
    <div class="row mt-10">
      <div class="col span-12">
        <Tolerations v-model="value.Tolerations" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
::v-deep {
    .role-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .col {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .check {
      margin-top: -24px;
    }

    .required {
      font-size: 14px;
      color: var(--error);
    }
}

.border {
    border-bottom: 1px solid #dcdee7;
    padding-bottom: 15px;
}
</style>
