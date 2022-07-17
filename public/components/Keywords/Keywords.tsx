import './style.scss';

import React, { Component } from 'react';
import {
  EuiButtonIcon,
} from '@elastic/eui';
import Bubble from '../Bubble/Bubble';


export interface KeywordsProps {
  value: string[];
  onChange: (value: string[]) => void;
};

export interface KeywordsState {
  keyword: string;
  editingKeyword: boolean;
};

export default class Keywords extends Component<KeywordsProps, KeywordsState> {
  inputRef: React.RefObject<HTMLInputElement>;

  constructor(props: KeywordsProps) {
    super(props);

    this.inputRef = React.createRef();

    this.state = {
      editingKeyword: false,
      keyword: ''
    };
  }

  render() {
    const onKeywordChange = (ev) => {
      this.setState({keyword: ev.target.value});
    };

    const addKeyword = () => {
      this.setState({
        editingKeyword: true
      });

      this.inputRef.current?.focus();
    };

    const stopEditing = (change: boolean) => {
      if (change) {
        const newKeywords = [...this.props.value];
        if (this.state.keyword) {
          newKeywords.push(this.state.keyword);
        }
        this.props.onChange(newKeywords);
      }

      this.setState({
        keyword: '',
        editingKeyword: false
      });
    };

    const removeKeyword = (i) => {
      const newKeywords = [...this.props.value];
      newKeywords.splice(i, 1);
      this.props.onChange(newKeywords);
    };

    const keywords = this.props.value.map((keyword, i) => (
      <Bubble key={i} severity="suspicious">
        {keyword}
        <EuiButtonIcon
          color="text"
          onClick={() => removeKeyword(i)}
          iconType="cross"
          size="s"
        />
      </Bubble>
    ));

    const newKeyword = this.state.editingKeyword
    ? <Bubble className="editing" severity="suspicious">
        {this.state.keyword}
        <span className="typing-caret">|</span>
        <EuiButtonIcon
          color="text"
          onClick={() => stopEditing(false)}
          iconType="cross"
          size="s"
        />
      </Bubble>
    : null;

    const addKeywordButton = !this.state.editingKeyword
      ? <EuiButtonIcon
          color="text"
          onClick={addKeyword}
          iconType="plusInCircle"
        />
      : null;

    const focusCapture = this.state.editingKeyword
      ? <div className="focus-capture" onClick={() => stopEditing(true)} />
      : null;
    
    const onKeyUp = (e) => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        stopEditing(true);
      } else if (e.key === 'Escape') {
        stopEditing(false);
      }
    };

    return (
      <div className="keywords-filter">
        <div className="handle">
          Keywords: 
          {keywords}
          {focusCapture}
          {newKeyword}
          {addKeywordButton}
        </div>
        <input id="keyword" ref={this.inputRef} type="text" onChange={onKeywordChange} value={this.state.keyword} onKeyUp={onKeyUp} />
      </div>
    );
  }
}
