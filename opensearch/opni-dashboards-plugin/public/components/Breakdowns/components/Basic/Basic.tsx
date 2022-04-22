import './style.scss';

import React, { Component, Fragment, createRef } from 'react';
import {
  EuiBasicTable
} from '@elastic/eui';
import Bubble from '../../../Bubble';
import { sortBy } from 'lodash';
import { BasicBreakdown } from '../../../../utils/requests';
import { formatShort } from '../../../../utils/format';
import { Range } from '../../../../utils/time';

export function createColumns(type, range, clusterId) {
  const getQuery = (row) => {
    const from = range.start.format();
    const to = range.end.format();
    const value = row.name;
    switch (type) {
      case 'pod':
        return `_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:'${from}',to:'${to}'))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,key:kubernetes.pod_name,negate:!f,params:(query:${value}),type:phrase),query:(match_phrase:(kubernetes.pod_name:${value}))),('$state':(store:appState),meta:(alias:!n,disabled:!f,key:cluster_id.keyword,negate:!f,params:(query:'${clusterId}'),type:phrase),query:(match_phrase:(cluster_id.keyword:'${clusterId}'))),('$state':(store:appState),meta:(alias:!n,disabled:!f,key:anomaly_level.keyword,negate:!f,params:(query:Anomaly),type:phrase),query:(match_phrase:(anomaly_level.keyword:Anomaly)))),interval:auto,query:(language:kuery,query:''),sort:!())`;
      case 'controlPlane':
        return `_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:'${from}',to:'${to}'))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,key:is_control_plane_log,negate:!f,params:(query:!t),type:phrase),query:(match_phrase:(is_control_plane_log:!t))),('$state':(store:appState),meta:(alias:!n,disabled:!f,key:kubernetes_component,negate:!f,params:(query:${value}),type:phrase),query:(match_phrase:(kubernetes_component:${value}))),('$state':(store:appState),meta:(alias:!n,disabled:!f,key:anomaly_level.keyword,negate:!f,params:(query:Anomaly),type:phrase),query:(match_phrase:(anomaly_level.keyword:Anomaly))),('$state':(store:appState),meta:(alias:!n,disabled:!f,key:cluster_id.keyword,negate:!f,params:(query:'${clusterId}'),type:phrase),query:(match_phrase:(cluster_id.keyword:'${clusterId}')))),interval:auto,query:(language:kuery,query:''),sort:!())`;
      case 'namespace':
        return `_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:'${from}',to:'${to}'))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,key:kubernetes.namespace_name,negate:!f,params:(query:${value}),type:phrase),query:(match_phrase:(kubernetes.namespace_name:${value}))),('$state':(store:appState),meta:(alias:!n,disabled:!f,key:cluster_id.keyword,negate:!f,params:(query:'${clusterId}'),type:phrase),query:(match_phrase:(cluster_id.keyword:'${clusterId}'))),('$state':(store:appState),meta:(alias:!n,disabled:!f,key:anomaly_level.keyword,negate:!f,params:(query:Anomaly),type:phrase),query:(match_phrase:(anomaly_level.keyword:Anomaly)))),interval:auto,query:(language:kuery,query:''),sort:!())`;
      default:
        return '';
      }
  };

  const getUrl = (row) => {
    const appPrefix = location.pathname.match(/.*\/app\//)[0];
    const query = getQuery(row);
    return `${appPrefix}discover#/?${query}`;
  };

  return [
    {
      field: 'name',
      name: 'Name',
    },
    {
      field: 'anomaly',
      name: 'Anomaly',
      render: (count, row) => <a href={getUrl(row)} target="_blank"><Bubble severity="anomaly">{formatShort(count)}</Bubble></a>
    },
    {
      field: 'normal',
      name: 'Normal',
      render: (count, row) => <span>{formatShort(count)}</span>
    }
  ];
}

export interface BreakdownProps {
  type: string;
  breakdown: BasicBreakdown[];
  range: Range;
  clusterId: string;
}

export default class Breakdown extends Component<BreakdownProps> {
  render() {
    const columns = createColumns(this.props.type, this.props.range, this.props.clusterId);
    const sorted = sortBy(this.props.breakdown, ['anomaly', 'normal']).reverse();

    return (
        <div className="basic-breakdown">
          <EuiBasicTable
            tableCaption={this.props.type}
            items={sorted}
            columns={columns}
          />
        </div>
    );
  }
}
