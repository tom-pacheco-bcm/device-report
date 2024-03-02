
declare interface ProgressBar {
  reset: () => void,
  update: (progress: number) => void,
}

declare type ProgressBarProps = {
  el: Element
}

// ProgressBar Function
export function ProgressBar(props: ProgressBarProps): ProgressBar {

  let value = 100

  const progress = props.el.getElementsByTagName("progress").item(0)

  const redraw = () => {
    if (value < 100) {
      props.el.removeAttribute("hidden")
    } else {
      props.el.setAttribute("hidden", "")
    }
    progress.setAttribute("value", String(value))
    progress.textContent = `${value}%`
  };

  progress.setAttribute("value", String(value))

  const reset = () => {
    value = 0
    redraw()
  };

  const update = (val: number) => {
    value = val
    redraw()
  };

  redraw()

  return {
    reset: reset,
    update: update,
  };
};
