import './style.scss';
import React, { Component } from 'react';
import { EuiIcon, EuiSideNav, htmlIdGenerator } from '@elastic/eui';
import { CoreConsumer } from '../../utils/CoreContext';

export default class SideNav extends Component {
    render() {
      return  <CoreConsumer>
        {(core: any) => {
          return <EuiSideNav
            className="side-nav"
            items={[
              {
                name: 'Opni',
                id: htmlIdGenerator('basicExample')(),
                items: [
                  {
                    name: 'Insights',
                    id: htmlIdGenerator('insights')(),
                    href: `${core.http.basePath.basePath}/app/opni#/`,
                    icon: <EuiIcon type="reporter" />,
                    isSelected: window.location.href.endsWith('opni#/')
                  },
                  {
                    name: 'Events',
                    id: htmlIdGenerator('events')(),
                    href: `${core.http.basePath.basePath}/app/opni#/events`,
                    icon: <EuiIcon type="clock" />,
                    isSelected: window.location.href.endsWith('opni#/events')
                  },
                  {
                    name: 'Log Templates',
                    id: htmlIdGenerator('templates')(),
                    href: `${core.http.basePath.basePath}/app/opni#/templates`,
                    icon: <EuiIcon type="documents" />,
                    isSelected: window.location.href.endsWith('opni#/templates')
                  },
                  {
                    name: 'Clusters',
                    id: htmlIdGenerator('clusters')(),
                    href: `${core.http.basePath.basePath}/app/opni#/clusters`,
                    icon: <EuiIcon type="heatmap" />,
                    isSelected: window.location.href.endsWith('opni#/clusters')
                  }
                ],
              },
            ]}
          />
        }}
      </CoreConsumer>
    }
}

  