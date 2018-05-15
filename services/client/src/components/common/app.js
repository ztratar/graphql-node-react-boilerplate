import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorph-style-loader/lib/withStyles';

import PureComponent from 'components/common/pure';
import AlertBox from 'components/alertBox';

import bootstrap from 'styles/bootstrap.css';
import fonts from 'styles/fonts.css';
import global from 'styles/global.css';
import card from 'styles/card.css';
import joyride from 'styles/lib/joyride.css';

export default (context) => {
  class App extends PureComponent {
    static childContextTypes = {
      insertCss: PropTypes.func.isRequired,
      _styles: PropTypes.any,
      getCssString: PropTypes.func
    };
    static propTypes = {
      children: PropTypes.element.isRequired
    };
    constructor (props, context) {
      super(props, context);
    }
    getChildContext () {
      return context;
    }
    render () {
      return (
        <ViewPort children={this.props.children}/>
      );
    }
  };

  @withStyles(bootstrap)
  @withStyles(fonts)
  @withStyles(card)
  @withStyles(global)
  @withStyles(joyride)
  class ViewPort extends PureComponent {
    constructor (props, context) {
      super(props, context);
    }
    render () {
      return (
        <div>
          <AlertBox/>
          <svg id='svg-image-blur' version='1.1' xmlns='http://www.w3.org/2000/svg'>
            <filter id='blur-effect'>
              <feGaussianBlur stdDeviation='8'/>
            </filter>
          </svg>
          <div id='root-body'>
            {this.props.children}
          </div>
        </div>
      )
    }
  }

  ViewPort.propTypes = {
    children: PropTypes.element.isRequired
  };

  return App;
};
