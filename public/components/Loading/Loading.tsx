import './style.scss';

import React, { Component } from 'react';
import { EuiLoadingChart } from '@elastic/eui';

export interface LoadingProps {
    promise: Promise<any>
}

export interface LoadingState {
    loading: boolean;
    error: boolean;
}

class Loading extends Component<LoadingProps, LoadingState> {
    constructor(props) {
        super(props);

        this.state = this.getNewPromiseState();
    }

    componentDidUpdate(prevProps: Readonly<LoadingProps>): void {
        if(this.props.promise !== prevProps.promise) {
            this.connectToNewPromise();
        }
    }

    getNewPromiseState = () => {
        return {
            loading: true,
            error: false,
        };
    };

    connectToNewPromise = () => {
        this.setState(this.getNewPromiseState());
        const capturedPromise = this.props.promise;
        this.props.promise
            .then(() => {}, () => {
                if (capturedPromise === this.props.promise) {
                    this.setState({ error: true });
                }
            })
            .finally(() => {
                if (capturedPromise === this.props.promise) {
                    this.setState({ loading: false });
                }
            });
    };

    render() {   
        const loading = this.state.loading ? <EuiLoadingChart /> : null;
        const children = !this.state.loading && !this.state.error ? this.props.children : null;
        const error = !this.state.loading && this.state.error ? 'There was an error' : null;

        return <div className="loading">
            {loading}
            {children}
            {error}
        </div>
    }
}

export default Loading;
  