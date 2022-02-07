export class Resource {
    private vue: any;

    constructor(vue: any) {
      this.vue = vue;
    }

    currentRoute() {
      return {};
    }

    public promptRemove(resources = this) {
      this.vue.$store.commit('action-menu/togglePromptRemove', resources, { root: true });
    }

    public remove() {
      this.vue.$emit('remove');
    }
}
