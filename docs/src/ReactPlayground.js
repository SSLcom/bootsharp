// These do not use ES6 imports, because the evaluated code requires un-mangled
// variable names.

/* eslint-disable */
const classNames = require('classnames');
const React = require('react');
const ReactDOM = require('react-dom');

const Accordion = require('react-bootstrap/lib/Accordion');
const Alert = require('react-bootstrap/lib/Alert');
const Badge = require('react-bootstrap/lib/Badge');
const Breadcrumb = require('react-bootstrap/lib/Breadcrumb');
const Button = require('react-bootstrap/lib/Button');
const ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
const ButtonInput = require('react-bootstrap/lib/ButtonInput');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');
const Carousel = require('react-bootstrap/lib/Carousel');
const Col = require('react-bootstrap/lib/Col');
const Collapse = require('react-bootstrap/lib/Collapse');
const CollapsibleNav = require('react-bootstrap/lib/CollapsibleNav');
const Dropdown = require('react-bootstrap/lib/Dropdown');
const DropdownButton = require('react-bootstrap/lib/DropdownButton');
const DropdownMenu = require('react-bootstrap/lib/DropdownMenu');
const Fade = require('react-bootstrap/lib/Fade');
const FormControls = require('react-bootstrap/lib/FormControls');
const Glyphicon = require('react-bootstrap/lib/Glyphicon');
const Grid = require('react-bootstrap/lib/Grid');
const Input = require('react-bootstrap/lib/Input');
const Image = require('react-bootstrap/lib/Image');
const Jumbotron = require('react-bootstrap/lib/Jumbotron');
const Label = require('react-bootstrap/lib/Label');
const ListGroup = require('react-bootstrap/lib/ListGroup');
const ListGroupItem = require('react-bootstrap/lib/ListGroupItem');
const Media = require('react-bootstrap/lib/Media');
const MenuItem = require('react-bootstrap/lib/MenuItem');
const Modal = require('react-bootstrap/lib/Modal');
const Nav = require('react-bootstrap/lib/Nav');
const Navbar = require('react-bootstrap/lib/Navbar');
const NavItem = require('react-bootstrap/lib/NavItem');
const NavDropdown = require('react-bootstrap/lib/NavDropdown');
const Overlay = require('react-bootstrap/lib/Overlay');
const OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');
const PageHeader = require('react-bootstrap/lib/PageHeader');
const PageItem = require('react-bootstrap/lib/PageItem');
const Pager = require('react-bootstrap/lib/Pager');
const Pagination = require('react-bootstrap/lib/Pagination');
const Panel = require('react-bootstrap/lib/Panel');
const PanelGroup = require('react-bootstrap/lib/PanelGroup');
const Popover = require('react-bootstrap/lib/Popover');
const ProgressBar = require('react-bootstrap/lib/ProgressBar');
const ResponsiveEmbed = require('react-bootstrap/lib/ResponsiveEmbed');
const Row = require('react-bootstrap/lib/Row');
const SplitButton = require('react-bootstrap/lib/SplitButton');
const Tab = require('react-bootstrap/lib/Tab');
const Table = require('react-bootstrap/lib/Table');
const Tabs = require('react-bootstrap/lib/Tabs');
const Thumbnail = require('react-bootstrap/lib/Thumbnail');
const Tooltip = require('react-bootstrap/lib/Tooltip');
const Well = require('react-bootstrap/lib/Well');
/* eslint-enable */

import babel from 'babel-core/browser';
import CodeExample from './CodeExample';

// This is only used for the ReactPlayground component, not for any of the
// examples, so it's fine to import like this.
import SafeAnchor from 'react-bootstrap/lib/SafeAnchor';

const IS_MOBILE = typeof navigator !== 'undefined' && (
  navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i)
  );

class CodeMirrorEditor extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    if (IS_MOBILE || CodeMirror === undefined) {
      return;
    }

    this.editor = CodeMirror.fromTextArea(this.refs.editor, {
      mode: 'text/jsx',
      lineNumbers: false,
      lineWrapping: false,
      matchBrackets: true,
      tabSize: 2,
      theme: 'solarized light',
      readOnly: this.props.readOnly
    });
    this.editor.on('change', this.handleChange);
  }

  componentDidUpdate() {
    if (this.props.readOnly) {
      this.editor.setValue(this.props.codeText);
    }
  }

  handleChange() {
    if (!this.props.readOnly && this.props.onChange) {
      this.props.onChange(this.editor.getValue());
    }
  }

  render() {
    // wrap in a div to fully contain CodeMirror
    let editor;

    if (IS_MOBILE) {
      editor = (
        <CodeExample
          mode="javascript"
          codeText={this.props.codeText}
        />
      );
    } else {
      editor = <textarea ref="editor" defaultValue={this.props.codeText} />;
    }

    return (
      <div style={this.props.style} className={this.props.className}>
        {editor}
      </div>
      );
  }
}

const selfCleaningTimeout = {
  componentDidUpdate() {
    clearTimeout(this.timeoutID);
  },

  updateTimeout() {
    clearTimeout(this.timeoutID);
    this.timeoutID = setTimeout.apply(null, arguments);
  }
};

const ReactPlayground = React.createClass({
  mixins: [selfCleaningTimeout],

  propTypes: {
    codeText: React.PropTypes.string.isRequired,
    transformer: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      transformer(code) {
        return babel.transform(code).code;
      }
    };
  },

  getInitialState() {
    return {
      code: this.props.codeText,
      codeChanged: false,
      showCode: false
    };
  },

  componentWillMount() {
    // For the initial render, we can hijack React.render to intercept the
    // example element and render it normally. This is safe because it's code
    // that we supply, so we can ensure ahead of time that it won't throw an
    // exception while rendering.
    const originalRender = ReactDOM.render;
    ReactDOM.render = (element) => this._initialExample = element;

    // Stub out mountNode for the example code.
    const mountNode = null;  // eslint-disable-line no-unused-vars

    try {
      const compiledCode = this.props.transformer(this.props.codeText);

      /* eslint-disable */
      eval(compiledCode);
      /* eslint-enable */
    } finally {
      ReactDOM.render = originalRender;
    }
  },

  componentWillUnmount() {
    this.clearExample();
  },

  handleCodeChange(value) {
    this.setState(
      {code: value, codeChanged: true},
      this.executeCode
    );
  },

  handleCodeModeToggle() {
    this.setState({
      showCode: !this.state.showCode
    });
  },

  render() {
    return (
      <div className="playground">
        {this.renderExample()}

        {this.renderEditor()}
        {this.renderToggle()}
      </div>
    );
  },

  renderExample() {
    let example;
    if (this.state.codeChanged) {
      example = (
        <div ref="mount" />
      );
    } else {
      example = (
        <div>{this._initialExample}</div>
      );
    }

    return (
      <div className={classNames('bs-example', this.props.exampleClassName)}>
        {example}
      </div>
    );
  },

  renderEditor() {
    if (!this.state.showCode) {
      return null;
    }

    return (
      <CodeMirrorEditor
        key="jsx"
        onChange={this.handleCodeChange}
        className="highlight"
        codeText={this.state.code}
      />
    );
  },

  renderToggle() {
    return (
      <SafeAnchor
        className={classNames('code-toggle', {'open': this.state.showCode})}
        onClick={this.handleCodeModeToggle}
      >
        {this.state.showCode ? 'hide code' : 'show code'}
      </SafeAnchor>
    );
  },

  clearExample() {
    if (!this.state.codeChanged) {
      return null;
    }

    const mountNode = this.refs.mount;
    try {
      ReactDOM.unmountComponentAtNode(mountNode);
    } catch (e) {
      console.error(e); // eslint-disable-line no-console
    }

    return mountNode;
  },

  executeCode() {
    const mountNode = this.clearExample();

    let compiledCode = null;
    try {
      compiledCode = this.props.transformer(this.state.code);

      /* eslint-disable */
      eval(compiledCode);
      /* eslint-enable */
    } catch (err) {
      if (compiledCode !== null) {
        console.log(err, compiledCode); // eslint-disable-line no-console
      } else {
        console.log(err); // eslint-disable-line no-console
      }

      this.updateTimeout(
        () => {
          ReactDOM.render(
            <Alert bsStyle="danger">
              {err.toString()}
            </Alert>,
            mountNode
          );
        },
        500
      );
    }
  }
});

export default ReactPlayground;
