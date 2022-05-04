import React, { Component } from 'react';
import { CoreConsumer } from '../../utils/CoreContext';
import ClusterConfig from '../../components/ClusterConfig';

class Main extends Component {
  render() {
    return (
      <CoreConsumer>
        {(core) =>
          core && (
            <div style={{ padding: '15px 0px' }}>
              <ClusterConfig />
            </div>
          )
        }
      </CoreConsumer>
    );
  }
}

export default Main;
