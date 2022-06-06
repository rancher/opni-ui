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
import { BasicBreakdown, getControlPlaneBreakdown, getLogTypes, getNamespaceBreakdown, getPodBreakdown, getRancherBreakdown } from '../../utils/requests';
import Loading from '../Loading/Loading';
import { Granularity, isSameRange, Range } from '../../utils/time';

export interface BreakdownsProps {
  range: Range;
  clusterId: string;
  granularity: Granularity;
};

export interface BreakdownState {
  controlPlaneBreakdownRequest: Promise<BasicBreakdown[]>;
  podBreakdownRequest: Promise<BasicBreakdown[]>;
  namespaceBreakdownRequest: Promise<BasicBreakdown[]>;
  rancherBreakdownRequest: Promise<BasicBreakdown[]>;
  controlPlaneBreakdown: BasicBreakdown[];
  podBreakdown: BasicBreakdown[];
  namespaceBreakdown: BasicBreakdown[];
  rancherBreakdown: BasicBreakdown[];
  allRequests: Promise<any>;
  showRancher: boolean;
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
      allRequests: new Promise<any>(() => {}),
      showRancher: false
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
    const controlPlaneBreakdownRequest =  getControlPlaneBreakdown(this.props.range, this.props.clusterId);
    const podBreakdownRequest =  getPodBreakdown(this.props.range, this.props.clusterId);
    const namespaceBreakdownRequest =  getNamespaceBreakdown(this.props.range, this.props.clusterId);
    const rancherBreakdownRequest = getRancherBreakdown(this.props.range, this.props.clusterId);
    const logTypesRequest = getLogTypes();
    
    this.setState({
      controlPlaneBreakdownRequest,
      podBreakdownRequest,
      namespaceBreakdownRequest,
      rancherBreakdownRequest,
      allRequests: Promise.all([controlPlaneBreakdownRequest, podBreakdownRequest, namespaceBreakdownRequest, rancherBreakdownRequest, getLogTypes])
    });

    const logTypes = await logTypesRequest;
    this.setState({
      controlPlaneBreakdown: await controlPlaneBreakdownRequest,
      podBreakdown: await podBreakdownRequest,
      namespaceBreakdown: await namespaceBreakdownRequest,
      rancherBreakdown: await rancherBreakdownRequest,
      showRancher: logTypes.includes('rancher')
    });
  };

  render() {
    const tabs = [
      {
        id: 'control-plane',
        name: 'Control Plane',
        content: <ControlPlane breakdown={this.state.controlPlaneBreakdown} range={this.props.range} clusterId={this.props.clusterId} granularity={this.props.granularity} />,
      },
      {
        id: 'pod',
        name: 'Pod',
        content: <Pod breakdown={this.state.podBreakdown} range={this.props.range} clusterId={this.props.clusterId} />
      },
      {
        id: 'namespace',
        name: 'Namespace',
        content: <Namespace breakdown={this.state.namespaceBreakdown} range={this.props.range} clusterId={this.props.clusterId} />
      }
    ];

    if (this.state.showRancher) {
      tabs.push({
        id: 'rancher',
        name: 'Rancher',
        content: <Rancher breakdown={this.state.rancherBreakdown} range={this.props.range} clusterId={this.props.clusterId} granularity={this.props.granularity} />
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
