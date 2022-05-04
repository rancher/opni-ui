import React, { Component } from 'react';
import { CoreConsumer } from '../../utils/CoreContext';
import InsightsChart from '../../components/InsightsChart';
import Selector from '../../components/Selector';
import Breakdowns from '../../components/Breakdowns';
import moment from 'moment';
import { DEFAULT_SETTINGS, Settings } from '../../components/Selector/Selector';
import { roundTime, Range, Granularity } from '../../utils/time';
import AnomalyChart from '../../components/AnomalyChart';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { getClusterIds } from '../../utils/requests';
import Loading from '../../components/Loading';

interface MainState {
  settings: Settings,
  clustersRequest: Promise<string[]>;
  clusters: string[];
  range: Range;
  granularity: Granularity,
  cluster: string;
};

class Main extends Component<any, MainState> {
  constructor(props) {
    super(props);

    this.state = {
      settings: { ...DEFAULT_SETTINGS },
      clustersRequest: new Promise(() => {}),
      clusters: [],
      range: this.getAbsoluteRange(),
      granularity: DEFAULT_SETTINGS.granularity,
      cluster: DEFAULT_SETTINGS.cluster
    };
  }

  getAbsoluteRange = (): Range => {
    const now = moment();
    const end = roundTime(now, moment.duration(30, 'm'));

    return {
      start: end.clone().subtract(this.state?.settings.range || DEFAULT_SETTINGS.range, 'ms'),
      end
    }
  }

  onSettingsChange = (settings) => {
    this.setState({ settings });
  };

  componentDidMount(): void {
    this.load();
  }

  onRefresh = () => {
    this.setState({ 
      range: this.getAbsoluteRange(),
      cluster: this.state.settings.cluster,
      granularity: this.state.settings.granularity
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
      <CoreConsumer>
        {(core) =>
          core && (
            <Loading promise={this.state.clustersRequest}>
              <div style={{ padding: '15px 0px', width: '100%' }}>
                <Selector settings={this.state.settings} onChange={this.onSettingsChange} clusterIds={this.state.clusters} onRefresh={this.onRefresh}/>
                <EuiFlexGroup style={{ padding: '0 15px' }} className="selector">
                  <EuiFlexItem><InsightsChart range={this.state.range} granularity={this.state.granularity} clusterId={this.state.cluster} /></EuiFlexItem>
                  <EuiFlexItem><AnomalyChart range={this.state.range} granularity={this.state.granularity} clusterId={this.state.cluster} /></EuiFlexItem>
                </EuiFlexGroup>
                <Breakdowns range={this.state.range} clusterId={this.state.cluster} />
              </div>
            </Loading>
          )
        }
      </CoreConsumer>
    );
  }
}

export default Main;
