// so that our CSS is statically analyzable
export const CLASS_NAMES = {
  overlay: "ReactModal__Overlay",
  content: "ReactModal__Content"
};

/**
 * Build the class names given a phase of the modal,
 * which part is and additional
 * @param {string} phase After open or before close.
 * @param {string} which Overlay or content.
 * @param {object|string} additional More...
 *
 * `additional` comes from the `className` and `overlayClassName`
 * which can be an `object` or a `string`.
 *
 * @return {string}
 */
export default (phase, which, additional) => {
  const defaultNames = {
    base: CLASS_NAMES[which],
    afterOpen: `${CLASS_NAMES[which]}--after-open`,
    beforeClose: `${CLASS_NAMES[which]}--before-close`
  };

  const classNameIsString = typeof additional === "string" && additional.length > 0;

  let classNames = classNameIsString ?
      defaultNames :
      Object.assign({}, defaultNames, additional);

  if (phase == 0) {
    return classNames.base;
  }

  let classPhase = "";
  if (phase == 1) {
    classPhase = classNames.afterOpen;
  } else if (phase == 2) {
    classPhase = classNames.beforeClose;
  }

  return `${classNames.base} ${classPhase}${classNameIsString ? " " + additional : ""}`;
};
