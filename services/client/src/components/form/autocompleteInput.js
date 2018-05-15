import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import classNames from 'classnames';
import Autosuggest from 'react-autosuggest/dist/standalone/autosuggest';
import Redux from 'redux';
import { autobind } from 'core-decorators';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';
import Input from 'components/form/input';
import Loader from 'components/loader';

import style from './autocompleteInput.css';
import inputStyle from './input.css';

@withStyles(style)
@withStyles(inputStyle)
export default class AutocompleteInput extends PureComponent {
  static propTypes = {
    suggestions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })).isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    onLoadRequested: PropTypes.func.isRequired,
    onClearRequested: PropTypes.func.isRequired,
    onSelect: PropTypes.func,
    size: PropTypes.oneOf([
      'sm',
      'md',
      'lg',
      'vlg'
    ]),
    background: PropTypes.oneOf([
      'white',
      'greyLightest'
    ]),
    className: PropTypes.string,
    placeholder: PropTypes.string,
    focus: PropTypes.bool,
    disabled: PropTypes.bool,
    loading: PropTypes.bool
  };

  static defaultProps = {
    suggestions: [],
    onChange: e => e.preventDefault(),
    onBlur: e => e,
    onLoadRequested: e => null,
    onClearRequested: e => null,
    onSelect: e => null,
    size: 'md',
    background: 'white',
    value: '',
    className: '',
    placeholder: 'Start typing...',
    focus: false,
    disabled: false,
    loading: false
  };

  constructor (props, context) {
    super(props, context);

    this.state = {
      curPos: (props.value || '').length,
      currentlyFocused: false,
      keyNavingList: false,
      enterHit: false,
      value: props.value || ''
    };
  }

  componentWillReceiveProps ({ value }) {
    if (value !== this.state.value) {
      this.setState({
        value
      });
    }
  }

  componentDidMount () {
    if (this.props.focus !== undefined && this.props.focus !== false) this.refs.autosuggest.input.focus();
  }

  componentDidUpdate () {
    if (this.state.currentlyFocused) {
      if (this.refs.autosuggest.input) this.refs.autosuggest.input.setSelectionRange(this.state.curPos, this.state.curPos);
    }
  }

  @autobind
  _getSuggestionValue (suggestion) {
    return suggestion.value;
  }

  @autobind
  _renderSuggestion (suggestion) {
    return <span key={suggestion.id}>{suggestion.value}</span>
  }

  @autobind
  _onBlur () {
    this.setState({ currentlyFocused: false });

    this.props.onBlur && this.props.onBlur();
  }

  @autobind
  _onFocus () {
    this.setState({ currentlyFocused: true });

    this.props.onFocus && this.props.onFocus();
  }

  @autobind
  _onChange (e, { newValue: value }) {
    e.preventDefault();

    const curPos = e.target.selectionEnd;

    this.setState({
      value,
      curPos
    }, () => {
      if (!this.state.keyNavingList) {
        this.props.onChange(this.state.value);
      }
    });

    this.setState({
      keyNavingList: false,
      enterHit: false
    });
  }

  @autobind
  _onSelect (e, { suggestion }) {
    e.preventDefault();
    this.props.onSelect(suggestion);
  }

  @autobind
  _assignInputRef (node) {
    this._inputRef = node;
  }

  @autobind
  _onKeyDown (e) {
    if (e.keyCode === 13) {
      this.setState({
        enterHit: true
      });
    } else {
      this.setState({
        enterHit: false
      });
    }

    if (e.keyCode === 40 || e.keyCode == 38) {
      this.setState({
        keyNavingList: true
      });
    } else {
      this.setState({
        keyNavingList: false
      });
    }
  }

  render () {
    const {
      suggestions,
      onLoadRequested,
      onClearRequested,
      size,
      background,
      value,
      className,
      placeholder,
      disabled
    } = this.props;

    const inputProps = {
      placeholder,
      value,
      disabled,
      onBlur: this._onBlur,
      onFocus: this._onFocus,
      onChange: this._onChange,
      onKeyDown: this._onKeyDown,
      className: classNames(inputStyle.input, inputStyle[background], inputStyle[size], className)
    };

    const {
      _getSuggestionValue,
      _renderSuggestion
    } = this;

    return (
      <div className={classNames(style.autocompleteInput, this.props.outerClassName)}>
        {this.props.loading ? (
          <div className={style.loader}>
            <Loader
              size='small'
            />
          </div>
        ) : null}
        <Autosuggest
          ref='autosuggest'
          focusFirstSuggestion={!this.state.keyNavingList}
          suggestions={this.props.loading ? [] : suggestions}
          onSuggestionsFetchRequested={onLoadRequested}
          onSuggestionsClearRequested={onClearRequested}
          onSuggestionSelected={this._onSelect}
          shouldRenderSuggestions={this.props.shouldRenderSuggestions}
          getSuggestionValue={_getSuggestionValue}
          renderSuggestion={_renderSuggestion}
          inputProps={inputProps}
          inputRef={this._assignInputRef}
          theme={{
            containerOpen: style.containerOpen,
            suggestionsContainer: classNames(style.suggestionsContainer, style['suggestionsContainer-'+background], this.props.suggestionsClassName),
            suggestionFocused: style.suggestionFocused
          }}
        />
      </div>
    );
  }
}
