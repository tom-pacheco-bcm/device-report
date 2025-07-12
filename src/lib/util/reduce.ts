

type Reducer<T, U> = (acc: U, t: T, i?: number, o?: object) => U;


export function reduce<T, U>(reducer: Reducer<T, U>, initialValue: U) {
  return (items: T[]) => items.reduce(reducer, initialValue);
}
