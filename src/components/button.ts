import { MOUSE_CLICK_EVENT, MOUSE_DOWN_EVENT, MOUSE_OUT_EVENT, MOUSE_OVER_EVENT, MOUSE_UP_EVENT, addEventListener } from "../dom/addEventListener";

declare type ButtonProps = {
  el: Element,
  clickHandler: () => void,
}

export function CreateButton(props: ButtonProps) {
  addEventListener(props.el, MOUSE_CLICK_EVENT, props.clickHandler);
  return {};
}
