import './style.scss';

import React, { Component } from 'react';
import {
  EuiPanel,
} from '@elastic/eui';
import {
  Chart,
  Settings,
  LineSeries,
  Axis,
  
} from '@elastic/charts';

export interface SparkLineProps {
  data: number[];
  yMax: number;
};

export default class InsightsChart extends Component<SparkLineProps> {
  render() {
    const xy = this.props.data.map((y, x) => ({x, y}));
    return (
      <Chart className="spark-line" size={[50, 30]}>
          <Settings tooltip={{customTooltip: () => <span></span>}}/>
          <Axis
            id="left"
            hide={true}
            domain={{min: 0, max: this.props.yMax}}
          />
          <LineSeries id="spark-line" data={xy} xAccessor="x" yAccessors={['y']} lineSeriesStyle={{ point: { visible: false } }} color="#3d98d3" />
      </Chart>
    );
  }
}
