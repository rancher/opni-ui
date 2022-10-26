import './style.scss';

import React, { Component } from 'react';
import {
  EuiTabbedContent,
  EuiPanel,
} from '@elastic/eui';

import ControlPlane from './components/ControlPlane';
import Pod from './components/Pod';
import Namespace from './components/Namesapce';
import Rancher from './components/Rancher';
import Longhorn from './components/Longhorn';
import { BasicBreakdown, getControlPlaneBreakdown, getLogTypes, getNamespaceBreakdown, getPodBreakdown, getRancherBreakdown, getLonghornBreakdown } from '../../utils/requests';
import Loading from '../Loading/Loading';
import { Granularity, isSameRange, Range } from '../../utils/time';

export interface BreakdownsProps {
  range: Range;
  clusterId: string;
  granularity: Granularity;
  keywords: string[];
};

export interface BreakdownState {
  controlPlaneBreakdownRequest: Promise<BasicBreakdown[]>;
  podBreakdownRequest: Promise<BasicBreakdown[]>;
  namespaceBreakdownRequest: Promise<BasicBreakdown[]>;
  rancherBreakdownRequest: Promise<BasicBreakdown[]>;
  longhornBreakdownRequest: Promise<BasicBreakdown[]>;
  controlPlaneBreakdown: BasicBreakdown[];
  podBreakdown: BasicBreakdown[];
  namespaceBreakdown: BasicBreakdown[];
  rancherBreakdown: BasicBreakdown[];
  longhornBreakdown: BasicBreakdown[];
  allRequests: Promise<any>;
  showRancher: boolean;
  showLonghorn: boolean;
}

export default class Breakdowns extends Component<BreakdownsProps, BreakdownState> {
  constructor(props) {
    super(props);

    this.state = {
      controlPlaneBreakdownRequest: new Promise<BasicBreakdown[]>(() => {}),
      controlPlaneBreakdown: [],
      podBreakdownRequest: new Promise<BasicBreakdown[]>(() => {}),
      podBreakdown: [],
      namespaceBreakdownRequest: new Promise<BasicBreakdown[]>(() => {}),
      namespaceBreakdown: [],
      rancherBreakdownRequest: new Promise<BasicBreakdown[]>(() => {}),
      rancherBreakdown: [],
      longhornBreakdownRequest: new Promise<BasicBreakdown[]>(()=>{}),
      longhornBreakdown: [],
      allRequests: new Promise<any>(() => {}),
      showRancher: false,
      showLonghorn: false,
    };
  }

  componentDidMount(): void {
      this.load();
  }

  componentDidUpdate(prevProps: Readonly<BreakdownsProps>): void {
    if (!isSameRange(prevProps.range, this.props.range) || this.props.clusterId !== prevProps.clusterId) {
      this.load();
    }
  }

  load = async () => {
    const controlPlaneBreakdownRequest =  getControlPlaneBreakdown(this.props.range, this.props.clusterId, this.props.keywords);
    const podBreakdownRequest =  getPodBreakdown(this.props.range, this.props.clusterId, this.props.keywords);
    const namespaceBreakdownRequest =  getNamespaceBreakdown(this.props.range, this.props.clusterId, this.props.keywords);
    const rancherBreakdownRequest = getRancherBreakdown(this.props.range, this.props.clusterId, this.props.keywords);
    const longhornBreakdownRequest = getLonghornBreakdown(this.props.range, this.props.clusterId, this.props.keywords);
    const logTypesRequest = getLogTypes();
    
    this.setState({
      controlPlaneBreakdownRequest,
      podBreakdownRequest,
      namespaceBreakdownRequest,
      rancherBreakdownRequest,
      longhornBreakdownRequest,
      allRequests: Promise.all([controlPlaneBreakdownRequest, podBreakdownRequest, namespaceBreakdownRequest, rancherBreakdownRequest, longhornBreakdownRequest, getLogTypes])
    });

    const logTypes = await logTypesRequest;
    this.setState({
      controlPlaneBreakdown: await controlPlaneBreakdownRequest,
      podBreakdown: await podBreakdownRequest,
      namespaceBreakdown: await namespaceBreakdownRequest,
      rancherBreakdown: await rancherBreakdownRequest,
      longhornBreakdown: await longhornBreakdownRequest,
      showRancher: logTypes.includes('rancher'),
      showLonghorn: logTypes.includes('longhorn')
    });
  };

  render() {
    const tabs = [
      {
        id: 'control-plane',
        name: 'Control Plane',
        content: <ControlPlane breakdown={this.state.controlPlaneBreakdown} range={this.props.range} clusterId={this.props.clusterId} granularity={this.props.granularity} keywords={this.props.keywords} />,
      },
      {
        id: 'pod',
        name: 'Workload Pod',
        content: <Pod breakdown={this.state.podBreakdown} range={this.props.range} clusterId={this.props.clusterId} keywords={this.props.keywords} />
      },
      {
        id: 'namespace',
        name: 'Workload Namespace',
        content: <Namespace breakdown={this.state.namespaceBreakdown} range={this.props.range} clusterId={this.props.clusterId} keywords={this.props.keywords} />
      }
    ];

    if (this.state.showRancher) {
      tabs.push({
        id: 'rancher',
        name: 'Rancher',
        content: <Rancher breakdown={this.state.rancherBreakdown} range={this.props.range} clusterId={this.props.clusterId} granularity={this.props.granularity} keywords={this.props.keywords} />
      });
    }

    if (this.state.showLonghorn) {
      tabs.push({
        id: 'longhorn',
        name: 'Longhorn',
        content: <Longhorn breakdown={this.state.longhornBreakdown} range={this.props.range} clusterId={this.props.clusterId} granularity={this.props.granularity} keywords={this.props.keywords} />
      });
    }
    return (
        <div style={{ padding: '15px 15px' }} className="breakdowns">
          <EuiPanel>
            <Loading promise={this.state.allRequests}>
              <EuiTabbedContent tabs={tabs} initialSelectedTab={tabs[0]} />
            </Loading>
          </EuiPanel>
        </div>
    );
  }
}
