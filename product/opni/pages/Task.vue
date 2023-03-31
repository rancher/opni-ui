<script>
import Main from '../components/Main';
import Task from '../components/Task';

export default {
  components: { Task, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Task' };
  }
};
</script>
<template>
  <Main>
    <Task />
  </Main>
</template>
