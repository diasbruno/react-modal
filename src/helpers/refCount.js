import elementClass from 'element-class';

import * as ariaAppHider from './ariaAppHider';

const modals = {};

function totalCount() {
  // Find all modal types and filter out empty arrays
  const values = Object.keys(modals)
    .map(key => modals[key])
    .filter(el => el.length) || [];
  return values.length;
}

export function add(element) {
  const { props } = element;
  const identifier = props.id || props.contentLabel || props;
  const bodyClassName = props.bodyOpenClassName;

  // Set variable and default if none
  let modalReference = modals[bodyClassName];
  if (!modalReference) {
    modals[bodyClassName] = [];
    modalReference = modals[bodyClassName];
  }

  // Add reference to modal for specified key if it does not exist already
  if (modalReference.indexOf(identifier) === -1) {
    modalReference.push(identifier);
  }

  if (modalReference.length > 0) {
    elementClass(document.body).add(bodyClassName);
  }

  // Add aria-hidden to appELement
  if (props.ariaHideApp) {
    ariaAppHider.hide(props.appElement);
  }
}

export function remove(element) {
  const { props } = element;
  const identifier = props.id || props.contentLabel || props;
  const bodyClassName = props.bodyOpenClassName;
  const modalReference = modals[bodyClassName];

  // Remove className if no more references
  if (modalReference) {
    const index = modalReference.indexOf(identifier);
    if (index !== -1) {
      modalReference.splice(index, 1);
    }
    if (modalReference.length === 0) {
      elementClass(document.body).remove(bodyClassName);
    }
  }

  // Reset aria-hidden attribute if all modals have been removed
  if (props.ariaHideApp && totalCount() < 1) {
    ariaAppHider.show(props.appElement);
  }
}
