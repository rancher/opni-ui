import './style.scss';

import React, { Component } from 'react';
import {
  EuiPanel,
  EuiBasicTable,
  EuiIcon,
  EuiToolTip
} from '@elastic/eui';

import Loading from '../Loading';
import { getK8sEvents, K8SEvent } from '../../utils/requests';
import { isSameRange, Range } from '../../utils/time';
import moment from 'moment';
import { Pagination } from '@elastic/eui/src/components/basic_table/pagination_bar';


export interface EventsTableProps {
  range: Range;
  clusterId: string;
};

export interface EventsTableState {
  eventsRequest: Promise<K8SEvent[]>;
  events: K8SEvent[];
  pagination: Pagination;
}

export default class EventsTable extends Component<EventsTableProps, EventsTableState> {
  constructor(props: EventsTableProps) {
    super(props);

    this.state = {
      eventsRequest: new Promise(() => {}),
      events: [],
      pagination: {
        pageIndex: 0,
        pageSize: 50,
        totalItemCount: 0
      }
    };
  }

  load = async () => {
    const eventsRequest = getK8sEvents(this.props.range, this.props.clusterId);
    this.setState({
      eventsRequest
    });

    const events = await eventsRequest;
    this.setState({
      events,
      pagination: {
        ...this.state.pagination,
        totalItemCount: events.length
      } 
    });
  };

  componentDidMount(): void {
      this.load();
  }

  componentDidUpdate(prevProps: Readonly<EventsTableProps>): void {
    if (!isSameRange(prevProps.range, this.props.range) || this.props.clusterId !== prevProps.clusterId) {
      this.load();
    }
  }

  render() {
    const columns = [
      {
        field: 'type',
        width: '30px',
        render: (value) => <EuiToolTip position="top" content={value}><span className={`circle ${value}`}>&nbsp;</span></EuiToolTip>
      },
      {
        field: 'cause',
        name: 'Cause',
        width: '195px'
      },
      {
        field: 'timestamp',
        name: 'Time',
        width: '200px',
        render: (value) => moment(value).format('MM-DD-YY HH:MM:SS.SSS')
      },
      {
        field: 'source',
        name: 'Source',
        width: '300px'
      },
      {
        field: 'summary',
        name: 'Summary',
      }      
    ];



    const onChange = () => {};

    const getPagedEvents = () => {
      return this.state.events.slice(this.state.pagination.pageIndex * this.state.pagination.pageSize, this.state.pagination.pageSize);
    };

    return (
      <div className="events-table" style={{ padding: '15px 15px', paddingTop: 0 }}>
          <EuiPanel>
            <Loading promise={this.state.eventsRequest}>
              <EuiBasicTable
                pagination={this.state.pagination}
                items={getPagedEvents()}
                columns={columns}
                onChange={onChange}
              />
            </Loading>
          </EuiPanel>
        </div>
    );
  }
}
