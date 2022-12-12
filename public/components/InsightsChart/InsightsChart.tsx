import './style.scss';

import React, { Component } from 'react';
import {
  EuiPanel,
  EuiIcon
} from '@elastic/eui';
import {
  Chart,
  Settings,
  Axis,
  AreaSeries,
  LineAnnotation,
  LineAnnotationStyle,
  AnnotationDomainType
} from '@elastic/charts';
import { COLORS } from '../../utils/colors';
import moment from 'moment';
import { Insight, K8SEvent } from '../../utils/requests';
import Loading from '../Loading/Loading';
import { Granularity, isSameRange, Range } from '../../utils/time';
import { formatShort } from '../../utils/format';

export interface InsightsChartProps {
  range: Range;
  granularity: Granularity; 
  clusterId: string;
  keywords: string[];
  insightsProvider(range: Range, granularity: Granularity, clusterId: string, keywords: string[]): Promise<Insight[]>;
  eventsProvider?(range: Range, clusterId: string): Promise<K8SEvent[]>;
};

export interface InsightsChartState {
  loadingPromise: Promise<any>;
  insights: Insight[];
  events: K8SEvent[];
};

export default class InsightsChart extends Component<InsightsChartProps, InsightsChartState> {
  constructor(props) {
    super(props);

    this.state = {
      loadingPromise: new Promise<any>(() => {}),
      insights: [],
      events: []
    };
  }

  componentDidMount(): void {
    this.load();
  }

  componentDidUpdate(prevProps: Readonly<InsightsChartProps>): void {
    if (this.props.granularity !== prevProps.granularity || !isSameRange(this.props.range, prevProps.range) || this.props.clusterId !== prevProps.clusterId || this.props.keywords !== prevProps.keywords) {
      this.load();
    }
  }

  load = async () => {
    const insightsRequest = this.props.insightsProvider(this.props.range, this.props.granularity, this.props.clusterId, this.props.keywords);
    const eventsRequest = this.props.eventsProvider ? this.props.eventsProvider(this.props.range, this.props.clusterId) : Promise.resolve([]);

    this.setState({
      loadingPromise: Promise.all([insightsRequest, eventsRequest])
    });

    this.setState({
      insights: await insightsRequest,
      events: await eventsRequest
    });
  };

  render() {
    function xFormat(ms) {
      return moment(ms).format('HH:mm');
    }

    const keywords = this.props.keywords.length > 0 
      ? <AreaSeries
            id="keywords"
            name="Keywords"
            groupId="left"
            data={this.state.insights}
            xAccessor={'timestamp'}
            yAccessors={['keywords']}
            color={COLORS.suspicious}
        />
      : null;

    const annotationData = this.state.events.map((e, i) => ({ dataValue: e.timestamp, header: e.timestamp }));

    const annotationStyle: Partial<LineAnnotationStyle> = {
      line: {strokeWidth: 0, stroke: '#b4a199', opacity: 1},
    };

    const eventTooltip = ({header}) => {
      const event: K8SEvent = this.state.events.find(e => e.timestamp === header) as K8SEvent;

      return <div className="event-tooltip">
        <div className="heading">
          <span className="time">{xFormat(event.timestamp)}</span>
          <span>- Event</span>
        </div>
        <div className="content">
          <span className="source">[{event.source}]: </span>
          <span className="summary">{event.summary}</span>
        </div>
      </div>;
    };

    const lineAnnotation = annotationData.length > 0
      ? <LineAnnotation
          id="events"
          domainType={AnnotationDomainType.XDomain}
          dataValues={annotationData as any}
          customTooltip={eventTooltip as any}
          marker={<EuiIcon type="clock" />}
          markerPosition="bottom"
          style={annotationStyle}
        />
      : null;

    return (
        <div className="insights-chart">
          <EuiPanel>
              <Loading promise={this.state.loadingPromise}>
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
                      {keywords}
                      <AreaSeries
                          id="normal"
                          name="Normal"
                          groupId="right"
                          data={this.state.insights}
                          xAccessor={'timestamp'}
                          yAccessors={['normal']}
                          color={COLORS.normal}
                      />
                      {lineAnnotation}
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
