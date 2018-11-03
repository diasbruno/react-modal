import ReactDOM from 'react-dom';
import ExecutionEnvironment from "exenv";

const EE = ExecutionEnvironment;

const SafeHTMLElement = EE.canUseDOM ? window.HTMLElement : {};

export const canUseDOM = EE.canUseDOM;

export const isReact16 = ReactDOM.createPortal !== undefined;

export default SafeHTMLElement;
