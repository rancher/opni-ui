import './style.scss';

import React, { Component } from 'react';
import {
  EuiBasicTable,
  EuiIcon,
  EuiPanel,
  EuiTitle,
  RIGHT_ALIGNMENT
} from '@elastic/eui';
import { DeploymentBreakdown } from '../../../../utils/requests';
import { Range } from '../../../../utils/time';
import { createBasicColumns } from '../utils';

export const NO_ITEMS_WORKLOAD_INSIGHTS_CONFIGURED="No items found. Make sure you have Opni's Deployments configured in order to see information here."
export type Group = { group?: true, name: string };
export type Item = DeploymentBreakdown | Group;

export interface Props {
  breakdown: Item[];
  range: Range;
  clusterId: string;
  keywords: string[];
  noItemsMessage?: string;
}

export interface State {
  itemIdToExpandedRowMap: any;
}

export default class Breakdown extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      itemIdToExpandedRowMap: {}
    };
  }
  render() {
    const toggle = (item) => {
      const itemIdToExpandedRowMap = this.state.itemIdToExpandedRowMap;
      if (itemIdToExpandedRowMap[item.id]) {
        delete itemIdToExpandedRowMap[item.id];
      } else {
        itemIdToExpandedRowMap[item.id] = (
          <EuiBasicTable
            className="pod-table"
            items={item.pods as any}
            columns={createNestedColumns(this.props.range, this.props.keywords)}
          />
        );
      }
      
      this.setState({itemIdToExpandedRowMap});
    };

    const isOpen = (item) => {
      return this.state.itemIdToExpandedRowMap[item.id];
    }

    const columns = createDeploymentsColumns(this.props.range, this.props.keywords, toggle, isOpen);
    const nestedBreakdown = createNestedBreakdown(this.props.breakdown);

    const clusters = Object.entries(nestedBreakdown).map(([clusterName, cluster], i) => {
      const items = Object.entries(cluster as any).flatMap(([namespaceName, namespace]) => {
        const name = `Namespace: ${namespaceName}`;
        return [{ group: true, name, id: name }, ...Object.values(namespace as any)];
      });

      return <EuiPanel className="cluster" key={i}>
        <EuiTitle size='xs'>
          <h4>Cluster: {clusterName}</h4>
        </EuiTitle>
        <EuiBasicTable
          isExpandable={true}
          itemId="id"
          items={items as any}
          columns={columns as any}
          rowProps={getRowProps}
          itemIdToExpandedRowMap={this.state.itemIdToExpandedRowMap}
        />
      </EuiPanel>;
    });

    const noItems = clusters.length === 0 ?  <div className='no-items'>{NO_ITEMS_WORKLOAD_INSIGHTS_CONFIGURED}</div> : null;

    return (
        <div className="deployment-breakdown">
          {clusters}
          {noItems}
        </div>
    );
  }
}

export function createDeploymentsColumns(range, keywords, toggle, isOpen) {
  return [
    ...createBasicColumns('deployment', range, true, keywords),
    {
      align: RIGHT_ALIGNMENT,
      isExpander: true,
      render: (item) => {
        return (<button onClick={() => toggle(item)} className="show-pods">
          <span>Pods</span>&nbsp;
          <EuiIcon type={isOpen(item) ? 'arrowUp' : 'arrowDown'}/>
        </button>)
      }
    },
  ];
}

export function createNestedColumns(range, keywords) {
  const columns: any[] = [
    ...createBasicColumns('pod', range, true, keywords),
    { render: () => <span /> },
  ];

  columns[0].render = (value) => {
    return <span>&nbsp;&nbsp;&nbsp; {value}</span>
  }

  columns.forEach((column: any) => {
    if (column.name) {
      delete column.name;
    }
  })

  return columns;
}


function getRowProps(item: Group) {
  return item.group ? { className: 'group' } : {};
}

function createNestedBreakdown(breakdown) {
  const lookup = {};

  breakdown.forEach((entry: any) => {
    lookup[entry.clusterName] = lookup[entry.clusterName] || {};
    lookup[entry.clusterName][entry.namespace] = lookup[entry.clusterName][entry.namespace] || {};
    lookup[entry.clusterName][entry.namespace][entry.deployment] = lookup[entry.clusterName][entry.namespace][entry.deployment] || {pods:[], anomaly: 0, suspicious: 0, normal: 0};

    lookup[entry.clusterName][entry.namespace][entry.deployment].id = `${entry.clusterId}:${entry.deployment}`;
    lookup[entry.clusterName][entry.namespace][entry.deployment].clusterId = entry.clusterId;
    lookup[entry.clusterName][entry.namespace][entry.deployment].name = entry.deployment;
    lookup[entry.clusterName][entry.namespace][entry.deployment].anomaly += entry.anomaly || 0;
    lookup[entry.clusterName][entry.namespace][entry.deployment].suspicious += entry.suspicious || 0;
    lookup[entry.clusterName][entry.namespace][entry.deployment].normal += entry.normal || 0;
    lookup[entry.clusterName][entry.namespace][entry.deployment].pods.push(entry);
  });

  return lookup;
}