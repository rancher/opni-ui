<script>
import Main from '../components/Main';
import RoleBindings from '../components/RoleBindings';

export default {
  components: { RoleBindings, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Role Bindings' };
  }
};
</script>
<template>
  <Main>
    <RoleBindings />
  </Main>
</template>
