declare module 'tough-cookie' {
  export class Cookie {
    constructor(options?: any);
    key?: string;
    value?: string;
    [key: string]: any;
  }

  export class CookieJar {
    constructor(options?: any);
    setCookie(
      cookie: Cookie | string,
      url: string,
      options?: any,
      callback?: (err: Error | null, cookie?: Cookie) => void
    ): Cookie | undefined;
    getCookies(
      url: string,
      options?: any,
      callback?: (err: Error | null, cookies?: Cookie[]) => void
    ): Cookie[] | undefined;
    [key: string]: any;
  }

  export interface ParsedCookie {
    key?: string;
    value?: string;
    [key: string]: any;
  }

  export function parse(str: string): ParsedCookie | undefined;
}
