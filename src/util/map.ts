

export const map =
  <T, U>(mapper: (t: T) => U) =>
    (items: T[]) =>
      items.map(mapper);
