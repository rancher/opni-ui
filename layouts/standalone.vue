<script>
import ActionMenu from '@/components/ActionMenu';
import PromptRemove from '@/components/PromptRemove';

export default {
  components: {
    ActionMenu,
    PromptRemove,
  },
};
</script>

<template>
  <div class="dashboard-roots">
    <nuxt />
    <ActionMenu />
    <PromptRemove />
  </div>
</template>
