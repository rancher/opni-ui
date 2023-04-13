<script>
import Main from '../components/Main';
import Tasks from '../components/Tasks';

export default {
  components: { Tasks, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Tasks' };
  }
};
</script>
<template>
  <Main>
    <Tasks />
  </Main>
</template>
