<script>
import Main from '../components/Main';
import PretrainedModels from '../components/PretrainedModels';

export default {
  components: { PretrainedModels, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Pretrained Models' };
  }
};
</script>
<template>
  <Main>
    <PretrainedModels />
  </Main>
</template>
