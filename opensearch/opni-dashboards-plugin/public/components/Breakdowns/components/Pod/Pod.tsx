import React, { Component } from 'react';
import { BasicBreakdown } from '../../../../utils/requests';
import Basic from '../Basic';
import { Range } from '../../../../utils/time';

export interface PodProps {
  breakdown: BasicBreakdown[];
  range: Range;
  clusterId: string;
}


export default class Pod extends Component<PodProps> {
  render() {
    return (
        <Basic type="pod" breakdown={this.props.breakdown} range={this.props.range} clusterId={this.props.clusterId} />
    );
  }
}
