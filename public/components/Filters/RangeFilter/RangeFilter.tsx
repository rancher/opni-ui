import './style.scss';

import React, { Component } from 'react';
import {
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
}
export interface SelectorProps {
  settings: Settings;
  onChange: (Settings) => void;
  onRefresh: () => void;
};

export const DEFAULT_SETTINGS: Settings = {
  range: {
    start: 'now-24h',
    end: 'now'
  }
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
    const { range } = this.props.settings;
    const onTimeChange = (newRange) => {
      this.onChange('range')({start: newRange.start, end: (newRange.end.includes('now') ? 'now' : newRange.end) });
      setTimeout(() => this.props.onRefresh());
    };
    return (
      <div className="range-filter">
        <EuiPanel>
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiFlexGroup style={{ padding: '0 15px' }}>
                <EuiFlexItem>
                  <EuiFlexGroup justifyContent="spaceEvenly" className="right">
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
