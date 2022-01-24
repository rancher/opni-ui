<script>
const UTC_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';

export default {
  props: {
    value: {
      type:     String,
      required: true
    },
    row: {
      type:     Object,
      required: true,
    },
    options: {
      type:     [Object, String],
      required: true,
    }
  },

  computed: {
    query() {
      switch (this.options.type) {
      case 'pod':
        return `_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:'${ this.from }',to:'${ this.to }'))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,key:kubernetes.pod_name,negate:!f,params:(query:${ this.value }),type:phrase),query:(match_phrase:(kubernetes.pod_name:${ this.value })))),interval:auto,query:(language:kuery,query:''),sort:!())`;
      case 'control-plane':
        return `_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:'${ this.from }',to:'${ this.to }'))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,key:is_control_plane_log,negate:!f,params:(query:!t),type:phrase),query:(match_phrase:(is_control_plane_log:!t))),('$state':(store:appState),meta:(alias:!n,disabled:!f,key:kubernetes_component,negate:!f,params:(query:${ this.value }),type:phrase),query:(match_phrase:(kubernetes_component:${ this.value })))),interval:auto,query:(language:kuery,query:''),sort:!())`;
      case 'namespace':
        return `_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:'${ this.from }',to:'${ this.to }'))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,key:kubernetes.namespace_name,negate:!f,params:(query:${ this.value }),type:phrase),query:(match_phrase:(kubernetes.namespace_name:${ this.value })))),interval:auto,query:(language:kuery,query:''),sort:!())`;
      case 'workload':
        return `_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:'${ this.from }',to:'${ this.to }'))&_a=(columns:!(_source),filters:!(),interval:auto,query:(language:kuery,query:"${ this.value }"),sort:!())`;
      default:
        return '';
      }
    },

    from() {
      return this.options.fromTo.from.utc().format(UTC_FORMAT);
    },

    to() {
      return this.options.fromTo.to.utc().format(UTC_FORMAT);
    },

    url() {
      const hostname = window.location.hostname;

      return `http://${ hostname }:5601/app/discover#/?${ this.query }`;
    }
  },

  methods: {
    toggle() {
      this.$set(this.row, this.key, !this.open);
    },
  }
};
</script>

<template>
  <a :href="url" rel="nofollow noopener noreferrer" target="_blank">{{ value }}</a>
</template>

<style lang="scss" scoped>
.icon {
    cursor: pointer;
}
</style>
