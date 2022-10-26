import React, { Component } from 'react';
import { BasicBreakdown } from '../../../../utils/requests';
import Basic from '../Basic';
import { Range } from '../../../../utils/time';
import { getGroupBreakdown } from '../../../../utils/group';
import { NO_ITEMS_WORKLOAD_INSIGHTS_CONFIGURED } from '../Basic/Basic';

export interface NamespaceProps {
  breakdown: BasicBreakdown[];
  range: Range;
  clusterId: string;
  keywords: string[];
}

export default class Namespace extends Component<NamespaceProps> {
  render() {
    return (
        <Basic type="namespace"  breakdown={getGroupBreakdown(this.props.breakdown)} range={this.props.range} clusterId={this.props.clusterId} showAnomaly={true} keywords={this.props.keywords} noItemsMessage={NO_ITEMS_WORKLOAD_INSIGHTS_CONFIGURED} />
    );
  }
}
