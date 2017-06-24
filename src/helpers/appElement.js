import ExecutionEnvironment from 'exenv';

const EE = ExecutionEnvironment;

export const SafeHTMLElement = EE.canUseDOM ? window.HTMLElement : {};
export const AppElement = EE.canUseDOM ? document.body : { appendChild() {} };
