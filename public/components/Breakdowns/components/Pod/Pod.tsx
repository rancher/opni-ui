import React, { Component } from 'react';
import { BasicBreakdown } from '../../../../utils/requests';
import Basic from '../Basic';
import { Range } from '../../../../utils/time';
import { getGroupBreakdown } from '../../../../utils/group';

export interface PodProps {
  breakdown: BasicBreakdown[];
  range: Range;
  clusterId: string;
}


export default class Pod extends Component<PodProps> {
  render() {
    return (
        <Basic type="pod"  breakdown={getGroupBreakdown(this.props.breakdown)} range={this.props.range} clusterId={this.props.clusterId} showNormalSparkline={true} showAnomaly={false} />
    );
  }
}
