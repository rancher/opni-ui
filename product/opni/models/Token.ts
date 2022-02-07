import day from 'dayjs';
import { Resource } from './Resource';
import { deleteToken } from '~/product/opni/utils/requests';

export interface TokenResponse {
  tokenID: string;
  secret: string;
  leaseID: string;
  ttl: string;
}

export interface TokensResponse {
  items: any[];
}

export class Token extends Resource {
    private base: TokenResponse;
    private now: day.Dayjs;

    constructor(base: TokenResponse, vue: any) {
      super(vue);
      this.base = base;
      this.now = day();
    }

    get type(): string {
      return 'token';
    }

    get id(): string {
      return `${ this.base.tokenID }.${ this.base.secret }`;
    }

    get nameDisplay(): string {
      return this.base.tokenID;
    }

    get expirationDate(): string {
      return this.now.add(Number.parseInt(this.base.ttl), 's').format();
    }

    get secret(): string {
      return this.base.secret;
    }

    get ttl(): string {
      return this.base.ttl;
    }

    get used(): number {
      return 0;
    }

    get usedDisplay(): string {
      return this.used === 1 ? 'Used 1 time' : `Used ${ this.used } times`;
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
      await deleteToken(this.base.tokenID);
      super.remove();
    }
}
