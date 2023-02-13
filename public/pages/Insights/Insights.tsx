import React, { Component } from 'react';
import InsightsChart from '../../components/InsightsChart';
import Selector from '../../components/Selector';
import Breakdowns from '../../components/Breakdowns';
import { DEFAULT_SETTINGS, Settings } from '../../components/Selector/Selector';
import { Range, Granularity } from '../../utils/time';
import AnomalyChart from '../../components/AnomalyChart';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { getClusterIds, getInsights, getK8sEvents } from '../../utils/requests';
import dateMath from '@elastic/datemath';
import Cookies from 'js-cookie';
import PrimaryLayout from '../../components/Layout/PrimaryLayout';
import { Moment } from 'moment';

interface MainState {
  settings: Settings,
  clustersRequest: Promise<string[]>;
  clusters: string[];
  range: Range;
  granularity: Granularity,
  cluster: string;
  keywords: string[];
};

const COOKIE_KEY = 'opni-keywords';

class Main extends Component<any, MainState> {
  constructor(props) {
    super(props);

    const keywords = Cookies.get(COOKIE_KEY) ? JSON.parse(Cookies.get(COOKIE_KEY) as string): DEFAULT_SETTINGS.keywords;
    this.state = {
      settings: { 
        ...DEFAULT_SETTINGS,
        keywords
      },
      clustersRequest: new Promise(() => {}),
      clusters: [],
      range: this.getAbsoluteRange(DEFAULT_SETTINGS.range),
      granularity: DEFAULT_SETTINGS.granularity,
      cluster:  DEFAULT_SETTINGS.cluster,
      keywords
    };
  }

  getAbsoluteRange = (range: { start: string; end: string;}): Range => {
    return {
      start: dateMath.parse(range.start) as Moment,
      end: dateMath.parse(range.end) as Moment
    }
  }

  onSettingsChange = (settings) => {
    this.setState({ settings });
  };

  componentDidMount(): void {
    this.load();
  }

  onRefresh = () => {
    Cookies.set(COOKIE_KEY, JSON.stringify(this.state.settings.keywords));
    this.setState({ 
      range: this.getAbsoluteRange(this.state.settings.range),
      cluster: this.state.settings.cluster,
      granularity: this.state.settings.granularity,
      keywords: this.state.settings.keywords
    });
  };

  load = async () => {
    const clustersRequest = getClusterIds();
    this.setState({
      clustersRequest
    });

    this.setState({
      clusters: await clustersRequest
    });
  };

  render() {
    return (
      <PrimaryLayout loadingPromise={this.state.clustersRequest}>
        <Selector settings={this.state.settings} onChange={this.onSettingsChange} clusterIds={this.state.clusters} onRefresh={this.onRefresh}/>
        <EuiFlexGroup style={{ padding: '0 15px' }} className="selector">
          <EuiFlexItem><InsightsChart range={this.state.range} granularity={this.state.granularity} clusterId={this.state.cluster} insightsProvider={getInsights} eventsProvider={(range, clusterId) => getK8sEvents(range, clusterId, 'Warning')} keywords={this.state.keywords} showTitle={true} /></EuiFlexItem>
          <EuiFlexItem><AnomalyChart range={this.state.range} granularity={this.state.granularity} clusterId={this.state.cluster} /></EuiFlexItem>
        </EuiFlexGroup>
        <Breakdowns granularity={this.state.granularity} range={this.state.range} clusterId={this.state.cluster} keywords={this.state.keywords} />
      </PrimaryLayout>
    );
  }
}

export default Main;
