/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 *   Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */
import './style.scss';

import React, { Component } from 'react';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
  EuiFormRow,
  EuiFieldText,
  EuiTitle,
} from '@elastic/eui';

const COLORS = {
  normal: '#3d98d3',
  suspicious: '#dac342',
  anomalous: '#f64747'

};

export default class ClusterConfig extends Component {
  render() {
    return (
      <div>
        <div style={{ padding: '15px 15px' }}>
          <EuiPanel>
            <EuiTitle size="s">
              <h3>Multicluster Config</h3>
            </EuiTitle>
            <EuiHorizontalRule margin="xs" />
            <EuiFlexGroup alignItems="flexEnd">
              <EuiFlexItem grow={false}>
                <EuiFormRow label="Cluster URL" >
                  <EuiFieldText name="first" />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem grow={false} >
                <EuiButton
                  color="danger"
                  onClick={() => { }}
                >
                  Delete
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiButton
              color="primary"
              onClick={() => { }}
              style={{ 'marginTop': '15px' }}
            >
              Add Cluster
            </EuiButton>
          </EuiPanel>
        </div>
      </div>
    );
  }
}
