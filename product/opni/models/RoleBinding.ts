import { Resource } from './Resource';
import { deleteRoleBinding } from '~/product/opni/utils/requests';

export interface RoleBindingResponse {
  name: string;
  roleName: string;
  subjects: string[];
  taints: string[];
}

export interface RoleBindingsResponse {
  items: RoleBindingResponse[];
}

export class RoleBinding extends Resource {
    private base: RoleBindingResponse;

    constructor(base: RoleBindingResponse, vue: any) {
      super(vue);
      this.base = base;
    }

    get name() {
      return this.base.name;
    }

    get nameDisplay(): string {
      return this.name;
    }

    get subjects() {
      return this.base.subjects;
    }

    get role() {
      return this.base.roleName;
    }

    get taints() {
      return this.base.taints;
    }

    get availableActions(): any[] {
      return [
        {
          action:     'promptRemove',
          altAction:  'delete',
          label:      'Delete',
          icon:       'icon icon-trash',
          bulkable:   true,
          enabled:    true,
          bulkAction: 'promptRemove',
          weight:     -10, // Delete always goes last
        }
      ];
    }

    async remove() {
      await deleteRoleBinding(this.base.name);
      super.remove();
    }
}
