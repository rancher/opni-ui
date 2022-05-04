import './style.scss';

import React, { Component } from 'react';
import {
  EuiTabbedContent,
  EuiPanel,
} from '@elastic/eui';

import ControlPlane from './components/ControlPlane';
import Pod from './components/Pod';
import Namespace from './components/Namesapce';
import { BasicBreakdown, getControlPlaneBreakdown, getNamespaceBreakdown, getPodBreakdown } from '../../utils/requests';
import Loading from '../Loading/Loading';
import { isSameRange, Range } from '../../utils/time';

export interface BreakdownsProps {
  range: Range;
  clusterId: string;
};

export interface BreakdownState {
  controlPlaneBreakdownRequest: Promise<BasicBreakdown[]>;
  podBreakdownRequest: Promise<BasicBreakdown[]>;
  namespaceBreakdownRequest: Promise<BasicBreakdown[]>;
  controlPlaneBreakdown: BasicBreakdown[];
  podBreakdown: BasicBreakdown[];
  namespaceBreakdown: BasicBreakdown[];
  allRequests: Promise<any>;
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
      allRequests: new Promise<any>(() => {}),
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
    
    this.setState({
      controlPlaneBreakdownRequest,
      podBreakdownRequest,
      namespaceBreakdownRequest,
      allRequests: Promise.all([controlPlaneBreakdownRequest, podBreakdownRequest, namespaceBreakdownRequest])
    });

    this.setState({
      controlPlaneBreakdown: await controlPlaneBreakdownRequest,
      podBreakdown: await podBreakdownRequest,
      namespaceBreakdown: await namespaceBreakdownRequest,
    });
  };

  render() {
    const tabs = [
      {
        id: 'control-plane',
        name: 'Control Plane',
        content: <ControlPlane breakdown={this.state.controlPlaneBreakdown} range={this.props.range} clusterId={this.props.clusterId} />,
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
