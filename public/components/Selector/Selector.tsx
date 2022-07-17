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
import { Granularity } from '../../utils/time';
import Keywords from '../Keywords';

export interface Settings {
  range: {
    start: string;
    end: string;
  };
  granularity: Granularity;
  cluster: string;
  keywords: string[];
}
export interface SelectorProps {
  settings: Settings;
  clusterIds: string[];
  onChange: (Settings) => void;
  onRefresh: () => void;
};

export interface SelectorState {
  showMoreFilters: boolean;
  keyword: string;
  keywords: string[];
  editingKeyword: boolean;
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
  cluster: CLUSTER_OPTIONS[0].value,
  keywords: []
};

export default class Selector extends Component<SelectorProps, SelectorState> {
  constructor(props: SelectorProps) {
    super(props);

    this.state = {
      showMoreFilters: props.settings.keywords.length > 0,
      editingKeyword: false,
      keyword: '',
      keywords: []
    };
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
    const { range, granularity, cluster, keywords } = this.props.settings;
    const clusterOptions = [...CLUSTER_OPTIONS, ...this.props.clusterIds.map(id => ({ value: id, text: id}))];
    const onTimeChange = (newRange) => {
      this.onChange('range')({start: newRange.start, end: newRange.end});
      setTimeout(() => this.props.onRefresh());
    };


    const moreFilters = this.state.showMoreFilters 
      ? <EuiFlexItem>
          <EuiFlexGroup direction="row" style={{ padding: '0 15px' }}>
            <EuiFlexItem className="more-filters">
              <Keywords value={keywords} onChange={this.onChange('keywords', 'array')} />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      : null;
    const toggleMoreFilters = () => {
      this.setState({showMoreFilters: !this.state.showMoreFilters});
    };
    const moreFiltersButtonLabel = this.state.showMoreFilters ? 'Less Filters' : 'More Filters';

    return (
      <div className="selector">
        <EuiPanel>
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiFlexGroup style={{ padding: '0 15px' }}>
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
            </EuiFlexItem>
            {moreFilters}
            <EuiFlexItem className="more-filters-button">
                <div className="handle" onClick={toggleMoreFilters}>{moreFiltersButtonLabel}</div>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </div>
    );
  }
}
