import './style.scss';

import React, { Component } from 'react';
import {
  EuiSelect,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiSuperDatePicker
} from '@elastic/eui';
import { Settings } from '@elastic/charts';
import { Granularity } from '../../utils/time';

export interface Settings {
  range: {
    start: string;
    end: string;
  };
  granularity: Granularity;
  cluster: string;
}
export interface SelectorProps {
  settings: Settings;
  clusterIds: string[];
  onChange: (Settings) => void;
  onRefresh: () => void;
};

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
  range: {
    start: 'now-24h',
    end: 'now'
  },
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
    const { range, granularity, cluster } = this.props.settings;
    const clusterOptions = [...CLUSTER_OPTIONS, ...this.props.clusterIds.map(id => ({ value: id, text: id}))];
    const onTimeChange = (newRange) => {
      this.onChange('range')({start: newRange.start, end: newRange.end});
      setTimeout(() => this.props.onRefresh());
    };

    return (
      <EuiFlexGroup style={{ padding: '0 15px' }} className="selector" >
        <EuiFlexItem>
          <EuiFlexItem><EuiSelect options={clusterOptions} prepend="Cluster" value={cluster} onChange={this.onChange('cluster')} /></EuiFlexItem>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFlexGroup justifyContent="flexEnd" className="right">
            <EuiFlexItem><EuiSelect className="period" options={GRANULARITY_OPTIONS} prepend="Period" value={granularity} onChange={this.onChange('granularity')} /></EuiFlexItem>
            <EuiFlexItem>
            <EuiSuperDatePicker
              start={range.start}
              end={range.end}
              onTimeChange={onTimeChange}
            />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
