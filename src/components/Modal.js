/* global setTimeout, clearTimeout */
import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { polyfill } from "react-lifecycles-compat";
import * as ariaAppHider from "../helpers/ariaAppHider";
import * as classList from "../helpers/classList";
import ModalPortal from "./ModalPortal";
import SafeHTMLElement, {
  isReact16, canUseDOM
} from "../helpers/safeHTMLElement";

console.log("Rendering with react 16+", isReact16);

const CLOSED = 0;
const WILL_OPEN = 1;
const OPEN = 2;
const WILL_CLOSE = 3;

function renderStateStr(state) {
  switch (state) {
  case WILL_CLOSE: return "WILL_CLOSE";
  case CLOSED: return "CLOSED";
  default: return "OPEN";
  }
}

let ariaHiddenInstances = 0;

export const portalClassName = "ReactModalPortal";
export const bodyOpenClassName = "ReactModal__Body--open";

export const defaultParentSelector = () => document.body;

const getCreatePortal = () =>
  isReact16
    ? ReactDOM.createPortal
    : ReactDOM.unstable_renderSubtreeIntoContainer;

const TAB_KEY = 9;
const ESC_KEY = 27;

import scopeTab from "../helpers/scopeTab";

class Modal extends Component {
  static defaultProps = {
    isOpen: false,
    style: {
      overlay: {},
      content: {}
    },
    parentSelector: defaultParentSelector,
    bodyOpenClassName,
    portalClassName,
    ariaHideApp: true,
    closeTimeoutMS: 0,
    shouldFocusAfterRender: true,
    shouldCloseOnOverlayClick: true,
    shouldCloseOnEsc: false
  };

  static setAppElement = () => document.body;

  state = { renderState: CLOSED };

  getSnapshotBeforeUpdate(pp, ps) {
    console.log("sbu", pp, ps, this.props);
    const {
      portalClassName, parentSelector
    } = this.props;

    return {
      updatePortalClassName: pp.portalClassName != portalClassName,
      prevParent: pp.parentSelector(),
      nextParent: parentSelector()
    };
  }

  componentDidMount = () => {
    this.node = document.createElement('div');

    const parent = this.props.parentSelector();
    parent.appendChild(this.node);

    this.node.className = this.props.portalClassName;
    this.props.isOpen && this.open();
  }

  componentDidUpdate(prevProps, _, snapshot) {
    const { isOpen, portalClassName } = this.props;

    if (snapshot.updatePortalClassName) {
      this.node.className = portalClassName;
    }

    (!prevProps.isOpen && isOpen) && this.open();
    (prevProps.isOpen && !isOpen) && this.close();
  }

  componentWillUnmount = () => {
    classList.manageClassNames('remove', this.props);
    this.removePortal();
  }

  open = () => this.updateProxy({
    renderState: WILL_OPEN
  }, () => {
    classList.manageClassNames('add', this.props);
    this.updateProxy({ renderState: OPEN });
  });

  close = () => this.updateProxy({
    renderState: WILL_CLOSE
  }, () => setTimeout(
    () => this.updateProxy(
      { renderState: CLOSED },
      () => classList.manageClassNames('remove', this.props)
    ),
    this.props.closeTimeoutMS
  ));

  updateProxy = (state, cb) => {
    console.log("Updating", state, cb);
    this.setState(state, cb || (() => {}));
  }

  portalRef = ref => (this.portal = ref);

  overlayRef = ref => {
    this.overlay = ref;
    this.props.overlayRef && this.props.overlayRef(ref);
  }

  contentRef = ref => {
    this.content = ref;
    this.props.contentRef && this.props.contentRef(ref);
  }

  renderPortal = () => {}

  removePortal = () => {
    const parent = this.props.parentSelector();
    parent.removeChild(this.node);
  }

  focusContent = () => {};

  handleKeyDown = event => {
    if (event.keyCode === TAB_KEY) {
      scopeTab(this.content, event);
    }

    if (this.props.shouldCloseOnEsc &&
        event.keyCode === ESC_KEY) {
      event.stopPropagation();
      this.props.onRequestClose(event);
    }
  };

  handleOverlayOnClick = event => {
    if (this.props.shouldCloseOnOverlayClick) {
      if (this.props.onRequestClose) {
        this.props.onRequestClose(event);
      } else {
        this.focusContent();
      }
    }
    this.currentTarget = null;
  };

  handleOverlayOnMouseDown = event => {
    this.currentTarget = event.target;

    (!this.props.shouldCloseOnOverlayClick &&
     event.target == this.currentTarget
    ) && event.preventDefault();
  }

  handleContentOnMouseDown = () => (this.currentTarget = null);

  handleContentOnMouseUp = () => (this.currentTarget = null);

  handleContentOnClick = () => (this.currentTarget = null);

  render() {
    console.log("rendering", this.props.id);
    if (!this.node) {
      return null;
    }
    const props = {
      renderState: this.state.renderState,
      contentRef: this.contentRef,
      overlayRef: this.overlayRef,
      ...this.props
    };

    if (isReact16) {
      props.ref = this.portalRef;
    }

    let portalArgs = [(
      <ModalPortal {...props}
                   handleKeyDown={this.handleKeyDown}
                   handleContentOnClick={this.handleContentOnClick}
                   handleContentOnMouseDown={this.handleContentOnMouseDown}
                   handleContentOnMouseUp={this.handleContentOnMouseUp}
                   handleOverlayOnClick={this.handleOverlayOnClick}
                   handleOverlayOnMouseDown={this.handleOverlayOnMouseDown} />
    ), this.node];

    !isReact16 && portalArgs.unshift(this);

    const portal = getCreatePortal().apply(null, portalArgs);

    return isReact16 ? portal : null;
  }
}

polyfill(Modal);

export default Modal;
