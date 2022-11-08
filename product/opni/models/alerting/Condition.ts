import { Resource } from '../Resource';
import { deleteAlertCondition, getAlertConditionStatus } from '~/product/opni/utils/requests/alerts';
import { Duration, Reference, Status, Timestamp } from '~/product/opni/models/shared';

export enum Severity {
  INFO = 0, // eslint-disable-line no-unused-vars
  WARNING = 1, // eslint-disable-line no-unused-vars
  ERROR = 2, // eslint-disable-line no-unused-vars
  CRITICAL = 3, // eslint-disable-line no-unused-vars
}

export const SeverityResponseToEnum = {
  INFO:     0,
  WARNING:  1,
  ERROR:    2,
  CRITICAL: 3,
};

export enum ControlFlowAction {
  IF_THEN = 0, // eslint-disable-line no-unused-vars
  IF_NOT_THEN = 1, // eslint-disable-line no-unused-vars
}

export enum CompositionAction {
  AND = 0, // eslint-disable-line no-unused-vars
  OR = 1, // eslint-disable-line no-unused-vars
}

export enum AlertType {
  SYSTEM = 0, // eslint-disable-line no-unused-vars
  KUBE_STATE = 1, // eslint-disable-line no-unused-vars
  COMPOSITION = 2, // eslint-disable-line no-unused-vars
  CONTROL_FLOW = 3, // eslint-disable-line no-unused-vars
}

export enum TimelineType {
  Timeline_Unknown = 0, // eslint-disable-line no-unused-vars, camelcase
  Timeline_Alerting = 1, // eslint-disable-line no-unused-vars, camelcase
  Timeline_Silenced = 2, // eslint-disable-line no-unused-vars, camelcase
}

export interface AlertConditionComposition {
  action: CompositionAction;
  x: Reference;
  y: Reference;
}

export interface AlertConditionControlFlow {
  action: ControlFlowAction;
  x: Reference;
  y: Reference;
  for: string;
}

export interface AlertConditionSystem {
  clusterId: Reference;
  timeout: Duration;
}

export interface AlertConditionKubeState {
  clusterId: string;
  objectType: string;
  objectName: string;
  namespace: string;
  state: string;
  for: Duration;
}

export interface AlertTypeDetails {
    system: AlertConditionSystem;
    kubeState: AlertConditionKubeState;
    composition: AlertConditionComposition;
    controlFlow: AlertConditionControlFlow;
}

export interface AttachedEndpoint {
  endpointId: string;
}

export interface EndpointImplementation {
  title: string;
  body: string;
  sendResolved: boolean;
}

export interface AttachedEndpoints {
  items: AttachedEndpoint[];

  initialDelay?: Duration;
  repeatInterval?: Duration;

  throttlingDuration?: Duration;
  details: EndpointImplementation;
}

export interface SilenceInfo {
  silenceId: string;
  startsAt: Timestamp;
  endsAt: Timestamp;
}

export interface AlertCondition {
  name: string;
  description: string;
  labels: string[];
  severity: Severity;
  alertType: AlertTypeDetails;
  attachedEndpoints: AttachedEndpoints;
  silence?: SilenceInfo;
}

export interface ActiveWindow {
  start: string;
  end: string;
  type: TimelineType;
}

export interface ActiveWindows {
  windows: ActiveWindow[];
}

export interface AlertConditionWithId {
  id: Reference;
  alertCondition: AlertCondition;
}

export interface AlertConditionList {
  items: AlertConditionWithId[];
}

export interface AlertDetailChoicesRequest {
  alertType: AlertType;
}

export interface ListAlertConditionSystem {
  agentIds: string[];
}

export interface ObjectList {
  objects: string;
}

export interface NamespaceObjects {
  namespaces: { [ key: string ]: ObjectList };
}

export interface KubeObjectGroups {
  resourceTypes: { [key: string]: NamespaceObjects };
}

export interface ListAlertConditionKubeState {
  clusters: { [key: string]: KubeObjectGroups };
  states: string[];
  fors: Duration;
}

export interface ListAlertConditionComposition {
  x: Reference;
  y: Reference;
}

export interface ListAlertConditionControlFlow {
  action: ControlFlowAction;
  x: Reference;
  y: Reference;
  for: Duration;
}

export interface ListAlertTypeDetails {
  system?: ListAlertConditionSystem;
  kubeState?: ListAlertConditionKubeState;
  composition?: ListAlertConditionComposition;
  controlFlow?: ListAlertConditionControlFlow;
}

export interface SilenceRequest {
  conditionId: Reference;
  duration: Duration;
}

export interface TimelineRequest {
  lookbackWindow: Duration;
}

export interface TimelineResponse {
  items: { [key: string]: ActiveWindows };
}

export interface UpdateAlertConditionRequest {
  id: Reference;
  updateAlert: AlertCondition;
}

export enum AlertConditionState {
  UNSPECIFIED = 0, // eslint-disable-line no-unused-vars, camelcase
  OK = 1, // eslint-disable-line no-unused-vars, camelcase
  FIRING = 2, // eslint-disable-line no-unused-vars, camelcase
  SILENCED = 3, // eslint-disable-line no-unused-vars, camelcase
}

export const alertConditionStateMapping = {
  UNSPECIFIED: 0,
  OK:          1,
  FIRING:      2,
  SILENCED:    3,
};

export interface AlertStatusResponse {
  state: AlertConditionState;
}

export class Condition extends Resource {
  private base: AlertConditionWithId;
  private statusRaw;

  constructor(base: AlertConditionWithId, vue: any) {
    super(vue);
    this.base = base;
    this.statusRaw = AlertConditionState.UNSPECIFIED;
  }

  get nameDisplay() {
    return this.base.alertCondition.name;
  }

  get description() {
    return this.base.alertCondition.description;
  }

  get id() {
    return this.base.id.id;
  }

  get type(): string {
    return Object.keys(this.base.alertCondition.alertType)[0];
  }

  get typeDisplay(): string {
    const mapping: any = {
      system:    'System',
      kubeState: 'Kube State'
    };

    return mapping[this.type] || 'Unknown';
  }

  get alertType(): any {
    return this.base.alertCondition.alertType[this.type as keyof AlertTypeDetails];
  }

  get labels(): string[] {
    return this.base.alertCondition.labels || [];
  }

  get status(): Status {
    const mapping: { [key: number]: Status} = {
      [AlertConditionState.FIRING]: {
        message: 'Firing',
        state:   'error'
      },
      [AlertConditionState.OK]: {
        message: 'Ok',
        state:   'success'
      },
      [AlertConditionState.SILENCED]: {
        message: 'Silenced',
        state:   'warning'
      },
      [AlertConditionState.UNSPECIFIED]: {
        message: 'Unspecified',
        state:   'warning'
      },
    };

    const enumeration = (alertConditionStateMapping as any)[this.statusRaw] as any;

    return mapping[enumeration] || mapping[AlertConditionState.UNSPECIFIED];
  }

  async updateStatus() {
    try {
      this.statusRaw = (await getAlertConditionStatus(this.id)).state;
    } catch (ex) {
      this.statusRaw = AlertConditionState.UNSPECIFIED;
    }
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
      name:   'condition',
      params: { id: this.id }
    });
  }

  async remove() {
    await deleteAlertCondition(this.id);
    super.remove();
  }
}
