import './style.scss';
import React, { Component } from 'react';
import { BasicBreakdown, getRancherInsights } from '../../../../utils/requests';
import Basic from '../Basic';
import { Granularity, Range } from '../../../../utils/time';
import InsightsChart from '../../../../components/InsightsChart';
import { getGroupBreakdown } from '../../../../utils/group';

export interface RancherProps {
  breakdown: BasicBreakdown[];
  range: Range;
  clusterId: string;
  granularity: Granularity;
  keywords: string[];
}

export default class Rancher extends Component<RancherProps> {
  render() {
    return (
      <div className="rancher-breakdown">
        <InsightsChart range={this.props.range} granularity={this.props.granularity} clusterId={this.props.clusterId} insightsProvider={getRancherInsights} keywords={this.props.keywords} />
        <Basic type="rancher" breakdown={getGroupBreakdown(this.props.breakdown)} range={this.props.range} clusterId={this.props.clusterId} showNormalSparkline={false} showAnomaly={true} keywords={this.props.keywords} />
      </div>
    );
  }
}
