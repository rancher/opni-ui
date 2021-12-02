/* eslint-disable camelcase */
export interface LogResponse {
    timestamp: Number;
    log: String;
    anomaly_level: String;
    'kubernetes.namespace_name': String;
    'kubernetes.pod_name': String;
    is_control_plane_log: Boolean;
}
/* eslint-enable camelcase */

export class Log {
    timestamp: Number;
    log: String;
    anomalyLevel: String;
    kubernetesNamespaceName: String;
    kubernetesPodName: String;
    isControlPlaneLog: Boolean;

    constructor(response: LogResponse) {
      this.timestamp = response.timestamp;
      this.log = response.log;
      this.anomalyLevel = response.anomaly_level;
      this.kubernetesNamespaceName = response['kubernetes.namespace_name'];
      this.kubernetesPodName = response['kubernetes.pod_name'];
      this.isControlPlaneLog = response.is_control_plane_log;
    }

    get area() {
      return this.isControlPlaneLog ? 'Control Plane' : 'Workload';
    }

    get stateDescription() {
      return true;
    }

    get stateObj() {
      return {};
    }
}
