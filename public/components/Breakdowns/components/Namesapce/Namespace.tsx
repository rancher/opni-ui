import React, { Component } from 'react';
import { BasicBreakdown } from '../../../../utils/requests';
import Basic from '../Basic';
import { Range } from '../../../../utils/time';

export interface NamespaceProps {
  breakdown: BasicBreakdown[];
  range: Range;
  clusterId: string;
}

export default class Namespace extends Component<NamespaceProps> {
  render() {
    return (
        <Basic type="namespace"  breakdown={this.props.breakdown} range={this.props.range} clusterId={this.props.clusterId} showNormalSparkline={true} showAnomaly={false} />
    );
  }
}
