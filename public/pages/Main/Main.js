
import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { CoreConsumer } from '../../utils/CoreContext';

import ClusterConfig from '../ClusterConfig';
import Insights from '../Insights';
import Events from '../Events';
import Templates from '../Templates';
import Clusters from '../Clusters';

class Main extends Component {
  render() {
    return (
      <CoreConsumer>
        {(core) =>
          core && (
            <div style={{ padding: '15px 0px' }}>
              <Switch>
                <Route
                  path={'/cluster-config'}
                  render={(props) => (
                    <ClusterConfig />
                  )}
                />
                <Route
                  path="/events"
                  render={(props) => (
                    <Events />
                  )}
                />
                <Route
                  path="/templates"
                  render={(props) => (
                    <Templates />
                  )}
                />
                <Route
                  path="/clusters"
                  render={(props) => (
                    <Clusters />
                  )}
                />
                <Route
                  render={(props) => (
                    <Insights />
                  )}
                />
              </Switch>
            </div>
          )
        }
      </CoreConsumer>
    );
  }
}

export default Main;