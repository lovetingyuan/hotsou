/**
 * @example
 * UseStateByKey<'abc', TType> == { abc: TType, setAbc: (a: TType) => void }
 */
declare type UseStateByKey<K extends string, T> = Omit<
  {
    [P in K]: T;
  } & {
    [P in `set${Capitalize<K>}`]: (a: T) => void;
  },
  ""
>;
