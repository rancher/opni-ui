<script>
import Main from '../components/Main';
import Condition from '../components/Condition';

export default {
  components: { Condition, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Condition' };
  }
};
</script>
<template>
  <Main>
    <Condition />
  </Main>
</template>
