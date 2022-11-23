import { capitalize } from 'lodash';
import { Resource } from '../Resource';
import { deleteEndpoint } from '~/product/opni/utils/requests/alerts';
import { Reference } from '~/product/opni/models/shared';

export interface SlackEndpoint {
    webhookUrl: string;
    channel: string;
}

export interface EmailEndpoint {
    to: string;
    smtpFrom: string;
    smtpSmartHost: string;
    smtpAuthUsername: string;
    smtpAuthIdentity: string;
    smtpAuthPassword: string;
    smtpRequireTLS: boolean;
}

export interface PagerDutyEndpoint {
  integrationKey: string;
}

export interface AlertEndpoint {
    name: string;
    description: string;
    slack?: SlackEndpoint;
    email?: EmailEndpoint;
    pagerDuty?: PagerDutyEndpoint;
}

export interface AlertEndpointWithId {
    endpoint: AlertEndpoint;
    id: Reference;
}

export interface AlertEndpointList {
    items: AlertEndpointWithId[];
}

export interface UpdateAlertEndpointRequest {
    forceUpdate: boolean;
    id: Reference;
    updateAlert: AlertEndpoint;
}

export interface TestAlertEndpointRequest {
  endpoint: AlertEndpoint;
}

export class Endpoint extends Resource {
    private base: AlertEndpointWithId;

    constructor(base: AlertEndpointWithId, vue: any) {
      super(vue);
      this.base = base;
    }

    get nameDisplay() {
      return this.base.endpoint.name;
    }

    get description() {
      return this.base.endpoint.description;
    }

    get id() {
      return this.base.id.id;
    }

    get type() {
      if (this.base.endpoint.email) {
        return 'email';
      }

      if (this.base.endpoint.slack) {
        return 'slack';
      }

      return 'unknown';
    }

    get typeDisplay() {
      return capitalize(this.type);
    }

    get endpoint() {
      return this.base.endpoint[this.type as keyof AlertEndpoint];
    }

    get availableActions(): any[] {
      return [
        {
          action:    'edit',
          altAction: 'edit',
          label:     'Edit',
          icon:      'icon icon-edit',
          enabled:   true,
        },
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

    edit() {
      this.vue.$router.replace({
        name:   'endpoint',
        params: { id: this.id }
      });
    }

    async remove() {
      const result = await deleteEndpoint(this.id);

      if (result.data?.items?.length > 0) {
        throw new Error(`${ this.nameDisplay } is currently being used by 1 or more conditions and cannot be deleted.`);
      }

      super.remove();
    }
}
