import './style.scss';
import React, { Component } from 'react';
import { EuiIcon, EuiPanel } from '@elastic/eui';


class Drawer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            maximized: false,
            dragging: false,
            drawerHeight: 400
        };
    }

    close = () => {
        this.setState({open: false, maximized: false});
    }

    open = () => {
        this.setState({open: true});
    }

    onMouseMove = (ev) => {
        if (!this.state.dragging) {
            return;
        }
    
        const clientHeight = document.documentElement.clientHeight;
        const mouseY = ev.clientY;
        const drawerHeight = clientHeight - mouseY;
        const value = this.maximized ? null : `${ drawerHeight }px`;

        this.setState({ drawerHeight: value});
    }

    onDrag = () => {
        this.setState({ dragging: true });
    }

    onDragDone = () => {
        this.setState({ dragging: false });
    }

    toggleFullScreen = () => {
        this.setState({ maximized: !this.state.maximized });
    }

    drawerStyle = () => {
        return this.state.maximized ? {} : { height: this.state.drawerHeight };
    }

    className = () => {
        return [
            'drawer',
            this.props.className ? this.props.className : '',
            this.state.dragging ? 'dragging' : '',
            this.state.open ? 'open' : 'closed', 
            this.state.maximized ? 'maximized' : ''
        ].join(' ');
    };

    disableClickThrough = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
    };

    render() {
        const fullScreenIcon = this.state.maximized 
            ? <EuiIcon type="minimize" size="m" onClick={this.toggleFullScreen}/> 
            : <EuiIcon type="expand" size="m" onClick={this.toggleFullScreen}/>;
        
        return (
            <div className={this.className()} onMouseUp={this.onDragDone} onMouseMove={this.onMouseMove} onClick={this.close}>
                <EuiPanel className="drawer-container" style={this.drawerStyle()}>
                    <div onClick={this.disableClickThrough}>
                        {this.props.children}
                        
                        <div className="handle" onMouseDown={this.onDrag}/>
                        <div className="buttons">
                            {fullScreenIcon}
                            <EuiIcon type="cross" size="l" onClick={this.close}/>
                        </div>
                    </div>
                </EuiPanel>
            </div>
        );
    }
}

export default Drawer;
  