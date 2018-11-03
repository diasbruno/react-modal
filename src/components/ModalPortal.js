/* global process */
import React, { Component } from "react";
import PropTypes from "prop-types";
import * as focusManager from "../helpers/focusManager";
import * as aria from "../helpers/ariaAppHider";
import { buildClassName } from "../helpers/classList";
import SafeHTMLElement from "../helpers/safeHTMLElement";


const WILL_OPEN = 0;
const OPENED = 1;
const WILL_CLOSE = 2;
const CLOSED = 3;

const Portal = props => {
  const overlayClassNames = buildClassName(
    'overlay', props.overlayClassName || "", props);

  const contentClassNames = buildClassName(
    'content', props.className || "", props);

  const dataAttributes = aria.attributesFromObject(
    'data', props.data || {});

  const ariaAttributes = aria.attributesFromObject(
    'aria', props.aria || {});

  return (
    <div ref={props.overlayRef}
         className={overlayClassNames}
         style={props.style.overlay || {}}
         onKeyDown={props.handleKeyDown}
         onClick={props.handleOverlayOnClick}
         onMouseDown={props.handleOverlayOnMouseDown}>
      <div ref={props.contentRef}
           className={contentClassNames}
           style={props.style.content || {}}
           onClick={props.handleContentOnClick}
           onMouseDown={props.handleContentOnMouseDown}
           onMouseUp={props.handleContentOnMouseUp}
           {...dataAttributes}
           {...ariaAttributes}>
        {props.children}
      </div>
    </div>
  );
};

export default props => props.renderState > 0 ? <Portal {...props} /> : null;
