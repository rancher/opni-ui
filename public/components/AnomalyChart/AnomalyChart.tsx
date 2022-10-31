import './style.scss';

import React, { Component } from 'react';
import {
  EuiPanel,
} from '@elastic/eui';
import {
  Chart,
  Settings,
  Axis,
  BarSeries,
  
} from '@elastic/charts';
import moment from 'moment';
import { getAnomalies, AnomalyByComponent } from '../../utils/requests';
import Loading from '../Loading/Loading';
import { Granularity, isSameRange, Range } from '../../utils/time';
import { formatShort } from '../../utils/format';

export interface AnomalyChartProps {
  range: Range; 
  granularity: Granularity;
  clusterId: string;
};

export interface AnomalyChartState {
  anomalyRequest: Promise<AnomalyByComponent>;
  anomalies: AnomalyByComponent;
};

export default class InsightsChart extends Component<AnomalyChartProps, AnomalyChartState> {
  constructor(props) {
    super(props);

    this.state = {
      anomalyRequest: new Promise<AnomalyByComponent>(() => {}),
      anomalies: {}
    };
  }

  componentDidMount(): void {
      this.load();
  }

  componentDidUpdate(prevProps: Readonly<AnomalyChartProps>): void {
      if (this.props.granularity !== prevProps.granularity || !isSameRange(this.props.range, prevProps.range) || this.props.clusterId !== prevProps.clusterId) {
        this.load();
      }
  }

  load = async () => {
    const anomalyRequest = getAnomalies(this.props.range, this.props.granularity, this.props.clusterId);
    this.setState({
      anomalyRequest
    });

    this.setState({
      anomalies: await anomalyRequest
    });
  };

  render() {
    function xFormat(ms) {
      return moment(ms).format('HH:mm');
    }

    const getBars = () => {
      const bars = Object.entries(this.state.anomalies).map(([component, anomalies]) => {
        return <BarSeries
          key={component}
          id={component}
          name={component}
          groupId="left"
          data={anomalies}
          xAccessor={'timestamp'}
          stackAccessors={['timestamp']}
          yAccessors={['count']}
        />
      });

      // We have to have a chart element without data in order for the chart to display "No data to display".
      const empty = <BarSeries
        key="empty"
        id="empty"
        name="empty"
        groupId="left"
        data={[]}
        xAccessor={'timestamp'}
        stackAccessors={['timestamp']}
        yAccessors={['count']}
      />;

      return bars.length === 0 ? empty : bars;
    };


    return (
        <div className="anomaly-chart">
          <EuiPanel>
              <Loading promise={this.state.anomalyRequest}>
                  <Chart size={{ height: 300 }}>
                      <Settings showLegend={true} legendPosition="bottom" tooltip={{headerFormatter: (data) => xFormat(data.value)}}/>
                      {getBars()}
                      <Axis id="bottom-axis" position="bottom" showGridLines tickFormat={xFormat} />
                      <Axis
                          id="left-axis"
                          position="left"
                          groupId="left"
                          showGridLines
                          tickFormat={(n) => formatShort(n)}
                      />
                  </Chart>
                </Loading>
            </EuiPanel>
        </div>
    );
  }
}
