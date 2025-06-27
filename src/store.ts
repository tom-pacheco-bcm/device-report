import { create } from "domain";


const compose = function <T, U>(processors: DispatchProcessor[]): DispatchProcessor {

  if (processors.length === 0) {
    return arg => arg;
  }

  if (processors.length === 1) {
    return processors[0];
  }

  return processors.reduce((a, b) => (dispatch) => a(b(dispatch)));
};


export class Store<T> {

  #subscriptions: Observer<T>[] = []

  dispatch: (action: Action) => void;
  getState: () => T;

  constructor(reducer: Reducer<T>, initialState: T) {
    let state = initialState;

    this.getState = () => state;

    this.dispatch = (action: Action) => {
      const lastState = state
      const nextState = reducer(lastState, action)
      if (!nextState) {
        return
      }
      state = nextState;
      if (lastState !== nextState) {
        this.#subscriptions.forEach(c => c(nextState))
      }
    }
  }

  subscribe(observer: Observer<T>): () => void {
    this.#subscriptions.push(observer);
    observer(this.getState());
    return () => {
      const i = this.#subscriptions.indexOf(observer);
      if (i === -1) {
        return
      }
      this.#subscriptions.splice(i, 1)
    }
  }
}


export function createStore<T>(reducer: Reducer<T>, initialState: T, ...middlewares: Middleware<T>[]) {
  const s = new Store(reducer, initialState)

  if (middlewares) {
    const chain = middlewares.map(middleware => middleware(s));
    s.dispatch = compose(chain)(s.dispatch);
  }

  return s;
};

