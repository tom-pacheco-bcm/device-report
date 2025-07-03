
export const filter =
  <T>(predicate: (t: T) => boolean) =>
    (items: T[]) =>
      items.filter(predicate);
