<script>
import Main from '../components/Main';
import Alarms from '../components/Alarms';

export default {
  components: { Alarms, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Alarms' };
  }
};
</script>
<template>
  <Main>
    <Alarms />
  </Main>
</template>
