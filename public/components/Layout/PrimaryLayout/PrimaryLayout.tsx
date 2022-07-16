import './style.scss';
import React, { Component } from 'react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { CoreConsumer } from '../../../utils/CoreContext';
import SideNav from '../../SideNav';
import Loading from '../../Loading';

export interface PrimaryLayoutProps {
    loadingPromise: Promise<any>;
}

export default class PrimaryLayout extends Component<PrimaryLayoutProps> {
    render() {
      return (
      <CoreConsumer>
        {(core) =>
          core && (
            <EuiFlexGroup style={{ padding: '0 15px' }} className="selector">
              <EuiFlexItem grow={false}>
                <SideNav />
              </EuiFlexItem>
              <EuiFlexItem>
                <Loading promise={this.props.loadingPromise}>
                  <div style={{ width: '100%' }}>
                    {this.props.children}
                  </div>
                </Loading>
              </EuiFlexItem>
            </EuiFlexGroup>
          )
        }
      </CoreConsumer>
      );
    }
}

  