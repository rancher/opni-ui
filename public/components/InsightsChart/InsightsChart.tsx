import './style.scss';

import React, { Component } from 'react';
import {
  EuiPanel,
} from '@elastic/eui';
import {
  Chart,
  Settings,
  Axis,
  AreaSeries,
  
} from '@elastic/charts';
import { COLORS } from '../../utils/colors';
import moment from 'moment';
import { Insight } from '../../utils/requests';
import Loading from '../Loading/Loading';
import { Granularity, isSameRange, Range } from '../../utils/time';
import { formatShort } from '../../utils/format';

export interface InsightsChartProps {
  range: Range;
  granularity: Granularity; 
  clusterId: string;
  insightsProvider(range: Range, granularity: Granularity, clusterId: string): Promise<Insight[]>;
};

export interface InsightsChartState {
  insightsRequest: Promise<Insight[]>;
  insights: Insight[];
};

export default class InsightsChart extends Component<InsightsChartProps, InsightsChartState> {
  constructor(props) {
    super(props);

    this.state = {
      insightsRequest: new Promise<Insight[]>(() => {}),
      insights: []
    };
  }

  componentDidMount(): void {
    this.load();
  }

  componentDidUpdate(prevProps: Readonly<InsightsChartProps>): void {
    if (this.props.granularity !== prevProps.granularity || !isSameRange(this.props.range, prevProps.range) || this.props.clusterId !== prevProps.clusterId) {
      this.load();
    }
  }

  load = async () => {
    const insightsRequest = this.props.insightsProvider(this.props.range, this.props.granularity, this.props.clusterId);
    this.setState({
      insightsRequest
    });

    this.setState({
      insights: await insightsRequest
    });
  };

  render() {
    function xFormat(ms) {
      return moment(ms).format('HH:MM');
    }

    return (
        <div className="insights-chart">
          <EuiPanel>
              <Loading promise={this.state.insightsRequest}>
                  <Chart size={{ height: 300 }}>
                      <Settings showLegend={true} legendPosition="bottom" tooltip={{headerFormatter: (data) => xFormat(data.value)}}/>
                      <AreaSeries
                          id="anomalous"
                          name="Anomalous"
                          groupId="left"
                          data={this.state.insights}
                          xAccessor={'timestamp'}
                          yAccessors={['anomaly']}
                          color={COLORS.anomalous}
                      />
                      <AreaSeries
                          id="normal"
                          name="Normal"
                          groupId="right"
                          data={this.state.insights}
                          xAccessor={'timestamp'}
                          yAccessors={['normal']}
                          color={COLORS.normal}
                      />
                      <Axis id="bottom-axis" position="bottom" showGridLines tickFormat={xFormat} />
                      <Axis
                          id="left-axis"
                          position="left"
                          groupId="left"
                          showGridLines
                          tickFormat={(n) => formatShort(n)}
                      />
                      <Axis
                          id="right-axis"
                          position="right"
                          groupId="right"
                          tickFormat={(n) => formatShort(n)}
                      />
                  </Chart>
                </Loading>
            </EuiPanel>
        </div>
    );
  }
}
