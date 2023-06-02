import './style.scss';

import React, { Component } from 'react';
import {
  EuiBasicTable
} from '@elastic/eui';
import { BasicBreakdown } from '../../../../utils/requests';
import { Range } from '../../../../utils/time';
import { createBasicColumns } from '../utils';

export const NO_ITEMS_WORKLOAD_INSIGHTS_CONFIGURED="No items found. Make sure you have Opni's Deployments configured in order to see information here."


function getRowProps(item: Group) {
  return item.group ? { className: 'group' } : {};
}

export type Group = { group?: true, name: string };
export type Item = BasicBreakdown | Group;

export interface BreakdownProps {
  type: string;
  breakdown: Item[];
  range: Range;
  clusterId: string;
  showAnomaly: boolean;
  keywords: string[];
  noItemsMessage?: string;
}

export default class Breakdown extends Component<BreakdownProps> {
  render() {
    const columns = createBasicColumns(this.props.type, this.props.range, this.props.showAnomaly, this.props.keywords);

    return (
        <div className="basic-breakdown">
          <EuiBasicTable
            tableCaption={this.props.type}
            items={this.props.breakdown}
            columns={columns}
            rowProps={getRowProps}
            noItemsMessage={this.props.noItemsMessage}
          />
        </div>
    );
  }
}
