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
            heading="Opni"
            items={[
              {
                name: 'Opni',
                id: htmlIdGenerator('basicExample')(),
                items: [
                  {
                    name: 'Insights',
                    id: htmlIdGenerator('basicExample')(),
                    href: `${core.http.basePath.basePath}/app/opni#/`,
                    icon: <EuiIcon type="reporter" />,
                    isSelected: window.location.href.endsWith('opni#/')
                  },
                  {
                    name: 'Events',
                    id: htmlIdGenerator('basicExample')(),
                    href: `${core.http.basePath.basePath}/app/opni#/events`,
                    icon: <EuiIcon type="clock" />,
                    isSelected: window.location.href.endsWith('opni#/events')
                  }
                ],
              },
            ]}
          />
        }}
      </CoreConsumer>
    }
}

  