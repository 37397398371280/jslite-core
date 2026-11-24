export type EraName =
  | "ES3"
  | "ES5"
  | "ES6"
  | "ES2016"
  | "ES2017"
  | "ES2018"
  | "ES2019"
  | "ES2020"
  | "ES2021"
  | "ES2022"
  | "ES2023"
  | "ES2024"
  | "ES2025"
  | "ES2026";

export interface EraCapabilities {
  es3: boolean;
  es5: boolean;
  es6: boolean;
  es2016: boolean;
  es2017: boolean;
  es2018: boolean;
  es2019: boolean;
  es2020: boolean;
  es2021: boolean;
  es2022: boolean;
  es2023: boolean;
  es2024: boolean;
  es2025: boolean;
  es2026: boolean;
}

export interface EraReport {
  highest: EraName;
  capabilities: EraCapabilities;
}

export interface EraAPI {
  detect(): EraReport;
  isAtLeast(version: string): boolean;
}

export type Collection<T> =
  | T[]
  | ArrayLike<T>
  | Record<string, T>
  | Set<T>
  | Map<any, T>
  | null
  | undefined;

export interface SetOpsAPI {
  toArray<T>(input: T[] | Set<T>): T[];
  union<T>(a: T[] | Set<T>, b: T[] | Set<T>): T[];
  intersection<T>(a: T[] | Set<T>, b: T[] | Set<T>): T[];
  difference<T>(a: T[] | Set<T>, b: T[] | Set<T>): T[];
  symmetricDifference<T>(a: T[] | Set<T>, b: T[] | Set<T>): T[];
  isSubsetOf<T>(a: T[] | Set<T>, b: T[] | Set<T>): boolean;
  isSupersetOf<T>(a: T[] | Set<T>, b: T[] | Set<T>): boolean;
  isDisjointFrom<T>(a: T[] | Set<T>, b: T[] | Set<T>): boolean;
}

export interface QueryAPI {
  parse(qs?: string | null): Record<string, string | string[]>;
  stringify(obj?: Record<string, any> | null): string;
}

export interface RetryOptions {
  retries?: number;
  delay?: number;
  backoff?: number;
}

export interface Deferred<T = any> {
  promise: Promise<T> | null;
  resolve: ((value: T | PromiseLike<T>) => void) | undefined;
  reject: ((reason?: any) => void) | undefined;
}

export interface StorageAPI {
  get<T = any>(key: string, fallback?: T): T | null;
  set(key: string, value: any): boolean;
  remove(key: string): void;
}

export interface DomCreateAttrs {
  class?: string | string[];
  className?: string | string[];
  text?: string | number | boolean;
  html?: string;
  style?: Record<string, string | number>;
  [key: string]: any;
}

export type DomChild = Node | string | number | boolean | null | undefined;

export interface DomAPI {
  $(selector: string, scope?: ParentNode | null): Element | null;
  $$(selector: string, scope?: ParentNode | null): Element[];
  on(
    target: EventTarget | null | undefined,
    eventName: string,
    handler: (event: any) => any,
    opts?: boolean | AddEventListenerOptions
  ): () => void;
  create(
    tagName: string,
    attrs?: DomCreateAttrs | null,
    children?: DomChild | DomChild[] | null
  ): HTMLElement | null;
  copyText(text: string): Promise<boolean> | boolean;
}

export type DateInput = Date | number | string;

export interface DateAPI {
  now(): number;
  isValid(input: DateInput): boolean;
  format(input: DateInput, pattern?: string, useUtc?: boolean): string;
  addDays(input: DateInput, days: number): Date;
  diffDays(startInput: DateInput, endInput: DateInput): number;
  startOfDay(input: DateInput, useUtc?: boolean): Date;
}

export interface EncodingAPI {
  utf8Encode(str?: string | null): number[];
  utf8Decode(bytes?: number[] | null): string;
  base64Encode(str?: string | null): string;
  base64Decode(b64?: string | null): string;
  base64EncodeBytes(bytes: number[]): string;
  base64DecodeBytes(b64?: string | null): number[];
  hexEncode(str?: string | null): string;
  hexDecode(hex?: string | null): string;
  hexEncodeBytes(bytes: number[]): string;
  hexDecodeBytes(hex?: string | null): number[];
}

export interface CompressOptions {
  mangle?: boolean;
}

export interface CompressResult {
  code: string;
  originalBytes: number;
  compressedBytes: number;
  savedBytes: number;
  ratio: number;
  renamed: Record<string, string>;
}

export interface LiteAPI {
  version: string;
  era: EraAPI;
  typeOf(val: any): string;
  isNil(v: any): v is null | undefined;
  isObj(v: any): v is object;
  isPlainObj(v: any): v is Record<string, any>;
  isFn(v: any): v is (...args: any[]) => any;
  isArr(v: any): v is any[];
  isNum(v: any): v is number;
  isStr(v: any): v is string;
  isBool(v: any): v is boolean;
  isEmpty(v: any): boolean;

  each<T>(collection: Collection<T>, iteratee: (value: T, key: any, collection: any) => boolean | void): Collection<T>;
  map<T, R = any>(collection: Collection<T>, iteratee: ((value: T, key: any, collection: any) => R) | string): R[];
  filter<T>(collection: Collection<T>, predicate: (value: T, key: any, collection: any) => boolean): T[];
  reject<T>(collection: Collection<T>, predicate: (value: T, key: any, collection: any) => boolean): T[];
  reduce<T, R = T>(
    collection: Collection<T>,
    reducer: (accumulator: R, value: T, key: any, collection: any) => R,
    initial?: R
  ): R;
  find<T>(collection: Collection<T>, predicate: (value: T, key: any, collection: any) => boolean): T | undefined;
  findLast<T>(arr: T[] | null | undefined, predicate: (value: T, index: number, array: T[]) => boolean): T | undefined;
  some<T>(collection: Collection<T>, predicate: (value: T, key: any, collection: any) => boolean): boolean;
  every<T>(collection: Collection<T>, predicate: (value: T, key: any, collection: any) => boolean): boolean;
  includes<T>(arr: T[] | null | undefined, item: T, fromIndex?: number): boolean;
  at<T>(arr: T[] | null | undefined, index: number): T | undefined;
  at(str: string | null | undefined, index: number): string | undefined;

  flatten<T = any>(arr: any[] | null | undefined, depth?: number): T[];
  flatMap<T, R = any>(arr: T[] | null | undefined, fn: (value: T, index: number, array: T[]) => R | R[]): R[];
  chunk<T>(arr: T[] | null | undefined, size: number): T[][];
  compact<T>(arr: T[] | null | undefined): NonNullable<T>[];
  unique<T>(arr: T[] | null | undefined, keyFn?: ((item: T) => any) | null): T[];
  groupBy<T>(arr: T[] | null | undefined, keyOrFn: string | ((item: T) => string | number)): Record<string, T[]>;
  countBy<T>(arr: T[] | null | undefined, keyOrFn: string | ((item: T) => string | number)): Record<string, number>;
  keyBy<T>(arr: T[] | null | undefined, keyOrFn: string | ((item: T) => string | number)): Record<string, T>;
  sortBy<T>(arr: T[] | null | undefined, keyOrFn: string | ((item: T) => any), descending?: boolean): T[];
  zip<T = any>(...arrays: any[][]): T[][];
  range(startOrEnd: number, end?: number, step?: number): number[];

  setOps: SetOpsAPI;

  get<T = any>(obj: any, path: string, fallback?: T): T;
  set<T extends object = any>(obj: T, path: string, value: any): T;
  keysOf(obj: any): string[];
  valuesOf<T = any>(obj: any): T[];
  entriesOf<T = any>(obj: any): [string, T][];
  fromEntries<T = any>(entries: [string, T][] | null | undefined): Record<string, T>;
  pick<T extends object, K extends keyof T>(obj: T | null | undefined, keys: K[]): Pick<T, K>;
  omit<T extends object, K extends keyof T>(obj: T | null | undefined, keys: K[]): Omit<T, K>;
  clone<T>(val: T, deep?: boolean): T;
  merge<T extends Record<string, any> = Record<string, any>>(...sources: Record<string, any>[]): T;
  equal(a: any, b: any): boolean;

  trim(str?: string | null): string;
  padStart(str: string | number | null | undefined, targetLength: number, padString?: string): string;
  padEnd(str: string | number | null | undefined, targetLength: number, padString?: string): string;
  replaceAll(
    str: string | null | undefined,
    search: string,
    replacement: string | ((match: string, offset: number, source: string) => string)
  ): string;
  escapeRegex(str?: string | null): string;
  camelCase(str?: string | null): string;
  kebabCase(str?: string | null): string;
  snakeCase(str?: string | null): string;
  capitalize(str?: string | null): string;
  template(str: string | null | undefined, data?: Record<string, any>): string;
  query: QueryAPI;

  clamp(num: number, min: number, max: number): number;
  sumPrecise(values: number[] | null | undefined): number;
  roundTo(num: number, decimals?: number): number;
  randomInt(min: number, max: number): number;

  once<F extends (...args: any[]) => any>(fn: F): F;
  memoize<F extends (...args: any[]) => any>(fn: F, resolver?: (...args: Parameters<F>) => string | number): F;
  pipe<T = any>(...fns: ((arg: any) => any)[]): (initial?: T) => any;
  compose<T = any>(...fns: ((arg: any) => any)[]): (initial?: T) => any;
  debounce<F extends (...args: any[]) => any>(fn: F, wait?: number): (...args: Parameters<F>) => void;
  throttle<F extends (...args: any[]) => any>(fn: F, limit?: number): (...args: Parameters<F>) => void;
  uid(prefix?: string): string;

  withResolvers<T = any>(): Deferred<T>;
  sleep(ms: number, cb?: () => void): Promise<number> | undefined;
  retry<T = any>(
    fn: (attempt: number) => Promise<T> | T,
    opts?: RetryOptions,
    cb?: (err: any, result?: T) => void
  ): Promise<T> | T;
  storage: StorageAPI;

  dom: DomAPI;
  date: DateAPI;
  encoding: EncodingAPI;

  compress(code?: string | null, opts?: CompressOptions): CompressResult;
  minify(code?: string | null, opts?: CompressOptions): CompressResult;
}

declare const lite: LiteAPI;

export default lite;

export const version: LiteAPI["version"];
export const era: LiteAPI["era"];
export const typeOf: LiteAPI["typeOf"];
export const isNil: LiteAPI["isNil"];
export const isObj: LiteAPI["isObj"];
export const isPlainObj: LiteAPI["isPlainObj"];
export const isFn: LiteAPI["isFn"];
export const isArr: LiteAPI["isArr"];
export const isNum: LiteAPI["isNum"];
export const isStr: LiteAPI["isStr"];
export const isBool: LiteAPI["isBool"];
export const isEmpty: LiteAPI["isEmpty"];
export const each: LiteAPI["each"];
export const map: LiteAPI["map"];
export const filter: LiteAPI["filter"];
export const reject: LiteAPI["reject"];
export const reduce: LiteAPI["reduce"];
export const find: LiteAPI["find"];
export const findLast: LiteAPI["findLast"];
export const some: LiteAPI["some"];
export const every: LiteAPI["every"];
export const includes: LiteAPI["includes"];
export const at: LiteAPI["at"];
export const flatten: LiteAPI["flatten"];
export const flatMap: LiteAPI["flatMap"];
export const chunk: LiteAPI["chunk"];
export const compact: LiteAPI["compact"];
export const unique: LiteAPI["unique"];
export const groupBy: LiteAPI["groupBy"];
export const countBy: LiteAPI["countBy"];
export const keyBy: LiteAPI["keyBy"];
export const sortBy: LiteAPI["sortBy"];
export const zip: LiteAPI["zip"];
export const range: LiteAPI["range"];
export const setOps: LiteAPI["setOps"];
export const get: LiteAPI["get"];
export const set: LiteAPI["set"];
export const keysOf: LiteAPI["keysOf"];
export const valuesOf: LiteAPI["valuesOf"];
export const entriesOf: LiteAPI["entriesOf"];
export const fromEntries: LiteAPI["fromEntries"];
export const pick: LiteAPI["pick"];
export const omit: LiteAPI["omit"];
export const clone: LiteAPI["clone"];
export const merge: LiteAPI["merge"];
export const equal: LiteAPI["equal"];
export const trim: LiteAPI["trim"];
export const padStart: LiteAPI["padStart"];
export const padEnd: LiteAPI["padEnd"];
export const replaceAll: LiteAPI["replaceAll"];
export const escapeRegex: LiteAPI["escapeRegex"];
export const camelCase: LiteAPI["camelCase"];
export const kebabCase: LiteAPI["kebabCase"];
export const snakeCase: LiteAPI["snakeCase"];
export const capitalize: LiteAPI["capitalize"];
export const template: LiteAPI["template"];
export const query: LiteAPI["query"];
export const clamp: LiteAPI["clamp"];
export const sumPrecise: LiteAPI["sumPrecise"];
export const roundTo: LiteAPI["roundTo"];
export const randomInt: LiteAPI["randomInt"];
export const once: LiteAPI["once"];
export const memoize: LiteAPI["memoize"];
export const pipe: LiteAPI["pipe"];
export const compose: LiteAPI["compose"];
export const debounce: LiteAPI["debounce"];
export const throttle: LiteAPI["throttle"];
export const uid: LiteAPI["uid"];
export const withResolvers: LiteAPI["withResolvers"];
export const sleep: LiteAPI["sleep"];
export const retry: LiteAPI["retry"];
export const storage: LiteAPI["storage"];
export const dom: LiteAPI["dom"];
export const date: LiteAPI["date"];
export const encoding: LiteAPI["encoding"];
export const compress: LiteAPI["compress"];
export const minify: LiteAPI["minify"];
