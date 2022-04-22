import './style.scss';

import React, { Component } from 'react';
import {
  EuiSelect,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { Settings } from '@elastic/charts';
import { Granularity } from '../../utils/time';

export interface Settings {
  refresh: number;
  range: number;
  granularity: Granularity;
  cluster: string;
}
export interface SelectorProps {
  settings: Settings;
  clusterIds: string[];
  onChange: (Settings) => void;
};

export const REFRESH_OPTIONS = [
  {
    value: 30000, //ms
    text: '30s'
  },
  {
    value: 60000, //ms
    text: '1m'
  },
  {
    value: 1800000, //ms
    text: '30m'
  }
];

const RANGE_OPTIONS = [
  {
    value: 86400000, //ms
    text: '24h'
  },
  {
    value: 43200000, //ms
    text: '12h'
  },
  {
    value: 3600000, //ms
    text: '1h'
  }
];

const GRANULARITY_OPTIONS: {text: string, value: Granularity}[] = [
  {
    value: '1h',
    text: '1h'
  },
  {
    value: '30m',
    text: '30m'
  },
  {
    value: '10m',
    text: '10m'
  }
];

const CLUSTER_OPTIONS = [
  {
    value: 'all',
    text: 'All Clusters'
  }
];

export const DEFAULT_SETTINGS: Settings = {
  refresh: REFRESH_OPTIONS[0].value,
  range: RANGE_OPTIONS[0].value,
  granularity: GRANULARITY_OPTIONS[0].value,
  cluster: CLUSTER_OPTIONS[0].value
};

export default class Selector extends Component<SelectorProps> {
  onChange = (field: keyof Settings, type: 'string' | 'number' = 'string') => {
    return (ev) => {
      this.props.onChange({
        ...this.props.settings,
        [field]: type === 'string' ? (ev?.target?.value || ev) : Number.parseInt(`${ev?.target?.value || ev}`)
      })
    };
  };

  render() {
    const { refresh, range, granularity, cluster } = this.props.settings;
    const clusterOptions = [...CLUSTER_OPTIONS, ...this.props.clusterIds.map(id => ({ value: id, text: id}))];
    return (
      <EuiFlexGroup style={{ padding: '0 15px' }} className="selector" justifyContent="spaceBetween">
        <EuiFlexItem>
          <EuiFlexItem><EuiSelect options={clusterOptions} prepend="Cluster" value={cluster} onChange={this.onChange('cluster')} /></EuiFlexItem>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFlexGroup justifyContent="flexEnd" className="right">
            <EuiFlexItem><EuiSelect options={REFRESH_OPTIONS} prepend="Refresh" value={refresh} onChange={this.onChange('refresh', 'number')} /></EuiFlexItem>
            <EuiFlexItem><EuiSelect options={RANGE_OPTIONS} prepend="Range" value={range} onChange={this.onChange('range', 'number')} /></EuiFlexItem>
            <EuiFlexItem><EuiSelect options={GRANULARITY_OPTIONS} prepend="Period" value={granularity} onChange={this.onChange('granularity')} /></EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
