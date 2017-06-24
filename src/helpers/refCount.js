import elementClass from 'element-class';

const modals = {};

export function add(bodyClass) {
  // Set variable and default if none
  if (!modals[bodyClass]) {
    modals[bodyClass] = 0;
  }
  modals[bodyClass] += 1;
  elementClass(document.body).add(bodyClass);
}

export function remove(bodyClass) {
  if (modals[bodyClass]) {
    modals[bodyClass] -= 1;
  }
  // Remove class if no more modals are open
  if (modals[bodyClass] === 0) {
    elementClass(document.body).remove(bodyClass);
  }
}

export function totalCount() {
  const count = Object.keys(modals)
    .reduce((acc, curr) => acc + modals[curr], 0);
  return count;
}
