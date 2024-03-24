

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

  constructor(reducer: Reducer<T>,
    initialState: T,
    ...middlewares: Middleware<T>[]) {

    let state = initialState

    const getState = () => state

    const dispatch = (action: Action) => {
      const lastState = state
      state = reducer(state, action)
      if (lastState !== state) {
        this.#subscriptions.forEach(c => c(state))
      }
    }

    this.getState = getState
    this.dispatch = dispatch

    if (middlewares) {
      const middlewareAPI = {
        getState: getState,
        dispatch: (a: Action) => { throw new Error(); }
      };

      const chain = middlewares.map(middleware => middleware(middlewareAPI));
      this.dispatch = compose(chain)(dispatch);
    }
  }

  subscribe(observer: Observer<T>): () => void {
    this.#subscriptions.push(observer);
    return () => {
      const i = this.#subscriptions.indexOf(observer);
      if (i === -1) {
        return
      }
      this.#subscriptions.splice(i, 1)
    }
  }
}


