'use babel';

import React from 'react';
import ReactDOM from 'react-dom';
import {CompositeDisposable} from 'atom';
import Dispatcher from './dispatcher';

export default class Editor extends React.Component {

  constructor(props) {
    super(props);
    this.subscriptions = new CompositeDisposable();
  }

  componentDidMount() {
    this.textEditorView = ReactDOM.findDOMNode(this);
    this.textEditor = this.textEditorView.getModel();
    let grammar = Editor.getGrammarForLanguage(this.props.language);
    this.textEditor.setGrammar(grammar);
    this.textEditor.setLineNumberGutterVisible(true);
    // Prevent `this.onTextChanged` on initial `onDidStopChanging`
    setTimeout(() => {
      this.subscriptions.add(this.textEditor.onDidStopChanging(this.onTextChanged))
    }, 1000);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    this.subscriptions.dispose();
  }

  render() {
    return (
      <atom-text-editor className="cell-input">
        {this.props.data.get('source')}
      </atom-text-editor>
    );
  }

  static getGrammarForLanguage(language) {
    let matchingGrammars = atom.grammars.grammars.filter(grammar => {
      return grammar !== atom.grammars.nullGrammar && (grammar.name != null) && (grammar.name.toLowerCase != null) && grammar.name.toLowerCase() === language;
    });
    return matchingGrammars[0];
  }

  onTextChanged = () => {
    Dispatcher.dispatch({
      actionType: Dispatcher.actions.cell_source_changed,
      cellID: this.props.data.getIn(['metadata', 'id']),
      source: this.textEditor.getText()
    });
  }

}
