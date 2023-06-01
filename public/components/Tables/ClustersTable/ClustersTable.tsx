import './style.scss';

import React, { Component } from 'react';
import {
  EuiPanel,
  EuiBasicTable,
  EuiText,
  EuiSpacer,
  EuiHorizontalRule,
} from '@elastic/eui';

import Loading from '../../Loading';
import { getClusters, Cluster } from '../../../utils/requests';
import { isSameRange, Range } from '../../../utils/time';
import { Pagination } from '@elastic/eui/src/components/basic_table/pagination_bar';
import Bubble from '../../Bubble';
import { formatShort } from '../../../utils/format';
import { clusterUrl } from '../../../utils/discoverUrls';
import { sortBy } from 'lodash';


export interface ClustersTableProps {
  range: Range;
};

export interface ClustersTableState {
  clustersRequest: Promise<Cluster[]>;
  clusters: Cluster[];
  pagination: Pagination;
}

export default class EventsTable extends Component<ClustersTableProps, ClustersTableState> {
  constructor(props: ClustersTableProps) {
    super(props);

    this.state = {
      clustersRequest: new Promise(() => {}),
      clusters: [],
      pagination: {
        pageIndex: 0,
        pageSize: 50,
        totalItemCount: 0
      }
    };
  }

  load = async () => {
    const clustersRequest = getClusters(this.props.range);
    this.setState({
      clustersRequest: clustersRequest
    });

    const clusters = sortBy((await clustersRequest), ['anomaly', 'normal', 'raw']).reverse();

    this.setState({
      clusters,
      pagination: {
        ...this.state.pagination,
        totalItemCount: clusters.length
      } 
    });
  };

  componentDidMount(): void {
      this.load();
  }

  componentDidUpdate(prevProps: Readonly<ClustersTableProps>): void {
    if (!isSameRange(prevProps.range, this.props.range)) {
      this.load();
    }
  }

  render() {
    const range = this.props.range;

    const columns = [
      {
        field: 'name',
        name: 'Name',
        width: '250',
      },
      {
        field: 'id',
        name: 'Id',
      },
      {
        field: 'anomaly',
        name: 'Anomaly',
        width: '125',
        render: (count, row) => {
          const clusterId = row.id;
          const url = clusterUrl(range, clusterId, 'Anomaly');
          return <a href={url} target="_blank"><Bubble severity="anomaly">{formatShort(count)}</Bubble></a>;
        }
      },
      {
        field: 'normal',
        name: 'Normal',
        width: '125',
        render: (count, row) => {
          const clusterId = row.id;
          const url = clusterUrl(range, clusterId, 'Normal');
          return <a href={url} target="_blank"><Bubble severity="normal">{formatShort(count)}</Bubble></a>;
        }
      },
      {
        field: 'raw',
        name: 'Raw',
        width: '125',
        render: (count, row) => {
          const clusterId = row.id;
          const url = clusterUrl(range, clusterId);
          return <a href={url} target="_blank"><Bubble severity="neutral">{formatShort(count)}</Bubble></a>;
        }
      }        
    ];



    const onChange = ({page = {} as any}) => {
      this.setState({
        pagination: {
          pageIndex: page.index,
          pageSize: page.size,
          totalItemCount: this.state.pagination.totalItemCount
        }
      })
    };

    const getPagedTemplates = () => {
      const start = this.state.pagination.pageIndex * this.state.pagination.pageSize;
      const end = start + this.state.pagination.pageSize;
      return this.state.clusters.slice(start, end);
    };

    const resultsCount =
    this.state.pagination.pageSize === 0 ? (
      <strong>All</strong>
    ) : (
      <>
        <strong>
          {this.state.pagination.pageSize * this.state.pagination.pageIndex + 1}-{Math.min(this.state.pagination.pageSize * this.state.pagination.pageIndex + this.state.pagination.pageSize, this.state.pagination.totalItemCount)}
        </strong>{' '}
        of {this.state.pagination.totalItemCount}
      </>
    );

    return (
      <div className="clusters-table" style={{ padding: '15px 15px', paddingTop: 0 }}>
          <EuiPanel>
            <Loading promise={this.state.clustersRequest}>
              <div>
                <div>
                  <EuiText size="xs">
                    Showing {resultsCount} <strong>Clusters</strong>
                  </EuiText>
                </div>
                <div>
                  <EuiSpacer size="s" />
                  <EuiHorizontalRule margin="none" style={{ height: 1 }} />
                  <EuiSpacer size="s" />
                </div>
                <div>
                  <EuiBasicTable
                    pagination={this.state.pagination}
                    items={getPagedTemplates()}
                    columns={columns}
                    onChange={onChange}
                  />
                </div>
              </div>
            </Loading>
          </EuiPanel>
        </div>
    );
  }
}
