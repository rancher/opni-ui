import './style.scss';

import React, { Component } from 'react';
import {
  EuiPanel,
  EuiBasicTable,
  EuiText,
  EuiSpacer,
  EuiHorizontalRule,
} from '@elastic/eui';

import Loading from '../Loading';
import { getLogTemplates, LogTemplate } from '../../utils/requests';
import { isSameRange, Range } from '../../utils/time';
import { Pagination } from '@elastic/eui/src/components/basic_table/pagination_bar';
import Bubble from '../Bubble';
import { formatShort } from '../../utils/format';


export interface TemplatesTableProps {
  range: Range;
  clusterId: string;
};

export interface Row extends LogTemplate {
  id: number;
}

export interface TemplatesTableState {
  templatesRequest: Promise<LogTemplate[]>;
  templates: Row[];
  pagination: Pagination;
}

export default class EventsTable extends Component<TemplatesTableProps, TemplatesTableState> {
  constructor(props: TemplatesTableProps) {
    super(props);

    this.state = {
      templatesRequest: new Promise(() => {}),
      templates: [],
      pagination: {
        pageIndex: 0,
        pageSize: 50,
        totalItemCount: 0
      }
    };
  }

  load = async () => {
    const templatesRequest = getLogTemplates(this.props.range, this.props.clusterId);
    this.setState({
      templatesRequest
    });

    const templates = (await templatesRequest)
      .map((template, i) => ({...template, id: i}));

    console.log(templates.length, templates);

    this.setState({
      templates,
      pagination: {
        ...this.state.pagination,
        totalItemCount: templates.length
      } 
    });
  };

  componentDidMount(): void {
      this.load();
  }

  componentDidUpdate(prevProps: Readonly<TemplatesTableProps>): void {
    if (!isSameRange(prevProps.range, this.props.range) || this.props.clusterId !== prevProps.clusterId) {
      this.load();
    }
  }

  render() {
    const range = this.props.range;
    const from = range.start.format();
    const to = range.end.format();
    const clusterId = this.props.clusterId;

    const columns = [
      {
        field: 'template',
        name: 'Template',
      },
      {
        field: 'count',
        name: 'Count',
        width: '100',
        render: (count, row) => {
          const templateId = row.templateId;
          const clusterQuery = clusterId !== 'all' ? `,('$state':(store:appState),meta:(alias:!n,disabled:!f,key:cluster_id,negate:!f,params:(query:'${clusterId}'),type:phrase),query:(match_phrase:(cluster_id:'${clusterId}')))` : '';
          const query = `_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:'${from}',to:'${to}'))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,key:template_cluster_id,negate:!f,params:(query:'${templateId}'),type:phrase),query:(match_phrase:(template_cluster_id:'${templateId}')))${clusterQuery}),interval:auto,query:(language:kuery,query:''),sort:!())`;
          const appPrefix = (location as any)?.pathname.match(/.*\/app\//)[0];
          const url = `${appPrefix}discover#/?${query}`;
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
      return this.state.templates.slice(start, end);
    };

    const itemIdToExpandedRowMap = this.state.templates.reduce((agg, template) => {
      agg[template.id] = <span className="sample">"{template.log}"</span>;
      return agg;
    }, {});

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
      <div className="events-table" style={{ padding: '15px 15px', paddingTop: 0 }}>
          <EuiPanel>
            <Loading promise={this.state.templatesRequest}>
              <div>
                <div>
                  <EuiText size="xs">
                    Showing {resultsCount} <strong>Log Templates</strong>
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
                    itemIdToExpandedRowMap={itemIdToExpandedRowMap}
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
