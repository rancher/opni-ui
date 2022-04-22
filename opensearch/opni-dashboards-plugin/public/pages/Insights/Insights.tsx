import React, { Component } from 'react';
import { CoreConsumer } from '../../utils/CoreContext';
import InsightsChart from '../../components/InsightsChart';
import Selector from '../../components/Selector';
import Breakdowns from '../../components/Breakdowns';
import moment from 'moment';
import { DEFAULT_SETTINGS, Settings } from '../../components/Selector/Selector';
import { roundTime, Range } from '../../utils/time';
import AnomalyChart from '../../components/AnomalyChart';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { getClusterIds } from '../../utils/requests';
import Loading from '../../components/Loading';

interface MainState {
  settings: Settings,
  clustersRequest: Promise<string[]>;
  clusters: string[];
};

class Main extends Component<any, MainState> {
  constructor(props) {
    super(props);

    this.state = {
      settings: { ...DEFAULT_SETTINGS },
      clustersRequest: new Promise(() => {}),
      clusters: []
    };
  }

  getAbsoluteRange = (): Range => {
    const now = moment();
    return {
      start: now.clone().subtract(1, 'day'),
      end: now
    }
  }

  getNewAbsoluteRange = (): Range => {
    const now = moment();
    const end = roundTime(now, moment.duration(30, 'm'));

    return {
      start: end.clone().subtract(this.state.settings.range, 'ms'),
      end
    }
  }

  onSettingsChange = (settings) => {
    console.log('setting', settings);
    this.setState({ settings });
  };

  componentDidMount(): void {
    this.load();
  }

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
              <div style={{ padding: '15px 0px' }}>
                <Selector settings={this.state.settings} onChange={this.onSettingsChange} clusterIds={this.state.clusters}/>
                <EuiFlexGroup style={{ padding: '0 15px' }} className="selector">
                  <EuiFlexItem><InsightsChart range={this.getNewAbsoluteRange()} granularity={this.state.settings.granularity} clusterId={this.state.settings.cluster} /></EuiFlexItem>
                  <EuiFlexItem><AnomalyChart range={this.getNewAbsoluteRange()} granularity={this.state.settings.granularity} clusterId={this.state.settings.cluster} /></EuiFlexItem>
                </EuiFlexGroup>
                <Breakdowns range={this.getNewAbsoluteRange()} clusterId={this.state.settings.cluster} />
              </div>
            </Loading>
          )
        }
      </CoreConsumer>
    );
  }
}

export default Main;
