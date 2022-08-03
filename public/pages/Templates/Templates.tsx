import React, { Component } from 'react';
import EventsFilter from '../../components/Filters/EventsFilter';
import { DEFAULT_SETTINGS, Settings } from '../../components/Filters/EventsFilter';
import { Range } from '../../utils/time';
import { getClusterIds } from '../../utils/requests';
import dateMath from '@elastic/datemath';
import PrimaryLayout from '../../components/Layout/PrimaryLayout';
import TemplatesTable from '../../components/TemplatesTable';
import { Moment } from 'moment';

interface EventsState {
  settings: Settings,
  clustersRequest: Promise<string[]>;
  clusters: string[];
  range: Range;
  cluster: string;
};

export default class Events extends Component<any, EventsState> {
  constructor(props) {
    super(props);

    this.state = {
      settings: { ...DEFAULT_SETTINGS },
      clustersRequest: new Promise(() => {}),
      clusters: [],
      range: this.getAbsoluteRange(DEFAULT_SETTINGS.range),
      cluster:  DEFAULT_SETTINGS.cluster,

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
      range: this.getAbsoluteRange(this.state.settings.range),
      cluster: this.state.settings.cluster
    });

    setTimeout(() => {
      this.loadEvents();
    });
  };

  load = async () => {
    const clustersRequest = getClusterIds();
    this.setState({
      clustersRequest
    });

    await this.loadEvents();

    this.setState({
      clusters: await clustersRequest
    });
  };

  loadEvents = async () => {

  };

  render() {
    return (
      <PrimaryLayout loadingPromise={this.state.clustersRequest}>
        <EventsFilter settings={this.state.settings} onChange={this.onSettingsChange} clusterIds={this.state.clusters} onRefresh={this.onRefresh}/>
        <TemplatesTable range={this.state.range} clusterId={this.state.cluster} />
      </PrimaryLayout>
    );
  }
}