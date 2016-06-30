'use strict';

const fs = require('fs');
const path = require('path');

const CommonMarkRenderer = require('commonmark-react-renderer');
const CommonMark = require('commonmark');
const renderHtml = require('react-dom/server')

const React = require('react');

var parser = new CommonMark.Parser();
var renderer = new CommonMarkRenderer({
  Common: {
    literal: true
  },
  CodeBlock: {
    literal: true
  }
});

class GitHubMarkdown {

  constructor(config) {

    config = config || {}

    this.file = config.file;
    this.title = config.title || path.basename(this.file);

    if (!fs.existsSync(this.file)) {
      throw new Error(`${this.file} does not exist`);
    }

    if (!fs.statSync(this.file).isFile()) {
      throw new Error(`${this.file} is not a markdown file`);
    }

  }

  render() {

    return new Promise((resolve, reject) => {
      let string = fs.readFileSync(this.file).toString();
      let ast = parser.parse(string);
      let html = renderer.render(ast);
      let result = renderHtml.renderToStaticMarkup(
          React.createElement.apply(React, ['div', null].concat(html))
      );

      result = result.replace(/<p>/g, '<p className={styles.p}>');
      result = result.replace(/<h1>/g, '<h1 className={styles.h1}>');
      result = result.replace(/<h2>/g, '<h2 className={styles.h2}>');
      result = result.replace(/<h3>/g, '<h3 className={styles.h3}>');
      result = result.replace(/<h4>/g, '<h4 className={styles.h4}>');
      result = result.replace(/<h5>/g, '<h5 className={styles.h5}>');
      result = result.replace(/<h6>/g, '<h6 className={styles.h6}>');
      result = result.replace(/<pre>/g, '<pre className={styles.pre}>');
      result = result.replace(/<strong>/g, '<strong className={styles.strong}>');
      result = result.replace(/<code>/g, '<code className={styles.code}>');

      result = result.replace(/<\/p>/g, '</p>\n            ');
      result = result.replace(/<\/h1>/g, '</h1>\n            ');
      result = result.replace(/<\/h2>/g, '</h2>\n            ');
      result = result.replace(/<\/h3>/g, '</h3>\n            ');
      result = result.replace(/<\/h4>/g, '</h4>\n            ');
      result = result.replace(/<\/h5>/g, '</h5>\n            ');
      result = result.replace(/<\/h6>/g, '</h6>\n            ');
      result = result.replace(/<\/pre>/g, '</pre>\n            ');
      result = result.replace(/<\/strong>/g, '</strong>\n            ');
      result = result.replace(/<\/code>/g, '</code>\n            ');
      result = result.substring('<div>'.length, result.length - '</div>'.length)

      let jsx = ` 
import styles from './style.css';
import React, { Component } from 'react';

class ${this.title} extends Component {
    // put your props and lifecycle hooks below
    static propTypes = {
    }

    componentWillReceiveProps(nextProps) {
    }

    render() {
      return (
        <div className={styles.container} ref='wiki'>
          ${result}
        </div>
      );
    }
}

export default = ${this.title}
`
      resolve(jsx);
    });
  }
}

module.exports = GitHubMarkdown;
