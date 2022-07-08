import './style.scss';
import React, { Component } from 'react';
import PropTypes, { string } from 'prop-types';

const propTypes = {
    className: string,
    severity: PropTypes.oneOf(['anomaly', 'suspicious', 'normal']).isRequired,
};


class Bubble extends Component {
    className() {
        return ['bubble', this.props.severity, this.props.className].join(' ').trim();
    }

    render() {
      return (
          <span {...this.props} className={this.className()}>{this.props.children}</span>
      );
    }
}

Bubble.propTypes = propTypes;

export default Bubble;
  