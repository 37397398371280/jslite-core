export type Primitive = string | number | boolean | symbol | bigint | null | undefined;
export type Predicate<T> = (value: T, indexOrKey: number | string, collection: unknown) => boolean;
export type Iteratee<T, R> = (value: T, indexOrKey: number | string, collection: unknown) => R;

export interface EraReport {
  highest: string;
  capabilities: Record<string, boolean>;
}

export interface RetryOptions {
  retries?: number;
  delay?: number;
  backoff?: number;
}

export interface LiteAPI {
  version: string;
  era: {
    detect(): EraReport;
    isAtLeast(yearOrVer: string | number): boolean;
  };
  typeOf(val: unknown): string;
  isNil(v: unknown): v is null | undefined;
  isObj(v: unknown): v is object;
  isPlainObj(v: unknown): v is Record<string, unknown>;
  isFn(v: unknown): v is (...args: unknown[]) => unknown;
  isArr(v: unknown): v is unknown[];
  isNum(v: unknown): v is number;
  isStr(v: unknown): v is string;
  isBool(v: unknown): v is boolean;
  isEmpty(v: unknown): boolean;
  each<T>(collection: T[] | Record<string, T> | null | undefined, iteratee: (value: T, key: number | string, collection: unknown) => boolean | void): typeof collection;
  map<T, R>(collection: T[] | Record<string, T> | null | undefined, iteratee: Iteratee<T, R> | string): R[];
  filter<T>(collection: T[] | null | undefined, predicate: Predicate<T>): T[];
  reject<T>(collection: T[] | null | undefined, predicate: Predicate<T>): T[];
  reduce<T, A>(collection: T[] | null | undefined, reducer: (acc: A, value: T, key: number | string, collection: unknown) => A, initial?: A): A;
  find<T>(collection: T[] | null | undefined, predicate: Predicate<T>): T | undefined;
  findLast<T>(arr: T[] | null | undefined, predicate: Predicate<T>): T | undefined;
  some<T>(collection: T[] | null | undefined, predicate: Predicate<T>): boolean;
  every<T>(collection: T[] | null | undefined, predicate: Predicate<T>): boolean;
  includes<T>(arr: T[] | null | undefined, item: T, fromIndex?: number): boolean;
  at<T>(arrOrStr: T[] | string | null | undefined, index: number): T | string | undefined;
  flatten<T>(arr: unknown[] | null | undefined, depth?: number): T[];
  flatMap<T, R>(arr: T[] | null | undefined, fn: Iteratee<T, R | R[]>): R[];
  chunk<T>(arr: T[] | null | undefined, size?: number): T[][];
  compact<T>(arr: T[] | null | undefined): NonNullable<T>[];
  unique<T>(arr: T[] | null | undefined, keyFn?: (item: T) => unknown): T[];
  groupBy<T>(arr: T[] | null | undefined, keyOrFn: string | ((item: T) => string | number)): Record<string, T[]>;
  countBy<T>(arr: T[] | null | undefined, keyOrFn: string | ((item: T) => string | number)): Record<string, number>;
  keyBy<T>(arr: T[] | null | undefined, keyOrFn: string | ((item: T) => string | number)): Record<string, T>;
  sortBy<T>(arr: T[] | null | undefined, keyOrFn: string | ((item: T) => unknown), descending?: boolean): T[];
  zip(...arrays: unknown[][]): unknown[][];
  range(start: number, end?: number, step?: number): number[];
  setOps: {
    toArray<T>(s: Iterable<T> | T[]): T[];
    union<T>(a: Iterable<T> | T[], b: Iterable<T> | T[]): T[];
    intersection<T>(a: Iterable<T> | T[], b: Iterable<T> | T[]): T[];
    difference<T>(a: Iterable<T> | T[], b: Iterable<T> | T[]): T[];
    symmetricDifference<T>(a: Iterable<T> | T[], b: Iterable<T> | T[]): T[];
    isSubsetOf<T>(a: Iterable<T> | T[], b: Iterable<T> | T[]): boolean;
    isSupersetOf<T>(a: Iterable<T> | T[], b: Iterable<T> | T[]): boolean;
    isDisjointFrom<T>(a: Iterable<T> | T[], b: Iterable<T> | T[]): boolean;
  };
  get<T = unknown>(obj: unknown, path: string, fallback?: T): T;
  set<T = unknown>(obj: Record<string, unknown>, path: string, value: T): Record<string, unknown>;
  keysOf(obj: unknown): string[];
  valuesOf<T = unknown>(obj: unknown): T[];
  entriesOf<T = unknown>(obj: unknown): [string, T][];
  fromEntries<T = unknown>(entries: [string, T][]): Record<string, T>;
  pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
  omit<T extends object>(obj: T, keys: string[]): Partial<T>;
  clone<T>(val: T, deep?: boolean): T;
  merge(...sources: Record<string, unknown>[]): Record<string, unknown>;
  equal(a: unknown, b: unknown): boolean;
  trim(str: unknown): string;
  padStart(str: unknown, targetLength: number, padString?: string): string;
  padEnd(str: unknown, targetLength: number, padString?: string): string;
  replaceAll(str: unknown, search: string, replacement: string | ((match: string, offset: number, input: string) => string)): string;
  escapeRegex(str: unknown): string;
  camelCase(str: unknown): string;
  kebabCase(str: unknown): string;
  snakeCase(str: unknown): string;
  capitalize(str: unknown): string;
  template(str: unknown, data?: Record<string, unknown>): string;
  query: {
    parse(qs?: string): Record<string, string | string[]>;
    stringify(obj?: Record<string, unknown>): string;
  };
  clamp(num: number, min: number, max: number): number;
  sumPrecise(values: number[]): number;
  roundTo(num: number, decimals?: number): number;
  randomInt(min: number, max: number): number;
  once<T extends (...args: unknown[]) => unknown>(fn: T): T;
  memoize<T extends (...args: unknown[]) => unknown>(fn: T, resolver?: (...args: unknown[]) => unknown): T;
  pipe<T = unknown>(...fns: Array<(arg: unknown) => unknown>): (initial?: T) => unknown;
  compose<T = unknown>(...fns: Array<(arg: unknown) => unknown>): (initial?: T) => unknown;
  debounce<T extends (...args: unknown[]) => unknown>(fn: T, wait?: number): (...args: Parameters<T>) => void;
  throttle<T extends (...args: unknown[]) => unknown>(fn: T, limit?: number): (...args: Parameters<T>) => void;
  uid(prefix?: string): string;
  withResolvers<T = unknown>(): {
    promise: Promise<T> | null;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
  };
  sleep(ms: number, cb?: () => void): Promise<number> | undefined;
  retry<T>(fn: (attempt: number) => Promise<T> | T, opts?: RetryOptions, cb?: (err: unknown, val?: T) => void): Promise<T> | T;
  storage: {
    get<T = unknown>(key: string, fallback?: T): T;
    set(key: string, value: unknown): boolean;
    remove(key: string): void;
  };
}

declare const lite: LiteAPI;
export { lite };
