
declare type Dictionary<T> = { [key: string | symbol]: T }

declare type ValueProps = Dictionary<string>

declare type Predicate<T> = (t: T) => boolean;
