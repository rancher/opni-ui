<script>
import Main from '../components/Main';
import Preempt from '../components/Preempt';

export default {
  components: { Main, Preempt },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Investigation' };
  }
};
</script>
<template>
  <Main>
    <Preempt />
  </Main>
</template>
