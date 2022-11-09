<script>
import Main from '../components/Main';
import Alarm from '../components/Alarm';

export default {
  components: { Alarm, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Alarm' };
  }
};
</script>
<template>
  <Main>
    <Alarm />
  </Main>
</template>
