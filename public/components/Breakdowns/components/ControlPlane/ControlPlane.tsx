import './style.scss';
import React, { Component } from 'react';
import { BasicBreakdown, getControlPlaneInsights } from '../../../../utils/requests';
import Basic from '../Basic';
import { Granularity, Range } from '../../../../utils/time';
import { getGroupBreakdown } from '../../../../utils/group';
import InsightsChart from '../../../InsightsChart';

export interface ControlPlaneProps {
  breakdown: BasicBreakdown[];
  range: Range;
  clusterId: string;
  granularity: Granularity;
  keywords: string[];
}

export default class ControlPlane extends Component<ControlPlaneProps> {
  render() {
    return (
      <div className="control-plane-breakdown">
        <InsightsChart range={this.props.range} granularity={this.props.granularity} clusterId={this.props.clusterId} insightsProvider={getControlPlaneInsights} keywords={this.props.keywords} />
        <Basic type="controlPlane" breakdown={getGroupBreakdown(this.props.breakdown)} range={this.props.range} clusterId={this.props.clusterId} showAnomaly={true} keywords={this.props.keywords} />
      </div>
    );
  }
}
