import React from 'react';
import { Range } from '../../../utils/time';
import Bubble from '../../Bubble';
import { formatShort } from '../../../utils/format';

export type LogType = 'pod' | 'controlPlane' | 'namespace' | 'rancher' | 'longhorn' | 'deployment';
export type Severity = 'Anomaly' | 'Normal' | 'Keyword'

function getQuery(type: LogType, range: Range, keywords: string[], severity: Severity, name: string, clusterId: string) {
    const from = range.start.format();
    const to = range.end.format();
    const value = name;
    const query = keywords.length > 0 && severity === 'Keyword'
      ? `query:(language:kuery,query:'${keywords.map(k => `log: "${k}"`).join(' or ')}')`
      : `query:(language:kuery,query:'')`;
    const severityQuery = severity !== 'Keyword'
      ? `,('$state':(store:appState),meta:(alias:!n,disabled:!f,key:anomaly_level,negate:!f,params:(query:${severity}),type:phrase),query:(match_phrase:(anomaly_level:${severity})))`
      : ``

    const clusterQuery = clusterId !== 'all' ? `,('$state':(store:appState),meta:(alias:!n,disabled:!f,key:cluster_id,negate:!f,params:(query:'${clusterId}'),type:phrase),query:(match_phrase:(cluster_id:'${clusterId}')))` : '';
    switch (type) {
      case 'pod':
        return `_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:'${from}',to:'${to}'))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,key:pod_name,negate:!f,params:(query:${value}),type:phrase),query:(match_phrase:(pod_name:${value})))${clusterQuery}${severityQuery}),interval:auto,${query},sort:!())`;
      case 'deployment':
          return `_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:'${from}',to:'${to}'))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,key:deployment,negate:!f,params:(query:${value}),type:phrase),query:(match_phrase:(deployment:${value})))${clusterQuery}${severityQuery}),interval:auto,${query},sort:!())`;
      case 'controlPlane':
        return `_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:'${from}',to:'${to}'))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,key:log_type,negate:!f,params:(query:controlplane),type:phrase),query:(match_phrase:(log_type:controlplane)))${clusterQuery},('$state':(store:appState),meta:(alias:!n,disabled:!f,key:kubernetes_component,negate:!f,params:(query:${value}),type:phrase),query:(match_phrase:(kubernetes_component:${value})))${severityQuery}),interval:auto,${query},sort:!())`;
      case 'namespace':
        return `_g=(filters:(),refreshInterval:(pause:!t,value:0),time:(from:'${from}',to:'${to}'))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,key:namespace_name,negate:!f,params:(query:${value}),type:phrase),query:(match_phrase:(namespace_name:${value})))${clusterQuery}${severityQuery}),interval:auto,${query},sort:!())`;
      case 'rancher':
        return `_g=(filters:(),refreshInterval:(pause:!t,value:0),time:(from:'${from}',to:'${to}'))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,key:log_type,negate:!f,params:(query:rancher),type:phrase),query:(match_phrase:(log_type:rancher))),('$state':(store:appState),meta:(alias:!n,disabled:!f,key:pod_name,negate:!f,params:(query:${value}),type:phrase),query:(match_phrase:(pod_name:${value})))${clusterQuery}${severityQuery}),interval:auto,${query},sort:!())`;
      case 'longhorn':
        return `_g=(filters:(),refreshInterval:(pause:!t,value:0),time:(from:'${from}',to:'${to}'))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,key:log_type,negate:!f,params:(query:longhorn),type:phrase),query:(match_phrase:(log_type:longhorn))),('$state':(store:appState),meta:(alias:!n,disabled:!f,key:pod_name,negate:!f,params:(query:${value}),type:phrase),query:(match_phrase:(pod_name:${value})))${clusterQuery}${severityQuery}),interval:auto,${query},sort:!())`;
      default:
        return '';
    }
}

export function getUrl(type: LogType, range: Range, keywords: string[], severity: Severity, name: string, clusterId: string) {
    const appPrefix = (location as any)?.pathname.match(/.*\/app\//)[0];
    const query = getQuery(type, range, keywords, severity, name, clusterId);
    return `${appPrefix}discover#/?${query}`;
};

export function getPercentage(count: number, anomaly: number, normal: number) {
    const total = anomaly + normal;
  
    return <span className="percent">
      - ({`${((count * 100 / total) || 0).toFixed(1)}%`})
    </span>;
}

export function createBubbleColumn(type: LogType, range: Range, keywords: string[], severity: Severity) {
  return {
    field: severity.toLowerCase(),
    name: severity,
    render: (count, item) => {
      const url = getUrl(type, range, keywords, severity, item.name, item.clusterId);
      const percentage = getPercentage(count, item.anomaly, item.normal);
      return <a href={url} target="_blank"><Bubble severity={severity === 'Keyword' ? 'suspicious' : severity.toLowerCase()}>{formatShort(count)}</Bubble> {percentage}</a>
    }
  };
}

export function createBasicColumns(type: LogType, range, showAnomaly, keywords) {
  const anomalyColumn = showAnomaly ? [createBubbleColumn(type, range, keywords, 'Anomaly')]: [];
  const keywordsColumn = keywords.length > 0 ? [createBubbleColumn(type, range, keywords, 'Keyword')]: [];

  return [
    {
      field: 'name',
      name: 'Name',
      width: '400px'
    },
    ...anomalyColumn,
    ...keywordsColumn,
    createBubbleColumn(type, range, keywords, 'Normal')
  ];
}