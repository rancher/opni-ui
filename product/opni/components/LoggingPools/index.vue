<script>
import Tab from '@/components/Tabbed/Tab';
import Tabbed from '@/components/Tabbed';
import NodePool from '~/product/opni/components/LoggingPools/NodePool.vue';

export function createEmptyPool(index) {
  return {
    Name:         `pool${ index }`,
    Roles:        ['controlplane', 'data', 'ingest'],
    Persistence:  { Enabled: false, StorageClass: '' },
    CPUResources: {
      Request: '',
      Limit:   ''
    },
    Replicas:           1,
    DiskSize:           '20Gi',
    MemoryLimit:        '1024Mi',
    NodeSelector:       {},
    EnableAntiAffinity: false
  };
}

export default {
  components: {
    Tab,
    Tabbed,
    NodePool
  },

  props: {
    value: {
      type:     Array,
      required: true
    }
  },

  data() {
    return { nameIndex: this.value.length };
  },

  methods: {
    addNodePool() {
      const pool = createEmptyPool(++this.nameIndex);

      this.value.push(pool);
      this.$nextTick(() => {
        this.$refs.pools.select(pool.Name);
      });
    },

    removeNodePool(index) {
      this.value.splice(index, 1);
    }
  },
};
</script>
<template>
  <Tabbed
    ref="pools"
    :side-tabs="true"
    :show-tabs-add-remove="true"
    @addTab="addNodePool($event)"
    @removeTab="removeNodePool($event)"
  >
    <template v-for="(obj, i) in value">
      <Tab
        v-if="!obj.remove"
        :key="i"
        :name="obj.Name"
        :weight="value.length - i"
        :label="obj.Name || '(Not Named)'"
        :show-header="false"
      >
        <NodePool
          ref="pool"
          :value="obj"
          @error="e=>errors = e"
        />
      </Tab>
    </template>
    <div v-if="!value.length">
      You do not have any node pools defined, click the plus to add one.
    </div>
  </Tabbed>
</template>

<style lang="scss" scoped>

</style>
