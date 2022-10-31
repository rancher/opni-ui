<script>
import Main from '../components/Main';
import Conditions from '../components/Conditions';

export default {
  components: { Conditions, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Conditions' };
  }
};
</script>
<template>
  <Main>
    <Conditions />
  </Main>
</template>
