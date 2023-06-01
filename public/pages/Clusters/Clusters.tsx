import React, { Component } from 'react';
import RangeFilter, { DEFAULT_SETTINGS, Settings } from '../../components/Filters/RangeFilter';

import { Range } from '../../utils/time';
import { ClusterMetadata, getClusterMetadata } from '../../utils/requests';
import dateMath from '@elastic/datemath';
import PrimaryLayout from '../../components/Layout/PrimaryLayout';
import ClustersTable from '../../components/Tables/ClustersTable';
import { Moment } from 'moment';

interface EventsState {
  settings: Settings,
  clustersRequest: Promise<ClusterMetadata[]>;
  clusters: ClusterMetadata[];
  range: Range;
};

export default class Events extends Component<any, EventsState> {
  constructor(props) {
    super(props);

    this.state = {
      settings: { ...DEFAULT_SETTINGS },
      clustersRequest: new Promise(() => {}),
      clusters: [],
      range: this.getAbsoluteRange(DEFAULT_SETTINGS.range),
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
    this.setState({ 
      range: this.getAbsoluteRange(this.state.settings.range)
    });
  };

  load = async () => {
    const clustersRequest = getClusterMetadata();
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
        <RangeFilter settings={this.state.settings} onChange={this.onSettingsChange} onRefresh={this.onRefresh}/>
        <ClustersTable range={this.state.range} />
      </PrimaryLayout>
    );
  }
}