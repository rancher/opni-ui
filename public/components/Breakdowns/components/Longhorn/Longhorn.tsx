import './style.scss';
import React, { Component } from 'react';
import { BasicBreakdown, getLonghornInsights } from '../../../../utils/requests';
import Basic from '../Basic';
import { Granularity, Range } from '../../../../utils/time';
import InsightsChart from '../../../InsightsChart';
import { getGroupBreakdown } from '../../../../utils/group';

export interface RancherProps {
  breakdown: BasicBreakdown[];
  range: Range;
  clusterId: string;
  granularity: Granularity;
  keywords: string[];
}

export default class Longhorn extends Component<RancherProps> {
  render() {
    return (
      <div className="longhorn-breakdown">
        <InsightsChart range={this.props.range} granularity={this.props.granularity} clusterId={this.props.clusterId} insightsProvider={getLonghornInsights} keywords={this.props.keywords} />
        <Basic type="longhorn" breakdown={getGroupBreakdown(this.props.breakdown)} range={this.props.range} clusterId={this.props.clusterId} showNormalSparkline={false} showAnomaly={true} keywords={this.props.keywords} />
      </div>
    );
  }
}
