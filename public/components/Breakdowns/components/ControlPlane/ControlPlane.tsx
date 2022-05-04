import React, { Component } from 'react';
import { BasicBreakdown } from '../../../../utils/requests';
import Basic from '../Basic';
import { Range } from '../../../../utils/time';

export interface ControlPlaneProps {
  breakdown: BasicBreakdown[];
  range: Range;
  clusterId: string;
}

export default class ControlPlane extends Component<ControlPlaneProps> {
  render() {
    return (
        <Basic type="controlPlane" breakdown={this.props.breakdown} range={this.props.range} clusterId={this.props.clusterId} showNormalSparkline={false} showAnomaly={true} />
    );
  }
}
