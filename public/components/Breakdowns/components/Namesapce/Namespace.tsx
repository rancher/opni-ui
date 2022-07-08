import React, { Component } from 'react';
import { BasicBreakdown } from '../../../../utils/requests';
import Basic from '../Basic';
import { Range } from '../../../../utils/time';
import { getGroupBreakdown } from '../../../../utils/group';

export interface NamespaceProps {
  breakdown: BasicBreakdown[];
  range: Range;
  clusterId: string;
  keywords: string[];
}

export default class Namespace extends Component<NamespaceProps> {
  render() {
    return (
        <Basic type="namespace"  breakdown={getGroupBreakdown(this.props.breakdown)} range={this.props.range} clusterId={this.props.clusterId} showNormalSparkline={true} showAnomaly={false} keywords={this.props.keywords} />
    );
  }
}
