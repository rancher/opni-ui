<script>
import Main from '../components/Main';
import RoleBinding from '../components/RoleBinding';

export default {
  components: { RoleBinding, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Role Binding' };
  }
};
</script>
<template>
  <Main>
    <RoleBinding />
  </Main>
</template>
