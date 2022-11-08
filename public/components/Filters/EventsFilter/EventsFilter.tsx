import './style.scss';

import React, { Component } from 'react';
import {
  EuiButtonIcon,
  EuiSelect,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSuperDatePicker
} from '@elastic/eui';
import { Settings } from '@elastic/charts';

export interface Settings {
  range: {
    start: string;
    end: string;
  };
  cluster: string;
}
export interface SelectorProps {
  settings: Settings;
  clusterIds: string[];
  onChange: (Settings) => void;
  onRefresh: () => void;
};

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
  cluster: CLUSTER_OPTIONS[0].value,
};

export default class Selector extends Component<SelectorProps> {
  constructor(props: SelectorProps) {
    super(props);
  }

  onChange = (field: keyof Settings, type: 'string' | 'number' | 'array' = 'string') => {
    return (ev) => {
      this.props.onChange({
        ...this.props.settings,
        [field]: type !== 'number' ? (ev?.target?.value || ev) : Number.parseInt(`${ev?.target?.value || ev}`)
      })
    };
  };

  render() {
    const { range, cluster } = this.props.settings;
    const clusterOptions = [...CLUSTER_OPTIONS, ...this.props.clusterIds.map(id => ({ value: id, text: id}))];
    const onTimeChange = (newRange) => {
      this.onChange('range')({start: newRange.start, end: (newRange.end.includes('now') ? 'now' : newRange.end) });
      setTimeout(() => this.props.onRefresh());
    };
    return (
      <div className="events-filter">
        <EuiPanel>
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiFlexGroup style={{ padding: '0 15px' }}>
                <EuiFlexItem>
                  <EuiFlexItem><EuiSelect options={clusterOptions} prepend="Cluster" value={cluster} onChange={this.onChange('cluster')} /></EuiFlexItem>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFlexGroup justifyContent="flexEnd" className="right">
                    <EuiFlexItem>
                      <EuiSuperDatePicker
                        className="date-picker"
                        start={range.start}
                        end={range.end}
                        onTimeChange={onTimeChange}
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </div>
    );
  }
}
