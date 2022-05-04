import './style.scss';
import React, { Component, createRef, Fragment } from 'react';
import { EuiBasicTable, EuiHorizontalRule, EuiTitle, EuiButtonIcon } from '@elastic/eui';
import Drawer from '../Drawer';
import Bubble from '../Bubble';
import moment from 'moment';
import { getLogs, Log } from '../../utils/requests';
import Loading from '../Loading/Loading';

const severityMap: { [key in Severity ]: string} = {
    anomaly: 'Anomalous',
    suspicious: 'Suspicious',
};

const typeMap = {
    controlPlane: () => 'Control Plane',
    pod: () => 'Pod',
    namespace: () => 'Namespace',
    workload: () => 'Workload'
};

export type Severity = 'anomaly' | 'suspicious';

export interface LogDrawerState {
    type: string;
    severity: Severity;
    itemIdToExpandedRowMap: any;
    identifiers: string[];
    logsRequest: Promise<Log[]>;
    logs: Log[];
}

class LogDrawer extends Component<any, LogDrawerState> {
    drawerRef = null;

    constructor(props) {
        super(props);

        this.drawerRef = createRef();
        this.state = {
            itemIdToExpandedRowMap: {},
            identifiers: [],
            severity: 'anomaly',
            type: 'controlPlane',
            logsRequest: new Promise(() => {}),
            logs: []
        };
    }

    getTitle = () => {
        const typeLabel = typeMap[this.state.type]();
        const severityLabel = severityMap[this.state.severity];

        return `${severityLabel} ${typeLabel} Logs`
    }

    open = (type, identifiers, severity) => {
        this.load();
        this.drawerRef.current.open();
        this.setState({ type, identifiers, severity });
    };

    toggleDetails = (item) => {
        const updatedMap = { ...this.state.itemIdToExpandedRowMap };

        if (this.state.itemIdToExpandedRowMap[item.id]) {
            delete updatedMap[item.id];
            
        } else {
            updatedMap[item.id] = <Bubble severity={this.state.severity}>{item.log}</Bubble>;
        }

        this.setState({
            itemIdToExpandedRowMap: updatedMap
        });
    };

    load = async  () => {
        const logsRequest = getLogs();
        this.setState({ logsRequest });
        this.setState({ logs: await logsRequest });
    };

    render() {     
        const columns = [
            {
              field: 'timestamp',
              name: 'Date',
              render: (item) => moment(item).format('YYYY/MM/DD HH:MM:SS')
            },
            {
              field: 'level',
              name: 'Log Level',
            },
            {
                field: 'component',
                name: 'Kubernetes Component',
            },
            {
                align: 'right',
                width: '40px',
                isExpander: true,
                render: (item) => (
                  <EuiButtonIcon
                    onClick={() => this.toggleDetails(item)}
                    iconType={this.state.itemIdToExpandedRowMap[item.id] ? 'arrowUp' : 'arrowDown'}
                  />
                ),
              },
          ];

        return (
            <Drawer ref={this.drawerRef} className="log-drawer">
                <div>
                    <div><EuiTitle size="l"><Fragment>{this.getTitle()}</Fragment></EuiTitle></div>
                    <div>
                        <EuiHorizontalRule />
                    </div>
                    <div className="body">
                        <Loading promise={this.state.logsRequest}>
                            <EuiBasicTable
                                itemId="id"
                                itemIdToExpandedRowMap={this.state.itemIdToExpandedRowMap}
                                tableCaption="Control Plane"
                                items={this.state.logs}
                                rowHeader="firstName"
                                columns={columns as any}
                            />
                        </Loading>
                    </div>
                </div>
            </Drawer>
        );
    }
}

export default LogDrawer;
  