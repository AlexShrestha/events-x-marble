import { createRequire as __createRequire } from 'node:module';
const require = __createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/hono/dist/compose.js
var compose;
var init_compose = __esm({
  "node_modules/hono/dist/compose.js"() {
    compose = (middleware, onError, onNotFound) => {
      return (context, next) => {
        let index = -1;
        return dispatch(0);
        async function dispatch(i) {
          if (i <= index) {
            throw new Error("next() called multiple times");
          }
          index = i;
          let res;
          let isError = false;
          let handler2;
          if (middleware[i]) {
            handler2 = middleware[i][0][0];
            context.req.routeIndex = i;
          } else {
            handler2 = i === middleware.length && next || void 0;
          }
          if (handler2) {
            try {
              res = await handler2(context, () => dispatch(i + 1));
            } catch (err) {
              if (err instanceof Error && onError) {
                context.error = err;
                res = await onError(err, context);
                isError = true;
              } else {
                throw err;
              }
            }
          } else {
            if (context.finalized === false && onNotFound) {
              res = await onNotFound(context);
            }
          }
          if (res && (context.finalized === false || isError)) {
            context.res = res;
          }
          return context;
        }
      };
    };
  }
});

// node_modules/hono/dist/http-exception.js
var init_http_exception = __esm({
  "node_modules/hono/dist/http-exception.js"() {
  }
});

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT;
var init_constants = __esm({
  "node_modules/hono/dist/request/constants.js"() {
    GET_MATCH_RESULT = /* @__PURE__ */ Symbol();
  }
});

// node_modules/hono/dist/utils/body.js
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form2 = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form2[key] = value;
    } else {
      handleParsingAllValues(form2, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form2).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form2, key, value);
        delete form2[key];
      }
    });
  }
  return form2;
}
var parseBody, handleParsingAllValues, handleParsingNestedValues;
var init_body = __esm({
  "node_modules/hono/dist/utils/body.js"() {
    init_request();
    parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
      const { all = false, dot = false } = options;
      const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
      const contentType = headers.get("Content-Type");
      if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
        return parseFormData(request, { all, dot });
      }
      return {};
    };
    handleParsingAllValues = (form2, key, value) => {
      if (form2[key] !== void 0) {
        if (Array.isArray(form2[key])) {
          ;
          form2[key].push(value);
        } else {
          form2[key] = [form2[key], value];
        }
      } else {
        if (!key.endsWith("[]")) {
          form2[key] = value;
        } else {
          form2[key] = [value];
        }
      }
    };
    handleParsingNestedValues = (form2, key, value) => {
      if (/(?:^|\.)__proto__\./.test(key)) {
        return;
      }
      let nestedForm = form2;
      const keys = key.split(".");
      keys.forEach((key2, index) => {
        if (index === keys.length - 1) {
          nestedForm[key2] = value;
        } else {
          if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
            nestedForm[key2] = /* @__PURE__ */ Object.create(null);
          }
          nestedForm = nestedForm[key2];
        }
      });
    };
  }
});

// node_modules/hono/dist/utils/url.js
var splitPath, splitRoutingPath, extractGroupsFromPath, replaceGroupMarks, patternCache, getPattern, tryDecode, tryDecodeURI, getPath, getPathNoStrict, mergePath, checkOptionalParameter, _decodeURI, _getQueryParam, getQueryParam, getQueryParams, decodeURIComponent_;
var init_url = __esm({
  "node_modules/hono/dist/utils/url.js"() {
    splitPath = (path) => {
      const paths = path.split("/");
      if (paths[0] === "") {
        paths.shift();
      }
      return paths;
    };
    splitRoutingPath = (routePath) => {
      const { groups, path } = extractGroupsFromPath(routePath);
      const paths = splitPath(path);
      return replaceGroupMarks(paths, groups);
    };
    extractGroupsFromPath = (path) => {
      const groups = [];
      path = path.replace(/\{[^}]+\}/g, (match2, index) => {
        const mark = `@${index}`;
        groups.push([mark, match2]);
        return mark;
      });
      return { groups, path };
    };
    replaceGroupMarks = (paths, groups) => {
      for (let i = groups.length - 1; i >= 0; i--) {
        const [mark] = groups[i];
        for (let j = paths.length - 1; j >= 0; j--) {
          if (paths[j].includes(mark)) {
            paths[j] = paths[j].replace(mark, groups[i][1]);
            break;
          }
        }
      }
      return paths;
    };
    patternCache = {};
    getPattern = (label, next) => {
      if (label === "*") {
        return "*";
      }
      const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      if (match2) {
        const cacheKey2 = `${label}#${next}`;
        if (!patternCache[cacheKey2]) {
          if (match2[2]) {
            patternCache[cacheKey2] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey2, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
          } else {
            patternCache[cacheKey2] = [label, match2[1], true];
          }
        }
        return patternCache[cacheKey2];
      }
      return null;
    };
    tryDecode = (str, decoder) => {
      try {
        return decoder(str);
      } catch {
        return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
          try {
            return decoder(match2);
          } catch {
            return match2;
          }
        });
      }
    };
    tryDecodeURI = (str) => tryDecode(str, decodeURI);
    getPath = (request) => {
      const url = request.url;
      const start = url.indexOf("/", url.indexOf(":") + 4);
      let i = start;
      for (; i < url.length; i++) {
        const charCode = url.charCodeAt(i);
        if (charCode === 37) {
          const queryIndex = url.indexOf("?", i);
          const hashIndex = url.indexOf("#", i);
          const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
          const path = url.slice(start, end);
          return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
        } else if (charCode === 63 || charCode === 35) {
          break;
        }
      }
      return url.slice(start, i);
    };
    getPathNoStrict = (request) => {
      const result = getPath(request);
      return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
    };
    mergePath = (base, sub, ...rest) => {
      if (rest.length) {
        sub = mergePath(sub, ...rest);
      }
      return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
    };
    checkOptionalParameter = (path) => {
      if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
        return null;
      }
      const segments = path.split("/");
      const results = [];
      let basePath = "";
      segments.forEach((segment) => {
        if (segment !== "" && !/\:/.test(segment)) {
          basePath += "/" + segment;
        } else if (/\:/.test(segment)) {
          if (/\?/.test(segment)) {
            if (results.length === 0 && basePath === "") {
              results.push("/");
            } else {
              results.push(basePath);
            }
            const optionalSegment = segment.replace("?", "");
            basePath += "/" + optionalSegment;
            results.push(basePath);
          } else {
            basePath += "/" + segment;
          }
        }
      });
      return results.filter((v, i, a) => a.indexOf(v) === i);
    };
    _decodeURI = (value) => {
      if (!/[%+]/.test(value)) {
        return value;
      }
      if (value.indexOf("+") !== -1) {
        value = value.replace(/\+/g, " ");
      }
      return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
    };
    _getQueryParam = (url, key, multiple) => {
      let encoded;
      if (!multiple && key && !/[%+]/.test(key)) {
        let keyIndex2 = url.indexOf("?", 8);
        if (keyIndex2 === -1) {
          return void 0;
        }
        if (!url.startsWith(key, keyIndex2 + 1)) {
          keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
        }
        while (keyIndex2 !== -1) {
          const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
          if (trailingKeyCode === 61) {
            const valueIndex = keyIndex2 + key.length + 2;
            const endIndex = url.indexOf("&", valueIndex);
            return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
          } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
            return "";
          }
          keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
        }
        encoded = /[%+]/.test(url);
        if (!encoded) {
          return void 0;
        }
      }
      const results = {};
      encoded ??= /[%+]/.test(url);
      let keyIndex = url.indexOf("?", 8);
      while (keyIndex !== -1) {
        const nextKeyIndex = url.indexOf("&", keyIndex + 1);
        let valueIndex = url.indexOf("=", keyIndex);
        if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
          valueIndex = -1;
        }
        let name = url.slice(
          keyIndex + 1,
          valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
        );
        if (encoded) {
          name = _decodeURI(name);
        }
        keyIndex = nextKeyIndex;
        if (name === "") {
          continue;
        }
        let value;
        if (valueIndex === -1) {
          value = "";
        } else {
          value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
          if (encoded) {
            value = _decodeURI(value);
          }
        }
        if (multiple) {
          if (!(results[name] && Array.isArray(results[name]))) {
            results[name] = [];
          }
          ;
          results[name].push(value);
        } else {
          results[name] ??= value;
        }
      }
      return key ? results[key] : results;
    };
    getQueryParam = _getQueryParam;
    getQueryParams = (url, key) => {
      return _getQueryParam(url, key, true);
    };
    decodeURIComponent_ = decodeURIComponent;
  }
});

// node_modules/hono/dist/request.js
var tryDecodeURIComponent, HonoRequest;
var init_request = __esm({
  "node_modules/hono/dist/request.js"() {
    init_http_exception();
    init_constants();
    init_body();
    init_url();
    tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
    HonoRequest = class {
      /**
       * `.raw` can get the raw Request object.
       *
       * @see {@link https://hono.dev/docs/api/request#raw}
       *
       * @example
       * ```ts
       * // For Cloudflare Workers
       * app.post('/', async (c) => {
       *   const metadata = c.req.raw.cf?.hostMetadata?
       *   ...
       * })
       * ```
       */
      raw;
      #validatedData;
      // Short name of validatedData
      #matchResult;
      routeIndex = 0;
      /**
       * `.path` can get the pathname of the request.
       *
       * @see {@link https://hono.dev/docs/api/request#path}
       *
       * @example
       * ```ts
       * app.get('/about/me', (c) => {
       *   const pathname = c.req.path // `/about/me`
       * })
       * ```
       */
      path;
      bodyCache = {};
      constructor(request, path = "/", matchResult = [[]]) {
        this.raw = request;
        this.path = path;
        this.#matchResult = matchResult;
        this.#validatedData = {};
      }
      param(key) {
        return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
      }
      #getDecodedParam(key) {
        const paramKey = this.#matchResult[0][this.routeIndex][1][key];
        const param = this.#getParamValue(paramKey);
        return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
      }
      #getAllDecodedParams() {
        const decoded = {};
        const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
        for (const key of keys) {
          const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
          if (value !== void 0) {
            decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
          }
        }
        return decoded;
      }
      #getParamValue(paramKey) {
        return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
      }
      query(key) {
        return getQueryParam(this.url, key);
      }
      queries(key) {
        return getQueryParams(this.url, key);
      }
      header(name) {
        if (name) {
          return this.raw.headers.get(name) ?? void 0;
        }
        const headerData = {};
        this.raw.headers.forEach((value, key) => {
          headerData[key] = value;
        });
        return headerData;
      }
      async parseBody(options) {
        return parseBody(this, options);
      }
      #cachedBody = (key) => {
        const { bodyCache, raw: raw2 } = this;
        const cachedBody = bodyCache[key];
        if (cachedBody) {
          return cachedBody;
        }
        const anyCachedKey = Object.keys(bodyCache)[0];
        if (anyCachedKey) {
          return bodyCache[anyCachedKey].then((body) => {
            if (anyCachedKey === "json") {
              body = JSON.stringify(body);
            }
            return new Response(body)[key]();
          });
        }
        return bodyCache[key] = raw2[key]();
      };
      /**
       * `.json()` can parse Request body of type `application/json`
       *
       * @see {@link https://hono.dev/docs/api/request#json}
       *
       * @example
       * ```ts
       * app.post('/entry', async (c) => {
       *   const body = await c.req.json()
       * })
       * ```
       */
      json() {
        return this.#cachedBody("text").then((text) => JSON.parse(text));
      }
      /**
       * `.text()` can parse Request body of type `text/plain`
       *
       * @see {@link https://hono.dev/docs/api/request#text}
       *
       * @example
       * ```ts
       * app.post('/entry', async (c) => {
       *   const body = await c.req.text()
       * })
       * ```
       */
      text() {
        return this.#cachedBody("text");
      }
      /**
       * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
       *
       * @see {@link https://hono.dev/docs/api/request#arraybuffer}
       *
       * @example
       * ```ts
       * app.post('/entry', async (c) => {
       *   const body = await c.req.arrayBuffer()
       * })
       * ```
       */
      arrayBuffer() {
        return this.#cachedBody("arrayBuffer");
      }
      /**
       * Parses the request body as a `Blob`.
       * @example
       * ```ts
       * app.post('/entry', async (c) => {
       *   const body = await c.req.blob();
       * });
       * ```
       * @see https://hono.dev/docs/api/request#blob
       */
      blob() {
        return this.#cachedBody("blob");
      }
      /**
       * Parses the request body as `FormData`.
       * @example
       * ```ts
       * app.post('/entry', async (c) => {
       *   const body = await c.req.formData();
       * });
       * ```
       * @see https://hono.dev/docs/api/request#formdata
       */
      formData() {
        return this.#cachedBody("formData");
      }
      /**
       * Adds validated data to the request.
       *
       * @param target - The target of the validation.
       * @param data - The validated data to add.
       */
      addValidatedData(target, data) {
        this.#validatedData[target] = data;
      }
      valid(target) {
        return this.#validatedData[target];
      }
      /**
       * `.url()` can get the request url strings.
       *
       * @see {@link https://hono.dev/docs/api/request#url}
       *
       * @example
       * ```ts
       * app.get('/about/me', (c) => {
       *   const url = c.req.url // `http://localhost:8787/about/me`
       *   ...
       * })
       * ```
       */
      get url() {
        return this.raw.url;
      }
      /**
       * `.method()` can get the method name of the request.
       *
       * @see {@link https://hono.dev/docs/api/request#method}
       *
       * @example
       * ```ts
       * app.get('/about/me', (c) => {
       *   const method = c.req.method // `GET`
       * })
       * ```
       */
      get method() {
        return this.raw.method;
      }
      get [GET_MATCH_RESULT]() {
        return this.#matchResult;
      }
      /**
       * `.matchedRoutes()` can return a matched route in the handler
       *
       * @deprecated
       *
       * Use matchedRoutes helper defined in "hono/route" instead.
       *
       * @see {@link https://hono.dev/docs/api/request#matchedroutes}
       *
       * @example
       * ```ts
       * app.use('*', async function logger(c, next) {
       *   await next()
       *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
       *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
       *     console.log(
       *       method,
       *       ' ',
       *       path,
       *       ' '.repeat(Math.max(10 - path.length, 0)),
       *       name,
       *       i === c.req.routeIndex ? '<- respond from here' : ''
       *     )
       *   })
       * })
       * ```
       */
      get matchedRoutes() {
        return this.#matchResult[0].map(([[, route]]) => route);
      }
      /**
       * `routePath()` can retrieve the path registered within the handler
       *
       * @deprecated
       *
       * Use routePath helper defined in "hono/route" instead.
       *
       * @see {@link https://hono.dev/docs/api/request#routepath}
       *
       * @example
       * ```ts
       * app.get('/posts/:id', (c) => {
       *   return c.json({ path: c.req.routePath })
       * })
       * ```
       */
      get routePath() {
        return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
      }
    };
  }
});

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase, raw, escapeRe, stringBufferToString, escapeToBuffer, resolveCallbackSync, resolveCallback;
var init_html = __esm({
  "node_modules/hono/dist/utils/html.js"() {
    HtmlEscapedCallbackPhase = {
      Stringify: 1,
      BeforeStream: 2,
      Stream: 3
    };
    raw = (value, callbacks) => {
      const escapedString = new String(value);
      escapedString.isEscaped = true;
      escapedString.callbacks = callbacks;
      return escapedString;
    };
    escapeRe = /[&<>'"]/;
    stringBufferToString = async (buffer, callbacks) => {
      let str = "";
      callbacks ||= [];
      const resolvedBuffer = await Promise.all(buffer);
      for (let i = resolvedBuffer.length - 1; ; i--) {
        str += resolvedBuffer[i];
        i--;
        if (i < 0) {
          break;
        }
        let r = resolvedBuffer[i];
        if (typeof r === "object") {
          callbacks.push(...r.callbacks || []);
        }
        const isEscaped = r.isEscaped;
        r = await (typeof r === "object" ? r.toString() : r);
        if (typeof r === "object") {
          callbacks.push(...r.callbacks || []);
        }
        if (r.isEscaped ?? isEscaped) {
          str += r;
        } else {
          const buf = [str];
          escapeToBuffer(r, buf);
          str = buf[0];
        }
      }
      return raw(str, callbacks);
    };
    escapeToBuffer = (str, buffer) => {
      const match2 = str.search(escapeRe);
      if (match2 === -1) {
        buffer[0] += str;
        return;
      }
      let escape;
      let index;
      let lastIndex = 0;
      for (index = match2; index < str.length; index++) {
        switch (str.charCodeAt(index)) {
          case 34:
            escape = "&quot;";
            break;
          case 39:
            escape = "&#39;";
            break;
          case 38:
            escape = "&amp;";
            break;
          case 60:
            escape = "&lt;";
            break;
          case 62:
            escape = "&gt;";
            break;
          default:
            continue;
        }
        buffer[0] += str.substring(lastIndex, index) + escape;
        lastIndex = index + 1;
      }
      buffer[0] += str.substring(lastIndex, index);
    };
    resolveCallbackSync = (str) => {
      const callbacks = str.callbacks;
      if (!callbacks?.length) {
        return str;
      }
      const buffer = [str];
      const context = {};
      callbacks.forEach((c) => c({ phase: HtmlEscapedCallbackPhase.Stringify, buffer, context }));
      return buffer[0];
    };
    resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
      if (typeof str === "object" && !(str instanceof String)) {
        if (!(str instanceof Promise)) {
          str = str.toString();
        }
        if (str instanceof Promise) {
          str = await str;
        }
      }
      const callbacks = str.callbacks;
      if (!callbacks?.length) {
        return Promise.resolve(str);
      }
      if (buffer) {
        buffer[0] += str;
      } else {
        buffer = [str];
      }
      const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
        (res) => Promise.all(
          res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
        ).then(() => buffer[0])
      );
      if (preserveCallbacks) {
        return raw(await resStr, callbacks);
      } else {
        return resStr;
      }
    };
  }
});

// node_modules/hono/dist/context.js
var TEXT_PLAIN, setDefaultContentType, createResponseInstance, Context;
var init_context = __esm({
  "node_modules/hono/dist/context.js"() {
    init_request();
    init_html();
    TEXT_PLAIN = "text/plain; charset=UTF-8";
    setDefaultContentType = (contentType, headers) => {
      return {
        "Content-Type": contentType,
        ...headers
      };
    };
    createResponseInstance = (body, init) => new Response(body, init);
    Context = class {
      #rawRequest;
      #req;
      /**
       * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
       *
       * @see {@link https://hono.dev/docs/api/context#env}
       *
       * @example
       * ```ts
       * // Environment object for Cloudflare Workers
       * app.get('*', async c => {
       *   const counter = c.env.COUNTER
       * })
       * ```
       */
      env = {};
      #var;
      finalized = false;
      /**
       * `.error` can get the error object from the middleware if the Handler throws an error.
       *
       * @see {@link https://hono.dev/docs/api/context#error}
       *
       * @example
       * ```ts
       * app.use('*', async (c, next) => {
       *   await next()
       *   if (c.error) {
       *     // do something...
       *   }
       * })
       * ```
       */
      error;
      #status;
      #executionCtx;
      #res;
      #layout;
      #renderer;
      #notFoundHandler;
      #preparedHeaders;
      #matchResult;
      #path;
      /**
       * Creates an instance of the Context class.
       *
       * @param req - The Request object.
       * @param options - Optional configuration options for the context.
       */
      constructor(req, options) {
        this.#rawRequest = req;
        if (options) {
          this.#executionCtx = options.executionCtx;
          this.env = options.env;
          this.#notFoundHandler = options.notFoundHandler;
          this.#path = options.path;
          this.#matchResult = options.matchResult;
        }
      }
      /**
       * `.req` is the instance of {@link HonoRequest}.
       */
      get req() {
        this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
        return this.#req;
      }
      /**
       * @see {@link https://hono.dev/docs/api/context#event}
       * The FetchEvent associated with the current request.
       *
       * @throws Will throw an error if the context does not have a FetchEvent.
       */
      get event() {
        if (this.#executionCtx && "respondWith" in this.#executionCtx) {
          return this.#executionCtx;
        } else {
          throw Error("This context has no FetchEvent");
        }
      }
      /**
       * @see {@link https://hono.dev/docs/api/context#executionctx}
       * The ExecutionContext associated with the current request.
       *
       * @throws Will throw an error if the context does not have an ExecutionContext.
       */
      get executionCtx() {
        if (this.#executionCtx) {
          return this.#executionCtx;
        } else {
          throw Error("This context has no ExecutionContext");
        }
      }
      /**
       * @see {@link https://hono.dev/docs/api/context#res}
       * The Response object for the current request.
       */
      get res() {
        return this.#res ||= createResponseInstance(null, {
          headers: this.#preparedHeaders ??= new Headers()
        });
      }
      /**
       * Sets the Response object for the current request.
       *
       * @param _res - The Response object to set.
       */
      set res(_res) {
        if (this.#res && _res) {
          _res = createResponseInstance(_res.body, _res);
          for (const [k, v] of this.#res.headers.entries()) {
            if (k === "content-type") {
              continue;
            }
            if (k === "set-cookie") {
              const cookies = this.#res.headers.getSetCookie();
              _res.headers.delete("set-cookie");
              for (const cookie of cookies) {
                _res.headers.append("set-cookie", cookie);
              }
            } else {
              _res.headers.set(k, v);
            }
          }
        }
        this.#res = _res;
        this.finalized = true;
      }
      /**
       * `.render()` can create a response within a layout.
       *
       * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
       *
       * @example
       * ```ts
       * app.get('/', (c) => {
       *   return c.render('Hello!')
       * })
       * ```
       */
      render = (...args) => {
        this.#renderer ??= (content) => this.html(content);
        return this.#renderer(...args);
      };
      /**
       * Sets the layout for the response.
       *
       * @param layout - The layout to set.
       * @returns The layout function.
       */
      setLayout = (layout) => this.#layout = layout;
      /**
       * Gets the current layout for the response.
       *
       * @returns The current layout function.
       */
      getLayout = () => this.#layout;
      /**
       * `.setRenderer()` can set the layout in the custom middleware.
       *
       * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
       *
       * @example
       * ```tsx
       * app.use('*', async (c, next) => {
       *   c.setRenderer((content) => {
       *     return c.html(
       *       <html>
       *         <body>
       *           <p>{content}</p>
       *         </body>
       *       </html>
       *     )
       *   })
       *   await next()
       * })
       * ```
       */
      setRenderer = (renderer) => {
        this.#renderer = renderer;
      };
      /**
       * `.header()` can set headers.
       *
       * @see {@link https://hono.dev/docs/api/context#header}
       *
       * @example
       * ```ts
       * app.get('/welcome', (c) => {
       *   // Set headers
       *   c.header('X-Message', 'Hello!')
       *   c.header('Content-Type', 'text/plain')
       *
       *   return c.body('Thank you for coming')
       * })
       * ```
       */
      header = (name, value, options) => {
        if (this.finalized) {
          this.#res = createResponseInstance(this.#res.body, this.#res);
        }
        const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
        if (value === void 0) {
          headers.delete(name);
        } else if (options?.append) {
          headers.append(name, value);
        } else {
          headers.set(name, value);
        }
      };
      status = (status) => {
        this.#status = status;
      };
      /**
       * `.set()` can set the value specified by the key.
       *
       * @see {@link https://hono.dev/docs/api/context#set-get}
       *
       * @example
       * ```ts
       * app.use('*', async (c, next) => {
       *   c.set('message', 'Hono is hot!!')
       *   await next()
       * })
       * ```
       */
      set = (key, value) => {
        this.#var ??= /* @__PURE__ */ new Map();
        this.#var.set(key, value);
      };
      /**
       * `.get()` can use the value specified by the key.
       *
       * @see {@link https://hono.dev/docs/api/context#set-get}
       *
       * @example
       * ```ts
       * app.get('/', (c) => {
       *   const message = c.get('message')
       *   return c.text(`The message is "${message}"`)
       * })
       * ```
       */
      get = (key) => {
        return this.#var ? this.#var.get(key) : void 0;
      };
      /**
       * `.var` can access the value of a variable.
       *
       * @see {@link https://hono.dev/docs/api/context#var}
       *
       * @example
       * ```ts
       * const result = c.var.client.oneMethod()
       * ```
       */
      // c.var.propName is a read-only
      get var() {
        if (!this.#var) {
          return {};
        }
        return Object.fromEntries(this.#var);
      }
      #newResponse(data, arg, headers) {
        const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
        if (typeof arg === "object" && "headers" in arg) {
          const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
          for (const [key, value] of argHeaders) {
            if (key.toLowerCase() === "set-cookie") {
              responseHeaders.append(key, value);
            } else {
              responseHeaders.set(key, value);
            }
          }
        }
        if (headers) {
          for (const [k, v] of Object.entries(headers)) {
            if (typeof v === "string") {
              responseHeaders.set(k, v);
            } else {
              responseHeaders.delete(k);
              for (const v2 of v) {
                responseHeaders.append(k, v2);
              }
            }
          }
        }
        const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
        return createResponseInstance(data, { status, headers: responseHeaders });
      }
      newResponse = (...args) => this.#newResponse(...args);
      /**
       * `.body()` can return the HTTP response.
       * You can set headers with `.header()` and set HTTP status code with `.status`.
       * This can also be set in `.text()`, `.json()` and so on.
       *
       * @see {@link https://hono.dev/docs/api/context#body}
       *
       * @example
       * ```ts
       * app.get('/welcome', (c) => {
       *   // Set headers
       *   c.header('X-Message', 'Hello!')
       *   c.header('Content-Type', 'text/plain')
       *   // Set HTTP status code
       *   c.status(201)
       *
       *   // Return the response body
       *   return c.body('Thank you for coming')
       * })
       * ```
       */
      body = (data, arg, headers) => this.#newResponse(data, arg, headers);
      /**
       * `.text()` can render text as `Content-Type:text/plain`.
       *
       * @see {@link https://hono.dev/docs/api/context#text}
       *
       * @example
       * ```ts
       * app.get('/say', (c) => {
       *   return c.text('Hello!')
       * })
       * ```
       */
      text = (text, arg, headers) => {
        return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
          text,
          arg,
          setDefaultContentType(TEXT_PLAIN, headers)
        );
      };
      /**
       * `.json()` can render JSON as `Content-Type:application/json`.
       *
       * @see {@link https://hono.dev/docs/api/context#json}
       *
       * @example
       * ```ts
       * app.get('/api', (c) => {
       *   return c.json({ message: 'Hello!' })
       * })
       * ```
       */
      json = (object2, arg, headers) => {
        return this.#newResponse(
          JSON.stringify(object2),
          arg,
          setDefaultContentType("application/json", headers)
        );
      };
      html = (html2, arg, headers) => {
        const res = (html22) => this.#newResponse(html22, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
        return typeof html2 === "object" ? resolveCallback(html2, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html2);
      };
      /**
       * `.redirect()` can Redirect, default status code is 302.
       *
       * @see {@link https://hono.dev/docs/api/context#redirect}
       *
       * @example
       * ```ts
       * app.get('/redirect', (c) => {
       *   return c.redirect('/')
       * })
       * app.get('/redirect-permanently', (c) => {
       *   return c.redirect('/', 301)
       * })
       * ```
       */
      redirect = (location, status) => {
        const locationString = String(location);
        this.header(
          "Location",
          // Multibyes should be encoded
          // eslint-disable-next-line no-control-regex
          !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
        );
        return this.newResponse(null, status ?? 302);
      };
      /**
       * `.notFound()` can return the Not Found Response.
       *
       * @see {@link https://hono.dev/docs/api/context#notfound}
       *
       * @example
       * ```ts
       * app.get('/notfound', (c) => {
       *   return c.notFound()
       * })
       * ```
       */
      notFound = () => {
        this.#notFoundHandler ??= () => createResponseInstance();
        return this.#notFoundHandler(this);
      };
    };
  }
});

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL, METHOD_NAME_ALL_LOWERCASE, METHODS, MESSAGE_MATCHER_IS_ALREADY_BUILT, UnsupportedPathError;
var init_router = __esm({
  "node_modules/hono/dist/router.js"() {
    METHOD_NAME_ALL = "ALL";
    METHOD_NAME_ALL_LOWERCASE = "all";
    METHODS = ["get", "post", "put", "delete", "options", "patch"];
    MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
    UnsupportedPathError = class extends Error {
    };
  }
});

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER;
var init_constants2 = __esm({
  "node_modules/hono/dist/utils/constants.js"() {
    COMPOSED_HANDLER = "__COMPOSED_HANDLER";
  }
});

// node_modules/hono/dist/hono-base.js
var notFoundHandler, errorHandler, Hono;
var init_hono_base = __esm({
  "node_modules/hono/dist/hono-base.js"() {
    init_compose();
    init_context();
    init_router();
    init_constants2();
    init_url();
    notFoundHandler = (c) => {
      return c.text("404 Not Found", 404);
    };
    errorHandler = (err, c) => {
      if ("getResponse" in err) {
        const res = err.getResponse();
        return c.newResponse(res.body, res);
      }
      console.error(err);
      return c.text("Internal Server Error", 500);
    };
    Hono = class _Hono {
      get;
      post;
      put;
      delete;
      options;
      patch;
      all;
      on;
      use;
      /*
        This class is like an abstract class and does not have a router.
        To use it, inherit the class and implement router in the constructor.
      */
      router;
      getPath;
      // Cannot use `#` because it requires visibility at JavaScript runtime.
      _basePath = "/";
      #path = "/";
      routes = [];
      constructor(options = {}) {
        const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
        allMethods.forEach((method) => {
          this[method] = (args1, ...args) => {
            if (typeof args1 === "string") {
              this.#path = args1;
            } else {
              this.#addRoute(method, this.#path, args1);
            }
            args.forEach((handler2) => {
              this.#addRoute(method, this.#path, handler2);
            });
            return this;
          };
        });
        this.on = (method, path, ...handlers) => {
          for (const p of [path].flat()) {
            this.#path = p;
            for (const m of [method].flat()) {
              handlers.map((handler2) => {
                this.#addRoute(m.toUpperCase(), this.#path, handler2);
              });
            }
          }
          return this;
        };
        this.use = (arg1, ...handlers) => {
          if (typeof arg1 === "string") {
            this.#path = arg1;
          } else {
            this.#path = "*";
            handlers.unshift(arg1);
          }
          handlers.forEach((handler2) => {
            this.#addRoute(METHOD_NAME_ALL, this.#path, handler2);
          });
          return this;
        };
        const { strict, ...optionsWithoutStrict } = options;
        Object.assign(this, optionsWithoutStrict);
        this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
      }
      #clone() {
        const clone2 = new _Hono({
          router: this.router,
          getPath: this.getPath
        });
        clone2.errorHandler = this.errorHandler;
        clone2.#notFoundHandler = this.#notFoundHandler;
        clone2.routes = this.routes;
        return clone2;
      }
      #notFoundHandler = notFoundHandler;
      // Cannot use `#` because it requires visibility at JavaScript runtime.
      errorHandler = errorHandler;
      /**
       * `.route()` allows grouping other Hono instance in routes.
       *
       * @see {@link https://hono.dev/docs/api/routing#grouping}
       *
       * @param {string} path - base Path
       * @param {Hono} app - other Hono instance
       * @returns {Hono} routed Hono instance
       *
       * @example
       * ```ts
       * const app = new Hono()
       * const app2 = new Hono()
       *
       * app2.get("/user", (c) => c.text("user"))
       * app.route("/api", app2) // GET /api/user
       * ```
       */
      route(path, app2) {
        const subApp = this.basePath(path);
        app2.routes.map((r) => {
          let handler2;
          if (app2.errorHandler === errorHandler) {
            handler2 = r.handler;
          } else {
            handler2 = async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res;
            handler2[COMPOSED_HANDLER] = r.handler;
          }
          subApp.#addRoute(r.method, r.path, handler2);
        });
        return this;
      }
      /**
       * `.basePath()` allows base paths to be specified.
       *
       * @see {@link https://hono.dev/docs/api/routing#base-path}
       *
       * @param {string} path - base Path
       * @returns {Hono} changed Hono instance
       *
       * @example
       * ```ts
       * const api = new Hono().basePath('/api')
       * ```
       */
      basePath(path) {
        const subApp = this.#clone();
        subApp._basePath = mergePath(this._basePath, path);
        return subApp;
      }
      /**
       * `.onError()` handles an error and returns a customized Response.
       *
       * @see {@link https://hono.dev/docs/api/hono#error-handling}
       *
       * @param {ErrorHandler} handler - request Handler for error
       * @returns {Hono} changed Hono instance
       *
       * @example
       * ```ts
       * app.onError((err, c) => {
       *   console.error(`${err}`)
       *   return c.text('Custom Error Message', 500)
       * })
       * ```
       */
      onError = (handler2) => {
        this.errorHandler = handler2;
        return this;
      };
      /**
       * `.notFound()` allows you to customize a Not Found Response.
       *
       * @see {@link https://hono.dev/docs/api/hono#not-found}
       *
       * @param {NotFoundHandler} handler - request handler for not-found
       * @returns {Hono} changed Hono instance
       *
       * @example
       * ```ts
       * app.notFound((c) => {
       *   return c.text('Custom 404 Message', 404)
       * })
       * ```
       */
      notFound = (handler2) => {
        this.#notFoundHandler = handler2;
        return this;
      };
      /**
       * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
       *
       * @see {@link https://hono.dev/docs/api/hono#mount}
       *
       * @param {string} path - base Path
       * @param {Function} applicationHandler - other Request Handler
       * @param {MountOptions} [options] - options of `.mount()`
       * @returns {Hono} mounted Hono instance
       *
       * @example
       * ```ts
       * import { Router as IttyRouter } from 'itty-router'
       * import { Hono } from 'hono'
       * // Create itty-router application
       * const ittyRouter = IttyRouter()
       * // GET /itty-router/hello
       * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
       *
       * const app = new Hono()
       * app.mount('/itty-router', ittyRouter.handle)
       * ```
       *
       * @example
       * ```ts
       * const app = new Hono()
       * // Send the request to another application without modification.
       * app.mount('/app', anotherApp, {
       *   replaceRequest: (req) => req,
       * })
       * ```
       */
      mount(path, applicationHandler, options) {
        let replaceRequest;
        let optionHandler;
        if (options) {
          if (typeof options === "function") {
            optionHandler = options;
          } else {
            optionHandler = options.optionHandler;
            if (options.replaceRequest === false) {
              replaceRequest = (request) => request;
            } else {
              replaceRequest = options.replaceRequest;
            }
          }
        }
        const getOptions = optionHandler ? (c) => {
          const options2 = optionHandler(c);
          return Array.isArray(options2) ? options2 : [options2];
        } : (c) => {
          let executionContext = void 0;
          try {
            executionContext = c.executionCtx;
          } catch {
          }
          return [c.env, executionContext];
        };
        replaceRequest ||= (() => {
          const mergedPath = mergePath(this._basePath, path);
          const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
          return (request) => {
            const url = new URL(request.url);
            url.pathname = url.pathname.slice(pathPrefixLength) || "/";
            return new Request(url, request);
          };
        })();
        const handler2 = async (c, next) => {
          const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
          if (res) {
            return res;
          }
          await next();
        };
        this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler2);
        return this;
      }
      #addRoute(method, path, handler2) {
        method = method.toUpperCase();
        path = mergePath(this._basePath, path);
        const r = { basePath: this._basePath, path, method, handler: handler2 };
        this.router.add(method, path, [handler2, r]);
        this.routes.push(r);
      }
      #handleError(err, c) {
        if (err instanceof Error) {
          return this.errorHandler(err, c);
        }
        throw err;
      }
      #dispatch(request, executionCtx, env2, method) {
        if (method === "HEAD") {
          return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
        }
        const path = this.getPath(request, { env: env2 });
        const matchResult = this.router.match(method, path);
        const c = new Context(request, {
          path,
          matchResult,
          env: env2,
          executionCtx,
          notFoundHandler: this.#notFoundHandler
        });
        if (matchResult[0].length === 1) {
          let res;
          try {
            res = matchResult[0][0][0][0](c, async () => {
              c.res = await this.#notFoundHandler(c);
            });
          } catch (err) {
            return this.#handleError(err, c);
          }
          return res instanceof Promise ? res.then(
            (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
          ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
        }
        const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
        return (async () => {
          try {
            const context = await composed(c);
            if (!context.finalized) {
              throw new Error(
                "Context is not finalized. Did you forget to return a Response object or `await next()`?"
              );
            }
            return context.res;
          } catch (err) {
            return this.#handleError(err, c);
          }
        })();
      }
      /**
       * `.fetch()` will be entry point of your app.
       *
       * @see {@link https://hono.dev/docs/api/hono#fetch}
       *
       * @param {Request} request - request Object of request
       * @param {Env} Env - env Object
       * @param {ExecutionContext} - context of execution
       * @returns {Response | Promise<Response>} response of request
       *
       */
      fetch = (request, ...rest) => {
        return this.#dispatch(request, rest[1], rest[0], request.method);
      };
      /**
       * `.request()` is a useful method for testing.
       * You can pass a URL or pathname to send a GET request.
       * app will return a Response object.
       * ```ts
       * test('GET /hello is ok', async () => {
       *   const res = await app.request('/hello')
       *   expect(res.status).toBe(200)
       * })
       * ```
       * @see https://hono.dev/docs/api/hono#request
       */
      request = (input2, requestInit, Env, executionCtx) => {
        if (input2 instanceof Request) {
          return this.fetch(requestInit ? new Request(input2, requestInit) : input2, Env, executionCtx);
        }
        input2 = input2.toString();
        return this.fetch(
          new Request(
            /^https?:\/\//.test(input2) ? input2 : `http://localhost${mergePath("/", input2)}`,
            requestInit
          ),
          Env,
          executionCtx
        );
      };
      /**
       * `.fire()` automatically adds a global fetch event listener.
       * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
       * @deprecated
       * Use `fire` from `hono/service-worker` instead.
       * ```ts
       * import { Hono } from 'hono'
       * import { fire } from 'hono/service-worker'
       *
       * const app = new Hono()
       * // ...
       * fire(app)
       * ```
       * @see https://hono.dev/docs/api/hono#fire
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
       * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
       */
      fire = () => {
        addEventListener("fetch", (event) => {
          event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
        });
      };
    };
  }
});

// node_modules/hono/dist/router/reg-exp-router/matcher.js
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = ((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  });
  this.match = match2;
  return match2(method, path);
}
var emptyParam;
var init_matcher = __esm({
  "node_modules/hono/dist/router/reg-exp-router/matcher.js"() {
    init_router();
    emptyParam = [];
  }
});

// node_modules/hono/dist/router/reg-exp-router/node.js
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var LABEL_REG_EXP_STR, ONLY_WILDCARD_REG_EXP_STR, TAIL_WILDCARD_REG_EXP_STR, PATH_ERROR, regExpMetaChars, Node;
var init_node = __esm({
  "node_modules/hono/dist/router/reg-exp-router/node.js"() {
    LABEL_REG_EXP_STR = "[^/]+";
    ONLY_WILDCARD_REG_EXP_STR = ".*";
    TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
    PATH_ERROR = /* @__PURE__ */ Symbol();
    regExpMetaChars = new Set(".\\+*[^]$()");
    Node = class _Node {
      #index;
      #varIndex;
      #children = /* @__PURE__ */ Object.create(null);
      insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
        if (tokens.length === 0) {
          if (this.#index !== void 0) {
            throw PATH_ERROR;
          }
          if (pathErrorCheckOnly) {
            return;
          }
          this.#index = index;
          return;
        }
        const [token, ...restTokens] = tokens;
        const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
        let node;
        if (pattern) {
          const name = pattern[1];
          let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
          if (name && pattern[2]) {
            if (regexpStr === ".*") {
              throw PATH_ERROR;
            }
            regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
            if (/\((?!\?:)/.test(regexpStr)) {
              throw PATH_ERROR;
            }
          }
          node = this.#children[regexpStr];
          if (!node) {
            if (Object.keys(this.#children).some(
              (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
            )) {
              throw PATH_ERROR;
            }
            if (pathErrorCheckOnly) {
              return;
            }
            node = this.#children[regexpStr] = new _Node();
            if (name !== "") {
              node.#varIndex = context.varIndex++;
            }
          }
          if (!pathErrorCheckOnly && name !== "") {
            paramMap.push([name, node.#varIndex]);
          }
        } else {
          node = this.#children[token];
          if (!node) {
            if (Object.keys(this.#children).some(
              (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
            )) {
              throw PATH_ERROR;
            }
            if (pathErrorCheckOnly) {
              return;
            }
            node = this.#children[token] = new _Node();
          }
        }
        node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
      }
      buildRegExpStr() {
        const childKeys = Object.keys(this.#children).sort(compareKey);
        const strList = childKeys.map((k) => {
          const c = this.#children[k];
          return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
        });
        if (typeof this.#index === "number") {
          strList.unshift(`#${this.#index}`);
        }
        if (strList.length === 0) {
          return "";
        }
        if (strList.length === 1) {
          return strList[0];
        }
        return "(?:" + strList.join("|") + ")";
      }
    };
  }
});

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie;
var init_trie = __esm({
  "node_modules/hono/dist/router/reg-exp-router/trie.js"() {
    init_node();
    Trie = class {
      #context = { varIndex: 0 };
      #root = new Node();
      insert(path, index, pathErrorCheckOnly) {
        const paramAssoc = [];
        const groups = [];
        for (let i = 0; ; ) {
          let replaced = false;
          path = path.replace(/\{[^}]+\}/g, (m) => {
            const mark = `@\\${i}`;
            groups[i] = [mark, m];
            i++;
            replaced = true;
            return mark;
          });
          if (!replaced) {
            break;
          }
        }
        const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
        for (let i = groups.length - 1; i >= 0; i--) {
          const [mark] = groups[i];
          for (let j = tokens.length - 1; j >= 0; j--) {
            if (tokens[j].indexOf(mark) !== -1) {
              tokens[j] = tokens[j].replace(mark, groups[i][1]);
              break;
            }
          }
        }
        this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
        return paramAssoc;
      }
      buildRegExp() {
        let regexp = this.#root.buildRegExpStr();
        if (regexp === "") {
          return [/^$/, [], []];
        }
        let captureIndex = 0;
        const indexReplacementMap = [];
        const paramReplacementMap = [];
        regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
          if (handlerIndex !== void 0) {
            indexReplacementMap[++captureIndex] = Number(handlerIndex);
            return "$()";
          }
          if (paramIndex !== void 0) {
            paramReplacementMap[Number(paramIndex)] = ++captureIndex;
            return "";
          }
          return "";
        });
        return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
      }
    };
  }
});

// node_modules/hono/dist/router/reg-exp-router/router.js
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var nullMatcher, wildcardRegExpCache, RegExpRouter;
var init_router2 = __esm({
  "node_modules/hono/dist/router/reg-exp-router/router.js"() {
    init_router();
    init_url();
    init_matcher();
    init_node();
    init_trie();
    nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
    wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
    RegExpRouter = class {
      name = "RegExpRouter";
      #middleware;
      #routes;
      constructor() {
        this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
        this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
      }
      add(method, path, handler2) {
        const middleware = this.#middleware;
        const routes = this.#routes;
        if (!middleware || !routes) {
          throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
        }
        if (!middleware[method]) {
          ;
          [middleware, routes].forEach((handlerMap) => {
            handlerMap[method] = /* @__PURE__ */ Object.create(null);
            Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
              handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
            });
          });
        }
        if (path === "/*") {
          path = "*";
        }
        const paramCount = (path.match(/\/:/g) || []).length;
        if (/\*$/.test(path)) {
          const re = buildWildcardRegExp(path);
          if (method === METHOD_NAME_ALL) {
            Object.keys(middleware).forEach((m) => {
              middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
            });
          } else {
            middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
          }
          Object.keys(middleware).forEach((m) => {
            if (method === METHOD_NAME_ALL || method === m) {
              Object.keys(middleware[m]).forEach((p) => {
                re.test(p) && middleware[m][p].push([handler2, paramCount]);
              });
            }
          });
          Object.keys(routes).forEach((m) => {
            if (method === METHOD_NAME_ALL || method === m) {
              Object.keys(routes[m]).forEach(
                (p) => re.test(p) && routes[m][p].push([handler2, paramCount])
              );
            }
          });
          return;
        }
        const paths = checkOptionalParameter(path) || [path];
        for (let i = 0, len = paths.length; i < len; i++) {
          const path2 = paths[i];
          Object.keys(routes).forEach((m) => {
            if (method === METHOD_NAME_ALL || method === m) {
              routes[m][path2] ||= [
                ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
              ];
              routes[m][path2].push([handler2, paramCount - len + i + 1]);
            }
          });
        }
      }
      match = match;
      buildAllMatchers() {
        const matchers = /* @__PURE__ */ Object.create(null);
        Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
          matchers[method] ||= this.#buildMatcher(method);
        });
        this.#middleware = this.#routes = void 0;
        clearWildcardRegExpCache();
        return matchers;
      }
      #buildMatcher(method) {
        const routes = [];
        let hasOwnRoute = method === METHOD_NAME_ALL;
        [this.#middleware, this.#routes].forEach((r) => {
          const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
          if (ownRoute.length !== 0) {
            hasOwnRoute ||= true;
            routes.push(...ownRoute);
          } else if (method !== METHOD_NAME_ALL) {
            routes.push(
              ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
            );
          }
        });
        if (!hasOwnRoute) {
          return null;
        } else {
          return buildMatcherFromPreprocessedRoutes(routes);
        }
      }
    };
  }
});

// node_modules/hono/dist/router/reg-exp-router/prepared-router.js
var init_prepared_router = __esm({
  "node_modules/hono/dist/router/reg-exp-router/prepared-router.js"() {
    init_router();
    init_matcher();
    init_router2();
  }
});

// node_modules/hono/dist/router/reg-exp-router/index.js
var init_reg_exp_router = __esm({
  "node_modules/hono/dist/router/reg-exp-router/index.js"() {
    init_router2();
    init_prepared_router();
  }
});

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter;
var init_router3 = __esm({
  "node_modules/hono/dist/router/smart-router/router.js"() {
    init_router();
    SmartRouter = class {
      name = "SmartRouter";
      #routers = [];
      #routes = [];
      constructor(init) {
        this.#routers = init.routers;
      }
      add(method, path, handler2) {
        if (!this.#routes) {
          throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
        }
        this.#routes.push([method, path, handler2]);
      }
      match(method, path) {
        if (!this.#routes) {
          throw new Error("Fatal error");
        }
        const routers = this.#routers;
        const routes = this.#routes;
        const len = routers.length;
        let i = 0;
        let res;
        for (; i < len; i++) {
          const router = routers[i];
          try {
            for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
              router.add(...routes[i2]);
            }
            res = router.match(method, path);
          } catch (e) {
            if (e instanceof UnsupportedPathError) {
              continue;
            }
            throw e;
          }
          this.match = router.match.bind(router);
          this.#routers = [router];
          this.#routes = void 0;
          break;
        }
        if (i === len) {
          throw new Error("Fatal error");
        }
        this.name = `SmartRouter + ${this.activeRouter.name}`;
        return res;
      }
      get activeRouter() {
        if (this.#routes || this.#routers.length !== 1) {
          throw new Error("No active router has been determined yet.");
        }
        return this.#routers[0];
      }
    };
  }
});

// node_modules/hono/dist/router/smart-router/index.js
var init_smart_router = __esm({
  "node_modules/hono/dist/router/smart-router/index.js"() {
    init_router3();
  }
});

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams, hasChildren, Node2;
var init_node2 = __esm({
  "node_modules/hono/dist/router/trie-router/node.js"() {
    init_router();
    init_url();
    emptyParams = /* @__PURE__ */ Object.create(null);
    hasChildren = (children) => {
      for (const _ in children) {
        return true;
      }
      return false;
    };
    Node2 = class _Node2 {
      #methods;
      #children;
      #patterns;
      #order = 0;
      #params = emptyParams;
      constructor(method, handler2, children) {
        this.#children = children || /* @__PURE__ */ Object.create(null);
        this.#methods = [];
        if (method && handler2) {
          const m = /* @__PURE__ */ Object.create(null);
          m[method] = { handler: handler2, possibleKeys: [], score: 0 };
          this.#methods = [m];
        }
        this.#patterns = [];
      }
      insert(method, path, handler2) {
        this.#order = ++this.#order;
        let curNode = this;
        const parts = splitRoutingPath(path);
        const possibleKeys = [];
        for (let i = 0, len = parts.length; i < len; i++) {
          const p = parts[i];
          const nextP = parts[i + 1];
          const pattern = getPattern(p, nextP);
          const key = Array.isArray(pattern) ? pattern[0] : p;
          if (key in curNode.#children) {
            curNode = curNode.#children[key];
            if (pattern) {
              possibleKeys.push(pattern[1]);
            }
            continue;
          }
          curNode.#children[key] = new _Node2();
          if (pattern) {
            curNode.#patterns.push(pattern);
            possibleKeys.push(pattern[1]);
          }
          curNode = curNode.#children[key];
        }
        curNode.#methods.push({
          [method]: {
            handler: handler2,
            possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
            score: this.#order
          }
        });
        return curNode;
      }
      #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
        for (let i = 0, len = node.#methods.length; i < len; i++) {
          const m = node.#methods[i];
          const handlerSet = m[method] || m[METHOD_NAME_ALL];
          const processedSet = {};
          if (handlerSet !== void 0) {
            handlerSet.params = /* @__PURE__ */ Object.create(null);
            handlerSets.push(handlerSet);
            if (nodeParams !== emptyParams || params && params !== emptyParams) {
              for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
                const key = handlerSet.possibleKeys[i2];
                const processed = processedSet[handlerSet.score];
                handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
                processedSet[handlerSet.score] = true;
              }
            }
          }
        }
      }
      search(method, path) {
        const handlerSets = [];
        this.#params = emptyParams;
        const curNode = this;
        let curNodes = [curNode];
        const parts = splitPath(path);
        const curNodesQueue = [];
        const len = parts.length;
        let partOffsets = null;
        for (let i = 0; i < len; i++) {
          const part = parts[i];
          const isLast = i === len - 1;
          const tempNodes = [];
          for (let j = 0, len2 = curNodes.length; j < len2; j++) {
            const node = curNodes[j];
            const nextNode = node.#children[part];
            if (nextNode) {
              nextNode.#params = node.#params;
              if (isLast) {
                if (nextNode.#children["*"]) {
                  this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
                }
                this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
              } else {
                tempNodes.push(nextNode);
              }
            }
            for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
              const pattern = node.#patterns[k];
              const params = node.#params === emptyParams ? {} : { ...node.#params };
              if (pattern === "*") {
                const astNode = node.#children["*"];
                if (astNode) {
                  this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
                  astNode.#params = params;
                  tempNodes.push(astNode);
                }
                continue;
              }
              const [key, name, matcher] = pattern;
              if (!part && !(matcher instanceof RegExp)) {
                continue;
              }
              const child = node.#children[key];
              if (matcher instanceof RegExp) {
                if (partOffsets === null) {
                  partOffsets = new Array(len);
                  let offset = path[0] === "/" ? 1 : 0;
                  for (let p = 0; p < len; p++) {
                    partOffsets[p] = offset;
                    offset += parts[p].length + 1;
                  }
                }
                const restPathString = path.substring(partOffsets[i]);
                const m = matcher.exec(restPathString);
                if (m) {
                  params[name] = m[0];
                  this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
                  if (hasChildren(child.#children)) {
                    child.#params = params;
                    const componentCount = m[0].match(/\//)?.length ?? 0;
                    const targetCurNodes = curNodesQueue[componentCount] ||= [];
                    targetCurNodes.push(child);
                  }
                  continue;
                }
              }
              if (matcher === true || matcher.test(part)) {
                params[name] = part;
                if (isLast) {
                  this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
                  if (child.#children["*"]) {
                    this.#pushHandlerSets(
                      handlerSets,
                      child.#children["*"],
                      method,
                      params,
                      node.#params
                    );
                  }
                } else {
                  child.#params = params;
                  tempNodes.push(child);
                }
              }
            }
          }
          const shifted = curNodesQueue.shift();
          curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
        }
        if (handlerSets.length > 1) {
          handlerSets.sort((a, b) => {
            return a.score - b.score;
          });
        }
        return [handlerSets.map(({ handler: handler2, params }) => [handler2, params])];
      }
    };
  }
});

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter;
var init_router4 = __esm({
  "node_modules/hono/dist/router/trie-router/router.js"() {
    init_url();
    init_node2();
    TrieRouter = class {
      name = "TrieRouter";
      #node;
      constructor() {
        this.#node = new Node2();
      }
      add(method, path, handler2) {
        const results = checkOptionalParameter(path);
        if (results) {
          for (let i = 0, len = results.length; i < len; i++) {
            this.#node.insert(method, results[i], handler2);
          }
          return;
        }
        this.#node.insert(method, path, handler2);
      }
      match(method, path) {
        return this.#node.search(method, path);
      }
    };
  }
});

// node_modules/hono/dist/router/trie-router/index.js
var init_trie_router = __esm({
  "node_modules/hono/dist/router/trie-router/index.js"() {
    init_router4();
  }
});

// node_modules/hono/dist/hono.js
var Hono2;
var init_hono = __esm({
  "node_modules/hono/dist/hono.js"() {
    init_hono_base();
    init_reg_exp_router();
    init_smart_router();
    init_trie_router();
    Hono2 = class extends Hono {
      /**
       * Creates an instance of the Hono class.
       *
       * @param options - Optional configuration options for the Hono instance.
       */
      constructor(options = {}) {
        super(options);
        this.router = options.router ?? new SmartRouter({
          routers: [new RegExpRouter(), new TrieRouter()]
        });
      }
    };
  }
});

// node_modules/hono/dist/index.js
var init_dist = __esm({
  "node_modules/hono/dist/index.js"() {
    init_hono();
  }
});

// node_modules/@libsql/core/lib-esm/api.js
var LibsqlError, LibsqlBatchError;
var init_api = __esm({
  "node_modules/@libsql/core/lib-esm/api.js"() {
    LibsqlError = class extends Error {
      /** Machine-readable error code. */
      code;
      /** Extended error code with more specific information (e.g., SQLITE_CONSTRAINT_PRIMARYKEY). */
      extendedCode;
      /** Raw numeric error code */
      rawCode;
      constructor(message, code, extendedCode, rawCode, cause) {
        if (code !== void 0) {
          message = `${code}: ${message}`;
        }
        super(message, { cause });
        this.code = code;
        this.extendedCode = extendedCode;
        this.rawCode = rawCode;
        this.name = "LibsqlError";
      }
    };
    LibsqlBatchError = class extends LibsqlError {
      /** The zero-based index of the statement that failed in the batch. */
      statementIndex;
      constructor(message, statementIndex, code, extendedCode, rawCode, cause) {
        super(message, code, extendedCode, rawCode, cause);
        this.statementIndex = statementIndex;
        this.name = "LibsqlBatchError";
      }
    };
  }
});

// node_modules/@libsql/core/lib-esm/uri.js
function parseUri(text) {
  const match2 = URI_RE.exec(text);
  if (match2 === null) {
    throw new LibsqlError(`The URL '${text}' is not in a valid format`, "URL_INVALID");
  }
  const groups = match2.groups;
  const scheme = groups["scheme"];
  const authority = groups["authority"] !== void 0 ? parseAuthority(groups["authority"]) : void 0;
  const path = percentDecode(groups["path"]);
  const query = groups["query"] !== void 0 ? parseQuery(groups["query"]) : void 0;
  const fragment = groups["fragment"] !== void 0 ? percentDecode(groups["fragment"]) : void 0;
  return { scheme, authority, path, query, fragment };
}
function parseAuthority(text) {
  const match2 = AUTHORITY_RE.exec(text);
  if (match2 === null) {
    throw new LibsqlError("The authority part of the URL is not in a valid format", "URL_INVALID");
  }
  const groups = match2.groups;
  const host = percentDecode(groups["host_br"] ?? groups["host"]);
  const port = groups["port"] ? parseInt(groups["port"], 10) : void 0;
  const userinfo = groups["username"] !== void 0 ? {
    username: percentDecode(groups["username"]),
    password: groups["password"] !== void 0 ? percentDecode(groups["password"]) : void 0
  } : void 0;
  return { host, port, userinfo };
}
function parseQuery(text) {
  const sequences = text.split("&");
  const pairs = [];
  for (const sequence of sequences) {
    if (sequence === "") {
      continue;
    }
    let key;
    let value;
    const splitIdx = sequence.indexOf("=");
    if (splitIdx < 0) {
      key = sequence;
      value = "";
    } else {
      key = sequence.substring(0, splitIdx);
      value = sequence.substring(splitIdx + 1);
    }
    pairs.push({
      key: percentDecode(key.replaceAll("+", " ")),
      value: percentDecode(value.replaceAll("+", " "))
    });
  }
  return { pairs };
}
function percentDecode(text) {
  try {
    return decodeURIComponent(text);
  } catch (e) {
    if (e instanceof URIError) {
      throw new LibsqlError(`URL component has invalid percent encoding: ${e}`, "URL_INVALID", void 0, void 0, e);
    }
    throw e;
  }
}
function encodeBaseUrl(scheme, authority, path) {
  if (authority === void 0) {
    throw new LibsqlError(`URL with scheme ${JSON.stringify(scheme + ":")} requires authority (the "//" part)`, "URL_INVALID");
  }
  const schemeText = `${scheme}:`;
  const hostText = encodeHost(authority.host);
  const portText = encodePort(authority.port);
  const userinfoText = encodeUserinfo(authority.userinfo);
  const authorityText = `//${userinfoText}${hostText}${portText}`;
  let pathText = path.split("/").map(encodeURIComponent).join("/");
  if (pathText !== "" && !pathText.startsWith("/")) {
    pathText = "/" + pathText;
  }
  return new URL(`${schemeText}${authorityText}${pathText}`);
}
function encodeHost(host) {
  return host.includes(":") ? `[${encodeURI(host)}]` : encodeURI(host);
}
function encodePort(port) {
  return port !== void 0 ? `:${port}` : "";
}
function encodeUserinfo(userinfo) {
  if (userinfo === void 0) {
    return "";
  }
  const usernameText = encodeURIComponent(userinfo.username);
  const passwordText = userinfo.password !== void 0 ? `:${encodeURIComponent(userinfo.password)}` : "";
  return `${usernameText}${passwordText}@`;
}
var URI_RE, AUTHORITY_RE;
var init_uri = __esm({
  "node_modules/@libsql/core/lib-esm/uri.js"() {
    init_api();
    URI_RE = (() => {
      const SCHEME = "(?<scheme>[A-Za-z][A-Za-z.+-]*)";
      const AUTHORITY = "(?<authority>[^/?#]*)";
      const PATH = "(?<path>[^?#]*)";
      const QUERY = "(?<query>[^#]*)";
      const FRAGMENT = "(?<fragment>.*)";
      return new RegExp(`^${SCHEME}:(//${AUTHORITY})?${PATH}(\\?${QUERY})?(#${FRAGMENT})?$`, "su");
    })();
    AUTHORITY_RE = (() => {
      return new RegExp(`^((?<username>[^:]*)(:(?<password>.*))?@)?((?<host>[^:\\[\\]]*)|(\\[(?<host_br>[^\\[\\]]*)\\]))(:(?<port>[0-9]*))?$`, "su");
    })();
  }
});

// node_modules/js-base64/base64.mjs
var version, VERSION, _hasBuffer, _TD, _TE, b64ch, b64chs, b64tab, b64re, _fromCC, _U8Afrom, _mkUriSafe, _tidyB64, btoaPolyfill, _btoa, _fromUint8Array, fromUint8Array, cb_utob, re_utob, utob, _encode, encode, encodeURI2, re_btou, cb_btou, btou, atobPolyfill, _atob, _toUint8Array, toUint8Array, _decode, _unURI, decode, isValid, _noEnum, extendString, extendUint8Array, extendBuiltins, gBase64;
var init_base64 = __esm({
  "node_modules/js-base64/base64.mjs"() {
    version = "3.7.8";
    VERSION = version;
    _hasBuffer = typeof Buffer === "function";
    _TD = typeof TextDecoder === "function" ? new TextDecoder() : void 0;
    _TE = typeof TextEncoder === "function" ? new TextEncoder() : void 0;
    b64ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    b64chs = Array.prototype.slice.call(b64ch);
    b64tab = ((a) => {
      let tab = {};
      a.forEach((c, i) => tab[c] = i);
      return tab;
    })(b64chs);
    b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
    _fromCC = String.fromCharCode.bind(String);
    _U8Afrom = typeof Uint8Array.from === "function" ? Uint8Array.from.bind(Uint8Array) : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));
    _mkUriSafe = (src) => src.replace(/=/g, "").replace(/[+\/]/g, (m0) => m0 == "+" ? "-" : "_");
    _tidyB64 = (s) => s.replace(/[^A-Za-z0-9\+\/]/g, "");
    btoaPolyfill = (bin) => {
      let u32, c0, c1, c2, asc = "";
      const pad = bin.length % 3;
      for (let i = 0; i < bin.length; ) {
        if ((c0 = bin.charCodeAt(i++)) > 255 || (c1 = bin.charCodeAt(i++)) > 255 || (c2 = bin.charCodeAt(i++)) > 255)
          throw new TypeError("invalid character found");
        u32 = c0 << 16 | c1 << 8 | c2;
        asc += b64chs[u32 >> 18 & 63] + b64chs[u32 >> 12 & 63] + b64chs[u32 >> 6 & 63] + b64chs[u32 & 63];
      }
      return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
    };
    _btoa = typeof btoa === "function" ? (bin) => btoa(bin) : _hasBuffer ? (bin) => Buffer.from(bin, "binary").toString("base64") : btoaPolyfill;
    _fromUint8Array = _hasBuffer ? (u8a) => Buffer.from(u8a).toString("base64") : (u8a) => {
      const maxargs = 4096;
      let strs = [];
      for (let i = 0, l = u8a.length; i < l; i += maxargs) {
        strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
      }
      return _btoa(strs.join(""));
    };
    fromUint8Array = (u8a, urlsafe = false) => urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a);
    cb_utob = (c) => {
      if (c.length < 2) {
        var cc = c.charCodeAt(0);
        return cc < 128 ? c : cc < 2048 ? _fromCC(192 | cc >>> 6) + _fromCC(128 | cc & 63) : _fromCC(224 | cc >>> 12 & 15) + _fromCC(128 | cc >>> 6 & 63) + _fromCC(128 | cc & 63);
      } else {
        var cc = 65536 + (c.charCodeAt(0) - 55296) * 1024 + (c.charCodeAt(1) - 56320);
        return _fromCC(240 | cc >>> 18 & 7) + _fromCC(128 | cc >>> 12 & 63) + _fromCC(128 | cc >>> 6 & 63) + _fromCC(128 | cc & 63);
      }
    };
    re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    utob = (u) => u.replace(re_utob, cb_utob);
    _encode = _hasBuffer ? (s) => Buffer.from(s, "utf8").toString("base64") : _TE ? (s) => _fromUint8Array(_TE.encode(s)) : (s) => _btoa(utob(s));
    encode = (src, urlsafe = false) => urlsafe ? _mkUriSafe(_encode(src)) : _encode(src);
    encodeURI2 = (src) => encode(src, true);
    re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
    cb_btou = (cccc) => {
      switch (cccc.length) {
        case 4:
          var cp = (7 & cccc.charCodeAt(0)) << 18 | (63 & cccc.charCodeAt(1)) << 12 | (63 & cccc.charCodeAt(2)) << 6 | 63 & cccc.charCodeAt(3), offset = cp - 65536;
          return _fromCC((offset >>> 10) + 55296) + _fromCC((offset & 1023) + 56320);
        case 3:
          return _fromCC((15 & cccc.charCodeAt(0)) << 12 | (63 & cccc.charCodeAt(1)) << 6 | 63 & cccc.charCodeAt(2));
        default:
          return _fromCC((31 & cccc.charCodeAt(0)) << 6 | 63 & cccc.charCodeAt(1));
      }
    };
    btou = (b) => b.replace(re_btou, cb_btou);
    atobPolyfill = (asc) => {
      asc = asc.replace(/\s+/g, "");
      if (!b64re.test(asc))
        throw new TypeError("malformed base64.");
      asc += "==".slice(2 - (asc.length & 3));
      let u24, r1, r2;
      let binArray = [];
      for (let i = 0; i < asc.length; ) {
        u24 = b64tab[asc.charAt(i++)] << 18 | b64tab[asc.charAt(i++)] << 12 | (r1 = b64tab[asc.charAt(i++)]) << 6 | (r2 = b64tab[asc.charAt(i++)]);
        if (r1 === 64) {
          binArray.push(_fromCC(u24 >> 16 & 255));
        } else if (r2 === 64) {
          binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255));
        } else {
          binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255));
        }
      }
      return binArray.join("");
    };
    _atob = typeof atob === "function" ? (asc) => atob(_tidyB64(asc)) : _hasBuffer ? (asc) => Buffer.from(asc, "base64").toString("binary") : atobPolyfill;
    _toUint8Array = _hasBuffer ? (a) => _U8Afrom(Buffer.from(a, "base64")) : (a) => _U8Afrom(_atob(a).split("").map((c) => c.charCodeAt(0)));
    toUint8Array = (a) => _toUint8Array(_unURI(a));
    _decode = _hasBuffer ? (a) => Buffer.from(a, "base64").toString("utf8") : _TD ? (a) => _TD.decode(_toUint8Array(a)) : (a) => btou(_atob(a));
    _unURI = (a) => _tidyB64(a.replace(/[-_]/g, (m0) => m0 == "-" ? "+" : "/"));
    decode = (src) => _decode(_unURI(src));
    isValid = (src) => {
      if (typeof src !== "string")
        return false;
      const s = src.replace(/\s+/g, "").replace(/={0,2}$/, "");
      return !/[^\s0-9a-zA-Z\+/]/.test(s) || !/[^\s0-9a-zA-Z\-_]/.test(s);
    };
    _noEnum = (v) => {
      return {
        value: v,
        enumerable: false,
        writable: true,
        configurable: true
      };
    };
    extendString = function() {
      const _add = (name, body) => Object.defineProperty(String.prototype, name, _noEnum(body));
      _add("fromBase64", function() {
        return decode(this);
      });
      _add("toBase64", function(urlsafe) {
        return encode(this, urlsafe);
      });
      _add("toBase64URI", function() {
        return encode(this, true);
      });
      _add("toBase64URL", function() {
        return encode(this, true);
      });
      _add("toUint8Array", function() {
        return toUint8Array(this);
      });
    };
    extendUint8Array = function() {
      const _add = (name, body) => Object.defineProperty(Uint8Array.prototype, name, _noEnum(body));
      _add("toBase64", function(urlsafe) {
        return fromUint8Array(this, urlsafe);
      });
      _add("toBase64URI", function() {
        return fromUint8Array(this, true);
      });
      _add("toBase64URL", function() {
        return fromUint8Array(this, true);
      });
    };
    extendBuiltins = () => {
      extendString();
      extendUint8Array();
    };
    gBase64 = {
      version,
      VERSION,
      atob: _atob,
      atobPolyfill,
      btoa: _btoa,
      btoaPolyfill,
      fromBase64: decode,
      toBase64: encode,
      encode,
      encodeURI: encodeURI2,
      encodeURL: encodeURI2,
      utob,
      btou,
      decode,
      isValid,
      fromUint8Array,
      toUint8Array,
      extendString,
      extendUint8Array,
      extendBuiltins
    };
  }
});

// node_modules/@libsql/core/lib-esm/util.js
function transactionModeToBegin(mode) {
  if (mode === "write") {
    return "BEGIN IMMEDIATE";
  } else if (mode === "read") {
    return "BEGIN TRANSACTION READONLY";
  } else if (mode === "deferred") {
    return "BEGIN DEFERRED";
  } else {
    throw RangeError('Unknown transaction mode, supported values are "write", "read" and "deferred"');
  }
}
function rowToJson(row) {
  return Array.prototype.map.call(row, valueToJson);
}
function valueToJson(value) {
  if (typeof value === "bigint") {
    return "" + value;
  } else if (value instanceof ArrayBuffer) {
    return gBase64.fromUint8Array(new Uint8Array(value));
  } else {
    return value;
  }
}
var supportedUrlLink, ResultSetImpl;
var init_util = __esm({
  "node_modules/@libsql/core/lib-esm/util.js"() {
    init_base64();
    supportedUrlLink = "https://github.com/libsql/libsql-client-ts#supported-urls";
    ResultSetImpl = class {
      columns;
      columnTypes;
      rows;
      rowsAffected;
      lastInsertRowid;
      constructor(columns, columnTypes, rows, rowsAffected, lastInsertRowid) {
        this.columns = columns;
        this.columnTypes = columnTypes;
        this.rows = rows;
        this.rowsAffected = rowsAffected;
        this.lastInsertRowid = lastInsertRowid;
      }
      toJSON() {
        return {
          columns: this.columns,
          columnTypes: this.columnTypes,
          rows: this.rows.map(rowToJson),
          rowsAffected: this.rowsAffected,
          lastInsertRowid: this.lastInsertRowid !== void 0 ? "" + this.lastInsertRowid : null
        };
      }
    };
  }
});

// node_modules/@libsql/core/lib-esm/config.js
function isInMemoryConfig(config) {
  return config.scheme === "file" && (config.path === ":memory:" || config.path.startsWith(":memory:?"));
}
function expandConfig(config, preferHttp) {
  if (typeof config !== "object") {
    throw new TypeError(`Expected client configuration as object, got ${typeof config}`);
  }
  let { url, authToken, tls, intMode, concurrency } = config;
  concurrency = Math.max(0, concurrency || 20);
  intMode ??= "number";
  let connectionQueryParams = [];
  if (url === inMemoryMode) {
    url = "file::memory:";
  }
  const uri = parseUri(url);
  const originalUriScheme = uri.scheme.toLowerCase();
  const isInMemoryMode = originalUriScheme === "file" && uri.path === inMemoryMode && uri.authority === void 0;
  let queryParamsDef;
  if (isInMemoryMode) {
    queryParamsDef = {
      cache: {
        values: ["shared", "private"],
        update: (key, value) => connectionQueryParams.push(`${key}=${value}`)
      }
    };
  } else {
    queryParamsDef = {
      tls: {
        values: ["0", "1"],
        update: (_, value) => tls = value === "1"
      },
      authToken: {
        update: (_, value) => authToken = value
      }
    };
  }
  for (const { key, value } of uri.query?.pairs ?? []) {
    if (!Object.hasOwn(queryParamsDef, key)) {
      throw new LibsqlError(`Unsupported URL query parameter ${JSON.stringify(key)}`, "URL_PARAM_NOT_SUPPORTED");
    }
    const queryParamDef = queryParamsDef[key];
    if (queryParamDef.values !== void 0 && !queryParamDef.values.includes(value)) {
      throw new LibsqlError(`Unknown value for the "${key}" query argument: ${JSON.stringify(value)}. Supported values are: [${queryParamDef.values.map((x) => '"' + x + '"').join(", ")}]`, "URL_INVALID");
    }
    if (queryParamDef.update !== void 0) {
      queryParamDef?.update(key, value);
    }
  }
  const connectionQueryParamsString = connectionQueryParams.length === 0 ? "" : `?${connectionQueryParams.join("&")}`;
  const path = uri.path + connectionQueryParamsString;
  let scheme;
  if (originalUriScheme === "libsql") {
    if (tls === false) {
      if (uri.authority?.port === void 0) {
        throw new LibsqlError('A "libsql:" URL with ?tls=0 must specify an explicit port', "URL_INVALID");
      }
      scheme = preferHttp ? "http" : "ws";
    } else {
      scheme = preferHttp ? "https" : "wss";
    }
  } else {
    scheme = originalUriScheme;
  }
  if (scheme === "http" || scheme === "ws") {
    tls ??= false;
  } else {
    tls ??= true;
  }
  if (scheme !== "http" && scheme !== "ws" && scheme !== "https" && scheme !== "wss" && scheme !== "file") {
    throw new LibsqlError(`The client supports only "libsql:", "wss:", "ws:", "https:", "http:" and "file:" URLs, got ${JSON.stringify(uri.scheme + ":")}. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
  }
  if (intMode !== "number" && intMode !== "bigint" && intMode !== "string") {
    throw new TypeError(`Invalid value for intMode, expected "number", "bigint" or "string", got ${JSON.stringify(intMode)}`);
  }
  if (uri.fragment !== void 0) {
    throw new LibsqlError(`URL fragments are not supported: ${JSON.stringify("#" + uri.fragment)}`, "URL_INVALID");
  }
  if (isInMemoryMode) {
    return {
      scheme: "file",
      tls: false,
      path,
      intMode,
      concurrency,
      syncUrl: config.syncUrl,
      syncInterval: config.syncInterval,
      readYourWrites: config.readYourWrites,
      offline: config.offline,
      fetch: config.fetch,
      authToken: void 0,
      encryptionKey: void 0,
      remoteEncryptionKey: void 0,
      authority: void 0
    };
  }
  return {
    scheme,
    tls,
    authority: uri.authority,
    path,
    authToken,
    intMode,
    concurrency,
    encryptionKey: config.encryptionKey,
    remoteEncryptionKey: config.remoteEncryptionKey,
    syncUrl: config.syncUrl,
    syncInterval: config.syncInterval,
    readYourWrites: config.readYourWrites,
    offline: config.offline,
    fetch: config.fetch
  };
}
var inMemoryMode;
var init_config = __esm({
  "node_modules/@libsql/core/lib-esm/config.js"() {
    init_api();
    init_uri();
    init_util();
    inMemoryMode = ":memory:";
  }
});

// node_modules/@neon-rs/load/dist/index.js
var require_dist = __commonJS({
  "node_modules/@neon-rs/load/dist/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.load = exports.currentTarget = void 0;
    var path = __importStar(__require("path"));
    var fs = __importStar(__require("fs"));
    function currentTarget() {
      let os = null;
      switch (process.platform) {
        case "android":
          switch (process.arch) {
            case "arm":
              return "android-arm-eabi";
            case "arm64":
              return "android-arm64";
          }
          os = "Android";
          break;
        case "win32":
          switch (process.arch) {
            case "x64":
              return "win32-x64-msvc";
            case "arm64":
              return "win32-arm64-msvc";
            case "ia32":
              return "win32-ia32-msvc";
          }
          os = "Windows";
          break;
        case "darwin":
          switch (process.arch) {
            case "x64":
              return "darwin-x64";
            case "arm64":
              return "darwin-arm64";
          }
          os = "macOS";
          break;
        case "linux":
          switch (process.arch) {
            case "x64":
            case "arm64":
              return isGlibc() ? `linux-${process.arch}-gnu` : `linux-${process.arch}-musl`;
            case "arm":
              return "linux-arm-gnueabihf";
          }
          os = "Linux";
          break;
        case "freebsd":
          if (process.arch === "x64") {
            return "freebsd-x64";
          }
          os = "FreeBSD";
          break;
      }
      if (os) {
        throw new Error(`Neon: unsupported ${os} architecture: ${process.arch}`);
      }
      throw new Error(`Neon: unsupported system: ${process.platform}`);
    }
    exports.currentTarget = currentTarget;
    function isGlibc() {
      const report = process.report?.getReport();
      if (typeof report !== "object" || !report || !("header" in report)) {
        return false;
      }
      const header = report.header;
      return typeof header === "object" && !!header && "glibcVersionRuntime" in header;
    }
    function load(dirname) {
      const m = path.join(dirname, "index.node");
      return fs.existsSync(m) ? __require(m) : null;
    }
    exports.load = load;
  }
});

// node_modules/detect-libc/lib/process.js
var require_process = __commonJS({
  "node_modules/detect-libc/lib/process.js"(exports, module) {
    "use strict";
    var isLinux = () => process.platform === "linux";
    var report = null;
    var getReport = () => {
      if (!report) {
        report = isLinux() && process.report ? process.report.getReport() : {};
      }
      return report;
    };
    module.exports = { isLinux, getReport };
  }
});

// node_modules/detect-libc/lib/filesystem.js
var require_filesystem = __commonJS({
  "node_modules/detect-libc/lib/filesystem.js"(exports, module) {
    "use strict";
    var fs = __require("fs");
    var LDD_PATH = "/usr/bin/ldd";
    var readFileSync = (path) => fs.readFileSync(path, "utf-8");
    var readFile2 = (path) => new Promise((resolve2, reject) => {
      fs.readFile(path, "utf-8", (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve2(data);
        }
      });
    });
    module.exports = {
      LDD_PATH,
      readFileSync,
      readFile: readFile2
    };
  }
});

// node_modules/detect-libc/lib/detect-libc.js
var require_detect_libc = __commonJS({
  "node_modules/detect-libc/lib/detect-libc.js"(exports, module) {
    "use strict";
    var childProcess = __require("child_process");
    var { isLinux, getReport } = require_process();
    var { LDD_PATH, readFile: readFile2, readFileSync } = require_filesystem();
    var cachedFamilyFilesystem;
    var cachedVersionFilesystem;
    var command = "getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true";
    var commandOut = "";
    var safeCommand = () => {
      if (!commandOut) {
        return new Promise((resolve2) => {
          childProcess.exec(command, (err, out) => {
            commandOut = err ? " " : out;
            resolve2(commandOut);
          });
        });
      }
      return commandOut;
    };
    var safeCommandSync = () => {
      if (!commandOut) {
        try {
          commandOut = childProcess.execSync(command, { encoding: "utf8" });
        } catch (_err) {
          commandOut = " ";
        }
      }
      return commandOut;
    };
    var GLIBC = "glibc";
    var RE_GLIBC_VERSION = /GLIBC\s(\d+\.\d+)/;
    var MUSL = "musl";
    var GLIBC_ON_LDD = GLIBC.toUpperCase();
    var MUSL_ON_LDD = MUSL.toLowerCase();
    var isFileMusl = (f) => f.includes("libc.musl-") || f.includes("ld-musl-");
    var familyFromReport = () => {
      const report = getReport();
      if (report.header && report.header.glibcVersionRuntime) {
        return GLIBC;
      }
      if (Array.isArray(report.sharedObjects)) {
        if (report.sharedObjects.some(isFileMusl)) {
          return MUSL;
        }
      }
      return null;
    };
    var familyFromCommand = (out) => {
      const [getconf, ldd1] = out.split(/[\r\n]+/);
      if (getconf && getconf.includes(GLIBC)) {
        return GLIBC;
      }
      if (ldd1 && ldd1.includes(MUSL)) {
        return MUSL;
      }
      return null;
    };
    var getFamilyFromLddContent = (content) => {
      if (content.includes(MUSL_ON_LDD)) {
        return MUSL;
      }
      if (content.includes(GLIBC_ON_LDD)) {
        return GLIBC;
      }
      return null;
    };
    var familyFromFilesystem = async () => {
      if (cachedFamilyFilesystem !== void 0) {
        return cachedFamilyFilesystem;
      }
      cachedFamilyFilesystem = null;
      try {
        const lddContent = await readFile2(LDD_PATH);
        cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
      } catch (e) {
      }
      return cachedFamilyFilesystem;
    };
    var familyFromFilesystemSync = () => {
      if (cachedFamilyFilesystem !== void 0) {
        return cachedFamilyFilesystem;
      }
      cachedFamilyFilesystem = null;
      try {
        const lddContent = readFileSync(LDD_PATH);
        cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
      } catch (e) {
      }
      return cachedFamilyFilesystem;
    };
    var family = async () => {
      let family2 = null;
      if (isLinux()) {
        family2 = await familyFromFilesystem();
        if (!family2) {
          family2 = familyFromReport();
        }
        if (!family2) {
          const out = await safeCommand();
          family2 = familyFromCommand(out);
        }
      }
      return family2;
    };
    var familySync = () => {
      let family2 = null;
      if (isLinux()) {
        family2 = familyFromFilesystemSync();
        if (!family2) {
          family2 = familyFromReport();
        }
        if (!family2) {
          const out = safeCommandSync();
          family2 = familyFromCommand(out);
        }
      }
      return family2;
    };
    var isNonGlibcLinux = async () => isLinux() && await family() !== GLIBC;
    var isNonGlibcLinuxSync = () => isLinux() && familySync() !== GLIBC;
    var versionFromFilesystem = async () => {
      if (cachedVersionFilesystem !== void 0) {
        return cachedVersionFilesystem;
      }
      cachedVersionFilesystem = null;
      try {
        const lddContent = await readFile2(LDD_PATH);
        const versionMatch = lddContent.match(RE_GLIBC_VERSION);
        if (versionMatch) {
          cachedVersionFilesystem = versionMatch[1];
        }
      } catch (e) {
      }
      return cachedVersionFilesystem;
    };
    var versionFromFilesystemSync = () => {
      if (cachedVersionFilesystem !== void 0) {
        return cachedVersionFilesystem;
      }
      cachedVersionFilesystem = null;
      try {
        const lddContent = readFileSync(LDD_PATH);
        const versionMatch = lddContent.match(RE_GLIBC_VERSION);
        if (versionMatch) {
          cachedVersionFilesystem = versionMatch[1];
        }
      } catch (e) {
      }
      return cachedVersionFilesystem;
    };
    var versionFromReport = () => {
      const report = getReport();
      if (report.header && report.header.glibcVersionRuntime) {
        return report.header.glibcVersionRuntime;
      }
      return null;
    };
    var versionSuffix = (s) => s.trim().split(/\s+/)[1];
    var versionFromCommand = (out) => {
      const [getconf, ldd1, ldd2] = out.split(/[\r\n]+/);
      if (getconf && getconf.includes(GLIBC)) {
        return versionSuffix(getconf);
      }
      if (ldd1 && ldd2 && ldd1.includes(MUSL)) {
        return versionSuffix(ldd2);
      }
      return null;
    };
    var version2 = async () => {
      let version3 = null;
      if (isLinux()) {
        version3 = await versionFromFilesystem();
        if (!version3) {
          version3 = versionFromReport();
        }
        if (!version3) {
          const out = await safeCommand();
          version3 = versionFromCommand(out);
        }
      }
      return version3;
    };
    var versionSync = () => {
      let version3 = null;
      if (isLinux()) {
        version3 = versionFromFilesystemSync();
        if (!version3) {
          version3 = versionFromReport();
        }
        if (!version3) {
          const out = safeCommandSync();
          version3 = versionFromCommand(out);
        }
      }
      return version3;
    };
    module.exports = {
      GLIBC,
      MUSL,
      family,
      familySync,
      isNonGlibcLinux,
      isNonGlibcLinuxSync,
      version: version2,
      versionSync
    };
  }
});

// node_modules/libsql/auth.js
var require_auth = __commonJS({
  "node_modules/libsql/auth.js"(exports, module) {
    var Authorization = {
      /**
       * Allow access to a resource.
       * @type {number}
       */
      ALLOW: 0,
      /**
       * Deny access to a resource and throw an error in `prepare()`.
       * @type {number}
       */
      DENY: 1
    };
    module.exports = Authorization;
  }
});

// node_modules/libsql/sqlite-error.js
var require_sqlite_error = __commonJS({
  "node_modules/libsql/sqlite-error.js"(exports, module) {
    "use strict";
    var descriptor = { value: "SqliteError", writable: true, enumerable: false, configurable: true };
    function SqliteError(message, code, rawCode) {
      if (new.target !== SqliteError) {
        return new SqliteError(message, code);
      }
      if (typeof code !== "string") {
        throw new TypeError("Expected second argument to be a string");
      }
      Error.call(this, message);
      descriptor.value = "" + message;
      Object.defineProperty(this, "message", descriptor);
      Error.captureStackTrace(this, SqliteError);
      this.code = code;
      this.rawCode = rawCode;
    }
    Object.setPrototypeOf(SqliteError, Error);
    Object.setPrototypeOf(SqliteError.prototype, Error.prototype);
    Object.defineProperty(SqliteError.prototype, "name", descriptor);
    module.exports = SqliteError;
  }
});

// node_modules/libsql/index.js
var require_libsql = __commonJS({
  "node_modules/libsql/index.js"(exports, module) {
    "use strict";
    var { load, currentTarget } = require_dist();
    var { familySync, GLIBC, MUSL } = require_detect_libc();
    function requireNative() {
      if (process.env.LIBSQL_JS_DEV) {
        return load(__dirname);
      }
      let target = currentTarget();
      if (familySync() == GLIBC) {
        switch (target) {
          case "linux-x64-musl":
            target = "linux-x64-gnu";
            break;
          case "linux-arm64-musl":
            target = "linux-arm64-gnu";
            break;
        }
      }
      if (target === "linux-arm-gnueabihf" && familySync() == MUSL) {
        target = "linux-arm-musleabihf";
      }
      return __require(`@libsql/${target}`);
    }
    var {
      databaseOpen,
      databaseOpenWithSync,
      databaseInTransaction,
      databaseInterrupt,
      databaseClose,
      databaseSyncSync,
      databaseSyncUntilSync,
      databaseExecSync,
      databasePrepareSync,
      databaseDefaultSafeIntegers,
      databaseAuthorizer,
      databaseLoadExtension,
      databaseMaxWriteReplicationIndex,
      statementRaw,
      statementIsReader,
      statementGet,
      statementRun,
      statementInterrupt,
      statementRowsSync,
      statementColumns,
      statementSafeIntegers,
      rowsNext
    } = requireNative();
    var Authorization = require_auth();
    var SqliteError = require_sqlite_error();
    function convertError(err) {
      if (err.libsqlError) {
        return new SqliteError(err.message, err.code, err.rawCode);
      }
      return err;
    }
    var Database2 = class {
      /**
       * Creates a new database connection. If the database file pointed to by `path` does not exists, it will be created.
       *
       * @constructor
       * @param {string} path - Path to the database file.
       */
      constructor(path, opts) {
        const encryptionCipher = opts?.encryptionCipher ?? "aes256cbc";
        if (opts && opts.syncUrl) {
          var authToken = "";
          if (opts.syncAuth) {
            console.warn("Warning: The `syncAuth` option is deprecated, please use `authToken` option instead.");
            authToken = opts.syncAuth;
          } else if (opts.authToken) {
            authToken = opts.authToken;
          }
          const encryptionKey = opts?.encryptionKey ?? "";
          const syncPeriod = opts?.syncPeriod ?? 0;
          const readYourWrites = opts?.readYourWrites ?? true;
          const offline = opts?.offline ?? false;
          const remoteEncryptionKey = opts?.remoteEncryptionKey ?? "";
          this.db = databaseOpenWithSync(path, opts.syncUrl, authToken, encryptionCipher, encryptionKey, syncPeriod, readYourWrites, offline, remoteEncryptionKey);
        } else {
          const authToken2 = opts?.authToken ?? "";
          const encryptionKey = opts?.encryptionKey ?? "";
          const timeout = opts?.timeout ?? 0;
          const remoteEncryptionKey = opts?.remoteEncryptionKey ?? "";
          this.db = databaseOpen(path, authToken2, encryptionCipher, encryptionKey, timeout, remoteEncryptionKey);
        }
        this.memory = path === ":memory:";
        this.readonly = false;
        this.name = "";
        this.open = true;
        const db2 = this.db;
        Object.defineProperties(this, {
          inTransaction: {
            get() {
              return databaseInTransaction(db2);
            }
          }
        });
      }
      sync() {
        return databaseSyncSync.call(this.db);
      }
      syncUntil(replicationIndex) {
        return databaseSyncUntilSync.call(this.db, replicationIndex);
      }
      /**
       * Prepares a SQL statement for execution.
       *
       * @param {string} sql - The SQL statement string to prepare.
       */
      prepare(sql) {
        try {
          const stmt = databasePrepareSync.call(this.db, sql);
          return new Statement(stmt);
        } catch (err) {
          throw convertError(err);
        }
      }
      /**
       * Returns a function that executes the given function in a transaction.
       *
       * @param {function} fn - The function to wrap in a transaction.
       */
      transaction(fn) {
        if (typeof fn !== "function")
          throw new TypeError("Expected first argument to be a function");
        const db2 = this;
        const wrapTxn = (mode) => {
          return (...bindParameters) => {
            db2.exec("BEGIN " + mode);
            try {
              const result = fn(...bindParameters);
              db2.exec("COMMIT");
              return result;
            } catch (err) {
              db2.exec("ROLLBACK");
              throw err;
            }
          };
        };
        const properties = {
          default: { value: wrapTxn("") },
          deferred: { value: wrapTxn("DEFERRED") },
          immediate: { value: wrapTxn("IMMEDIATE") },
          exclusive: { value: wrapTxn("EXCLUSIVE") },
          database: { value: this, enumerable: true }
        };
        Object.defineProperties(properties.default.value, properties);
        Object.defineProperties(properties.deferred.value, properties);
        Object.defineProperties(properties.immediate.value, properties);
        Object.defineProperties(properties.exclusive.value, properties);
        return properties.default.value;
      }
      pragma(source, options) {
        if (options == null) options = {};
        if (typeof source !== "string") throw new TypeError("Expected first argument to be a string");
        if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
        const simple = options["simple"];
        const stmt = this.prepare(`PRAGMA ${source}`, this, true);
        return simple ? stmt.pluck().get() : stmt.all();
      }
      backup(filename, options) {
        throw new Error("not implemented");
      }
      serialize(options) {
        throw new Error("not implemented");
      }
      function(name, options, fn) {
        if (options == null) options = {};
        if (typeof options === "function") {
          fn = options;
          options = {};
        }
        if (typeof name !== "string")
          throw new TypeError("Expected first argument to be a string");
        if (typeof fn !== "function")
          throw new TypeError("Expected last argument to be a function");
        if (typeof options !== "object")
          throw new TypeError("Expected second argument to be an options object");
        if (!name)
          throw new TypeError(
            "User-defined function name cannot be an empty string"
          );
        throw new Error("not implemented");
      }
      aggregate(name, options) {
        if (typeof name !== "string")
          throw new TypeError("Expected first argument to be a string");
        if (typeof options !== "object" || options === null)
          throw new TypeError("Expected second argument to be an options object");
        if (!name)
          throw new TypeError(
            "User-defined function name cannot be an empty string"
          );
        throw new Error("not implemented");
      }
      table(name, factory) {
        if (typeof name !== "string")
          throw new TypeError("Expected first argument to be a string");
        if (!name)
          throw new TypeError(
            "Virtual table module name cannot be an empty string"
          );
        throw new Error("not implemented");
      }
      authorizer(rules) {
        databaseAuthorizer.call(this.db, rules);
      }
      loadExtension(...args) {
        databaseLoadExtension.call(this.db, ...args);
      }
      maxWriteReplicationIndex() {
        return databaseMaxWriteReplicationIndex.call(this.db);
      }
      /**
       * Executes a SQL statement.
       *
       * @param {string} sql - The SQL statement string to execute.
       */
      exec(sql) {
        try {
          databaseExecSync.call(this.db, sql);
        } catch (err) {
          throw convertError(err);
        }
      }
      /**
       * Interrupts the database connection.
       */
      interrupt() {
        databaseInterrupt.call(this.db);
      }
      /**
       * Closes the database connection.
       */
      close() {
        databaseClose.call(this.db);
        this.open = false;
      }
      /**
       * Toggle 64-bit integer support.
       */
      defaultSafeIntegers(toggle) {
        databaseDefaultSafeIntegers.call(this.db, toggle ?? true);
        return this;
      }
      unsafeMode(...args) {
        throw new Error("not implemented");
      }
    };
    var Statement = class {
      constructor(stmt) {
        this.stmt = stmt;
        this.pluckMode = false;
      }
      /**
       * Toggle raw mode.
       *
       * @param raw Enable or disable raw mode. If you don't pass the parameter, raw mode is enabled.
       */
      raw(raw2) {
        statementRaw.call(this.stmt, raw2 ?? true);
        return this;
      }
      /**
       * Toggle pluck mode.
       *
       * @param pluckMode Enable or disable pluck mode. If you don't pass the parameter, pluck mode is enabled.
       */
      pluck(pluckMode) {
        this.pluckMode = pluckMode ?? true;
        return this;
      }
      get reader() {
        return statementIsReader.call(this.stmt);
      }
      /**
       * Executes the SQL statement and returns an info object.
       */
      run(...bindParameters) {
        try {
          if (bindParameters.length == 1 && typeof bindParameters[0] === "object") {
            return statementRun.call(this.stmt, bindParameters[0]);
          } else {
            return statementRun.call(this.stmt, bindParameters.flat());
          }
        } catch (err) {
          throw convertError(err);
        }
      }
      /**
       * Executes the SQL statement and returns the first row.
       *
       * @param bindParameters - The bind parameters for executing the statement.
       */
      get(...bindParameters) {
        try {
          if (bindParameters.length == 1 && typeof bindParameters[0] === "object") {
            return statementGet.call(this.stmt, bindParameters[0]);
          } else {
            return statementGet.call(this.stmt, bindParameters.flat());
          }
        } catch (err) {
          throw convertError(err);
        }
      }
      /**
       * Executes the SQL statement and returns an iterator to the resulting rows.
       *
       * @param bindParameters - The bind parameters for executing the statement.
       */
      iterate(...bindParameters) {
        var rows = void 0;
        if (bindParameters.length == 1 && typeof bindParameters[0] === "object") {
          rows = statementRowsSync.call(this.stmt, bindParameters[0]);
        } else {
          rows = statementRowsSync.call(this.stmt, bindParameters.flat());
        }
        const iter = {
          nextRows: Array(100),
          nextRowIndex: 100,
          next() {
            try {
              if (this.nextRowIndex === 100) {
                rowsNext.call(rows, this.nextRows);
                this.nextRowIndex = 0;
              }
              const row = this.nextRows[this.nextRowIndex];
              this.nextRows[this.nextRowIndex] = void 0;
              if (!row) {
                return { done: true };
              }
              this.nextRowIndex++;
              return { value: row, done: false };
            } catch (err) {
              throw convertError(err);
            }
          },
          [Symbol.iterator]() {
            return this;
          }
        };
        return iter;
      }
      /**
       * Executes the SQL statement and returns an array of the resulting rows.
       *
       * @param bindParameters - The bind parameters for executing the statement.
       */
      all(...bindParameters) {
        try {
          const result = [];
          for (const row of this.iterate(...bindParameters)) {
            if (this.pluckMode) {
              result.push(row[Object.keys(row)[0]]);
            } else {
              result.push(row);
            }
          }
          return result;
        } catch (err) {
          throw convertError(err);
        }
      }
      /**
       * Interrupts the statement.
       */
      interrupt() {
        statementInterrupt.call(this.stmt);
      }
      /**
       * Returns the columns in the result set returned by this prepared statement.
       */
      columns() {
        return statementColumns.call(this.stmt);
      }
      /**
       * Toggle 64-bit integer support.
       */
      safeIntegers(toggle) {
        statementSafeIntegers.call(this.stmt, toggle ?? true);
        return this;
      }
    };
    module.exports = Database2;
    module.exports.Authorization = Authorization;
    module.exports.SqliteError = SqliteError;
  }
});

// node_modules/@libsql/client/lib-esm/sqlite3.js
import { Buffer as Buffer2 } from "node:buffer";
function _createClient(config) {
  if (config.scheme !== "file") {
    throw new LibsqlError(`URL scheme ${JSON.stringify(config.scheme + ":")} is not supported by the local sqlite3 client. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
  }
  const authority = config.authority;
  if (authority !== void 0) {
    const host = authority.host.toLowerCase();
    if (host !== "" && host !== "localhost") {
      throw new LibsqlError(`Invalid host in file URL: ${JSON.stringify(authority.host)}. A "file:" URL with an absolute path should start with one slash ("file:/absolute/path.db") or with three slashes ("file:///absolute/path.db"). For more information, please read ${supportedUrlLink}`, "URL_INVALID");
    }
    if (authority.port !== void 0) {
      throw new LibsqlError("File URL cannot have a port", "URL_INVALID");
    }
    if (authority.userinfo !== void 0) {
      throw new LibsqlError("File URL cannot have username and password", "URL_INVALID");
    }
  }
  let isInMemory = isInMemoryConfig(config);
  if (isInMemory && config.syncUrl) {
    throw new LibsqlError(`Embedded replica must use file for local db but URI with in-memory mode were provided instead: ${config.path}`, "URL_INVALID");
  }
  let path = config.path;
  if (isInMemory) {
    path = `${config.scheme}:${config.path}`;
  }
  const options = {
    authToken: config.authToken,
    encryptionKey: config.encryptionKey,
    remoteEncryptionKey: config.remoteEncryptionKey,
    syncUrl: config.syncUrl,
    syncPeriod: config.syncInterval,
    readYourWrites: config.readYourWrites,
    offline: config.offline
  };
  const db2 = new import_libsql.default(path, options);
  executeStmt(db2, "SELECT 1 AS checkThatTheDatabaseCanBeOpened", config.intMode);
  return new Sqlite3Client(path, options, db2, config.intMode);
}
function executeStmt(db2, stmt, intMode) {
  let sql;
  let args;
  if (typeof stmt === "string") {
    sql = stmt;
    args = [];
  } else {
    sql = stmt.sql;
    if (Array.isArray(stmt.args)) {
      args = stmt.args.map((value) => valueToSql(value, intMode));
    } else {
      args = {};
      for (const name in stmt.args) {
        const argName = name[0] === "@" || name[0] === "$" || name[0] === ":" ? name.substring(1) : name;
        args[argName] = valueToSql(stmt.args[name], intMode);
      }
    }
  }
  try {
    const sqlStmt = db2.prepare(sql);
    sqlStmt.safeIntegers(true);
    let returnsData = true;
    try {
      sqlStmt.raw(true);
    } catch {
      returnsData = false;
    }
    if (returnsData) {
      const columns = Array.from(sqlStmt.columns().map((col) => col.name));
      const columnTypes = Array.from(sqlStmt.columns().map((col) => col.type ?? ""));
      const rows = sqlStmt.all(args).map((sqlRow) => {
        return rowFromSql(sqlRow, columns, intMode);
      });
      const rowsAffected = 0;
      const lastInsertRowid = void 0;
      return new ResultSetImpl(columns, columnTypes, rows, rowsAffected, lastInsertRowid);
    } else {
      const info = sqlStmt.run(args);
      const rowsAffected = info.changes;
      const lastInsertRowid = BigInt(info.lastInsertRowid);
      return new ResultSetImpl([], [], [], rowsAffected, lastInsertRowid);
    }
  } catch (e) {
    throw mapSqliteError(e);
  }
}
function rowFromSql(sqlRow, columns, intMode) {
  const row = {};
  Object.defineProperty(row, "length", { value: sqlRow.length });
  for (let i = 0; i < sqlRow.length; ++i) {
    const value = valueFromSql(sqlRow[i], intMode);
    Object.defineProperty(row, i, { value });
    const column = columns[i];
    if (!Object.hasOwn(row, column)) {
      Object.defineProperty(row, column, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
  }
  return row;
}
function valueFromSql(sqlValue, intMode) {
  if (typeof sqlValue === "bigint") {
    if (intMode === "number") {
      if (sqlValue < minSafeBigint || sqlValue > maxSafeBigint) {
        throw new RangeError("Received integer which cannot be safely represented as a JavaScript number");
      }
      return Number(sqlValue);
    } else if (intMode === "bigint") {
      return sqlValue;
    } else if (intMode === "string") {
      return "" + sqlValue;
    } else {
      throw new Error("Invalid value for IntMode");
    }
  } else if (sqlValue instanceof Buffer2) {
    return sqlValue.buffer;
  }
  return sqlValue;
}
function valueToSql(value, intMode) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new RangeError("Only finite numbers (not Infinity or NaN) can be passed as arguments");
    }
    return value;
  } else if (typeof value === "bigint") {
    if (value < minInteger || value > maxInteger) {
      throw new RangeError("bigint is too large to be represented as a 64-bit integer and passed as argument");
    }
    return value;
  } else if (typeof value === "boolean") {
    switch (intMode) {
      case "bigint":
        return value ? 1n : 0n;
      case "string":
        return value ? "1" : "0";
      default:
        return value ? 1 : 0;
    }
  } else if (value instanceof ArrayBuffer) {
    return Buffer2.from(value);
  } else if (value instanceof Date) {
    return value.valueOf();
  } else if (value === void 0) {
    throw new TypeError("undefined cannot be passed as argument to the database");
  } else {
    return value;
  }
}
function executeMultiple(db2, sql) {
  try {
    db2.exec(sql);
  } catch (e) {
    throw mapSqliteError(e);
  }
}
function mapSqliteError(e) {
  if (e instanceof import_libsql.default.SqliteError) {
    const extendedCode = e.code;
    const code = mapToBaseCode(e.rawCode);
    return new LibsqlError(e.message, code, extendedCode, e.rawCode, e);
  }
  return e;
}
function mapToBaseCode(rawCode) {
  if (rawCode === void 0) {
    return "SQLITE_UNKNOWN";
  }
  const baseCode = rawCode & 255;
  return sqliteErrorCodes[baseCode] ?? `SQLITE_UNKNOWN_${baseCode.toString()}`;
}
var import_libsql, Sqlite3Client, Sqlite3Transaction, minSafeBigint, maxSafeBigint, minInteger, maxInteger, sqliteErrorCodes;
var init_sqlite3 = __esm({
  "node_modules/@libsql/client/lib-esm/sqlite3.js"() {
    import_libsql = __toESM(require_libsql(), 1);
    init_api();
    init_config();
    init_util();
    init_api();
    Sqlite3Client = class {
      #path;
      #options;
      #db;
      #intMode;
      closed;
      protocol;
      /** @private */
      constructor(path, options, db2, intMode) {
        this.#path = path;
        this.#options = options;
        this.#db = db2;
        this.#intMode = intMode;
        this.closed = false;
        this.protocol = "file";
      }
      async execute(stmtOrSql, args) {
        let stmt;
        if (typeof stmtOrSql === "string") {
          stmt = {
            sql: stmtOrSql,
            args: args || []
          };
        } else {
          stmt = stmtOrSql;
        }
        this.#checkNotClosed();
        return executeStmt(this.#getDb(), stmt, this.#intMode);
      }
      async batch(stmts, mode = "deferred") {
        this.#checkNotClosed();
        const db2 = this.#getDb();
        try {
          executeStmt(db2, transactionModeToBegin(mode), this.#intMode);
          const resultSets = [];
          for (let i = 0; i < stmts.length; i++) {
            try {
              if (!db2.inTransaction) {
                throw new LibsqlBatchError("The transaction has been rolled back", i, "TRANSACTION_CLOSED");
              }
              const stmt = stmts[i];
              const normalizedStmt = Array.isArray(stmt) ? { sql: stmt[0], args: stmt[1] || [] } : stmt;
              resultSets.push(executeStmt(db2, normalizedStmt, this.#intMode));
            } catch (e) {
              if (e instanceof LibsqlBatchError) {
                throw e;
              }
              if (e instanceof LibsqlError) {
                throw new LibsqlBatchError(e.message, i, e.code, e.extendedCode, e.rawCode, e.cause instanceof Error ? e.cause : void 0);
              }
              throw e;
            }
          }
          executeStmt(db2, "COMMIT", this.#intMode);
          return resultSets;
        } finally {
          if (db2.inTransaction) {
            executeStmt(db2, "ROLLBACK", this.#intMode);
          }
        }
      }
      async migrate(stmts) {
        this.#checkNotClosed();
        const db2 = this.#getDb();
        try {
          executeStmt(db2, "PRAGMA foreign_keys=off", this.#intMode);
          executeStmt(db2, transactionModeToBegin("deferred"), this.#intMode);
          const resultSets = [];
          for (let i = 0; i < stmts.length; i++) {
            try {
              if (!db2.inTransaction) {
                throw new LibsqlBatchError("The transaction has been rolled back", i, "TRANSACTION_CLOSED");
              }
              resultSets.push(executeStmt(db2, stmts[i], this.#intMode));
            } catch (e) {
              if (e instanceof LibsqlBatchError) {
                throw e;
              }
              if (e instanceof LibsqlError) {
                throw new LibsqlBatchError(e.message, i, e.code, e.extendedCode, e.rawCode, e.cause instanceof Error ? e.cause : void 0);
              }
              throw e;
            }
          }
          executeStmt(db2, "COMMIT", this.#intMode);
          return resultSets;
        } finally {
          if (db2.inTransaction) {
            executeStmt(db2, "ROLLBACK", this.#intMode);
          }
          executeStmt(db2, "PRAGMA foreign_keys=on", this.#intMode);
        }
      }
      async transaction(mode = "write") {
        const db2 = this.#getDb();
        executeStmt(db2, transactionModeToBegin(mode), this.#intMode);
        this.#db = null;
        return new Sqlite3Transaction(db2, this.#intMode);
      }
      async executeMultiple(sql) {
        this.#checkNotClosed();
        const db2 = this.#getDb();
        try {
          return executeMultiple(db2, sql);
        } finally {
          if (db2.inTransaction) {
            executeStmt(db2, "ROLLBACK", this.#intMode);
          }
        }
      }
      async sync() {
        this.#checkNotClosed();
        const rep = await this.#getDb().sync();
        return {
          frames_synced: rep.frames_synced,
          frame_no: rep.frame_no
        };
      }
      async reconnect() {
        try {
          if (!this.closed && this.#db !== null) {
            this.#db.close();
          }
        } finally {
          this.#db = new import_libsql.default(this.#path, this.#options);
          this.closed = false;
        }
      }
      close() {
        this.closed = true;
        if (this.#db !== null) {
          this.#db.close();
          this.#db = null;
        }
      }
      #checkNotClosed() {
        if (this.closed) {
          throw new LibsqlError("The client is closed", "CLIENT_CLOSED");
        }
      }
      // Lazily creates the database connection and returns it
      #getDb() {
        if (this.#db === null) {
          this.#db = new import_libsql.default(this.#path, this.#options);
        }
        return this.#db;
      }
    };
    Sqlite3Transaction = class {
      #database;
      #intMode;
      /** @private */
      constructor(database, intMode) {
        this.#database = database;
        this.#intMode = intMode;
      }
      async execute(stmtOrSql, args) {
        let stmt;
        if (typeof stmtOrSql === "string") {
          stmt = {
            sql: stmtOrSql,
            args: args || []
          };
        } else {
          stmt = stmtOrSql;
        }
        this.#checkNotClosed();
        return executeStmt(this.#database, stmt, this.#intMode);
      }
      async batch(stmts) {
        const resultSets = [];
        for (let i = 0; i < stmts.length; i++) {
          try {
            this.#checkNotClosed();
            const stmt = stmts[i];
            const normalizedStmt = Array.isArray(stmt) ? { sql: stmt[0], args: stmt[1] || [] } : stmt;
            resultSets.push(executeStmt(this.#database, normalizedStmt, this.#intMode));
          } catch (e) {
            if (e instanceof LibsqlBatchError) {
              throw e;
            }
            if (e instanceof LibsqlError) {
              throw new LibsqlBatchError(e.message, i, e.code, e.extendedCode, e.rawCode, e.cause instanceof Error ? e.cause : void 0);
            }
            throw e;
          }
        }
        return resultSets;
      }
      async executeMultiple(sql) {
        this.#checkNotClosed();
        return executeMultiple(this.#database, sql);
      }
      async rollback() {
        if (!this.#database.open) {
          return;
        }
        this.#checkNotClosed();
        executeStmt(this.#database, "ROLLBACK", this.#intMode);
      }
      async commit() {
        this.#checkNotClosed();
        executeStmt(this.#database, "COMMIT", this.#intMode);
      }
      close() {
        if (this.#database.inTransaction) {
          executeStmt(this.#database, "ROLLBACK", this.#intMode);
        }
      }
      get closed() {
        return !this.#database.inTransaction;
      }
      #checkNotClosed() {
        if (this.closed) {
          throw new LibsqlError("The transaction is closed", "TRANSACTION_CLOSED");
        }
      }
    };
    minSafeBigint = -9007199254740991n;
    maxSafeBigint = 9007199254740991n;
    minInteger = -9223372036854775808n;
    maxInteger = 9223372036854775807n;
    sqliteErrorCodes = {
      1: "SQLITE_ERROR",
      2: "SQLITE_INTERNAL",
      3: "SQLITE_PERM",
      4: "SQLITE_ABORT",
      5: "SQLITE_BUSY",
      6: "SQLITE_LOCKED",
      7: "SQLITE_NOMEM",
      8: "SQLITE_READONLY",
      9: "SQLITE_INTERRUPT",
      10: "SQLITE_IOERR",
      11: "SQLITE_CORRUPT",
      12: "SQLITE_NOTFOUND",
      13: "SQLITE_FULL",
      14: "SQLITE_CANTOPEN",
      15: "SQLITE_PROTOCOL",
      16: "SQLITE_EMPTY",
      17: "SQLITE_SCHEMA",
      18: "SQLITE_TOOBIG",
      19: "SQLITE_CONSTRAINT",
      20: "SQLITE_MISMATCH",
      21: "SQLITE_MISUSE",
      22: "SQLITE_NOLFS",
      23: "SQLITE_AUTH",
      24: "SQLITE_FORMAT",
      25: "SQLITE_RANGE",
      26: "SQLITE_NOTADB",
      27: "SQLITE_NOTICE",
      28: "SQLITE_WARNING"
    };
  }
});

// node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/ws/lib/constants.js"(exports, module) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: /* @__PURE__ */ Symbol("kIsForOnEventAttribute"),
      kListener: /* @__PURE__ */ Symbol("kListener"),
      kStatusCode: /* @__PURE__ */ Symbol("status-code"),
      kWebSocket: /* @__PURE__ */ Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports, module) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = __require("bufferutil");
        module.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports, module) {
    "use strict";
    var kDone = /* @__PURE__ */ Symbol("kDone");
    var kRun = /* @__PURE__ */ Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports, module) {
    "use strict";
    var zlib = __require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = /* @__PURE__ */ Symbol("permessage-deflate");
    var kTotalLength = /* @__PURE__ */ Symbol("total-length");
    var kCallback = /* @__PURE__ */ Symbol("callback");
    var kBuffers = /* @__PURE__ */ Symbol("buffers");
    var kError = /* @__PURE__ */ Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports, module) {
    "use strict";
    var { isUtf8 } = __require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = __require("utf-8-validate");
        module.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports, module) {
    "use strict";
    var { Writable } = __require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module.exports = Receiver2;
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports, module) {
    "use strict";
    var { Duplex } = __require("stream");
    var { randomFillSync } = __require("crypto");
    var {
      types: { isUint8Array }
    } = __require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = /* @__PURE__ */ Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports, module) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = /* @__PURE__ */ Symbol("kCode");
    var kData = /* @__PURE__ */ Symbol("kData");
    var kError = /* @__PURE__ */ Symbol("kError");
    var kMessage = /* @__PURE__ */ Symbol("kMessage");
    var kReason = /* @__PURE__ */ Symbol("kReason");
    var kTarget = /* @__PURE__ */ Symbol("kTarget");
    var kType = /* @__PURE__ */ Symbol("kType");
    var kWasClean = /* @__PURE__ */ Symbol("kWasClean");
    var Event2 = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event2.prototype, "target", { enumerable: true });
    Object.defineProperty(Event2.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event2 {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event2 {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event2 {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler2, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler2 && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler2, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler2, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler2, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event2("open");
            event[kTarget] = this;
            callListener(handler2, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler2;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler2) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler2 && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module.exports = {
      CloseEvent,
      ErrorEvent,
      Event: Event2,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse2(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module.exports = { format, parse: parse2 };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var https = __require("https");
    var http = __require("http");
    var net = __require("net");
    var tls = __require("tls");
    var { randomBytes, createHash: createHash3 } = __require("crypto");
    var { Duplex, Readable } = __require("stream");
    var { URL: URL2 } = __require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener: addEventListener2, removeEventListener }
    } = require_event_target();
    var { format, parse: parse2 } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = /* @__PURE__ */ Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler2) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler2 !== "function") return;
          this.addEventListener(method, handler2, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener2;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL2) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL2(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL2(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash3("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse2(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/ws/lib/stream.js"(exports, module) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = __require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module.exports = createWebSocketStream2;
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse2(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module.exports = { parse: parse2 };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var http = __require("http");
    var { Duplex } = __require("stream");
    var { createHash: createHash3 } = __require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version2 = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version2 !== 13 && version2 !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version2 === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash3("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map)) server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// node_modules/ws/wrapper.mjs
var import_stream, import_extension, import_permessage_deflate, import_receiver, import_sender, import_subprotocol, import_websocket, import_websocket_server;
var init_wrapper = __esm({
  "node_modules/ws/wrapper.mjs"() {
    import_stream = __toESM(require_stream(), 1);
    import_extension = __toESM(require_extension(), 1);
    import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
    import_receiver = __toESM(require_receiver(), 1);
    import_sender = __toESM(require_sender(), 1);
    import_subprotocol = __toESM(require_subprotocol(), 1);
    import_websocket = __toESM(require_websocket(), 1);
    import_websocket_server = __toESM(require_websocket_server(), 1);
  }
});

// node_modules/@libsql/isomorphic-ws/node.mjs
var init_node3 = __esm({
  "node_modules/@libsql/isomorphic-ws/node.mjs"() {
    init_wrapper();
  }
});

// node_modules/@libsql/hrana-client/lib-esm/client.js
var Client;
var init_client = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/client.js"() {
    Client = class {
      /** @private */
      constructor() {
        this.intMode = "number";
      }
      /** Representation of integers returned from the database. See {@link IntMode}.
       *
       * This value is inherited by {@link Stream} objects created with {@link openStream}, but you can
       * override the integer mode for every stream by setting {@link Stream.intMode} on the stream.
       */
      intMode;
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/errors.js
var ClientError, ProtoError, ResponseError, ClosedError, WebSocketUnsupportedError, WebSocketError, HttpServerError, ProtocolVersionError, InternalError, MisuseError;
var init_errors = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/errors.js"() {
    ClientError = class extends Error {
      /** @private */
      constructor(message) {
        super(message);
        this.name = "ClientError";
      }
    };
    ProtoError = class extends ClientError {
      /** @private */
      constructor(message) {
        super(message);
        this.name = "ProtoError";
      }
    };
    ResponseError = class extends ClientError {
      code;
      /** @internal */
      proto;
      /** @private */
      constructor(message, protoError) {
        super(message);
        this.name = "ResponseError";
        this.code = protoError.code;
        this.proto = protoError;
        this.stack = void 0;
      }
    };
    ClosedError = class extends ClientError {
      /** @private */
      constructor(message, cause) {
        if (cause !== void 0) {
          super(`${message}: ${cause}`);
          this.cause = cause;
        } else {
          super(message);
        }
        this.name = "ClosedError";
      }
    };
    WebSocketUnsupportedError = class extends ClientError {
      /** @private */
      constructor(message) {
        super(message);
        this.name = "WebSocketUnsupportedError";
      }
    };
    WebSocketError = class extends ClientError {
      /** @private */
      constructor(message) {
        super(message);
        this.name = "WebSocketError";
      }
    };
    HttpServerError = class extends ClientError {
      status;
      /** @private */
      constructor(message, status) {
        super(message);
        this.status = status;
        this.name = "HttpServerError";
      }
    };
    ProtocolVersionError = class extends ClientError {
      /** @private */
      constructor(message) {
        super(message);
        this.name = "ProtocolVersionError";
      }
    };
    InternalError = class extends ClientError {
      /** @private */
      constructor(message) {
        super(message);
        this.name = "InternalError";
      }
    };
    MisuseError = class extends ClientError {
      /** @private */
      constructor(message) {
        super(message);
        this.name = "MisuseError";
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/encoding/json/decode.js
function string(value) {
  if (typeof value === "string") {
    return value;
  }
  throw typeError(value, "string");
}
function stringOpt(value) {
  if (value === null || value === void 0) {
    return void 0;
  } else if (typeof value === "string") {
    return value;
  }
  throw typeError(value, "string or null");
}
function number(value) {
  if (typeof value === "number") {
    return value;
  }
  throw typeError(value, "number");
}
function boolean(value) {
  if (typeof value === "boolean") {
    return value;
  }
  throw typeError(value, "boolean");
}
function array(value) {
  if (Array.isArray(value)) {
    return value;
  }
  throw typeError(value, "array");
}
function object(value) {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  throw typeError(value, "object");
}
function arrayObjectsMap(value, fun) {
  return array(value).map((elemValue) => fun(object(elemValue)));
}
function typeError(value, expected) {
  if (value === void 0) {
    return new ProtoError(`Expected ${expected}, but the property was missing`);
  }
  let received = typeof value;
  if (value === null) {
    received = "null";
  } else if (Array.isArray(value)) {
    received = "array";
  }
  return new ProtoError(`Expected ${expected}, received ${received}`);
}
function readJsonObject(value, fun) {
  return fun(object(value));
}
var init_decode = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/encoding/json/decode.js"() {
    init_errors();
  }
});

// node_modules/@libsql/hrana-client/lib-esm/encoding/json/encode.js
function writeJsonObject(value, fun) {
  const output = [];
  const writer = new ObjectWriter(output);
  writer.begin();
  fun(writer, value);
  writer.end();
  return output.join("");
}
var ObjectWriter;
var init_encode = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/encoding/json/encode.js"() {
    ObjectWriter = class {
      #output;
      #isFirst;
      constructor(output) {
        this.#output = output;
        this.#isFirst = false;
      }
      begin() {
        this.#output.push("{");
        this.#isFirst = true;
      }
      end() {
        this.#output.push("}");
        this.#isFirst = false;
      }
      #key(name) {
        if (this.#isFirst) {
          this.#output.push('"');
          this.#isFirst = false;
        } else {
          this.#output.push(',"');
        }
        this.#output.push(name);
        this.#output.push('":');
      }
      string(name, value) {
        this.#key(name);
        this.#output.push(JSON.stringify(value));
      }
      stringRaw(name, value) {
        this.#key(name);
        this.#output.push('"');
        this.#output.push(value);
        this.#output.push('"');
      }
      number(name, value) {
        this.#key(name);
        this.#output.push("" + value);
      }
      boolean(name, value) {
        this.#key(name);
        this.#output.push(value ? "true" : "false");
      }
      object(name, value, valueFun) {
        this.#key(name);
        this.begin();
        valueFun(this, value);
        this.end();
      }
      arrayObjects(name, values, valueFun) {
        this.#key(name);
        this.#output.push("[");
        for (let i = 0; i < values.length; ++i) {
          if (i !== 0) {
            this.#output.push(",");
          }
          this.begin();
          valueFun(this, values[i]);
          this.end();
        }
        this.#output.push("]");
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/util.js
var VARINT, FIXED_64, LENGTH_DELIMITED, FIXED_32;
var init_util2 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/util.js"() {
    VARINT = 0;
    FIXED_64 = 1;
    LENGTH_DELIMITED = 2;
    FIXED_32 = 5;
  }
});

// node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/decode.js
function readProtobufMessage(data, def) {
  const msgReader = new MessageReader(data);
  const fieldReader = new FieldReader(msgReader);
  let value = def.default();
  while (!msgReader.eof()) {
    const key = msgReader.varint();
    const tag = key >> 3;
    const wireType = key & 7;
    fieldReader.setup(wireType);
    const tagFun = def[tag];
    if (tagFun !== void 0) {
      const returnedValue = tagFun(fieldReader, value);
      if (returnedValue !== void 0) {
        value = returnedValue;
      }
    }
    fieldReader.maybeSkip();
  }
  return value;
}
var MessageReader, FieldReader;
var init_decode2 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/decode.js"() {
    init_errors();
    init_util2();
    MessageReader = class {
      #array;
      #view;
      #pos;
      constructor(array2) {
        this.#array = array2;
        this.#view = new DataView(array2.buffer, array2.byteOffset, array2.byteLength);
        this.#pos = 0;
      }
      varint() {
        let value = 0;
        for (let shift = 0; ; shift += 7) {
          const byte = this.#array[this.#pos++];
          value |= (byte & 127) << shift;
          if (!(byte & 128)) {
            break;
          }
        }
        return value;
      }
      varintBig() {
        let value = 0n;
        for (let shift = 0n; ; shift += 7n) {
          const byte = this.#array[this.#pos++];
          value |= BigInt(byte & 127) << shift;
          if (!(byte & 128)) {
            break;
          }
        }
        return value;
      }
      bytes(length) {
        const array2 = new Uint8Array(this.#array.buffer, this.#array.byteOffset + this.#pos, length);
        this.#pos += length;
        return array2;
      }
      double() {
        const value = this.#view.getFloat64(this.#pos, true);
        this.#pos += 8;
        return value;
      }
      skipVarint() {
        for (; ; ) {
          const byte = this.#array[this.#pos++];
          if (!(byte & 128)) {
            break;
          }
        }
      }
      skip(count) {
        this.#pos += count;
      }
      eof() {
        return this.#pos >= this.#array.byteLength;
      }
    };
    FieldReader = class {
      #reader;
      #wireType;
      constructor(reader) {
        this.#reader = reader;
        this.#wireType = -1;
      }
      setup(wireType) {
        this.#wireType = wireType;
      }
      #expect(expectedWireType) {
        if (this.#wireType !== expectedWireType) {
          throw new ProtoError(`Expected wire type ${expectedWireType}, got ${this.#wireType}`);
        }
        this.#wireType = -1;
      }
      bytes() {
        this.#expect(LENGTH_DELIMITED);
        const length = this.#reader.varint();
        return this.#reader.bytes(length);
      }
      string() {
        return new TextDecoder().decode(this.bytes());
      }
      message(def) {
        return readProtobufMessage(this.bytes(), def);
      }
      int32() {
        this.#expect(VARINT);
        return this.#reader.varint();
      }
      uint32() {
        return this.int32();
      }
      bool() {
        return this.int32() !== 0;
      }
      uint64() {
        this.#expect(VARINT);
        return this.#reader.varintBig();
      }
      sint64() {
        const value = this.uint64();
        return value >> 1n ^ -(value & 1n);
      }
      double() {
        this.#expect(FIXED_64);
        return this.#reader.double();
      }
      maybeSkip() {
        if (this.#wireType < 0) {
          return;
        } else if (this.#wireType === VARINT) {
          this.#reader.skipVarint();
        } else if (this.#wireType === FIXED_64) {
          this.#reader.skip(8);
        } else if (this.#wireType === LENGTH_DELIMITED) {
          const length = this.#reader.varint();
          this.#reader.skip(length);
        } else if (this.#wireType === FIXED_32) {
          this.#reader.skip(4);
        } else {
          throw new ProtoError(`Unexpected wire type ${this.#wireType}`);
        }
        this.#wireType = -1;
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/encode.js
function writeProtobufMessage(value, fun) {
  const w = new MessageWriter();
  fun(w, value);
  return w.data();
}
var MessageWriter;
var init_encode2 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/encode.js"() {
    init_util2();
    MessageWriter = class _MessageWriter {
      #buf;
      #array;
      #view;
      #pos;
      constructor() {
        this.#buf = new ArrayBuffer(256);
        this.#array = new Uint8Array(this.#buf);
        this.#view = new DataView(this.#buf);
        this.#pos = 0;
      }
      #ensure(extra) {
        if (this.#pos + extra <= this.#buf.byteLength) {
          return;
        }
        let newCap = this.#buf.byteLength;
        while (newCap < this.#pos + extra) {
          newCap *= 2;
        }
        const newBuf = new ArrayBuffer(newCap);
        const newArray = new Uint8Array(newBuf);
        const newView = new DataView(newBuf);
        newArray.set(new Uint8Array(this.#buf, 0, this.#pos));
        this.#buf = newBuf;
        this.#array = newArray;
        this.#view = newView;
      }
      #varint(value) {
        this.#ensure(5);
        value = 0 | value;
        do {
          let byte = value & 127;
          value >>>= 7;
          byte |= value ? 128 : 0;
          this.#array[this.#pos++] = byte;
        } while (value);
      }
      #varintBig(value) {
        this.#ensure(10);
        value = value & 0xffffffffffffffffn;
        do {
          let byte = Number(value & 0x7fn);
          value >>= 7n;
          byte |= value ? 128 : 0;
          this.#array[this.#pos++] = byte;
        } while (value);
      }
      #tag(tag, wireType) {
        this.#varint(tag << 3 | wireType);
      }
      bytes(tag, value) {
        this.#tag(tag, LENGTH_DELIMITED);
        this.#varint(value.byteLength);
        this.#ensure(value.byteLength);
        this.#array.set(value, this.#pos);
        this.#pos += value.byteLength;
      }
      string(tag, value) {
        this.bytes(tag, new TextEncoder().encode(value));
      }
      message(tag, value, fun) {
        const writer = new _MessageWriter();
        fun(writer, value);
        this.bytes(tag, writer.data());
      }
      int32(tag, value) {
        this.#tag(tag, VARINT);
        this.#varint(value);
      }
      uint32(tag, value) {
        this.int32(tag, value);
      }
      bool(tag, value) {
        this.int32(tag, value ? 1 : 0);
      }
      sint64(tag, value) {
        this.#tag(tag, VARINT);
        this.#varintBig(value << 1n ^ value >> 63n);
      }
      double(tag, value) {
        this.#tag(tag, FIXED_64);
        this.#ensure(8);
        this.#view.setFloat64(this.#pos, value, true);
        this.#pos += 8;
      }
      data() {
        return new Uint8Array(this.#buf, 0, this.#pos);
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/encoding/index.js
var init_encoding = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/encoding/index.js"() {
    init_decode();
    init_encode();
    init_decode2();
    init_encode2();
  }
});

// node_modules/@libsql/hrana-client/lib-esm/id_alloc.js
var IdAlloc;
var init_id_alloc = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/id_alloc.js"() {
    init_errors();
    IdAlloc = class {
      // Set of all allocated ids
      #usedIds;
      // Set of all free ids lower than `#usedIds.size`
      #freeIds;
      constructor() {
        this.#usedIds = /* @__PURE__ */ new Set();
        this.#freeIds = /* @__PURE__ */ new Set();
      }
      // Returns an id that was free, and marks it as used.
      alloc() {
        for (const freeId2 of this.#freeIds) {
          this.#freeIds.delete(freeId2);
          this.#usedIds.add(freeId2);
          if (!this.#usedIds.has(this.#usedIds.size - 1)) {
            this.#freeIds.add(this.#usedIds.size - 1);
          }
          return freeId2;
        }
        const freeId = this.#usedIds.size;
        this.#usedIds.add(freeId);
        return freeId;
      }
      free(id) {
        if (!this.#usedIds.delete(id)) {
          throw new InternalError("Freeing an id that is not allocated");
        }
        this.#freeIds.delete(this.#usedIds.size);
        if (id < this.#usedIds.size) {
          this.#freeIds.add(id);
        }
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/util.js
function impossible(value, message) {
  throw new InternalError(message);
}
var init_util3 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/util.js"() {
    init_errors();
  }
});

// node_modules/@libsql/hrana-client/lib-esm/value.js
function valueToProto(value) {
  if (value === null) {
    return null;
  } else if (typeof value === "string") {
    return value;
  } else if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new RangeError("Only finite numbers (not Infinity or NaN) can be passed as arguments");
    }
    return value;
  } else if (typeof value === "bigint") {
    if (value < minInteger2 || value > maxInteger2) {
      throw new RangeError("This bigint value is too large to be represented as a 64-bit integer and passed as argument");
    }
    return value;
  } else if (typeof value === "boolean") {
    return value ? 1n : 0n;
  } else if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  } else if (value instanceof Uint8Array) {
    return value;
  } else if (value instanceof Date) {
    return +value.valueOf();
  } else if (typeof value === "object") {
    return "" + value.toString();
  } else {
    throw new TypeError("Unsupported type of value");
  }
}
function valueFromProto(value, intMode) {
  if (value === null) {
    return null;
  } else if (typeof value === "number") {
    return value;
  } else if (typeof value === "string") {
    return value;
  } else if (typeof value === "bigint") {
    if (intMode === "number") {
      const num = Number(value);
      if (!Number.isSafeInteger(num)) {
        throw new RangeError("Received integer which is too large to be safely represented as a JavaScript number");
      }
      return num;
    } else if (intMode === "bigint") {
      return value;
    } else if (intMode === "string") {
      return "" + value;
    } else {
      throw new MisuseError("Invalid value for IntMode");
    }
  } else if (value instanceof Uint8Array) {
    return value.slice().buffer;
  } else if (value === void 0) {
    throw new ProtoError("Received unrecognized type of Value");
  } else {
    throw impossible(value, "Impossible type of Value");
  }
}
var minInteger2, maxInteger2;
var init_value = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/value.js"() {
    init_errors();
    init_util3();
    minInteger2 = -9223372036854775808n;
    maxInteger2 = 9223372036854775807n;
  }
});

// node_modules/@libsql/hrana-client/lib-esm/result.js
function stmtResultFromProto(result) {
  return {
    affectedRowCount: result.affectedRowCount,
    lastInsertRowid: result.lastInsertRowid,
    columnNames: result.cols.map((col) => col.name),
    columnDecltypes: result.cols.map((col) => col.decltype)
  };
}
function rowsResultFromProto(result, intMode) {
  const stmtResult = stmtResultFromProto(result);
  const rows = result.rows.map((row) => rowFromProto(stmtResult.columnNames, row, intMode));
  return { ...stmtResult, rows };
}
function rowResultFromProto(result, intMode) {
  const stmtResult = stmtResultFromProto(result);
  let row;
  if (result.rows.length > 0) {
    row = rowFromProto(stmtResult.columnNames, result.rows[0], intMode);
  }
  return { ...stmtResult, row };
}
function valueResultFromProto(result, intMode) {
  const stmtResult = stmtResultFromProto(result);
  let value;
  if (result.rows.length > 0 && stmtResult.columnNames.length > 0) {
    value = valueFromProto(result.rows[0][0], intMode);
  }
  return { ...stmtResult, value };
}
function rowFromProto(colNames, values, intMode) {
  const row = {};
  Object.defineProperty(row, "length", { value: values.length });
  for (let i = 0; i < values.length; ++i) {
    const value = valueFromProto(values[i], intMode);
    Object.defineProperty(row, i, { value });
    const colName = colNames[i];
    if (colName !== void 0 && !Object.hasOwn(row, colName)) {
      Object.defineProperty(row, colName, { value, enumerable: true, configurable: true, writable: true });
    }
  }
  return row;
}
function errorFromProto(error) {
  return new ResponseError(error.message, error);
}
var init_result = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/result.js"() {
    init_errors();
    init_value();
  }
});

// node_modules/@libsql/hrana-client/lib-esm/sql.js
function sqlToProto(owner, sql) {
  if (sql instanceof Sql) {
    return { sqlId: sql._getSqlId(owner) };
  } else {
    return { sql: "" + sql };
  }
}
var Sql;
var init_sql = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/sql.js"() {
    init_errors();
    Sql = class {
      #owner;
      #sqlId;
      #closed;
      /** @private */
      constructor(owner, sqlId) {
        this.#owner = owner;
        this.#sqlId = sqlId;
        this.#closed = void 0;
      }
      /** @private */
      _getSqlId(owner) {
        if (this.#owner !== owner) {
          throw new MisuseError("Attempted to use SQL text opened with other object");
        } else if (this.#closed !== void 0) {
          throw new ClosedError("SQL text is closed", this.#closed);
        }
        return this.#sqlId;
      }
      /** Remove the SQL text from the server, releasing resouces. */
      close() {
        this._setClosed(new ClientError("SQL text was manually closed"));
      }
      /** @private */
      _setClosed(error) {
        if (this.#closed === void 0) {
          this.#closed = error;
          this.#owner._closeSql(this.#sqlId);
        }
      }
      /** True if the SQL text is closed (removed from the server). */
      get closed() {
        return this.#closed !== void 0;
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/queue.js
var Queue;
var init_queue = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/queue.js"() {
    Queue = class {
      #pushStack;
      #shiftStack;
      constructor() {
        this.#pushStack = [];
        this.#shiftStack = [];
      }
      get length() {
        return this.#pushStack.length + this.#shiftStack.length;
      }
      push(elem) {
        this.#pushStack.push(elem);
      }
      shift() {
        if (this.#shiftStack.length === 0 && this.#pushStack.length > 0) {
          this.#shiftStack = this.#pushStack.reverse();
          this.#pushStack = [];
        }
        return this.#shiftStack.pop();
      }
      first() {
        return this.#shiftStack.length !== 0 ? this.#shiftStack[this.#shiftStack.length - 1] : this.#pushStack[0];
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/stmt.js
function stmtToProto(sqlOwner, stmt, wantRows) {
  let inSql;
  let args = [];
  let namedArgs = [];
  if (stmt instanceof Stmt) {
    inSql = stmt.sql;
    args = stmt._args;
    for (const [name, value] of stmt._namedArgs.entries()) {
      namedArgs.push({ name, value });
    }
  } else if (Array.isArray(stmt)) {
    inSql = stmt[0];
    if (Array.isArray(stmt[1])) {
      args = stmt[1].map((arg) => valueToProto(arg));
    } else {
      namedArgs = Object.entries(stmt[1]).map(([name, value]) => {
        return { name, value: valueToProto(value) };
      });
    }
  } else {
    inSql = stmt;
  }
  const { sql, sqlId } = sqlToProto(sqlOwner, inSql);
  return { sql, sqlId, args, namedArgs, wantRows };
}
var Stmt;
var init_stmt = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/stmt.js"() {
    init_sql();
    init_value();
    Stmt = class {
      /** The SQL statement text. */
      sql;
      /** @private */
      _args;
      /** @private */
      _namedArgs;
      /** Initialize the statement with given SQL text. */
      constructor(sql) {
        this.sql = sql;
        this._args = [];
        this._namedArgs = /* @__PURE__ */ new Map();
      }
      /** Binds positional parameters from the given `values`. All previous positional bindings are cleared. */
      bindIndexes(values) {
        this._args.length = 0;
        for (const value of values) {
          this._args.push(valueToProto(value));
        }
        return this;
      }
      /** Binds a parameter by a 1-based index. */
      bindIndex(index, value) {
        if (index !== (index | 0) || index <= 0) {
          throw new RangeError("Index of a positional argument must be positive integer");
        }
        while (this._args.length < index) {
          this._args.push(null);
        }
        this._args[index - 1] = valueToProto(value);
        return this;
      }
      /** Binds a parameter by name. */
      bindName(name, value) {
        this._namedArgs.set(name, valueToProto(value));
        return this;
      }
      /** Clears all bindings. */
      unbindAll() {
        this._args.length = 0;
        this._namedArgs.clear();
        return this;
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/batch.js
function executeRegular(stream, steps, batch) {
  return stream._batch(batch).then((result) => {
    for (let step = 0; step < steps.length; ++step) {
      const stepResult = result.stepResults.get(step);
      const stepError = result.stepErrors.get(step);
      steps[step].callback(stepResult, stepError);
    }
  });
}
async function executeCursor(stream, steps, batch) {
  const cursor = await stream._openCursor(batch);
  try {
    let nextStep = 0;
    let beginEntry = void 0;
    let rows = [];
    for (; ; ) {
      const entry = await cursor.next();
      if (entry === void 0) {
        break;
      }
      if (entry.type === "step_begin") {
        if (entry.step < nextStep || entry.step >= steps.length) {
          throw new ProtoError("Server produced StepBeginEntry for unexpected step");
        } else if (beginEntry !== void 0) {
          throw new ProtoError("Server produced StepBeginEntry before terminating previous step");
        }
        for (let step = nextStep; step < entry.step; ++step) {
          steps[step].callback(void 0, void 0);
        }
        nextStep = entry.step + 1;
        beginEntry = entry;
        rows = [];
      } else if (entry.type === "step_end") {
        if (beginEntry === void 0) {
          throw new ProtoError("Server produced StepEndEntry but no step is active");
        }
        const stmtResult = {
          cols: beginEntry.cols,
          rows,
          affectedRowCount: entry.affectedRowCount,
          lastInsertRowid: entry.lastInsertRowid
        };
        steps[beginEntry.step].callback(stmtResult, void 0);
        beginEntry = void 0;
        rows = [];
      } else if (entry.type === "step_error") {
        if (beginEntry === void 0) {
          if (entry.step >= steps.length) {
            throw new ProtoError("Server produced StepErrorEntry for unexpected step");
          }
          for (let step = nextStep; step < entry.step; ++step) {
            steps[step].callback(void 0, void 0);
          }
        } else {
          if (entry.step !== beginEntry.step) {
            throw new ProtoError("Server produced StepErrorEntry for unexpected step");
          }
          beginEntry = void 0;
          rows = [];
        }
        steps[entry.step].callback(void 0, entry.error);
        nextStep = entry.step + 1;
      } else if (entry.type === "row") {
        if (beginEntry === void 0) {
          throw new ProtoError("Server produced RowEntry but no step is active");
        }
        rows.push(entry.row);
      } else if (entry.type === "error") {
        throw errorFromProto(entry.error);
      } else if (entry.type === "none") {
        throw new ProtoError("Server produced unrecognized CursorEntry");
      } else {
        throw impossible(entry, "Impossible CursorEntry");
      }
    }
    if (beginEntry !== void 0) {
      throw new ProtoError("Server closed Cursor before terminating active step");
    }
    for (let step = nextStep; step < steps.length; ++step) {
      steps[step].callback(void 0, void 0);
    }
  } finally {
    cursor.close();
  }
}
function stepIndex(step) {
  if (step._index === void 0) {
    throw new MisuseError("Cannot add a condition referencing a step that has not been added to the batch");
  }
  return step._index;
}
function checkCondBatch(expectedBatch, cond) {
  if (cond._batch !== expectedBatch) {
    throw new MisuseError("Cannot mix BatchCond objects for different Batch objects");
  }
}
var Batch, BatchStep, BatchCond;
var init_batch = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/batch.js"() {
    init_errors();
    init_result();
    init_stmt();
    init_util3();
    Batch = class {
      /** @private */
      _stream;
      #useCursor;
      /** @private */
      _steps;
      #executed;
      /** @private */
      constructor(stream, useCursor) {
        this._stream = stream;
        this.#useCursor = useCursor;
        this._steps = [];
        this.#executed = false;
      }
      /** Return a builder for adding a step to the batch. */
      step() {
        return new BatchStep(this);
      }
      /** Execute the batch. */
      execute() {
        if (this.#executed) {
          throw new MisuseError("This batch has already been executed");
        }
        this.#executed = true;
        const batch = {
          steps: this._steps.map((step) => step.proto)
        };
        if (this.#useCursor) {
          return executeCursor(this._stream, this._steps, batch);
        } else {
          return executeRegular(this._stream, this._steps, batch);
        }
      }
    };
    BatchStep = class {
      /** @private */
      _batch;
      #conds;
      /** @private */
      _index;
      /** @private */
      constructor(batch) {
        this._batch = batch;
        this.#conds = [];
        this._index = void 0;
      }
      /** Add the condition that needs to be satisfied to execute the statement. If you use this method multiple
       * times, we join the conditions with a logical AND. */
      condition(cond) {
        this.#conds.push(cond._proto);
        return this;
      }
      /** Add a statement that returns rows. */
      query(stmt) {
        return this.#add(stmt, true, rowsResultFromProto);
      }
      /** Add a statement that returns at most a single row. */
      queryRow(stmt) {
        return this.#add(stmt, true, rowResultFromProto);
      }
      /** Add a statement that returns at most a single value. */
      queryValue(stmt) {
        return this.#add(stmt, true, valueResultFromProto);
      }
      /** Add a statement without returning rows. */
      run(stmt) {
        return this.#add(stmt, false, stmtResultFromProto);
      }
      #add(inStmt, wantRows, fromProto) {
        if (this._index !== void 0) {
          throw new MisuseError("This BatchStep has already been added to the batch");
        }
        const stmt = stmtToProto(this._batch._stream._sqlOwner(), inStmt, wantRows);
        let condition;
        if (this.#conds.length === 0) {
          condition = void 0;
        } else if (this.#conds.length === 1) {
          condition = this.#conds[0];
        } else {
          condition = { type: "and", conds: this.#conds.slice() };
        }
        const proto = { stmt, condition };
        return new Promise((outputCallback, errorCallback) => {
          const callback = (stepResult, stepError) => {
            if (stepResult !== void 0 && stepError !== void 0) {
              errorCallback(new ProtoError("Server returned both result and error"));
            } else if (stepError !== void 0) {
              errorCallback(errorFromProto(stepError));
            } else if (stepResult !== void 0) {
              outputCallback(fromProto(stepResult, this._batch._stream.intMode));
            } else {
              outputCallback(void 0);
            }
          };
          this._index = this._batch._steps.length;
          this._batch._steps.push({ proto, callback });
        });
      }
    };
    BatchCond = class _BatchCond {
      /** @private */
      _batch;
      /** @private */
      _proto;
      /** @private */
      constructor(batch, proto) {
        this._batch = batch;
        this._proto = proto;
      }
      /** Create a condition that evaluates to true when the given step executes successfully.
       *
       * If the given step fails error or is skipped because its condition evaluated to false, this
       * condition evaluates to false.
       */
      static ok(step) {
        return new _BatchCond(step._batch, { type: "ok", step: stepIndex(step) });
      }
      /** Create a condition that evaluates to true when the given step fails.
       *
       * If the given step succeeds or is skipped because its condition evaluated to false, this condition
       * evaluates to false.
       */
      static error(step) {
        return new _BatchCond(step._batch, { type: "error", step: stepIndex(step) });
      }
      /** Create a condition that is a logical negation of another condition.
       */
      static not(cond) {
        return new _BatchCond(cond._batch, { type: "not", cond: cond._proto });
      }
      /** Create a condition that is a logical AND of other conditions.
       */
      static and(batch, conds) {
        for (const cond of conds) {
          checkCondBatch(batch, cond);
        }
        return new _BatchCond(batch, { type: "and", conds: conds.map((e) => e._proto) });
      }
      /** Create a condition that is a logical OR of other conditions.
       */
      static or(batch, conds) {
        for (const cond of conds) {
          checkCondBatch(batch, cond);
        }
        return new _BatchCond(batch, { type: "or", conds: conds.map((e) => e._proto) });
      }
      /** Create a condition that evaluates to true when the SQL connection is in autocommit mode (not inside an
       * explicit transaction). This requires protocol version 3 or higher.
       */
      static isAutocommit(batch) {
        batch._stream.client()._ensureVersion(3, "BatchCond.isAutocommit()");
        return new _BatchCond(batch, { type: "is_autocommit" });
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/describe.js
function describeResultFromProto(result) {
  return {
    paramNames: result.params.map((p) => p.name),
    columns: result.cols,
    isExplain: result.isExplain,
    isReadonly: result.isReadonly
  };
}
var init_describe = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/describe.js"() {
  }
});

// node_modules/@libsql/hrana-client/lib-esm/stream.js
var Stream;
var init_stream = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/stream.js"() {
    init_batch();
    init_describe();
    init_result();
    init_sql();
    init_stmt();
    Stream = class {
      /** @private */
      constructor(intMode) {
        this.intMode = intMode;
      }
      /** Execute a statement and return rows. */
      query(stmt) {
        return this.#execute(stmt, true, rowsResultFromProto);
      }
      /** Execute a statement and return at most a single row. */
      queryRow(stmt) {
        return this.#execute(stmt, true, rowResultFromProto);
      }
      /** Execute a statement and return at most a single value. */
      queryValue(stmt) {
        return this.#execute(stmt, true, valueResultFromProto);
      }
      /** Execute a statement without returning rows. */
      run(stmt) {
        return this.#execute(stmt, false, stmtResultFromProto);
      }
      #execute(inStmt, wantRows, fromProto) {
        const stmt = stmtToProto(this._sqlOwner(), inStmt, wantRows);
        return this._execute(stmt).then((r) => fromProto(r, this.intMode));
      }
      /** Return a builder for creating and executing a batch.
       *
       * If `useCursor` is true, the batch will be executed using a Hrana cursor, which will stream results from
       * the server to the client, which consumes less memory on the server. This requires protocol version 3 or
       * higher.
       */
      batch(useCursor = false) {
        return new Batch(this, useCursor);
      }
      /** Parse and analyze a statement. This requires protocol version 2 or higher. */
      describe(inSql) {
        const protoSql = sqlToProto(this._sqlOwner(), inSql);
        return this._describe(protoSql).then(describeResultFromProto);
      }
      /** Execute a sequence of statements separated by semicolons. This requires protocol version 2 or higher.
       * */
      sequence(inSql) {
        const protoSql = sqlToProto(this._sqlOwner(), inSql);
        return this._sequence(protoSql);
      }
      /** Representation of integers returned from the database. See {@link IntMode}.
       *
       * This value affects the results of all operations on this stream.
       */
      intMode;
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/cursor.js
var Cursor;
var init_cursor = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/cursor.js"() {
    Cursor = class {
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/ws/cursor.js
var fetchChunkSize, fetchQueueSize, WsCursor;
var init_cursor2 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/ws/cursor.js"() {
    init_errors();
    init_cursor();
    init_queue();
    fetchChunkSize = 1e3;
    fetchQueueSize = 10;
    WsCursor = class extends Cursor {
      #client;
      #stream;
      #cursorId;
      #entryQueue;
      #fetchQueue;
      #closed;
      #done;
      /** @private */
      constructor(client, stream, cursorId) {
        super();
        this.#client = client;
        this.#stream = stream;
        this.#cursorId = cursorId;
        this.#entryQueue = new Queue();
        this.#fetchQueue = new Queue();
        this.#closed = void 0;
        this.#done = false;
      }
      /** Fetch the next entry from the cursor. */
      async next() {
        for (; ; ) {
          if (this.#closed !== void 0) {
            throw new ClosedError("Cursor is closed", this.#closed);
          }
          while (!this.#done && this.#fetchQueue.length < fetchQueueSize) {
            this.#fetchQueue.push(this.#fetch());
          }
          const entry = this.#entryQueue.shift();
          if (this.#done || entry !== void 0) {
            return entry;
          }
          await this.#fetchQueue.shift().then((response) => {
            if (response === void 0) {
              return;
            }
            for (const entry2 of response.entries) {
              this.#entryQueue.push(entry2);
            }
            this.#done ||= response.done;
          });
        }
      }
      #fetch() {
        return this.#stream._sendCursorRequest(this, {
          type: "fetch_cursor",
          cursorId: this.#cursorId,
          maxCount: fetchChunkSize
        }).then((resp) => resp, (error) => {
          this._setClosed(error);
          return void 0;
        });
      }
      /** @private */
      _setClosed(error) {
        if (this.#closed !== void 0) {
          return;
        }
        this.#closed = error;
        this.#stream._sendCursorRequest(this, {
          type: "close_cursor",
          cursorId: this.#cursorId
        }).catch(() => void 0);
        this.#stream._cursorClosed(this);
      }
      /** Close the cursor. */
      close() {
        this._setClosed(new ClientError("Cursor was manually closed"));
      }
      /** True if the cursor is closed. */
      get closed() {
        return this.#closed !== void 0;
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/ws/stream.js
var WsStream;
var init_stream2 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/ws/stream.js"() {
    init_errors();
    init_queue();
    init_stream();
    init_cursor2();
    WsStream = class _WsStream extends Stream {
      #client;
      #streamId;
      #queue;
      #cursor;
      #closing;
      #closed;
      /** @private */
      static open(client) {
        const streamId = client._streamIdAlloc.alloc();
        const stream = new _WsStream(client, streamId);
        const responseCallback = () => void 0;
        const errorCallback = (e) => stream.#setClosed(e);
        const request = { type: "open_stream", streamId };
        client._sendRequest(request, { responseCallback, errorCallback });
        return stream;
      }
      /** @private */
      constructor(client, streamId) {
        super(client.intMode);
        this.#client = client;
        this.#streamId = streamId;
        this.#queue = new Queue();
        this.#cursor = void 0;
        this.#closing = false;
        this.#closed = void 0;
      }
      /** Get the {@link WsClient} object that this stream belongs to. */
      client() {
        return this.#client;
      }
      /** @private */
      _sqlOwner() {
        return this.#client;
      }
      /** @private */
      _execute(stmt) {
        return this.#sendStreamRequest({
          type: "execute",
          streamId: this.#streamId,
          stmt
        }).then((response) => {
          return response.result;
        });
      }
      /** @private */
      _batch(batch) {
        return this.#sendStreamRequest({
          type: "batch",
          streamId: this.#streamId,
          batch
        }).then((response) => {
          return response.result;
        });
      }
      /** @private */
      _describe(protoSql) {
        this.#client._ensureVersion(2, "describe()");
        return this.#sendStreamRequest({
          type: "describe",
          streamId: this.#streamId,
          sql: protoSql.sql,
          sqlId: protoSql.sqlId
        }).then((response) => {
          return response.result;
        });
      }
      /** @private */
      _sequence(protoSql) {
        this.#client._ensureVersion(2, "sequence()");
        return this.#sendStreamRequest({
          type: "sequence",
          streamId: this.#streamId,
          sql: protoSql.sql,
          sqlId: protoSql.sqlId
        }).then((_response) => {
          return void 0;
        });
      }
      /** Check whether the SQL connection underlying this stream is in autocommit state (i.e., outside of an
       * explicit transaction). This requires protocol version 3 or higher.
       */
      getAutocommit() {
        this.#client._ensureVersion(3, "getAutocommit()");
        return this.#sendStreamRequest({
          type: "get_autocommit",
          streamId: this.#streamId
        }).then((response) => {
          return response.isAutocommit;
        });
      }
      #sendStreamRequest(request) {
        return new Promise((responseCallback, errorCallback) => {
          this.#pushToQueue({ type: "request", request, responseCallback, errorCallback });
        });
      }
      /** @private */
      _openCursor(batch) {
        this.#client._ensureVersion(3, "cursor");
        return new Promise((cursorCallback, errorCallback) => {
          this.#pushToQueue({ type: "cursor", batch, cursorCallback, errorCallback });
        });
      }
      /** @private */
      _sendCursorRequest(cursor, request) {
        if (cursor !== this.#cursor) {
          throw new InternalError("Cursor not associated with the stream attempted to execute a request");
        }
        return new Promise((responseCallback, errorCallback) => {
          if (this.#closed !== void 0) {
            errorCallback(new ClosedError("Stream is closed", this.#closed));
          } else {
            this.#client._sendRequest(request, { responseCallback, errorCallback });
          }
        });
      }
      /** @private */
      _cursorClosed(cursor) {
        if (cursor !== this.#cursor) {
          throw new InternalError("Cursor was closed, but it was not associated with the stream");
        }
        this.#cursor = void 0;
        this.#flushQueue();
      }
      #pushToQueue(entry) {
        if (this.#closed !== void 0) {
          entry.errorCallback(new ClosedError("Stream is closed", this.#closed));
        } else if (this.#closing) {
          entry.errorCallback(new ClosedError("Stream is closing", void 0));
        } else {
          this.#queue.push(entry);
          this.#flushQueue();
        }
      }
      #flushQueue() {
        for (; ; ) {
          const entry = this.#queue.first();
          if (entry === void 0 && this.#cursor === void 0 && this.#closing) {
            this.#setClosed(new ClientError("Stream was gracefully closed"));
            break;
          } else if (entry?.type === "request" && this.#cursor === void 0) {
            const { request, responseCallback, errorCallback } = entry;
            this.#queue.shift();
            this.#client._sendRequest(request, { responseCallback, errorCallback });
          } else if (entry?.type === "cursor" && this.#cursor === void 0) {
            const { batch, cursorCallback } = entry;
            this.#queue.shift();
            const cursorId = this.#client._cursorIdAlloc.alloc();
            const cursor = new WsCursor(this.#client, this, cursorId);
            const request = {
              type: "open_cursor",
              streamId: this.#streamId,
              cursorId,
              batch
            };
            const responseCallback = () => void 0;
            const errorCallback = (e) => cursor._setClosed(e);
            this.#client._sendRequest(request, { responseCallback, errorCallback });
            this.#cursor = cursor;
            cursorCallback(cursor);
          } else {
            break;
          }
        }
      }
      #setClosed(error) {
        if (this.#closed !== void 0) {
          return;
        }
        this.#closed = error;
        if (this.#cursor !== void 0) {
          this.#cursor._setClosed(error);
        }
        for (; ; ) {
          const entry = this.#queue.shift();
          if (entry !== void 0) {
            entry.errorCallback(error);
          } else {
            break;
          }
        }
        const request = { type: "close_stream", streamId: this.#streamId };
        const responseCallback = () => this.#client._streamIdAlloc.free(this.#streamId);
        const errorCallback = () => void 0;
        this.#client._sendRequest(request, { responseCallback, errorCallback });
      }
      /** Immediately close the stream. */
      close() {
        this.#setClosed(new ClientError("Stream was manually closed"));
      }
      /** Gracefully close the stream. */
      closeGracefully() {
        this.#closing = true;
        this.#flushQueue();
      }
      /** True if the stream is closed or closing. */
      get closed() {
        return this.#closed !== void 0 || this.#closing;
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/shared/json_encode.js
function Stmt2(w, msg) {
  if (msg.sql !== void 0) {
    w.string("sql", msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.number("sql_id", msg.sqlId);
  }
  w.arrayObjects("args", msg.args, Value);
  w.arrayObjects("named_args", msg.namedArgs, NamedArg);
  w.boolean("want_rows", msg.wantRows);
}
function NamedArg(w, msg) {
  w.string("name", msg.name);
  w.object("value", msg.value, Value);
}
function Batch2(w, msg) {
  w.arrayObjects("steps", msg.steps, BatchStep2);
}
function BatchStep2(w, msg) {
  if (msg.condition !== void 0) {
    w.object("condition", msg.condition, BatchCond2);
  }
  w.object("stmt", msg.stmt, Stmt2);
}
function BatchCond2(w, msg) {
  w.stringRaw("type", msg.type);
  if (msg.type === "ok" || msg.type === "error") {
    w.number("step", msg.step);
  } else if (msg.type === "not") {
    w.object("cond", msg.cond, BatchCond2);
  } else if (msg.type === "and" || msg.type === "or") {
    w.arrayObjects("conds", msg.conds, BatchCond2);
  } else if (msg.type === "is_autocommit") {
  } else {
    throw impossible(msg, "Impossible type of BatchCond");
  }
}
function Value(w, msg) {
  if (msg === null) {
    w.stringRaw("type", "null");
  } else if (typeof msg === "bigint") {
    w.stringRaw("type", "integer");
    w.stringRaw("value", "" + msg);
  } else if (typeof msg === "number") {
    w.stringRaw("type", "float");
    w.number("value", msg);
  } else if (typeof msg === "string") {
    w.stringRaw("type", "text");
    w.string("value", msg);
  } else if (msg instanceof Uint8Array) {
    w.stringRaw("type", "blob");
    w.stringRaw("base64", gBase64.fromUint8Array(msg));
  } else if (msg === void 0) {
  } else {
    throw impossible(msg, "Impossible type of Value");
  }
}
var init_json_encode = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/shared/json_encode.js"() {
    init_base64();
    init_util3();
  }
});

// node_modules/@libsql/hrana-client/lib-esm/ws/json_encode.js
function ClientMsg(w, msg) {
  w.stringRaw("type", msg.type);
  if (msg.type === "hello") {
    if (msg.jwt !== void 0) {
      w.string("jwt", msg.jwt);
    }
  } else if (msg.type === "request") {
    w.number("request_id", msg.requestId);
    w.object("request", msg.request, Request2);
  } else {
    throw impossible(msg, "Impossible type of ClientMsg");
  }
}
function Request2(w, msg) {
  w.stringRaw("type", msg.type);
  if (msg.type === "open_stream") {
    w.number("stream_id", msg.streamId);
  } else if (msg.type === "close_stream") {
    w.number("stream_id", msg.streamId);
  } else if (msg.type === "execute") {
    w.number("stream_id", msg.streamId);
    w.object("stmt", msg.stmt, Stmt2);
  } else if (msg.type === "batch") {
    w.number("stream_id", msg.streamId);
    w.object("batch", msg.batch, Batch2);
  } else if (msg.type === "open_cursor") {
    w.number("stream_id", msg.streamId);
    w.number("cursor_id", msg.cursorId);
    w.object("batch", msg.batch, Batch2);
  } else if (msg.type === "close_cursor") {
    w.number("cursor_id", msg.cursorId);
  } else if (msg.type === "fetch_cursor") {
    w.number("cursor_id", msg.cursorId);
    w.number("max_count", msg.maxCount);
  } else if (msg.type === "sequence") {
    w.number("stream_id", msg.streamId);
    if (msg.sql !== void 0) {
      w.string("sql", msg.sql);
    }
    if (msg.sqlId !== void 0) {
      w.number("sql_id", msg.sqlId);
    }
  } else if (msg.type === "describe") {
    w.number("stream_id", msg.streamId);
    if (msg.sql !== void 0) {
      w.string("sql", msg.sql);
    }
    if (msg.sqlId !== void 0) {
      w.number("sql_id", msg.sqlId);
    }
  } else if (msg.type === "store_sql") {
    w.number("sql_id", msg.sqlId);
    w.string("sql", msg.sql);
  } else if (msg.type === "close_sql") {
    w.number("sql_id", msg.sqlId);
  } else if (msg.type === "get_autocommit") {
    w.number("stream_id", msg.streamId);
  } else {
    throw impossible(msg, "Impossible type of Request");
  }
}
var init_json_encode2 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/ws/json_encode.js"() {
    init_json_encode();
    init_util3();
  }
});

// node_modules/@libsql/hrana-client/lib-esm/shared/protobuf_encode.js
function Stmt3(w, msg) {
  if (msg.sql !== void 0) {
    w.string(1, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(2, msg.sqlId);
  }
  for (const arg of msg.args) {
    w.message(3, arg, Value2);
  }
  for (const arg of msg.namedArgs) {
    w.message(4, arg, NamedArg2);
  }
  w.bool(5, msg.wantRows);
}
function NamedArg2(w, msg) {
  w.string(1, msg.name);
  w.message(2, msg.value, Value2);
}
function Batch3(w, msg) {
  for (const step of msg.steps) {
    w.message(1, step, BatchStep3);
  }
}
function BatchStep3(w, msg) {
  if (msg.condition !== void 0) {
    w.message(1, msg.condition, BatchCond3);
  }
  w.message(2, msg.stmt, Stmt3);
}
function BatchCond3(w, msg) {
  if (msg.type === "ok") {
    w.uint32(1, msg.step);
  } else if (msg.type === "error") {
    w.uint32(2, msg.step);
  } else if (msg.type === "not") {
    w.message(3, msg.cond, BatchCond3);
  } else if (msg.type === "and") {
    w.message(4, msg.conds, BatchCondList);
  } else if (msg.type === "or") {
    w.message(5, msg.conds, BatchCondList);
  } else if (msg.type === "is_autocommit") {
    w.message(6, void 0, Empty);
  } else {
    throw impossible(msg, "Impossible type of BatchCond");
  }
}
function BatchCondList(w, msg) {
  for (const cond of msg) {
    w.message(1, cond, BatchCond3);
  }
}
function Value2(w, msg) {
  if (msg === null) {
    w.message(1, void 0, Empty);
  } else if (typeof msg === "bigint") {
    w.sint64(2, msg);
  } else if (typeof msg === "number") {
    w.double(3, msg);
  } else if (typeof msg === "string") {
    w.string(4, msg);
  } else if (msg instanceof Uint8Array) {
    w.bytes(5, msg);
  } else if (msg === void 0) {
  } else {
    throw impossible(msg, "Impossible type of Value");
  }
}
function Empty(_w, _msg) {
}
var init_protobuf_encode = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/shared/protobuf_encode.js"() {
    init_util3();
  }
});

// node_modules/@libsql/hrana-client/lib-esm/ws/protobuf_encode.js
function ClientMsg2(w, msg) {
  if (msg.type === "hello") {
    w.message(1, msg, HelloMsg);
  } else if (msg.type === "request") {
    w.message(2, msg, RequestMsg);
  } else {
    throw impossible(msg, "Impossible type of ClientMsg");
  }
}
function HelloMsg(w, msg) {
  if (msg.jwt !== void 0) {
    w.string(1, msg.jwt);
  }
}
function RequestMsg(w, msg) {
  w.int32(1, msg.requestId);
  const request = msg.request;
  if (request.type === "open_stream") {
    w.message(2, request, OpenStreamReq);
  } else if (request.type === "close_stream") {
    w.message(3, request, CloseStreamReq);
  } else if (request.type === "execute") {
    w.message(4, request, ExecuteReq);
  } else if (request.type === "batch") {
    w.message(5, request, BatchReq);
  } else if (request.type === "open_cursor") {
    w.message(6, request, OpenCursorReq);
  } else if (request.type === "close_cursor") {
    w.message(7, request, CloseCursorReq);
  } else if (request.type === "fetch_cursor") {
    w.message(8, request, FetchCursorReq);
  } else if (request.type === "sequence") {
    w.message(9, request, SequenceReq);
  } else if (request.type === "describe") {
    w.message(10, request, DescribeReq);
  } else if (request.type === "store_sql") {
    w.message(11, request, StoreSqlReq);
  } else if (request.type === "close_sql") {
    w.message(12, request, CloseSqlReq);
  } else if (request.type === "get_autocommit") {
    w.message(13, request, GetAutocommitReq);
  } else {
    throw impossible(request, "Impossible type of Request");
  }
}
function OpenStreamReq(w, msg) {
  w.int32(1, msg.streamId);
}
function CloseStreamReq(w, msg) {
  w.int32(1, msg.streamId);
}
function ExecuteReq(w, msg) {
  w.int32(1, msg.streamId);
  w.message(2, msg.stmt, Stmt3);
}
function BatchReq(w, msg) {
  w.int32(1, msg.streamId);
  w.message(2, msg.batch, Batch3);
}
function OpenCursorReq(w, msg) {
  w.int32(1, msg.streamId);
  w.int32(2, msg.cursorId);
  w.message(3, msg.batch, Batch3);
}
function CloseCursorReq(w, msg) {
  w.int32(1, msg.cursorId);
}
function FetchCursorReq(w, msg) {
  w.int32(1, msg.cursorId);
  w.uint32(2, msg.maxCount);
}
function SequenceReq(w, msg) {
  w.int32(1, msg.streamId);
  if (msg.sql !== void 0) {
    w.string(2, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(3, msg.sqlId);
  }
}
function DescribeReq(w, msg) {
  w.int32(1, msg.streamId);
  if (msg.sql !== void 0) {
    w.string(2, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(3, msg.sqlId);
  }
}
function StoreSqlReq(w, msg) {
  w.int32(1, msg.sqlId);
  w.string(2, msg.sql);
}
function CloseSqlReq(w, msg) {
  w.int32(1, msg.sqlId);
}
function GetAutocommitReq(w, msg) {
  w.int32(1, msg.streamId);
}
var init_protobuf_encode2 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/ws/protobuf_encode.js"() {
    init_protobuf_encode();
    init_util3();
  }
});

// node_modules/@libsql/hrana-client/lib-esm/shared/json_decode.js
function Error2(obj) {
  const message = string(obj["message"]);
  const code = stringOpt(obj["code"]);
  return { message, code };
}
function StmtResult(obj) {
  const cols = arrayObjectsMap(obj["cols"], Col);
  const rows = array(obj["rows"]).map((rowObj) => arrayObjectsMap(rowObj, Value3));
  const affectedRowCount = number(obj["affected_row_count"]);
  const lastInsertRowidStr = stringOpt(obj["last_insert_rowid"]);
  const lastInsertRowid = lastInsertRowidStr !== void 0 ? BigInt(lastInsertRowidStr) : void 0;
  return { cols, rows, affectedRowCount, lastInsertRowid };
}
function Col(obj) {
  const name = stringOpt(obj["name"]);
  const decltype = stringOpt(obj["decltype"]);
  return { name, decltype };
}
function BatchResult(obj) {
  const stepResults = /* @__PURE__ */ new Map();
  array(obj["step_results"]).forEach((value, i) => {
    if (value !== null) {
      stepResults.set(i, StmtResult(object(value)));
    }
  });
  const stepErrors = /* @__PURE__ */ new Map();
  array(obj["step_errors"]).forEach((value, i) => {
    if (value !== null) {
      stepErrors.set(i, Error2(object(value)));
    }
  });
  return { stepResults, stepErrors };
}
function CursorEntry(obj) {
  const type = string(obj["type"]);
  if (type === "step_begin") {
    const step = number(obj["step"]);
    const cols = arrayObjectsMap(obj["cols"], Col);
    return { type: "step_begin", step, cols };
  } else if (type === "step_end") {
    const affectedRowCount = number(obj["affected_row_count"]);
    const lastInsertRowidStr = stringOpt(obj["last_insert_rowid"]);
    const lastInsertRowid = lastInsertRowidStr !== void 0 ? BigInt(lastInsertRowidStr) : void 0;
    return { type: "step_end", affectedRowCount, lastInsertRowid };
  } else if (type === "step_error") {
    const step = number(obj["step"]);
    const error = Error2(object(obj["error"]));
    return { type: "step_error", step, error };
  } else if (type === "row") {
    const row = arrayObjectsMap(obj["row"], Value3);
    return { type: "row", row };
  } else if (type === "error") {
    const error = Error2(object(obj["error"]));
    return { type: "error", error };
  } else {
    throw new ProtoError("Unexpected type of CursorEntry");
  }
}
function DescribeResult(obj) {
  const params = arrayObjectsMap(obj["params"], DescribeParam);
  const cols = arrayObjectsMap(obj["cols"], DescribeCol);
  const isExplain = boolean(obj["is_explain"]);
  const isReadonly = boolean(obj["is_readonly"]);
  return { params, cols, isExplain, isReadonly };
}
function DescribeParam(obj) {
  const name = stringOpt(obj["name"]);
  return { name };
}
function DescribeCol(obj) {
  const name = string(obj["name"]);
  const decltype = stringOpt(obj["decltype"]);
  return { name, decltype };
}
function Value3(obj) {
  const type = string(obj["type"]);
  if (type === "null") {
    return null;
  } else if (type === "integer") {
    const value = string(obj["value"]);
    return BigInt(value);
  } else if (type === "float") {
    return number(obj["value"]);
  } else if (type === "text") {
    return string(obj["value"]);
  } else if (type === "blob") {
    return gBase64.toUint8Array(string(obj["base64"]));
  } else {
    throw new ProtoError("Unexpected type of Value");
  }
}
var init_json_decode = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/shared/json_decode.js"() {
    init_base64();
    init_errors();
    init_decode();
  }
});

// node_modules/@libsql/hrana-client/lib-esm/ws/json_decode.js
function ServerMsg(obj) {
  const type = string(obj["type"]);
  if (type === "hello_ok") {
    return { type: "hello_ok" };
  } else if (type === "hello_error") {
    const error = Error2(object(obj["error"]));
    return { type: "hello_error", error };
  } else if (type === "response_ok") {
    const requestId = number(obj["request_id"]);
    const response = Response2(object(obj["response"]));
    return { type: "response_ok", requestId, response };
  } else if (type === "response_error") {
    const requestId = number(obj["request_id"]);
    const error = Error2(object(obj["error"]));
    return { type: "response_error", requestId, error };
  } else {
    throw new ProtoError("Unexpected type of ServerMsg");
  }
}
function Response2(obj) {
  const type = string(obj["type"]);
  if (type === "open_stream") {
    return { type: "open_stream" };
  } else if (type === "close_stream") {
    return { type: "close_stream" };
  } else if (type === "execute") {
    const result = StmtResult(object(obj["result"]));
    return { type: "execute", result };
  } else if (type === "batch") {
    const result = BatchResult(object(obj["result"]));
    return { type: "batch", result };
  } else if (type === "open_cursor") {
    return { type: "open_cursor" };
  } else if (type === "close_cursor") {
    return { type: "close_cursor" };
  } else if (type === "fetch_cursor") {
    const entries = arrayObjectsMap(obj["entries"], CursorEntry);
    const done = boolean(obj["done"]);
    return { type: "fetch_cursor", entries, done };
  } else if (type === "sequence") {
    return { type: "sequence" };
  } else if (type === "describe") {
    const result = DescribeResult(object(obj["result"]));
    return { type: "describe", result };
  } else if (type === "store_sql") {
    return { type: "store_sql" };
  } else if (type === "close_sql") {
    return { type: "close_sql" };
  } else if (type === "get_autocommit") {
    const isAutocommit = boolean(obj["is_autocommit"]);
    return { type: "get_autocommit", isAutocommit };
  } else {
    throw new ProtoError("Unexpected type of Response");
  }
}
var init_json_decode2 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/ws/json_decode.js"() {
    init_errors();
    init_decode();
    init_json_decode();
  }
});

// node_modules/@libsql/hrana-client/lib-esm/shared/protobuf_decode.js
var Error3, StmtResult2, Col2, Row, BatchResult2, BatchResultStepResult, BatchResultStepError, CursorEntry2, StepBeginEntry, StepEndEntry, StepErrorEntry, DescribeResult2, DescribeParam2, DescribeCol2, Value4;
var init_protobuf_decode = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/shared/protobuf_decode.js"() {
    Error3 = {
      default() {
        return { message: "", code: void 0 };
      },
      1(r, msg) {
        msg.message = r.string();
      },
      2(r, msg) {
        msg.code = r.string();
      }
    };
    StmtResult2 = {
      default() {
        return {
          cols: [],
          rows: [],
          affectedRowCount: 0,
          lastInsertRowid: void 0
        };
      },
      1(r, msg) {
        msg.cols.push(r.message(Col2));
      },
      2(r, msg) {
        msg.rows.push(r.message(Row));
      },
      3(r, msg) {
        msg.affectedRowCount = Number(r.uint64());
      },
      4(r, msg) {
        msg.lastInsertRowid = r.sint64();
      }
    };
    Col2 = {
      default() {
        return { name: void 0, decltype: void 0 };
      },
      1(r, msg) {
        msg.name = r.string();
      },
      2(r, msg) {
        msg.decltype = r.string();
      }
    };
    Row = {
      default() {
        return [];
      },
      1(r, msg) {
        msg.push(r.message(Value4));
      }
    };
    BatchResult2 = {
      default() {
        return { stepResults: /* @__PURE__ */ new Map(), stepErrors: /* @__PURE__ */ new Map() };
      },
      1(r, msg) {
        const [key, value] = r.message(BatchResultStepResult);
        msg.stepResults.set(key, value);
      },
      2(r, msg) {
        const [key, value] = r.message(BatchResultStepError);
        msg.stepErrors.set(key, value);
      }
    };
    BatchResultStepResult = {
      default() {
        return [0, StmtResult2.default()];
      },
      1(r, msg) {
        msg[0] = r.uint32();
      },
      2(r, msg) {
        msg[1] = r.message(StmtResult2);
      }
    };
    BatchResultStepError = {
      default() {
        return [0, Error3.default()];
      },
      1(r, msg) {
        msg[0] = r.uint32();
      },
      2(r, msg) {
        msg[1] = r.message(Error3);
      }
    };
    CursorEntry2 = {
      default() {
        return { type: "none" };
      },
      1(r) {
        return r.message(StepBeginEntry);
      },
      2(r) {
        return r.message(StepEndEntry);
      },
      3(r) {
        return r.message(StepErrorEntry);
      },
      4(r) {
        return { type: "row", row: r.message(Row) };
      },
      5(r) {
        return { type: "error", error: r.message(Error3) };
      }
    };
    StepBeginEntry = {
      default() {
        return { type: "step_begin", step: 0, cols: [] };
      },
      1(r, msg) {
        msg.step = r.uint32();
      },
      2(r, msg) {
        msg.cols.push(r.message(Col2));
      }
    };
    StepEndEntry = {
      default() {
        return {
          type: "step_end",
          affectedRowCount: 0,
          lastInsertRowid: void 0
        };
      },
      1(r, msg) {
        msg.affectedRowCount = r.uint32();
      },
      2(r, msg) {
        msg.lastInsertRowid = r.uint64();
      }
    };
    StepErrorEntry = {
      default() {
        return {
          type: "step_error",
          step: 0,
          error: Error3.default()
        };
      },
      1(r, msg) {
        msg.step = r.uint32();
      },
      2(r, msg) {
        msg.error = r.message(Error3);
      }
    };
    DescribeResult2 = {
      default() {
        return {
          params: [],
          cols: [],
          isExplain: false,
          isReadonly: false
        };
      },
      1(r, msg) {
        msg.params.push(r.message(DescribeParam2));
      },
      2(r, msg) {
        msg.cols.push(r.message(DescribeCol2));
      },
      3(r, msg) {
        msg.isExplain = r.bool();
      },
      4(r, msg) {
        msg.isReadonly = r.bool();
      }
    };
    DescribeParam2 = {
      default() {
        return { name: void 0 };
      },
      1(r, msg) {
        msg.name = r.string();
      }
    };
    DescribeCol2 = {
      default() {
        return { name: "", decltype: void 0 };
      },
      1(r, msg) {
        msg.name = r.string();
      },
      2(r, msg) {
        msg.decltype = r.string();
      }
    };
    Value4 = {
      default() {
        return void 0;
      },
      1(r) {
        return null;
      },
      2(r) {
        return r.sint64();
      },
      3(r) {
        return r.double();
      },
      4(r) {
        return r.string();
      },
      5(r) {
        return r.bytes();
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/ws/protobuf_decode.js
var ServerMsg2, HelloErrorMsg, ResponseErrorMsg, ResponseOkMsg, ExecuteResp, BatchResp, FetchCursorResp, DescribeResp, GetAutocommitResp;
var init_protobuf_decode2 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/ws/protobuf_decode.js"() {
    init_protobuf_decode();
    ServerMsg2 = {
      default() {
        return { type: "none" };
      },
      1(r) {
        return { type: "hello_ok" };
      },
      2(r) {
        return r.message(HelloErrorMsg);
      },
      3(r) {
        return r.message(ResponseOkMsg);
      },
      4(r) {
        return r.message(ResponseErrorMsg);
      }
    };
    HelloErrorMsg = {
      default() {
        return { type: "hello_error", error: Error3.default() };
      },
      1(r, msg) {
        msg.error = r.message(Error3);
      }
    };
    ResponseErrorMsg = {
      default() {
        return { type: "response_error", requestId: 0, error: Error3.default() };
      },
      1(r, msg) {
        msg.requestId = r.int32();
      },
      2(r, msg) {
        msg.error = r.message(Error3);
      }
    };
    ResponseOkMsg = {
      default() {
        return {
          type: "response_ok",
          requestId: 0,
          response: { type: "none" }
        };
      },
      1(r, msg) {
        msg.requestId = r.int32();
      },
      2(r, msg) {
        msg.response = { type: "open_stream" };
      },
      3(r, msg) {
        msg.response = { type: "close_stream" };
      },
      4(r, msg) {
        msg.response = r.message(ExecuteResp);
      },
      5(r, msg) {
        msg.response = r.message(BatchResp);
      },
      6(r, msg) {
        msg.response = { type: "open_cursor" };
      },
      7(r, msg) {
        msg.response = { type: "close_cursor" };
      },
      8(r, msg) {
        msg.response = r.message(FetchCursorResp);
      },
      9(r, msg) {
        msg.response = { type: "sequence" };
      },
      10(r, msg) {
        msg.response = r.message(DescribeResp);
      },
      11(r, msg) {
        msg.response = { type: "store_sql" };
      },
      12(r, msg) {
        msg.response = { type: "close_sql" };
      },
      13(r, msg) {
        msg.response = r.message(GetAutocommitResp);
      }
    };
    ExecuteResp = {
      default() {
        return { type: "execute", result: StmtResult2.default() };
      },
      1(r, msg) {
        msg.result = r.message(StmtResult2);
      }
    };
    BatchResp = {
      default() {
        return { type: "batch", result: BatchResult2.default() };
      },
      1(r, msg) {
        msg.result = r.message(BatchResult2);
      }
    };
    FetchCursorResp = {
      default() {
        return { type: "fetch_cursor", entries: [], done: false };
      },
      1(r, msg) {
        msg.entries.push(r.message(CursorEntry2));
      },
      2(r, msg) {
        msg.done = r.bool();
      }
    };
    DescribeResp = {
      default() {
        return { type: "describe", result: DescribeResult2.default() };
      },
      1(r, msg) {
        msg.result = r.message(DescribeResult2);
      }
    };
    GetAutocommitResp = {
      default() {
        return { type: "get_autocommit", isAutocommit: false };
      },
      1(r, msg) {
        msg.isAutocommit = r.bool();
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/ws/client.js
var subprotocolsV2, subprotocolsV3, WsClient;
var init_client2 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/ws/client.js"() {
    init_client();
    init_encoding();
    init_errors();
    init_id_alloc();
    init_result();
    init_sql();
    init_util3();
    init_stream2();
    init_json_encode2();
    init_protobuf_encode2();
    init_json_decode2();
    init_protobuf_decode2();
    subprotocolsV2 = /* @__PURE__ */ new Map([
      ["hrana2", { version: 2, encoding: "json" }],
      ["hrana1", { version: 1, encoding: "json" }]
    ]);
    subprotocolsV3 = /* @__PURE__ */ new Map([
      ["hrana3-protobuf", { version: 3, encoding: "protobuf" }],
      ["hrana3", { version: 3, encoding: "json" }],
      ["hrana2", { version: 2, encoding: "json" }],
      ["hrana1", { version: 1, encoding: "json" }]
    ]);
    WsClient = class extends Client {
      #socket;
      // List of callbacks that we queue until the socket transitions from the CONNECTING to the OPEN state.
      #openCallbacks;
      // Have we already transitioned from CONNECTING to OPEN and fired the callbacks in #openCallbacks?
      #opened;
      // Stores the error that caused us to close the client (and the socket). If we are not closed, this is
      // `undefined`.
      #closed;
      // Have we received a response to our "hello" from the server?
      #recvdHello;
      // Subprotocol negotiated with the server. It is only available after the socket transitions to the OPEN
      // state.
      #subprotocol;
      // Has the `getVersion()` function been called? This is only used to validate that the API is used
      // correctly.
      #getVersionCalled;
      // A map from request id to the responses that we expect to receive from the server.
      #responseMap;
      // An allocator of request ids.
      #requestIdAlloc;
      // An allocator of stream ids.
      /** @private */
      _streamIdAlloc;
      // An allocator of cursor ids.
      /** @private */
      _cursorIdAlloc;
      // An allocator of SQL text ids.
      #sqlIdAlloc;
      /** @private */
      constructor(socket, jwt) {
        super();
        this.#socket = socket;
        this.#openCallbacks = [];
        this.#opened = false;
        this.#closed = void 0;
        this.#recvdHello = false;
        this.#subprotocol = void 0;
        this.#getVersionCalled = false;
        this.#responseMap = /* @__PURE__ */ new Map();
        this.#requestIdAlloc = new IdAlloc();
        this._streamIdAlloc = new IdAlloc();
        this._cursorIdAlloc = new IdAlloc();
        this.#sqlIdAlloc = new IdAlloc();
        this.#socket.binaryType = "arraybuffer";
        this.#socket.addEventListener("open", () => this.#onSocketOpen());
        this.#socket.addEventListener("close", (event) => this.#onSocketClose(event));
        this.#socket.addEventListener("error", (event) => this.#onSocketError(event));
        this.#socket.addEventListener("message", (event) => this.#onSocketMessage(event));
        this.#send({ type: "hello", jwt });
      }
      // Send (or enqueue to send) a message to the server.
      #send(msg) {
        if (this.#closed !== void 0) {
          throw new InternalError("Trying to send a message on a closed client");
        }
        if (this.#opened) {
          this.#sendToSocket(msg);
        } else {
          const openCallback = () => this.#sendToSocket(msg);
          const errorCallback = () => void 0;
          this.#openCallbacks.push({ openCallback, errorCallback });
        }
      }
      // The socket transitioned from CONNECTING to OPEN
      #onSocketOpen() {
        const protocol = this.#socket.protocol;
        if (protocol === void 0) {
          this.#setClosed(new ClientError("The `WebSocket.protocol` property is undefined. This most likely means that the WebSocket implementation provided by the environment is broken. If you are using Miniflare 2, please update to Miniflare 3, which fixes this problem."));
          return;
        } else if (protocol === "") {
          this.#subprotocol = { version: 1, encoding: "json" };
        } else {
          this.#subprotocol = subprotocolsV3.get(protocol);
          if (this.#subprotocol === void 0) {
            this.#setClosed(new ProtoError(`Unrecognized WebSocket subprotocol: ${JSON.stringify(protocol)}`));
            return;
          }
        }
        for (const callbacks of this.#openCallbacks) {
          callbacks.openCallback();
        }
        this.#openCallbacks.length = 0;
        this.#opened = true;
      }
      #sendToSocket(msg) {
        const encoding = this.#subprotocol.encoding;
        if (encoding === "json") {
          const jsonMsg = writeJsonObject(msg, ClientMsg);
          this.#socket.send(jsonMsg);
        } else if (encoding === "protobuf") {
          const protobufMsg = writeProtobufMessage(msg, ClientMsg2);
          this.#socket.send(protobufMsg);
        } else {
          throw impossible(encoding, "Impossible encoding");
        }
      }
      /** Get the protocol version negotiated with the server, possibly waiting until the socket is open. */
      getVersion() {
        return new Promise((versionCallback, errorCallback) => {
          this.#getVersionCalled = true;
          if (this.#closed !== void 0) {
            errorCallback(this.#closed);
          } else if (!this.#opened) {
            const openCallback = () => versionCallback(this.#subprotocol.version);
            this.#openCallbacks.push({ openCallback, errorCallback });
          } else {
            versionCallback(this.#subprotocol.version);
          }
        });
      }
      // Make sure that the negotiated version is at least `minVersion`.
      /** @private */
      _ensureVersion(minVersion, feature) {
        if (this.#subprotocol === void 0 || !this.#getVersionCalled) {
          throw new ProtocolVersionError(`${feature} is supported only on protocol version ${minVersion} and higher, but the version supported by the WebSocket server is not yet known. Use Client.getVersion() to wait until the version is available.`);
        } else if (this.#subprotocol.version < minVersion) {
          throw new ProtocolVersionError(`${feature} is supported on protocol version ${minVersion} and higher, but the WebSocket server only supports version ${this.#subprotocol.version}`);
        }
      }
      // Send a request to the server and invoke a callback when we get the response.
      /** @private */
      _sendRequest(request, callbacks) {
        if (this.#closed !== void 0) {
          callbacks.errorCallback(new ClosedError("Client is closed", this.#closed));
          return;
        }
        const requestId = this.#requestIdAlloc.alloc();
        this.#responseMap.set(requestId, { ...callbacks, type: request.type });
        this.#send({ type: "request", requestId, request });
      }
      // The socket encountered an error.
      #onSocketError(event) {
        const eventMessage = event.message;
        const message = eventMessage ?? "WebSocket was closed due to an error";
        this.#setClosed(new WebSocketError(message));
      }
      // The socket was closed.
      #onSocketClose(event) {
        let message = `WebSocket was closed with code ${event.code}`;
        if (event.reason) {
          message += `: ${event.reason}`;
        }
        this.#setClosed(new WebSocketError(message));
      }
      // Close the client with the given error.
      #setClosed(error) {
        if (this.#closed !== void 0) {
          return;
        }
        this.#closed = error;
        for (const callbacks of this.#openCallbacks) {
          callbacks.errorCallback(error);
        }
        this.#openCallbacks.length = 0;
        for (const [requestId, responseState] of this.#responseMap.entries()) {
          responseState.errorCallback(error);
          this.#requestIdAlloc.free(requestId);
        }
        this.#responseMap.clear();
        this.#socket.close();
      }
      // We received a message from the socket.
      #onSocketMessage(event) {
        if (this.#closed !== void 0) {
          return;
        }
        try {
          let msg;
          const encoding = this.#subprotocol.encoding;
          if (encoding === "json") {
            if (typeof event.data !== "string") {
              this.#socket.close(3003, "Only text messages are accepted with JSON encoding");
              this.#setClosed(new ProtoError("Received non-text message from server with JSON encoding"));
              return;
            }
            msg = readJsonObject(JSON.parse(event.data), ServerMsg);
          } else if (encoding === "protobuf") {
            if (!(event.data instanceof ArrayBuffer)) {
              this.#socket.close(3003, "Only binary messages are accepted with Protobuf encoding");
              this.#setClosed(new ProtoError("Received non-binary message from server with Protobuf encoding"));
              return;
            }
            msg = readProtobufMessage(new Uint8Array(event.data), ServerMsg2);
          } else {
            throw impossible(encoding, "Impossible encoding");
          }
          this.#handleMsg(msg);
        } catch (e) {
          this.#socket.close(3007, "Could not handle message");
          this.#setClosed(e);
        }
      }
      // Handle a message from the server.
      #handleMsg(msg) {
        if (msg.type === "none") {
          throw new ProtoError("Received an unrecognized ServerMsg");
        } else if (msg.type === "hello_ok" || msg.type === "hello_error") {
          if (this.#recvdHello) {
            throw new ProtoError("Received a duplicated hello response");
          }
          this.#recvdHello = true;
          if (msg.type === "hello_error") {
            throw errorFromProto(msg.error);
          }
          return;
        } else if (!this.#recvdHello) {
          throw new ProtoError("Received a non-hello message before a hello response");
        }
        if (msg.type === "response_ok") {
          const requestId = msg.requestId;
          const responseState = this.#responseMap.get(requestId);
          this.#responseMap.delete(requestId);
          if (responseState === void 0) {
            throw new ProtoError("Received unexpected OK response");
          }
          this.#requestIdAlloc.free(requestId);
          try {
            if (responseState.type !== msg.response.type) {
              console.dir({ responseState, msg });
              throw new ProtoError("Received unexpected type of response");
            }
            responseState.responseCallback(msg.response);
          } catch (e) {
            responseState.errorCallback(e);
            throw e;
          }
        } else if (msg.type === "response_error") {
          const requestId = msg.requestId;
          const responseState = this.#responseMap.get(requestId);
          this.#responseMap.delete(requestId);
          if (responseState === void 0) {
            throw new ProtoError("Received unexpected error response");
          }
          this.#requestIdAlloc.free(requestId);
          responseState.errorCallback(errorFromProto(msg.error));
        } else {
          throw impossible(msg, "Impossible ServerMsg type");
        }
      }
      /** Open a {@link WsStream}, a stream for executing SQL statements. */
      openStream() {
        return WsStream.open(this);
      }
      /** Cache a SQL text on the server. This requires protocol version 2 or higher. */
      storeSql(sql) {
        this._ensureVersion(2, "storeSql()");
        const sqlId = this.#sqlIdAlloc.alloc();
        const sqlObj = new Sql(this, sqlId);
        const responseCallback = () => void 0;
        const errorCallback = (e) => sqlObj._setClosed(e);
        const request = { type: "store_sql", sqlId, sql };
        this._sendRequest(request, { responseCallback, errorCallback });
        return sqlObj;
      }
      /** @private */
      _closeSql(sqlId) {
        if (this.#closed !== void 0) {
          return;
        }
        const responseCallback = () => this.#sqlIdAlloc.free(sqlId);
        const errorCallback = (e) => this.#setClosed(e);
        const request = { type: "close_sql", sqlId };
        this._sendRequest(request, { responseCallback, errorCallback });
      }
      /** Close the client and the WebSocket. */
      close() {
        this.#setClosed(new ClientError("Client was manually closed"));
      }
      /** True if the client is closed. */
      get closed() {
        return this.#closed !== void 0;
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/queue_microtask.js
var _queueMicrotask;
var init_queue_microtask = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/queue_microtask.js"() {
    if (typeof queueMicrotask !== "undefined") {
      _queueMicrotask = queueMicrotask;
    } else {
      const resolved = Promise.resolve();
      _queueMicrotask = (callback) => {
        resolved.then(callback);
      };
    }
  }
});

// node_modules/@libsql/hrana-client/lib-esm/byte_queue.js
var ByteQueue;
var init_byte_queue = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/byte_queue.js"() {
    ByteQueue = class {
      #array;
      #shiftPos;
      #pushPos;
      constructor(initialCap) {
        this.#array = new Uint8Array(new ArrayBuffer(initialCap));
        this.#shiftPos = 0;
        this.#pushPos = 0;
      }
      get length() {
        return this.#pushPos - this.#shiftPos;
      }
      data() {
        return this.#array.slice(this.#shiftPos, this.#pushPos);
      }
      push(chunk) {
        this.#ensurePush(chunk.byteLength);
        this.#array.set(chunk, this.#pushPos);
        this.#pushPos += chunk.byteLength;
      }
      #ensurePush(pushLength) {
        if (this.#pushPos + pushLength <= this.#array.byteLength) {
          return;
        }
        const filledLength = this.#pushPos - this.#shiftPos;
        if (filledLength + pushLength <= this.#array.byteLength && 2 * this.#pushPos >= this.#array.byteLength) {
          this.#array.copyWithin(0, this.#shiftPos, this.#pushPos);
        } else {
          let newCap = this.#array.byteLength;
          do {
            newCap *= 2;
          } while (filledLength + pushLength > newCap);
          const newArray = new Uint8Array(new ArrayBuffer(newCap));
          newArray.set(this.#array.slice(this.#shiftPos, this.#pushPos), 0);
          this.#array = newArray;
        }
        this.#pushPos = filledLength;
        this.#shiftPos = 0;
      }
      shift(length) {
        this.#shiftPos += length;
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/http/json_decode.js
function PipelineRespBody(obj) {
  const baton = stringOpt(obj["baton"]);
  const baseUrl = stringOpt(obj["base_url"]);
  const results = arrayObjectsMap(obj["results"], StreamResult);
  return { baton, baseUrl, results };
}
function StreamResult(obj) {
  const type = string(obj["type"]);
  if (type === "ok") {
    const response = StreamResponse(object(obj["response"]));
    return { type: "ok", response };
  } else if (type === "error") {
    const error = Error2(object(obj["error"]));
    return { type: "error", error };
  } else {
    throw new ProtoError("Unexpected type of StreamResult");
  }
}
function StreamResponse(obj) {
  const type = string(obj["type"]);
  if (type === "close") {
    return { type: "close" };
  } else if (type === "execute") {
    const result = StmtResult(object(obj["result"]));
    return { type: "execute", result };
  } else if (type === "batch") {
    const result = BatchResult(object(obj["result"]));
    return { type: "batch", result };
  } else if (type === "sequence") {
    return { type: "sequence" };
  } else if (type === "describe") {
    const result = DescribeResult(object(obj["result"]));
    return { type: "describe", result };
  } else if (type === "store_sql") {
    return { type: "store_sql" };
  } else if (type === "close_sql") {
    return { type: "close_sql" };
  } else if (type === "get_autocommit") {
    const isAutocommit = boolean(obj["is_autocommit"]);
    return { type: "get_autocommit", isAutocommit };
  } else {
    throw new ProtoError("Unexpected type of StreamResponse");
  }
}
function CursorRespBody(obj) {
  const baton = stringOpt(obj["baton"]);
  const baseUrl = stringOpt(obj["base_url"]);
  return { baton, baseUrl };
}
var init_json_decode3 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/http/json_decode.js"() {
    init_errors();
    init_decode();
    init_json_decode();
  }
});

// node_modules/@libsql/hrana-client/lib-esm/http/protobuf_decode.js
var PipelineRespBody2, StreamResult2, StreamResponse2, ExecuteStreamResp, BatchStreamResp, DescribeStreamResp, GetAutocommitStreamResp, CursorRespBody2;
var init_protobuf_decode3 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/http/protobuf_decode.js"() {
    init_protobuf_decode();
    PipelineRespBody2 = {
      default() {
        return { baton: void 0, baseUrl: void 0, results: [] };
      },
      1(r, msg) {
        msg.baton = r.string();
      },
      2(r, msg) {
        msg.baseUrl = r.string();
      },
      3(r, msg) {
        msg.results.push(r.message(StreamResult2));
      }
    };
    StreamResult2 = {
      default() {
        return { type: "none" };
      },
      1(r) {
        return { type: "ok", response: r.message(StreamResponse2) };
      },
      2(r) {
        return { type: "error", error: r.message(Error3) };
      }
    };
    StreamResponse2 = {
      default() {
        return { type: "none" };
      },
      1(r) {
        return { type: "close" };
      },
      2(r) {
        return r.message(ExecuteStreamResp);
      },
      3(r) {
        return r.message(BatchStreamResp);
      },
      4(r) {
        return { type: "sequence" };
      },
      5(r) {
        return r.message(DescribeStreamResp);
      },
      6(r) {
        return { type: "store_sql" };
      },
      7(r) {
        return { type: "close_sql" };
      },
      8(r) {
        return r.message(GetAutocommitStreamResp);
      }
    };
    ExecuteStreamResp = {
      default() {
        return { type: "execute", result: StmtResult2.default() };
      },
      1(r, msg) {
        msg.result = r.message(StmtResult2);
      }
    };
    BatchStreamResp = {
      default() {
        return { type: "batch", result: BatchResult2.default() };
      },
      1(r, msg) {
        msg.result = r.message(BatchResult2);
      }
    };
    DescribeStreamResp = {
      default() {
        return { type: "describe", result: DescribeResult2.default() };
      },
      1(r, msg) {
        msg.result = r.message(DescribeResult2);
      }
    };
    GetAutocommitStreamResp = {
      default() {
        return { type: "get_autocommit", isAutocommit: false };
      },
      1(r, msg) {
        msg.isAutocommit = r.bool();
      }
    };
    CursorRespBody2 = {
      default() {
        return { baton: void 0, baseUrl: void 0 };
      },
      1(r, msg) {
        msg.baton = r.string();
      },
      2(r, msg) {
        msg.baseUrl = r.string();
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/http/cursor.js
var HttpCursor;
var init_cursor3 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/http/cursor.js"() {
    init_byte_queue();
    init_cursor();
    init_decode();
    init_decode2();
    init_errors();
    init_util3();
    init_json_decode3();
    init_protobuf_decode3();
    init_json_decode();
    init_protobuf_decode();
    HttpCursor = class extends Cursor {
      #stream;
      #encoding;
      #reader;
      #queue;
      #closed;
      #done;
      /** @private */
      constructor(stream, encoding) {
        super();
        this.#stream = stream;
        this.#encoding = encoding;
        this.#reader = void 0;
        this.#queue = new ByteQueue(16 * 1024);
        this.#closed = void 0;
        this.#done = false;
      }
      async open(response) {
        if (response.body === null) {
          throw new ProtoError("No response body for cursor request");
        }
        this.#reader = response.body[Symbol.asyncIterator]();
        const respBody = await this.#nextItem(CursorRespBody, CursorRespBody2);
        if (respBody === void 0) {
          throw new ProtoError("Empty response to cursor request");
        }
        return respBody;
      }
      /** Fetch the next entry from the cursor. */
      next() {
        return this.#nextItem(CursorEntry, CursorEntry2);
      }
      /** Close the cursor. */
      close() {
        this._setClosed(new ClientError("Cursor was manually closed"));
      }
      /** @private */
      _setClosed(error) {
        if (this.#closed !== void 0) {
          return;
        }
        this.#closed = error;
        this.#stream._cursorClosed(this);
        if (this.#reader !== void 0) {
          this.#reader.return();
        }
      }
      /** True if the cursor is closed. */
      get closed() {
        return this.#closed !== void 0;
      }
      async #nextItem(jsonFun, protobufDef) {
        for (; ; ) {
          if (this.#done) {
            return void 0;
          } else if (this.#closed !== void 0) {
            throw new ClosedError("Cursor is closed", this.#closed);
          }
          if (this.#encoding === "json") {
            const jsonData = this.#parseItemJson();
            if (jsonData !== void 0) {
              const jsonText = new TextDecoder().decode(jsonData);
              const jsonValue = JSON.parse(jsonText);
              return readJsonObject(jsonValue, jsonFun);
            }
          } else if (this.#encoding === "protobuf") {
            const protobufData = this.#parseItemProtobuf();
            if (protobufData !== void 0) {
              return readProtobufMessage(protobufData, protobufDef);
            }
          } else {
            throw impossible(this.#encoding, "Impossible encoding");
          }
          if (this.#reader === void 0) {
            throw new InternalError("Attempted to read from HTTP cursor before it was opened");
          }
          const { value, done } = await this.#reader.next();
          if (done && this.#queue.length === 0) {
            this.#done = true;
          } else if (done) {
            throw new ProtoError("Unexpected end of cursor stream");
          } else {
            this.#queue.push(value);
          }
        }
      }
      #parseItemJson() {
        const data = this.#queue.data();
        const newlineByte = 10;
        const newlinePos = data.indexOf(newlineByte);
        if (newlinePos < 0) {
          return void 0;
        }
        const jsonData = data.slice(0, newlinePos);
        this.#queue.shift(newlinePos + 1);
        return jsonData;
      }
      #parseItemProtobuf() {
        const data = this.#queue.data();
        let varintValue = 0;
        let varintLength = 0;
        for (; ; ) {
          if (varintLength >= data.byteLength) {
            return void 0;
          }
          const byte = data[varintLength];
          varintValue |= (byte & 127) << 7 * varintLength;
          varintLength += 1;
          if (!(byte & 128)) {
            break;
          }
        }
        if (data.byteLength < varintLength + varintValue) {
          return void 0;
        }
        const protobufData = data.slice(varintLength, varintLength + varintValue);
        this.#queue.shift(varintLength + varintValue);
        return protobufData;
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/http/json_encode.js
function PipelineReqBody(w, msg) {
  if (msg.baton !== void 0) {
    w.string("baton", msg.baton);
  }
  w.arrayObjects("requests", msg.requests, StreamRequest);
}
function StreamRequest(w, msg) {
  w.stringRaw("type", msg.type);
  if (msg.type === "close") {
  } else if (msg.type === "execute") {
    w.object("stmt", msg.stmt, Stmt2);
  } else if (msg.type === "batch") {
    w.object("batch", msg.batch, Batch2);
  } else if (msg.type === "sequence") {
    if (msg.sql !== void 0) {
      w.string("sql", msg.sql);
    }
    if (msg.sqlId !== void 0) {
      w.number("sql_id", msg.sqlId);
    }
  } else if (msg.type === "describe") {
    if (msg.sql !== void 0) {
      w.string("sql", msg.sql);
    }
    if (msg.sqlId !== void 0) {
      w.number("sql_id", msg.sqlId);
    }
  } else if (msg.type === "store_sql") {
    w.number("sql_id", msg.sqlId);
    w.string("sql", msg.sql);
  } else if (msg.type === "close_sql") {
    w.number("sql_id", msg.sqlId);
  } else if (msg.type === "get_autocommit") {
  } else {
    throw impossible(msg, "Impossible type of StreamRequest");
  }
}
function CursorReqBody(w, msg) {
  if (msg.baton !== void 0) {
    w.string("baton", msg.baton);
  }
  w.object("batch", msg.batch, Batch2);
}
var init_json_encode3 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/http/json_encode.js"() {
    init_json_encode();
    init_util3();
  }
});

// node_modules/@libsql/hrana-client/lib-esm/http/protobuf_encode.js
function PipelineReqBody2(w, msg) {
  if (msg.baton !== void 0) {
    w.string(1, msg.baton);
  }
  for (const req of msg.requests) {
    w.message(2, req, StreamRequest2);
  }
}
function StreamRequest2(w, msg) {
  if (msg.type === "close") {
    w.message(1, msg, CloseStreamReq2);
  } else if (msg.type === "execute") {
    w.message(2, msg, ExecuteStreamReq);
  } else if (msg.type === "batch") {
    w.message(3, msg, BatchStreamReq);
  } else if (msg.type === "sequence") {
    w.message(4, msg, SequenceStreamReq);
  } else if (msg.type === "describe") {
    w.message(5, msg, DescribeStreamReq);
  } else if (msg.type === "store_sql") {
    w.message(6, msg, StoreSqlStreamReq);
  } else if (msg.type === "close_sql") {
    w.message(7, msg, CloseSqlStreamReq);
  } else if (msg.type === "get_autocommit") {
    w.message(8, msg, GetAutocommitStreamReq);
  } else {
    throw impossible(msg, "Impossible type of StreamRequest");
  }
}
function CloseStreamReq2(_w, _msg) {
}
function ExecuteStreamReq(w, msg) {
  w.message(1, msg.stmt, Stmt3);
}
function BatchStreamReq(w, msg) {
  w.message(1, msg.batch, Batch3);
}
function SequenceStreamReq(w, msg) {
  if (msg.sql !== void 0) {
    w.string(1, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(2, msg.sqlId);
  }
}
function DescribeStreamReq(w, msg) {
  if (msg.sql !== void 0) {
    w.string(1, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(2, msg.sqlId);
  }
}
function StoreSqlStreamReq(w, msg) {
  w.int32(1, msg.sqlId);
  w.string(2, msg.sql);
}
function CloseSqlStreamReq(w, msg) {
  w.int32(1, msg.sqlId);
}
function GetAutocommitStreamReq(_w, _msg) {
}
function CursorReqBody2(w, msg) {
  if (msg.baton !== void 0) {
    w.string(1, msg.baton);
  }
  w.message(2, msg.batch, Batch3);
}
var init_protobuf_encode3 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/http/protobuf_encode.js"() {
    init_protobuf_encode();
    init_util3();
  }
});

// node_modules/@libsql/hrana-client/lib-esm/http/stream.js
function handlePipelineResponse(pipeline, respBody) {
  if (respBody.results.length !== pipeline.length) {
    throw new ProtoError("Server returned unexpected number of pipeline results");
  }
  for (let i = 0; i < pipeline.length; ++i) {
    const result = respBody.results[i];
    const entry = pipeline[i];
    if (result.type === "ok") {
      if (result.response.type !== entry.request.type) {
        throw new ProtoError("Received unexpected type of response");
      }
      entry.responseCallback(result.response);
    } else if (result.type === "error") {
      entry.errorCallback(errorFromProto(result.error));
    } else if (result.type === "none") {
      throw new ProtoError("Received unrecognized type of StreamResult");
    } else {
      throw impossible(result, "Received impossible type of StreamResult");
    }
  }
}
async function decodePipelineResponse(resp, encoding) {
  if (encoding === "json") {
    const respJson = await resp.json();
    return readJsonObject(respJson, PipelineRespBody);
  }
  if (encoding === "protobuf") {
    const respData = await resp.arrayBuffer();
    return readProtobufMessage(new Uint8Array(respData), PipelineRespBody2);
  }
  await resp.body?.cancel();
  throw impossible(encoding, "Impossible encoding");
}
async function errorFromResponse(resp) {
  const respType = resp.headers.get("content-type") ?? "text/plain";
  let message = `Server returned HTTP status ${resp.status}`;
  if (respType === "application/json") {
    const respBody = await resp.json();
    if ("message" in respBody) {
      return errorFromProto(respBody);
    }
    return new HttpServerError(message, resp.status);
  }
  if (respType === "text/plain") {
    const respBody = (await resp.text()).trim();
    if (respBody !== "") {
      message += `: ${respBody}`;
    }
    return new HttpServerError(message, resp.status);
  }
  await resp.body?.cancel();
  return new HttpServerError(message, resp.status);
}
var HttpStream;
var init_stream3 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/http/stream.js"() {
    init_errors();
    init_encoding();
    init_id_alloc();
    init_queue();
    init_queue_microtask();
    init_result();
    init_sql();
    init_stream();
    init_util3();
    init_cursor3();
    init_json_encode3();
    init_protobuf_encode3();
    init_json_encode3();
    init_protobuf_encode3();
    init_json_decode3();
    init_protobuf_decode3();
    HttpStream = class extends Stream {
      #client;
      #baseUrl;
      #jwt;
      #fetch;
      #remoteEncryptionKey;
      #baton;
      #queue;
      #flushing;
      #cursor;
      #closing;
      #closeQueued;
      #closed;
      #sqlIdAlloc;
      /** @private */
      constructor(client, baseUrl, jwt, customFetch, remoteEncryptionKey) {
        super(client.intMode);
        this.#client = client;
        this.#baseUrl = baseUrl.toString();
        this.#jwt = jwt;
        this.#fetch = customFetch;
        this.#remoteEncryptionKey = remoteEncryptionKey;
        this.#baton = void 0;
        this.#queue = new Queue();
        this.#flushing = false;
        this.#closing = false;
        this.#closeQueued = false;
        this.#closed = void 0;
        this.#sqlIdAlloc = new IdAlloc();
      }
      /** Get the {@link HttpClient} object that this stream belongs to. */
      client() {
        return this.#client;
      }
      /** @private */
      _sqlOwner() {
        return this;
      }
      /** Cache a SQL text on the server. */
      storeSql(sql) {
        const sqlId = this.#sqlIdAlloc.alloc();
        this.#sendStreamRequest({ type: "store_sql", sqlId, sql }).then(() => void 0, (error) => this._setClosed(error));
        return new Sql(this, sqlId);
      }
      /** @private */
      _closeSql(sqlId) {
        if (this.#closed !== void 0) {
          return;
        }
        this.#sendStreamRequest({ type: "close_sql", sqlId }).then(() => this.#sqlIdAlloc.free(sqlId), (error) => this._setClosed(error));
      }
      /** @private */
      _execute(stmt) {
        return this.#sendStreamRequest({ type: "execute", stmt }).then((response) => {
          return response.result;
        });
      }
      /** @private */
      _batch(batch) {
        return this.#sendStreamRequest({ type: "batch", batch }).then((response) => {
          return response.result;
        });
      }
      /** @private */
      _describe(protoSql) {
        return this.#sendStreamRequest({
          type: "describe",
          sql: protoSql.sql,
          sqlId: protoSql.sqlId
        }).then((response) => {
          return response.result;
        });
      }
      /** @private */
      _sequence(protoSql) {
        return this.#sendStreamRequest({
          type: "sequence",
          sql: protoSql.sql,
          sqlId: protoSql.sqlId
        }).then((_response) => {
          return void 0;
        });
      }
      /** Check whether the SQL connection underlying this stream is in autocommit state (i.e., outside of an
       * explicit transaction). This requires protocol version 3 or higher.
       */
      getAutocommit() {
        this.#client._ensureVersion(3, "getAutocommit()");
        return this.#sendStreamRequest({
          type: "get_autocommit"
        }).then((response) => {
          return response.isAutocommit;
        });
      }
      #sendStreamRequest(request) {
        return new Promise((responseCallback, errorCallback) => {
          this.#pushToQueue({ type: "pipeline", request, responseCallback, errorCallback });
        });
      }
      /** @private */
      _openCursor(batch) {
        return new Promise((cursorCallback, errorCallback) => {
          this.#pushToQueue({ type: "cursor", batch, cursorCallback, errorCallback });
        });
      }
      /** @private */
      _cursorClosed(cursor) {
        if (cursor !== this.#cursor) {
          throw new InternalError("Cursor was closed, but it was not associated with the stream");
        }
        this.#cursor = void 0;
        _queueMicrotask(() => this.#flushQueue());
      }
      /** Immediately close the stream. */
      close() {
        this._setClosed(new ClientError("Stream was manually closed"));
      }
      /** Gracefully close the stream. */
      closeGracefully() {
        this.#closing = true;
        _queueMicrotask(() => this.#flushQueue());
      }
      /** True if the stream is closed. */
      get closed() {
        return this.#closed !== void 0 || this.#closing;
      }
      /** @private */
      _setClosed(error) {
        if (this.#closed !== void 0) {
          return;
        }
        this.#closed = error;
        if (this.#cursor !== void 0) {
          this.#cursor._setClosed(error);
        }
        this.#client._streamClosed(this);
        for (; ; ) {
          const entry = this.#queue.shift();
          if (entry !== void 0) {
            entry.errorCallback(error);
          } else {
            break;
          }
        }
        if ((this.#baton !== void 0 || this.#flushing) && !this.#closeQueued) {
          this.#queue.push({
            type: "pipeline",
            request: { type: "close" },
            responseCallback: () => void 0,
            errorCallback: () => void 0
          });
          this.#closeQueued = true;
          _queueMicrotask(() => this.#flushQueue());
        }
      }
      #pushToQueue(entry) {
        if (this.#closed !== void 0) {
          throw new ClosedError("Stream is closed", this.#closed);
        } else if (this.#closing) {
          throw new ClosedError("Stream is closing", void 0);
        } else {
          this.#queue.push(entry);
          _queueMicrotask(() => this.#flushQueue());
        }
      }
      #flushQueue() {
        if (this.#flushing || this.#cursor !== void 0) {
          return;
        }
        if (this.#closing && this.#queue.length === 0) {
          this._setClosed(new ClientError("Stream was gracefully closed"));
          return;
        }
        const endpoint = this.#client._endpoint;
        if (endpoint === void 0) {
          this.#client._endpointPromise.then(() => this.#flushQueue(), (error) => this._setClosed(error));
          return;
        }
        const firstEntry = this.#queue.shift();
        if (firstEntry === void 0) {
          return;
        } else if (firstEntry.type === "pipeline") {
          const pipeline = [firstEntry];
          for (; ; ) {
            const entry = this.#queue.first();
            if (entry !== void 0 && entry.type === "pipeline") {
              pipeline.push(entry);
              this.#queue.shift();
            } else if (entry === void 0 && this.#closing && !this.#closeQueued) {
              pipeline.push({
                type: "pipeline",
                request: { type: "close" },
                responseCallback: () => void 0,
                errorCallback: () => void 0
              });
              this.#closeQueued = true;
              break;
            } else {
              break;
            }
          }
          this.#flushPipeline(endpoint, pipeline);
        } else if (firstEntry.type === "cursor") {
          this.#flushCursor(endpoint, firstEntry);
        } else {
          throw impossible(firstEntry, "Impossible type of QueueEntry");
        }
      }
      #flushPipeline(endpoint, pipeline) {
        this.#flush(() => this.#createPipelineRequest(pipeline, endpoint), (resp) => decodePipelineResponse(resp, endpoint.encoding), (respBody) => respBody.baton, (respBody) => respBody.baseUrl, (respBody) => handlePipelineResponse(pipeline, respBody), (error) => pipeline.forEach((entry) => entry.errorCallback(error)));
      }
      #flushCursor(endpoint, entry) {
        const cursor = new HttpCursor(this, endpoint.encoding);
        this.#cursor = cursor;
        this.#flush(() => this.#createCursorRequest(entry, endpoint), (resp) => cursor.open(resp), (respBody) => respBody.baton, (respBody) => respBody.baseUrl, (_respBody) => entry.cursorCallback(cursor), (error) => entry.errorCallback(error));
      }
      #flush(createRequest, decodeResponse, getBaton, getBaseUrl, handleResponse, handleError) {
        let promise;
        try {
          const request = createRequest();
          const fetch2 = this.#fetch;
          promise = fetch2(request);
        } catch (error) {
          promise = Promise.reject(error);
        }
        this.#flushing = true;
        promise.then((resp) => {
          if (!resp.ok) {
            return errorFromResponse(resp).then((error) => {
              throw error;
            });
          }
          return decodeResponse(resp);
        }).then((r) => {
          this.#baton = getBaton(r);
          this.#baseUrl = getBaseUrl(r) ?? this.#baseUrl;
          handleResponse(r);
        }).catch((error) => {
          this._setClosed(error);
          handleError(error);
        }).finally(() => {
          this.#flushing = false;
          this.#flushQueue();
        });
      }
      #createPipelineRequest(pipeline, endpoint) {
        return this.#createRequest(new URL(endpoint.pipelinePath, this.#baseUrl), {
          baton: this.#baton,
          requests: pipeline.map((entry) => entry.request)
        }, endpoint.encoding, PipelineReqBody, PipelineReqBody2);
      }
      #createCursorRequest(entry, endpoint) {
        if (endpoint.cursorPath === void 0) {
          throw new ProtocolVersionError(`Cursors are supported only on protocol version 3 and higher, but the HTTP server only supports version ${endpoint.version}.`);
        }
        return this.#createRequest(new URL(endpoint.cursorPath, this.#baseUrl), {
          baton: this.#baton,
          batch: entry.batch
        }, endpoint.encoding, CursorReqBody, CursorReqBody2);
      }
      #createRequest(url, reqBody, encoding, jsonFun, protobufFun) {
        let bodyData;
        let contentType;
        if (encoding === "json") {
          bodyData = writeJsonObject(reqBody, jsonFun);
          contentType = "application/json";
        } else if (encoding === "protobuf") {
          bodyData = writeProtobufMessage(reqBody, protobufFun);
          contentType = "application/x-protobuf";
        } else {
          throw impossible(encoding, "Impossible encoding");
        }
        const headers = new Headers();
        headers.set("content-type", contentType);
        if (this.#jwt !== void 0) {
          headers.set("authorization", `Bearer ${this.#jwt}`);
        }
        if (this.#remoteEncryptionKey !== void 0) {
          headers.set("x-turso-encryption-key", this.#remoteEncryptionKey);
        }
        return new Request(url.toString(), { method: "POST", headers, body: bodyData });
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/http/client.js
async function findEndpoint(customFetch, clientUrl) {
  const fetch2 = customFetch;
  for (const endpoint of checkEndpoints) {
    const url = new URL(endpoint.versionPath, clientUrl);
    const request = new Request(url.toString(), { method: "GET" });
    const response = await fetch2(request);
    await response.arrayBuffer();
    if (response.ok) {
      return endpoint;
    }
  }
  return fallbackEndpoint;
}
var checkEndpoints, fallbackEndpoint, HttpClient;
var init_client3 = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/http/client.js"() {
    init_client();
    init_errors();
    init_stream3();
    checkEndpoints = [
      {
        versionPath: "v3-protobuf",
        pipelinePath: "v3-protobuf/pipeline",
        cursorPath: "v3-protobuf/cursor",
        version: 3,
        encoding: "protobuf"
      }
      /*
      {
          versionPath: "v3",
          pipelinePath: "v3/pipeline",
          cursorPath: "v3/cursor",
          version: 3,
          encoding: "json",
      },
      */
    ];
    fallbackEndpoint = {
      versionPath: "v2",
      pipelinePath: "v2/pipeline",
      cursorPath: void 0,
      version: 2,
      encoding: "json"
    };
    HttpClient = class extends Client {
      #url;
      #jwt;
      #fetch;
      #remoteEncryptionKey;
      #closed;
      #streams;
      /** @private */
      _endpointPromise;
      /** @private */
      _endpoint;
      /** @private */
      constructor(url, jwt, customFetch, remoteEncryptionKey, protocolVersion = 2) {
        super();
        this.#url = url;
        this.#jwt = jwt;
        this.#fetch = customFetch ?? globalThis.fetch;
        this.#remoteEncryptionKey = remoteEncryptionKey;
        this.#closed = void 0;
        this.#streams = /* @__PURE__ */ new Set();
        if (protocolVersion == 3) {
          this._endpointPromise = findEndpoint(this.#fetch, this.#url);
          this._endpointPromise.then((endpoint) => this._endpoint = endpoint, (error) => this.#setClosed(error));
        } else {
          this._endpointPromise = Promise.resolve(fallbackEndpoint);
          this._endpointPromise.then((endpoint) => this._endpoint = endpoint, (error) => this.#setClosed(error));
        }
      }
      /** Get the protocol version supported by the server. */
      async getVersion() {
        if (this._endpoint !== void 0) {
          return this._endpoint.version;
        }
        return (await this._endpointPromise).version;
      }
      // Make sure that the negotiated version is at least `minVersion`.
      /** @private */
      _ensureVersion(minVersion, feature) {
        if (minVersion <= fallbackEndpoint.version) {
          return;
        } else if (this._endpoint === void 0) {
          throw new ProtocolVersionError(`${feature} is supported only on protocol version ${minVersion} and higher, but the version supported by the HTTP server is not yet known. Use Client.getVersion() to wait until the version is available.`);
        } else if (this._endpoint.version < minVersion) {
          throw new ProtocolVersionError(`${feature} is supported only on protocol version ${minVersion} and higher, but the HTTP server only supports version ${this._endpoint.version}.`);
        }
      }
      /** Open a {@link HttpStream}, a stream for executing SQL statements. */
      openStream() {
        if (this.#closed !== void 0) {
          throw new ClosedError("Client is closed", this.#closed);
        }
        const stream = new HttpStream(this, this.#url, this.#jwt, this.#fetch, this.#remoteEncryptionKey);
        this.#streams.add(stream);
        return stream;
      }
      /** @private */
      _streamClosed(stream) {
        this.#streams.delete(stream);
      }
      /** Close the client and all its streams. */
      close() {
        this.#setClosed(new ClientError("Client was manually closed"));
      }
      /** True if the client is closed. */
      get closed() {
        return this.#closed !== void 0;
      }
      #setClosed(error) {
        if (this.#closed !== void 0) {
          return;
        }
        this.#closed = error;
        for (const stream of Array.from(this.#streams)) {
          stream._setClosed(new ClosedError("Client was closed", error));
        }
      }
    };
  }
});

// node_modules/@libsql/hrana-client/lib-esm/libsql_url.js
var init_libsql_url = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/libsql_url.js"() {
    init_errors();
  }
});

// node_modules/@libsql/hrana-client/lib-esm/index.js
function openWs(url, jwt, protocolVersion = 2) {
  if (typeof import_websocket.default === "undefined") {
    throw new WebSocketUnsupportedError("WebSockets are not supported in this environment");
  }
  var subprotocols = void 0;
  if (protocolVersion == 3) {
    subprotocols = Array.from(subprotocolsV3.keys());
  } else {
    subprotocols = Array.from(subprotocolsV2.keys());
  }
  const socket = new import_websocket.default(url, subprotocols);
  return new WsClient(socket, jwt);
}
function openHttp(url, jwt, customFetch, remoteEncryptionKey, protocolVersion = 2) {
  return new HttpClient(url instanceof URL ? url : new URL(url), jwt, customFetch, remoteEncryptionKey, protocolVersion);
}
var init_lib_esm = __esm({
  "node_modules/@libsql/hrana-client/lib-esm/index.js"() {
    init_node3();
    init_client2();
    init_errors();
    init_client3();
    init_client2();
    init_node3();
    init_client();
    init_errors();
    init_batch();
    init_libsql_url();
    init_sql();
    init_stmt();
    init_stream();
    init_client3();
    init_stream3();
    init_client2();
    init_stream2();
  }
});

// node_modules/@libsql/client/lib-esm/hrana.js
async function executeHranaBatch(mode, version2, batch, hranaStmts, disableForeignKeys = false) {
  if (disableForeignKeys) {
    batch.step().run("PRAGMA foreign_keys=off");
  }
  const beginStep = batch.step();
  const beginPromise = beginStep.run(transactionModeToBegin(mode));
  let lastStep = beginStep;
  const stmtPromises = hranaStmts.map((hranaStmt) => {
    const stmtStep = batch.step().condition(BatchCond.ok(lastStep));
    if (version2 >= 3) {
      stmtStep.condition(BatchCond.not(BatchCond.isAutocommit(batch)));
    }
    const stmtPromise = stmtStep.query(hranaStmt);
    lastStep = stmtStep;
    return stmtPromise;
  });
  const commitStep = batch.step().condition(BatchCond.ok(lastStep));
  if (version2 >= 3) {
    commitStep.condition(BatchCond.not(BatchCond.isAutocommit(batch)));
  }
  const commitPromise = commitStep.run("COMMIT");
  const rollbackStep = batch.step().condition(BatchCond.not(BatchCond.ok(commitStep)));
  rollbackStep.run("ROLLBACK").catch((_) => void 0);
  if (disableForeignKeys) {
    batch.step().run("PRAGMA foreign_keys=on");
  }
  await batch.execute();
  const resultSets = [];
  await beginPromise;
  for (let i = 0; i < stmtPromises.length; i++) {
    try {
      const hranaRows = await stmtPromises[i];
      if (hranaRows === void 0) {
        throw new LibsqlBatchError("Statement in a batch was not executed, probably because the transaction has been rolled back", i, "TRANSACTION_CLOSED");
      }
      resultSets.push(resultSetFromHrana(hranaRows));
    } catch (e) {
      if (e instanceof LibsqlBatchError) {
        throw e;
      }
      const mappedError = mapHranaError(e);
      if (mappedError instanceof LibsqlError) {
        throw new LibsqlBatchError(mappedError.message, i, mappedError.code, mappedError.extendedCode, mappedError.rawCode, mappedError.cause instanceof Error ? mappedError.cause : void 0);
      }
      throw mappedError;
    }
  }
  await commitPromise;
  return resultSets;
}
function stmtToHrana(stmt) {
  let sql;
  let args;
  if (Array.isArray(stmt)) {
    [sql, args] = stmt;
  } else if (typeof stmt === "string") {
    sql = stmt;
  } else {
    sql = stmt.sql;
    args = stmt.args;
  }
  const hranaStmt = new Stmt(sql);
  if (args) {
    if (Array.isArray(args)) {
      hranaStmt.bindIndexes(args);
    } else {
      for (const [key, value] of Object.entries(args)) {
        hranaStmt.bindName(key, value);
      }
    }
  }
  return hranaStmt;
}
function resultSetFromHrana(hranaRows) {
  const columns = hranaRows.columnNames.map((c) => c ?? "");
  const columnTypes = hranaRows.columnDecltypes.map((c) => c ?? "");
  const rows = hranaRows.rows;
  const rowsAffected = hranaRows.affectedRowCount;
  const lastInsertRowid = hranaRows.lastInsertRowid !== void 0 ? hranaRows.lastInsertRowid : void 0;
  return new ResultSetImpl(columns, columnTypes, rows, rowsAffected, lastInsertRowid);
}
function mapHranaError(e) {
  if (e instanceof ClientError) {
    const code = mapHranaErrorCode(e);
    return new LibsqlError(e.message, code, void 0, void 0, e);
  }
  return e;
}
function mapHranaErrorCode(e) {
  if (e instanceof ResponseError && e.code !== void 0) {
    return e.code;
  } else if (e instanceof ProtoError) {
    return "HRANA_PROTO_ERROR";
  } else if (e instanceof ClosedError) {
    return e.cause instanceof ClientError ? mapHranaErrorCode(e.cause) : "HRANA_CLOSED_ERROR";
  } else if (e instanceof WebSocketError) {
    return "HRANA_WEBSOCKET_ERROR";
  } else if (e instanceof HttpServerError) {
    return "SERVER_ERROR";
  } else if (e instanceof ProtocolVersionError) {
    return "PROTOCOL_VERSION_ERROR";
  } else if (e instanceof InternalError) {
    return "INTERNAL_ERROR";
  } else {
    return "UNKNOWN";
  }
}
var HranaTransaction;
var init_hrana = __esm({
  "node_modules/@libsql/client/lib-esm/hrana.js"() {
    init_lib_esm();
    init_api();
    init_util();
    HranaTransaction = class {
      #mode;
      #version;
      // Promise that is resolved when the BEGIN statement completes, or `undefined` if we haven't executed the
      // BEGIN statement yet.
      #started;
      /** @private */
      constructor(mode, version2) {
        this.#mode = mode;
        this.#version = version2;
        this.#started = void 0;
      }
      execute(stmt) {
        return this.batch([stmt]).then((results) => results[0]);
      }
      async batch(stmts) {
        const stream = this._getStream();
        if (stream.closed) {
          throw new LibsqlError("Cannot execute statements because the transaction is closed", "TRANSACTION_CLOSED");
        }
        try {
          const hranaStmts = stmts.map(stmtToHrana);
          let rowsPromises;
          if (this.#started === void 0) {
            this._getSqlCache().apply(hranaStmts);
            const batch = stream.batch(this.#version >= 3);
            const beginStep = batch.step();
            const beginPromise = beginStep.run(transactionModeToBegin(this.#mode));
            let lastStep = beginStep;
            rowsPromises = hranaStmts.map((hranaStmt) => {
              const stmtStep = batch.step().condition(BatchCond.ok(lastStep));
              if (this.#version >= 3) {
                stmtStep.condition(BatchCond.not(BatchCond.isAutocommit(batch)));
              }
              const rowsPromise = stmtStep.query(hranaStmt);
              rowsPromise.catch(() => void 0);
              lastStep = stmtStep;
              return rowsPromise;
            });
            this.#started = batch.execute().then(() => beginPromise).then(() => void 0);
            try {
              await this.#started;
            } catch (e) {
              this.close();
              throw e;
            }
          } else {
            if (this.#version < 3) {
              await this.#started;
            } else {
            }
            this._getSqlCache().apply(hranaStmts);
            const batch = stream.batch(this.#version >= 3);
            let lastStep = void 0;
            rowsPromises = hranaStmts.map((hranaStmt) => {
              const stmtStep = batch.step();
              if (lastStep !== void 0) {
                stmtStep.condition(BatchCond.ok(lastStep));
              }
              if (this.#version >= 3) {
                stmtStep.condition(BatchCond.not(BatchCond.isAutocommit(batch)));
              }
              const rowsPromise = stmtStep.query(hranaStmt);
              rowsPromise.catch(() => void 0);
              lastStep = stmtStep;
              return rowsPromise;
            });
            await batch.execute();
          }
          const resultSets = [];
          for (let i = 0; i < rowsPromises.length; i++) {
            try {
              const rows = await rowsPromises[i];
              if (rows === void 0) {
                throw new LibsqlBatchError("Statement in a transaction was not executed, probably because the transaction has been rolled back", i, "TRANSACTION_CLOSED");
              }
              resultSets.push(resultSetFromHrana(rows));
            } catch (e) {
              if (e instanceof LibsqlBatchError) {
                throw e;
              }
              const mappedError = mapHranaError(e);
              if (mappedError instanceof LibsqlError) {
                throw new LibsqlBatchError(mappedError.message, i, mappedError.code, mappedError.extendedCode, mappedError.rawCode, mappedError.cause instanceof Error ? mappedError.cause : void 0);
              }
              throw mappedError;
            }
          }
          return resultSets;
        } catch (e) {
          throw mapHranaError(e);
        }
      }
      async executeMultiple(sql) {
        const stream = this._getStream();
        if (stream.closed) {
          throw new LibsqlError("Cannot execute statements because the transaction is closed", "TRANSACTION_CLOSED");
        }
        try {
          if (this.#started === void 0) {
            this.#started = stream.run(transactionModeToBegin(this.#mode)).then(() => void 0);
            try {
              await this.#started;
            } catch (e) {
              this.close();
              throw e;
            }
          } else {
            await this.#started;
          }
          await stream.sequence(sql);
        } catch (e) {
          throw mapHranaError(e);
        }
      }
      async rollback() {
        try {
          const stream = this._getStream();
          if (stream.closed) {
            return;
          }
          if (this.#started !== void 0) {
          } else {
            return;
          }
          const promise = stream.run("ROLLBACK").catch((e) => {
            throw mapHranaError(e);
          });
          stream.closeGracefully();
          await promise;
        } catch (e) {
          throw mapHranaError(e);
        } finally {
          this.close();
        }
      }
      async commit() {
        try {
          const stream = this._getStream();
          if (stream.closed) {
            throw new LibsqlError("Cannot commit the transaction because it is already closed", "TRANSACTION_CLOSED");
          }
          if (this.#started !== void 0) {
            await this.#started;
          } else {
            return;
          }
          const promise = stream.run("COMMIT").catch((e) => {
            throw mapHranaError(e);
          });
          stream.closeGracefully();
          await promise;
        } catch (e) {
          throw mapHranaError(e);
        } finally {
          this.close();
        }
      }
    };
  }
});

// node_modules/@libsql/client/lib-esm/sql_cache.js
var SqlCache, Lru;
var init_sql_cache = __esm({
  "node_modules/@libsql/client/lib-esm/sql_cache.js"() {
    SqlCache = class {
      #owner;
      #sqls;
      capacity;
      constructor(owner, capacity) {
        this.#owner = owner;
        this.#sqls = new Lru();
        this.capacity = capacity;
      }
      // Replaces SQL strings with cached `hrana.Sql` objects in the statements in `hranaStmts`. After this
      // function returns, we guarantee that all `hranaStmts` refer to valid (not closed) `hrana.Sql` objects,
      // but _we may invalidate any other `hrana.Sql` objects_ (by closing them, thus removing them from the
      // server).
      //
      // In practice, this means that after calling this function, you can use the statements only up to the
      // first `await`, because concurrent code may also use the cache and invalidate those statements.
      apply(hranaStmts) {
        if (this.capacity <= 0) {
          return;
        }
        const usedSqlObjs = /* @__PURE__ */ new Set();
        for (const hranaStmt of hranaStmts) {
          if (typeof hranaStmt.sql !== "string") {
            continue;
          }
          const sqlText = hranaStmt.sql;
          if (sqlText.length >= 5e3) {
            continue;
          }
          let sqlObj = this.#sqls.get(sqlText);
          if (sqlObj === void 0) {
            while (this.#sqls.size + 1 > this.capacity) {
              const [evictSqlText, evictSqlObj] = this.#sqls.peekLru();
              if (usedSqlObjs.has(evictSqlObj)) {
                break;
              }
              evictSqlObj.close();
              this.#sqls.delete(evictSqlText);
            }
            if (this.#sqls.size + 1 <= this.capacity) {
              sqlObj = this.#owner.storeSql(sqlText);
              this.#sqls.set(sqlText, sqlObj);
            }
          }
          if (sqlObj !== void 0) {
            hranaStmt.sql = sqlObj;
            usedSqlObjs.add(sqlObj);
          }
        }
      }
    };
    Lru = class {
      // This maps keys to the cache values. The entries are ordered by their last use (entires that were used
      // most recently are at the end).
      #cache;
      constructor() {
        this.#cache = /* @__PURE__ */ new Map();
      }
      get(key) {
        const value = this.#cache.get(key);
        if (value !== void 0) {
          this.#cache.delete(key);
          this.#cache.set(key, value);
        }
        return value;
      }
      set(key, value) {
        this.#cache.set(key, value);
      }
      peekLru() {
        for (const entry of this.#cache.entries()) {
          return entry;
        }
        return void 0;
      }
      delete(key) {
        this.#cache.delete(key);
      }
      get size() {
        return this.#cache.size;
      }
    };
  }
});

// node_modules/promise-limit/index.js
var require_promise_limit = __commonJS({
  "node_modules/promise-limit/index.js"(exports, module) {
    function limiter(count) {
      var outstanding = 0;
      var jobs = [];
      function remove() {
        outstanding--;
        if (outstanding < count) {
          dequeue();
        }
      }
      function dequeue() {
        var job = jobs.shift();
        semaphore.queue = jobs.length;
        if (job) {
          run(job.fn).then(job.resolve).catch(job.reject);
        }
      }
      function queue(fn) {
        return new Promise(function(resolve2, reject) {
          jobs.push({ fn, resolve: resolve2, reject });
          semaphore.queue = jobs.length;
        });
      }
      function run(fn) {
        outstanding++;
        try {
          return Promise.resolve(fn()).then(function(result) {
            remove();
            return result;
          }, function(error) {
            remove();
            throw error;
          });
        } catch (err) {
          remove();
          return Promise.reject(err);
        }
      }
      var semaphore = function(fn) {
        if (outstanding >= count) {
          return queue(fn);
        } else {
          return run(fn);
        }
      };
      return semaphore;
    }
    function map(items, mapper) {
      var failed = false;
      var limit = this;
      return Promise.all(items.map(function() {
        var args = arguments;
        return limit(function() {
          if (!failed) {
            return mapper.apply(void 0, args).catch(function(e) {
              failed = true;
              throw e;
            });
          }
        });
      }));
    }
    function addExtras(fn) {
      fn.queue = 0;
      fn.map = map;
      return fn;
    }
    module.exports = function(count) {
      if (count) {
        return addExtras(limiter(count));
      } else {
        return addExtras(function(fn) {
          return fn();
        });
      }
    };
  }
});

// node_modules/@libsql/client/lib-esm/ws.js
function _createClient2(config) {
  if (config.scheme !== "wss" && config.scheme !== "ws") {
    throw new LibsqlError(`The WebSocket client supports only "libsql:", "wss:" and "ws:" URLs, got ${JSON.stringify(config.scheme + ":")}. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
  }
  if (config.encryptionKey !== void 0) {
    throw new LibsqlError("Encryption key is not supported by the remote client.", "ENCRYPTION_KEY_NOT_SUPPORTED");
  }
  if (config.scheme === "ws" && config.tls) {
    throw new LibsqlError(`A "ws:" URL cannot opt into TLS by using ?tls=1`, "URL_INVALID");
  } else if (config.scheme === "wss" && !config.tls) {
    throw new LibsqlError(`A "wss:" URL cannot opt out of TLS by using ?tls=0`, "URL_INVALID");
  }
  const url = encodeBaseUrl(config.scheme, config.authority, config.path);
  let client;
  try {
    client = openWs(url, config.authToken);
  } catch (e) {
    if (e instanceof WebSocketUnsupportedError) {
      const suggestedScheme = config.scheme === "wss" ? "https" : "http";
      const suggestedUrl = encodeBaseUrl(suggestedScheme, config.authority, config.path);
      throw new LibsqlError(`This environment does not support WebSockets, please switch to the HTTP client by using a "${suggestedScheme}:" URL (${JSON.stringify(suggestedUrl)}). For more information, please read ${supportedUrlLink}`, "WEBSOCKETS_NOT_SUPPORTED");
    }
    throw mapHranaError(e);
  }
  return new WsClient2(client, url, config.authToken, config.intMode, config.concurrency);
}
var import_promise_limit, maxConnAgeMillis, sqlCacheCapacity, WsClient2, WsTransaction;
var init_ws = __esm({
  "node_modules/@libsql/client/lib-esm/ws.js"() {
    init_lib_esm();
    init_api();
    init_config();
    init_hrana();
    init_sql_cache();
    init_uri();
    init_util();
    import_promise_limit = __toESM(require_promise_limit(), 1);
    init_api();
    maxConnAgeMillis = 60 * 1e3;
    sqlCacheCapacity = 100;
    WsClient2 = class {
      #url;
      #authToken;
      #intMode;
      // State of the current connection. The `hrana.WsClient` inside may be closed at any moment due to an
      // asynchronous error.
      #connState;
      // If defined, this is a connection that will be used in the future, once it is ready.
      #futureConnState;
      closed;
      protocol;
      #isSchemaDatabase;
      #promiseLimitFunction;
      /** @private */
      constructor(client, url, authToken, intMode, concurrency) {
        this.#url = url;
        this.#authToken = authToken;
        this.#intMode = intMode;
        this.#connState = this.#openConn(client);
        this.#futureConnState = void 0;
        this.closed = false;
        this.protocol = "ws";
        this.#promiseLimitFunction = (0, import_promise_limit.default)(concurrency);
      }
      async limit(fn) {
        return this.#promiseLimitFunction(fn);
      }
      async execute(stmtOrSql, args) {
        let stmt;
        if (typeof stmtOrSql === "string") {
          stmt = {
            sql: stmtOrSql,
            args: args || []
          };
        } else {
          stmt = stmtOrSql;
        }
        return this.limit(async () => {
          const streamState = await this.#openStream();
          try {
            const hranaStmt = stmtToHrana(stmt);
            streamState.conn.sqlCache.apply([hranaStmt]);
            const hranaRowsPromise = streamState.stream.query(hranaStmt);
            streamState.stream.closeGracefully();
            const hranaRowsResult = await hranaRowsPromise;
            return resultSetFromHrana(hranaRowsResult);
          } catch (e) {
            throw mapHranaError(e);
          } finally {
            this._closeStream(streamState);
          }
        });
      }
      async batch(stmts, mode = "deferred") {
        return this.limit(async () => {
          const streamState = await this.#openStream();
          try {
            const normalizedStmts = stmts.map((stmt) => {
              if (Array.isArray(stmt)) {
                return {
                  sql: stmt[0],
                  args: stmt[1] || []
                };
              }
              return stmt;
            });
            const hranaStmts = normalizedStmts.map(stmtToHrana);
            const version2 = await streamState.conn.client.getVersion();
            streamState.conn.sqlCache.apply(hranaStmts);
            const batch = streamState.stream.batch(version2 >= 3);
            const resultsPromise = executeHranaBatch(mode, version2, batch, hranaStmts);
            const results = await resultsPromise;
            return results;
          } catch (e) {
            throw mapHranaError(e);
          } finally {
            this._closeStream(streamState);
          }
        });
      }
      async migrate(stmts) {
        return this.limit(async () => {
          const streamState = await this.#openStream();
          try {
            const hranaStmts = stmts.map(stmtToHrana);
            const version2 = await streamState.conn.client.getVersion();
            const batch = streamState.stream.batch(version2 >= 3);
            const resultsPromise = executeHranaBatch("deferred", version2, batch, hranaStmts, true);
            const results = await resultsPromise;
            return results;
          } catch (e) {
            throw mapHranaError(e);
          } finally {
            this._closeStream(streamState);
          }
        });
      }
      async transaction(mode = "write") {
        return this.limit(async () => {
          const streamState = await this.#openStream();
          try {
            const version2 = await streamState.conn.client.getVersion();
            return new WsTransaction(this, streamState, mode, version2);
          } catch (e) {
            this._closeStream(streamState);
            throw mapHranaError(e);
          }
        });
      }
      async executeMultiple(sql) {
        return this.limit(async () => {
          const streamState = await this.#openStream();
          try {
            const promise = streamState.stream.sequence(sql);
            streamState.stream.closeGracefully();
            await promise;
          } catch (e) {
            throw mapHranaError(e);
          } finally {
            this._closeStream(streamState);
          }
        });
      }
      sync() {
        throw new LibsqlError("sync not supported in ws mode", "SYNC_NOT_SUPPORTED");
      }
      async #openStream() {
        if (this.closed) {
          throw new LibsqlError("The client is closed", "CLIENT_CLOSED");
        }
        const now = /* @__PURE__ */ new Date();
        const ageMillis = now.valueOf() - this.#connState.openTime.valueOf();
        if (ageMillis > maxConnAgeMillis && this.#futureConnState === void 0) {
          const futureConnState = this.#openConn();
          this.#futureConnState = futureConnState;
          futureConnState.client.getVersion().then((_version) => {
            if (this.#connState !== futureConnState) {
              if (this.#connState.streamStates.size === 0) {
                this.#connState.client.close();
              } else {
              }
            }
            this.#connState = futureConnState;
            this.#futureConnState = void 0;
          }, (_e) => {
            this.#futureConnState = void 0;
          });
        }
        if (this.#connState.client.closed) {
          try {
            if (this.#futureConnState !== void 0) {
              this.#connState = this.#futureConnState;
            } else {
              this.#connState = this.#openConn();
            }
          } catch (e) {
            throw mapHranaError(e);
          }
        }
        const connState = this.#connState;
        try {
          if (connState.useSqlCache === void 0) {
            connState.useSqlCache = await connState.client.getVersion() >= 2;
            if (connState.useSqlCache) {
              connState.sqlCache.capacity = sqlCacheCapacity;
            }
          }
          const stream = connState.client.openStream();
          stream.intMode = this.#intMode;
          const streamState = { conn: connState, stream };
          connState.streamStates.add(streamState);
          return streamState;
        } catch (e) {
          throw mapHranaError(e);
        }
      }
      #openConn(client) {
        try {
          client ??= openWs(this.#url, this.#authToken);
          return {
            client,
            useSqlCache: void 0,
            sqlCache: new SqlCache(client, 0),
            openTime: /* @__PURE__ */ new Date(),
            streamStates: /* @__PURE__ */ new Set()
          };
        } catch (e) {
          throw mapHranaError(e);
        }
      }
      async reconnect() {
        try {
          for (const st of Array.from(this.#connState.streamStates)) {
            try {
              st.stream.close();
            } catch {
            }
          }
          this.#connState.client.close();
        } catch {
        }
        if (this.#futureConnState) {
          try {
            this.#futureConnState.client.close();
          } catch {
          }
          this.#futureConnState = void 0;
        }
        const next = this.#openConn();
        const version2 = await next.client.getVersion();
        next.useSqlCache = version2 >= 2;
        if (next.useSqlCache) {
          next.sqlCache.capacity = sqlCacheCapacity;
        }
        this.#connState = next;
        this.closed = false;
      }
      _closeStream(streamState) {
        streamState.stream.close();
        const connState = streamState.conn;
        connState.streamStates.delete(streamState);
        if (connState.streamStates.size === 0 && connState !== this.#connState) {
          connState.client.close();
        }
      }
      close() {
        this.#connState.client.close();
        this.closed = true;
        if (this.#futureConnState) {
          try {
            this.#futureConnState.client.close();
          } catch {
          }
          this.#futureConnState = void 0;
        }
        this.closed = true;
      }
    };
    WsTransaction = class extends HranaTransaction {
      #client;
      #streamState;
      /** @private */
      constructor(client, state, mode, version2) {
        super(mode, version2);
        this.#client = client;
        this.#streamState = state;
      }
      /** @private */
      _getStream() {
        return this.#streamState.stream;
      }
      /** @private */
      _getSqlCache() {
        return this.#streamState.conn.sqlCache;
      }
      close() {
        this.#client._closeStream(this.#streamState);
      }
      get closed() {
        return this.#streamState.stream.closed;
      }
    };
  }
});

// node_modules/@libsql/client/lib-esm/http.js
function _createClient3(config) {
  if (config.scheme !== "https" && config.scheme !== "http") {
    throw new LibsqlError(`The HTTP client supports only "libsql:", "https:" and "http:" URLs, got ${JSON.stringify(config.scheme + ":")}. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
  }
  if (config.encryptionKey !== void 0) {
    throw new LibsqlError("Encryption key is not supported by the remote client.", "ENCRYPTION_KEY_NOT_SUPPORTED");
  }
  if (config.scheme === "http" && config.tls) {
    throw new LibsqlError(`A "http:" URL cannot opt into TLS by using ?tls=1`, "URL_INVALID");
  } else if (config.scheme === "https" && !config.tls) {
    throw new LibsqlError(`A "https:" URL cannot opt out of TLS by using ?tls=0`, "URL_INVALID");
  }
  const url = encodeBaseUrl(config.scheme, config.authority, config.path);
  return new HttpClient2(url, config.authToken, config.intMode, config.fetch, config.concurrency, config.remoteEncryptionKey);
}
var import_promise_limit2, sqlCacheCapacity2, HttpClient2, HttpTransaction;
var init_http = __esm({
  "node_modules/@libsql/client/lib-esm/http.js"() {
    init_lib_esm();
    init_api();
    init_config();
    init_hrana();
    init_sql_cache();
    init_uri();
    init_util();
    import_promise_limit2 = __toESM(require_promise_limit(), 1);
    init_api();
    sqlCacheCapacity2 = 30;
    HttpClient2 = class {
      #client;
      protocol;
      #url;
      #intMode;
      #customFetch;
      #concurrency;
      #authToken;
      #remoteEncryptionKey;
      #promiseLimitFunction;
      /** @private */
      constructor(url, authToken, intMode, customFetch, concurrency, remoteEncryptionKey) {
        this.#url = url;
        this.#authToken = authToken;
        this.#intMode = intMode;
        this.#customFetch = customFetch;
        this.#concurrency = concurrency;
        this.#remoteEncryptionKey = remoteEncryptionKey;
        this.#client = openHttp(this.#url, this.#authToken, this.#customFetch, remoteEncryptionKey);
        this.#client.intMode = this.#intMode;
        this.protocol = "http";
        this.#promiseLimitFunction = (0, import_promise_limit2.default)(this.#concurrency);
      }
      async limit(fn) {
        return this.#promiseLimitFunction(fn);
      }
      async execute(stmtOrSql, args) {
        let stmt;
        if (typeof stmtOrSql === "string") {
          stmt = {
            sql: stmtOrSql,
            args: args || []
          };
        } else {
          stmt = stmtOrSql;
        }
        return this.limit(async () => {
          try {
            const hranaStmt = stmtToHrana(stmt);
            let rowsPromise;
            const stream = this.#client.openStream();
            try {
              rowsPromise = stream.query(hranaStmt);
            } finally {
              stream.closeGracefully();
            }
            const rowsResult = await rowsPromise;
            return resultSetFromHrana(rowsResult);
          } catch (e) {
            throw mapHranaError(e);
          }
        });
      }
      async batch(stmts, mode = "deferred") {
        return this.limit(async () => {
          try {
            const normalizedStmts = stmts.map((stmt) => {
              if (Array.isArray(stmt)) {
                return {
                  sql: stmt[0],
                  args: stmt[1] || []
                };
              }
              return stmt;
            });
            const hranaStmts = normalizedStmts.map(stmtToHrana);
            const version2 = await this.#client.getVersion();
            let resultsPromise;
            const stream = this.#client.openStream();
            try {
              const sqlCache = new SqlCache(stream, sqlCacheCapacity2);
              sqlCache.apply(hranaStmts);
              const batch = stream.batch(false);
              resultsPromise = executeHranaBatch(mode, version2, batch, hranaStmts);
            } finally {
              stream.closeGracefully();
            }
            const results = await resultsPromise;
            return results;
          } catch (e) {
            throw mapHranaError(e);
          }
        });
      }
      async migrate(stmts) {
        return this.limit(async () => {
          try {
            const hranaStmts = stmts.map(stmtToHrana);
            const version2 = await this.#client.getVersion();
            let resultsPromise;
            const stream = this.#client.openStream();
            try {
              const batch = stream.batch(false);
              resultsPromise = executeHranaBatch("deferred", version2, batch, hranaStmts, true);
            } finally {
              stream.closeGracefully();
            }
            const results = await resultsPromise;
            return results;
          } catch (e) {
            throw mapHranaError(e);
          }
        });
      }
      async transaction(mode = "write") {
        return this.limit(async () => {
          try {
            const version2 = await this.#client.getVersion();
            return new HttpTransaction(this.#client.openStream(), mode, version2);
          } catch (e) {
            throw mapHranaError(e);
          }
        });
      }
      async executeMultiple(sql) {
        return this.limit(async () => {
          try {
            let promise;
            const stream = this.#client.openStream();
            try {
              promise = stream.sequence(sql);
            } finally {
              stream.closeGracefully();
            }
            await promise;
          } catch (e) {
            throw mapHranaError(e);
          }
        });
      }
      sync() {
        throw new LibsqlError("sync not supported in http mode", "SYNC_NOT_SUPPORTED");
      }
      close() {
        this.#client.close();
      }
      async reconnect() {
        try {
          if (!this.closed) {
            this.#client.close();
          }
        } finally {
          this.#client = openHttp(this.#url, this.#authToken, this.#customFetch, this.#remoteEncryptionKey);
          this.#client.intMode = this.#intMode;
        }
      }
      get closed() {
        return this.#client.closed;
      }
    };
    HttpTransaction = class extends HranaTransaction {
      #stream;
      #sqlCache;
      /** @private */
      constructor(stream, mode, version2) {
        super(mode, version2);
        this.#stream = stream;
        this.#sqlCache = new SqlCache(stream, sqlCacheCapacity2);
      }
      /** @private */
      _getStream() {
        return this.#stream;
      }
      /** @private */
      _getSqlCache() {
        return this.#sqlCache;
      }
      close() {
        this.#stream.close();
      }
      get closed() {
        return this.#stream.closed;
      }
    };
  }
});

// node_modules/@libsql/client/lib-esm/node.js
function createClient(config) {
  return _createClient4(expandConfig(config, true));
}
function _createClient4(config) {
  if (config.scheme === "wss" || config.scheme === "ws") {
    return _createClient2(config);
  } else if (config.scheme === "https" || config.scheme === "http") {
    return _createClient3(config);
  } else {
    return _createClient(config);
  }
}
var init_node4 = __esm({
  "node_modules/@libsql/client/lib-esm/node.js"() {
    init_config();
    init_sqlite3();
    init_ws();
    init_http();
    init_api();
  }
});

// node_modules/zod/v3/helpers/util.js
var util, objectUtil, ZodParsedType, getParsedType;
var init_util4 = __esm({
  "node_modules/zod/v3/helpers/util.js"() {
    (function(util2) {
      util2.assertEqual = (_) => {
      };
      function assertIs(_arg) {
      }
      util2.assertIs = assertIs;
      function assertNever(_x) {
        throw new Error();
      }
      util2.assertNever = assertNever;
      util2.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
          obj[item] = item;
        }
        return obj;
      };
      util2.getValidEnumValues = (obj) => {
        const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
          filtered[k] = obj[k];
        }
        return util2.objectValues(filtered);
      };
      util2.objectValues = (obj) => {
        return util2.objectKeys(obj).map(function(e) {
          return obj[e];
        });
      };
      util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object2) => {
        const keys = [];
        for (const key in object2) {
          if (Object.prototype.hasOwnProperty.call(object2, key)) {
            keys.push(key);
          }
        }
        return keys;
      };
      util2.find = (arr, checker) => {
        for (const item of arr) {
          if (checker(item))
            return item;
        }
        return void 0;
      };
      util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
      function joinValues(array2, separator = " | ") {
        return array2.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
      }
      util2.joinValues = joinValues;
      util2.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      };
    })(util || (util = {}));
    (function(objectUtil2) {
      objectUtil2.mergeShapes = (first, second) => {
        return {
          ...first,
          ...second
          // second overwrites first
        };
      };
    })(objectUtil || (objectUtil = {}));
    ZodParsedType = util.arrayToEnum([
      "string",
      "nan",
      "number",
      "integer",
      "float",
      "boolean",
      "date",
      "bigint",
      "symbol",
      "function",
      "undefined",
      "null",
      "array",
      "object",
      "unknown",
      "promise",
      "void",
      "never",
      "map",
      "set"
    ]);
    getParsedType = (data) => {
      const t = typeof data;
      switch (t) {
        case "undefined":
          return ZodParsedType.undefined;
        case "string":
          return ZodParsedType.string;
        case "number":
          return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
        case "boolean":
          return ZodParsedType.boolean;
        case "function":
          return ZodParsedType.function;
        case "bigint":
          return ZodParsedType.bigint;
        case "symbol":
          return ZodParsedType.symbol;
        case "object":
          if (Array.isArray(data)) {
            return ZodParsedType.array;
          }
          if (data === null) {
            return ZodParsedType.null;
          }
          if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
            return ZodParsedType.promise;
          }
          if (typeof Map !== "undefined" && data instanceof Map) {
            return ZodParsedType.map;
          }
          if (typeof Set !== "undefined" && data instanceof Set) {
            return ZodParsedType.set;
          }
          if (typeof Date !== "undefined" && data instanceof Date) {
            return ZodParsedType.date;
          }
          return ZodParsedType.object;
        default:
          return ZodParsedType.unknown;
      }
    };
  }
});

// node_modules/zod/v3/ZodError.js
var ZodIssueCode, quotelessJson, ZodError;
var init_ZodError = __esm({
  "node_modules/zod/v3/ZodError.js"() {
    init_util4();
    ZodIssueCode = util.arrayToEnum([
      "invalid_type",
      "invalid_literal",
      "custom",
      "invalid_union",
      "invalid_union_discriminator",
      "invalid_enum_value",
      "unrecognized_keys",
      "invalid_arguments",
      "invalid_return_type",
      "invalid_date",
      "invalid_string",
      "too_small",
      "too_big",
      "invalid_intersection_types",
      "not_multiple_of",
      "not_finite"
    ]);
    quotelessJson = (obj) => {
      const json = JSON.stringify(obj, null, 2);
      return json.replace(/"([^"]+)":/g, "$1:");
    };
    ZodError = class _ZodError extends Error {
      get errors() {
        return this.issues;
      }
      constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
          this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
          this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(this, actualProto);
        } else {
          this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
      }
      format(_mapper) {
        const mapper = _mapper || function(issue) {
          return issue.message;
        };
        const fieldErrors = { _errors: [] };
        const processError = (error) => {
          for (const issue of error.issues) {
            if (issue.code === "invalid_union") {
              issue.unionErrors.map(processError);
            } else if (issue.code === "invalid_return_type") {
              processError(issue.returnTypeError);
            } else if (issue.code === "invalid_arguments") {
              processError(issue.argumentsError);
            } else if (issue.path.length === 0) {
              fieldErrors._errors.push(mapper(issue));
            } else {
              let curr = fieldErrors;
              let i = 0;
              while (i < issue.path.length) {
                const el = issue.path[i];
                const terminal = i === issue.path.length - 1;
                if (!terminal) {
                  curr[el] = curr[el] || { _errors: [] };
                } else {
                  curr[el] = curr[el] || { _errors: [] };
                  curr[el]._errors.push(mapper(issue));
                }
                curr = curr[el];
                i++;
              }
            }
          }
        };
        processError(this);
        return fieldErrors;
      }
      static assert(value) {
        if (!(value instanceof _ZodError)) {
          throw new Error(`Not a ZodError: ${value}`);
        }
      }
      toString() {
        return this.message;
      }
      get message() {
        return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
      }
      get isEmpty() {
        return this.issues.length === 0;
      }
      flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
          if (sub.path.length > 0) {
            const firstEl = sub.path[0];
            fieldErrors[firstEl] = fieldErrors[firstEl] || [];
            fieldErrors[firstEl].push(mapper(sub));
          } else {
            formErrors.push(mapper(sub));
          }
        }
        return { formErrors, fieldErrors };
      }
      get formErrors() {
        return this.flatten();
      }
    };
    ZodError.create = (issues) => {
      const error = new ZodError(issues);
      return error;
    };
  }
});

// node_modules/zod/v3/locales/en.js
var errorMap, en_default;
var init_en = __esm({
  "node_modules/zod/v3/locales/en.js"() {
    init_ZodError();
    init_util4();
    errorMap = (issue, _ctx) => {
      let message;
      switch (issue.code) {
        case ZodIssueCode.invalid_type:
          if (issue.received === ZodParsedType.undefined) {
            message = "Required";
          } else {
            message = `Expected ${issue.expected}, received ${issue.received}`;
          }
          break;
        case ZodIssueCode.invalid_literal:
          message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
          break;
        case ZodIssueCode.unrecognized_keys:
          message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
          break;
        case ZodIssueCode.invalid_union:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_union_discriminator:
          message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
          break;
        case ZodIssueCode.invalid_enum_value:
          message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
          break;
        case ZodIssueCode.invalid_arguments:
          message = `Invalid function arguments`;
          break;
        case ZodIssueCode.invalid_return_type:
          message = `Invalid function return type`;
          break;
        case ZodIssueCode.invalid_date:
          message = `Invalid date`;
          break;
        case ZodIssueCode.invalid_string:
          if (typeof issue.validation === "object") {
            if ("includes" in issue.validation) {
              message = `Invalid input: must include "${issue.validation.includes}"`;
              if (typeof issue.validation.position === "number") {
                message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
              }
            } else if ("startsWith" in issue.validation) {
              message = `Invalid input: must start with "${issue.validation.startsWith}"`;
            } else if ("endsWith" in issue.validation) {
              message = `Invalid input: must end with "${issue.validation.endsWith}"`;
            } else {
              util.assertNever(issue.validation);
            }
          } else if (issue.validation !== "regex") {
            message = `Invalid ${issue.validation}`;
          } else {
            message = "Invalid";
          }
          break;
        case ZodIssueCode.too_small:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "bigint")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.too_big:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "bigint")
            message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.custom:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_intersection_types:
          message = `Intersection results could not be merged`;
          break;
        case ZodIssueCode.not_multiple_of:
          message = `Number must be a multiple of ${issue.multipleOf}`;
          break;
        case ZodIssueCode.not_finite:
          message = "Number must be finite";
          break;
        default:
          message = _ctx.defaultError;
          util.assertNever(issue);
      }
      return { message };
    };
    en_default = errorMap;
  }
});

// node_modules/zod/v3/errors.js
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
var overrideErrorMap;
var init_errors2 = __esm({
  "node_modules/zod/v3/errors.js"() {
    init_en();
    overrideErrorMap = en_default;
  }
});

// node_modules/zod/v3/helpers/parseUtil.js
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var makeIssue, EMPTY_PATH, ParseStatus, INVALID, DIRTY, OK, isAborted, isDirty, isValid2, isAsync;
var init_parseUtil = __esm({
  "node_modules/zod/v3/helpers/parseUtil.js"() {
    init_errors2();
    init_en();
    makeIssue = (params) => {
      const { data, path, errorMaps, issueData } = params;
      const fullPath = [...path, ...issueData.path || []];
      const fullIssue = {
        ...issueData,
        path: fullPath
      };
      if (issueData.message !== void 0) {
        return {
          ...issueData,
          path: fullPath,
          message: issueData.message
        };
      }
      let errorMessage = "";
      const maps = errorMaps.filter((m) => !!m).slice().reverse();
      for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
      }
      return {
        ...issueData,
        path: fullPath,
        message: errorMessage
      };
    };
    EMPTY_PATH = [];
    ParseStatus = class _ParseStatus {
      constructor() {
        this.value = "valid";
      }
      dirty() {
        if (this.value === "valid")
          this.value = "dirty";
      }
      abort() {
        if (this.value !== "aborted")
          this.value = "aborted";
      }
      static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
          if (s.status === "aborted")
            return INVALID;
          if (s.status === "dirty")
            status.dirty();
          arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
      }
      static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value
          });
        }
        return _ParseStatus.mergeObjectSync(status, syncPairs);
      }
      static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
          const { key, value } = pair;
          if (key.status === "aborted")
            return INVALID;
          if (value.status === "aborted")
            return INVALID;
          if (key.status === "dirty")
            status.dirty();
          if (value.status === "dirty")
            status.dirty();
          if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
            finalObject[key.value] = value.value;
          }
        }
        return { status: status.value, value: finalObject };
      }
    };
    INVALID = Object.freeze({
      status: "aborted"
    });
    DIRTY = (value) => ({ status: "dirty", value });
    OK = (value) => ({ status: "valid", value });
    isAborted = (x) => x.status === "aborted";
    isDirty = (x) => x.status === "dirty";
    isValid2 = (x) => x.status === "valid";
    isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
  }
});

// node_modules/zod/v3/helpers/typeAliases.js
var init_typeAliases = __esm({
  "node_modules/zod/v3/helpers/typeAliases.js"() {
  }
});

// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
var init_errorUtil = __esm({
  "node_modules/zod/v3/helpers/errorUtil.js"() {
    (function(errorUtil2) {
      errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
      errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
    })(errorUtil || (errorUtil = {}));
  }
});

// node_modules/zod/v3/types.js
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var ParseInputLazyPath, handleResult, ZodType, cuidRegex, cuid2Regex, ulidRegex, uuidRegex, nanoidRegex, jwtRegex, durationRegex, emailRegex, _emojiRegex, emojiRegex, ipv4Regex, ipv4CidrRegex, ipv6Regex, ipv6CidrRegex, base64Regex, base64urlRegex, dateRegexSource, dateRegex, ZodString, ZodNumber, ZodBigInt, ZodBoolean, ZodDate, ZodSymbol, ZodUndefined, ZodNull, ZodAny, ZodUnknown, ZodNever, ZodVoid, ZodArray, ZodObject, ZodUnion, getDiscriminator, ZodDiscriminatedUnion, ZodIntersection, ZodTuple, ZodRecord, ZodMap, ZodSet, ZodFunction, ZodLazy, ZodLiteral, ZodEnum, ZodNativeEnum, ZodPromise, ZodEffects, ZodOptional, ZodNullable, ZodDefault, ZodCatch, ZodNaN, BRAND, ZodBranded, ZodPipeline, ZodReadonly, late, ZodFirstPartyTypeKind, instanceOfType, stringType, numberType, nanType, bigIntType, booleanType, dateType, symbolType, undefinedType, nullType, anyType, unknownType, neverType, voidType, arrayType, objectType, strictObjectType, unionType, discriminatedUnionType, intersectionType, tupleType, recordType, mapType, setType, functionType, lazyType, literalType, enumType, nativeEnumType, promiseType, effectsType, optionalType, nullableType, preprocessType, pipelineType, ostring, onumber, oboolean, coerce, NEVER;
var init_types = __esm({
  "node_modules/zod/v3/types.js"() {
    init_ZodError();
    init_errors2();
    init_errorUtil();
    init_parseUtil();
    init_util4();
    ParseInputLazyPath = class {
      constructor(parent, value, path, key) {
        this._cachedPath = [];
        this.parent = parent;
        this.data = value;
        this._path = path;
        this._key = key;
      }
      get path() {
        if (!this._cachedPath.length) {
          if (Array.isArray(this._key)) {
            this._cachedPath.push(...this._path, ...this._key);
          } else {
            this._cachedPath.push(...this._path, this._key);
          }
        }
        return this._cachedPath;
      }
    };
    handleResult = (ctx, result) => {
      if (isValid2(result)) {
        return { success: true, data: result.value };
      } else {
        if (!ctx.common.issues.length) {
          throw new Error("Validation failed but no issues detected.");
        }
        return {
          success: false,
          get error() {
            if (this._error)
              return this._error;
            const error = new ZodError(ctx.common.issues);
            this._error = error;
            return this._error;
          }
        };
      }
    };
    ZodType = class {
      get description() {
        return this._def.description;
      }
      _getType(input2) {
        return getParsedType(input2.data);
      }
      _getOrReturnCtx(input2, ctx) {
        return ctx || {
          common: input2.parent.common,
          data: input2.data,
          parsedType: getParsedType(input2.data),
          schemaErrorMap: this._def.errorMap,
          path: input2.path,
          parent: input2.parent
        };
      }
      _processInputParams(input2) {
        return {
          status: new ParseStatus(),
          ctx: {
            common: input2.parent.common,
            data: input2.data,
            parsedType: getParsedType(input2.data),
            schemaErrorMap: this._def.errorMap,
            path: input2.path,
            parent: input2.parent
          }
        };
      }
      _parseSync(input2) {
        const result = this._parse(input2);
        if (isAsync(result)) {
          throw new Error("Synchronous parse encountered promise.");
        }
        return result;
      }
      _parseAsync(input2) {
        const result = this._parse(input2);
        return Promise.resolve(result);
      }
      parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      safeParse(data, params) {
        const ctx = {
          common: {
            issues: [],
            async: params?.async ?? false,
            contextualErrorMap: params?.errorMap
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
      }
      "~validate"(data) {
        const ctx = {
          common: {
            issues: [],
            async: !!this["~standard"].async
          },
          path: [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        if (!this["~standard"].async) {
          try {
            const result = this._parseSync({ data, path: [], parent: ctx });
            return isValid2(result) ? {
              value: result.value
            } : {
              issues: ctx.common.issues
            };
          } catch (err) {
            if (err?.message?.toLowerCase()?.includes("encountered")) {
              this["~standard"].async = true;
            }
            ctx.common = {
              issues: [],
              async: true
            };
          }
        }
        return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid2(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        });
      }
      async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      async safeParseAsync(data, params) {
        const ctx = {
          common: {
            issues: [],
            contextualErrorMap: params?.errorMap,
            async: true
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
      }
      refine(check, message) {
        const getIssueProperties = (val) => {
          if (typeof message === "string" || typeof message === "undefined") {
            return { message };
          } else if (typeof message === "function") {
            return message(val);
          } else {
            return message;
          }
        };
        return this._refinement((val, ctx) => {
          const result = check(val);
          const setError = () => ctx.addIssue({
            code: ZodIssueCode.custom,
            ...getIssueProperties(val)
          });
          if (typeof Promise !== "undefined" && result instanceof Promise) {
            return result.then((data) => {
              if (!data) {
                setError();
                return false;
              } else {
                return true;
              }
            });
          }
          if (!result) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
          if (!check(val)) {
            ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
            return false;
          } else {
            return true;
          }
        });
      }
      _refinement(refinement) {
        return new ZodEffects({
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "refinement", refinement }
        });
      }
      superRefine(refinement) {
        return this._refinement(refinement);
      }
      constructor(def) {
        this.spa = this.safeParseAsync;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.readonly = this.readonly.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
        this["~standard"] = {
          version: 1,
          vendor: "zod",
          validate: (data) => this["~validate"](data)
        };
      }
      optional() {
        return ZodOptional.create(this, this._def);
      }
      nullable() {
        return ZodNullable.create(this, this._def);
      }
      nullish() {
        return this.nullable().optional();
      }
      array() {
        return ZodArray.create(this);
      }
      promise() {
        return ZodPromise.create(this, this._def);
      }
      or(option) {
        return ZodUnion.create([this, option], this._def);
      }
      and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
      }
      transform(transform) {
        return new ZodEffects({
          ...processCreateParams(this._def),
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "transform", transform }
        });
      }
      default(def) {
        const defaultValueFunc = typeof def === "function" ? def : () => def;
        return new ZodDefault({
          ...processCreateParams(this._def),
          innerType: this,
          defaultValue: defaultValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodDefault
        });
      }
      brand() {
        return new ZodBranded({
          typeName: ZodFirstPartyTypeKind.ZodBranded,
          type: this,
          ...processCreateParams(this._def)
        });
      }
      catch(def) {
        const catchValueFunc = typeof def === "function" ? def : () => def;
        return new ZodCatch({
          ...processCreateParams(this._def),
          innerType: this,
          catchValue: catchValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodCatch
        });
      }
      describe(description) {
        const This = this.constructor;
        return new This({
          ...this._def,
          description
        });
      }
      pipe(target) {
        return ZodPipeline.create(this, target);
      }
      readonly() {
        return ZodReadonly.create(this);
      }
      isOptional() {
        return this.safeParse(void 0).success;
      }
      isNullable() {
        return this.safeParse(null).success;
      }
    };
    cuidRegex = /^c[^\s-]{8,}$/i;
    cuid2Regex = /^[0-9a-z]+$/;
    ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
    uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    nanoidRegex = /^[a-z0-9_-]{21}$/i;
    jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
    emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
    _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
    ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
    ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
    ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
    base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
    dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
    dateRegex = new RegExp(`^${dateRegexSource}$`);
    ZodString = class _ZodString extends ZodType {
      _parse(input2) {
        if (this._def.coerce) {
          input2.data = String(input2.data);
        }
        const parsedType = this._getType(input2);
        if (parsedType !== ZodParsedType.string) {
          const ctx2 = this._getOrReturnCtx(input2);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.string,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input2.data.length < check.value) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input2.data.length > check.value) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "length") {
            const tooBig = input2.data.length > check.value;
            const tooSmall = input2.data.length < check.value;
            if (tooBig || tooSmall) {
              ctx = this._getOrReturnCtx(input2, ctx);
              if (tooBig) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_big,
                  maximum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              } else if (tooSmall) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_small,
                  minimum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              }
              status.dirty();
            }
          } else if (check.kind === "email") {
            if (!emailRegex.test(input2.data)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                validation: "email",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "emoji") {
            if (!emojiRegex) {
              emojiRegex = new RegExp(_emojiRegex, "u");
            }
            if (!emojiRegex.test(input2.data)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                validation: "emoji",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "uuid") {
            if (!uuidRegex.test(input2.data)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                validation: "uuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "nanoid") {
            if (!nanoidRegex.test(input2.data)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                validation: "nanoid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid") {
            if (!cuidRegex.test(input2.data)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                validation: "cuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid2") {
            if (!cuid2Regex.test(input2.data)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                validation: "cuid2",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ulid") {
            if (!ulidRegex.test(input2.data)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                validation: "ulid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "url") {
            try {
              new URL(input2.data);
            } catch {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                validation: "url",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "regex") {
            check.regex.lastIndex = 0;
            const testResult = check.regex.test(input2.data);
            if (!testResult) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                validation: "regex",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "trim") {
            input2.data = input2.data.trim();
          } else if (check.kind === "includes") {
            if (!input2.data.includes(check.value, check.position)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { includes: check.value, position: check.position },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "toLowerCase") {
            input2.data = input2.data.toLowerCase();
          } else if (check.kind === "toUpperCase") {
            input2.data = input2.data.toUpperCase();
          } else if (check.kind === "startsWith") {
            if (!input2.data.startsWith(check.value)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { startsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "endsWith") {
            if (!input2.data.endsWith(check.value)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { endsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "datetime") {
            const regex = datetimeRegex(check);
            if (!regex.test(input2.data)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "datetime",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "date") {
            const regex = dateRegex;
            if (!regex.test(input2.data)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "date",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "time") {
            const regex = timeRegex(check);
            if (!regex.test(input2.data)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "time",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "duration") {
            if (!durationRegex.test(input2.data)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                validation: "duration",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ip") {
            if (!isValidIP(input2.data, check.version)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                validation: "ip",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "jwt") {
            if (!isValidJWT(input2.data, check.alg)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                validation: "jwt",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cidr") {
            if (!isValidCidr(input2.data, check.version)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                validation: "cidr",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64") {
            if (!base64Regex.test(input2.data)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                validation: "base64",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64url") {
            if (!base64urlRegex.test(input2.data)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                validation: "base64url",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input2.data };
      }
      _regex(regex, validation, message) {
        return this.refinement((data) => regex.test(data), {
          validation,
          code: ZodIssueCode.invalid_string,
          ...errorUtil.errToObj(message)
        });
      }
      _addCheck(check) {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      email(message) {
        return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
      }
      url(message) {
        return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
      }
      emoji(message) {
        return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
      }
      uuid(message) {
        return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
      }
      nanoid(message) {
        return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
      }
      cuid(message) {
        return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
      }
      cuid2(message) {
        return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
      }
      ulid(message) {
        return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
      }
      base64(message) {
        return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
      }
      base64url(message) {
        return this._addCheck({
          kind: "base64url",
          ...errorUtil.errToObj(message)
        });
      }
      jwt(options) {
        return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
      }
      ip(options) {
        return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
      }
      cidr(options) {
        return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
      }
      datetime(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "datetime",
            precision: null,
            offset: false,
            local: false,
            message: options
          });
        }
        return this._addCheck({
          kind: "datetime",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          offset: options?.offset ?? false,
          local: options?.local ?? false,
          ...errorUtil.errToObj(options?.message)
        });
      }
      date(message) {
        return this._addCheck({ kind: "date", message });
      }
      time(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "time",
            precision: null,
            message: options
          });
        }
        return this._addCheck({
          kind: "time",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          ...errorUtil.errToObj(options?.message)
        });
      }
      duration(message) {
        return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
      }
      regex(regex, message) {
        return this._addCheck({
          kind: "regex",
          regex,
          ...errorUtil.errToObj(message)
        });
      }
      includes(value, options) {
        return this._addCheck({
          kind: "includes",
          value,
          position: options?.position,
          ...errorUtil.errToObj(options?.message)
        });
      }
      startsWith(value, message) {
        return this._addCheck({
          kind: "startsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      endsWith(value, message) {
        return this._addCheck({
          kind: "endsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      min(minLength, message) {
        return this._addCheck({
          kind: "min",
          value: minLength,
          ...errorUtil.errToObj(message)
        });
      }
      max(maxLength, message) {
        return this._addCheck({
          kind: "max",
          value: maxLength,
          ...errorUtil.errToObj(message)
        });
      }
      length(len, message) {
        return this._addCheck({
          kind: "length",
          value: len,
          ...errorUtil.errToObj(message)
        });
      }
      /**
       * Equivalent to `.min(1)`
       */
      nonempty(message) {
        return this.min(1, errorUtil.errToObj(message));
      }
      trim() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "trim" }]
        });
      }
      toLowerCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toLowerCase" }]
        });
      }
      toUpperCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toUpperCase" }]
        });
      }
      get isDatetime() {
        return !!this._def.checks.find((ch) => ch.kind === "datetime");
      }
      get isDate() {
        return !!this._def.checks.find((ch) => ch.kind === "date");
      }
      get isTime() {
        return !!this._def.checks.find((ch) => ch.kind === "time");
      }
      get isDuration() {
        return !!this._def.checks.find((ch) => ch.kind === "duration");
      }
      get isEmail() {
        return !!this._def.checks.find((ch) => ch.kind === "email");
      }
      get isURL() {
        return !!this._def.checks.find((ch) => ch.kind === "url");
      }
      get isEmoji() {
        return !!this._def.checks.find((ch) => ch.kind === "emoji");
      }
      get isUUID() {
        return !!this._def.checks.find((ch) => ch.kind === "uuid");
      }
      get isNANOID() {
        return !!this._def.checks.find((ch) => ch.kind === "nanoid");
      }
      get isCUID() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid");
      }
      get isCUID2() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid2");
      }
      get isULID() {
        return !!this._def.checks.find((ch) => ch.kind === "ulid");
      }
      get isIP() {
        return !!this._def.checks.find((ch) => ch.kind === "ip");
      }
      get isCIDR() {
        return !!this._def.checks.find((ch) => ch.kind === "cidr");
      }
      get isBase64() {
        return !!this._def.checks.find((ch) => ch.kind === "base64");
      }
      get isBase64url() {
        return !!this._def.checks.find((ch) => ch.kind === "base64url");
      }
      get minLength() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodString.create = (params) => {
      return new ZodString({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodString,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    ZodNumber = class _ZodNumber extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
      }
      _parse(input2) {
        if (this._def.coerce) {
          input2.data = Number(input2.data);
        }
        const parsedType = this._getType(input2);
        if (parsedType !== ZodParsedType.number) {
          const ctx2 = this._getOrReturnCtx(input2);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.number,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "int") {
            if (!util.isInteger(input2.data)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: "integer",
                received: "float",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "min") {
            const tooSmall = check.inclusive ? input2.data < check.value : input2.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input2.data > check.value : input2.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (floatSafeRemainder(input2.data, check.value) !== 0) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "finite") {
            if (!Number.isFinite(input2.data)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_finite,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input2.data };
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodNumber({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodNumber({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      int(message) {
        return this._addCheck({
          kind: "int",
          message: errorUtil.toString(message)
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      finite(message) {
        return this._addCheck({
          kind: "finite",
          message: errorUtil.toString(message)
        });
      }
      safe(message) {
        return this._addCheck({
          kind: "min",
          inclusive: true,
          value: Number.MIN_SAFE_INTEGER,
          message: errorUtil.toString(message)
        })._addCheck({
          kind: "max",
          inclusive: true,
          value: Number.MAX_SAFE_INTEGER,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
      get isInt() {
        return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
      }
      get isFinite() {
        let max = null;
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
            return true;
          } else if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          } else if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return Number.isFinite(min) && Number.isFinite(max);
      }
    };
    ZodNumber.create = (params) => {
      return new ZodNumber({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodNumber,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    ZodBigInt = class _ZodBigInt extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
      }
      _parse(input2) {
        if (this._def.coerce) {
          try {
            input2.data = BigInt(input2.data);
          } catch {
            return this._getInvalidInput(input2);
          }
        }
        const parsedType = this._getType(input2);
        if (parsedType !== ZodParsedType.bigint) {
          return this._getInvalidInput(input2);
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            const tooSmall = check.inclusive ? input2.data < check.value : input2.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                type: "bigint",
                minimum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input2.data > check.value : input2.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                type: "bigint",
                maximum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (input2.data % check.value !== BigInt(0)) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input2.data };
      }
      _getInvalidInput(input2) {
        const ctx = this._getOrReturnCtx(input2);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.bigint,
          received: ctx.parsedType
        });
        return INVALID;
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodBigInt({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodBigInt({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodBigInt.create = (params) => {
      return new ZodBigInt({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodBigInt,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    ZodBoolean = class extends ZodType {
      _parse(input2) {
        if (this._def.coerce) {
          input2.data = Boolean(input2.data);
        }
        const parsedType = this._getType(input2);
        if (parsedType !== ZodParsedType.boolean) {
          const ctx = this._getOrReturnCtx(input2);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.boolean,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input2.data);
      }
    };
    ZodBoolean.create = (params) => {
      return new ZodBoolean({
        typeName: ZodFirstPartyTypeKind.ZodBoolean,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    ZodDate = class _ZodDate extends ZodType {
      _parse(input2) {
        if (this._def.coerce) {
          input2.data = new Date(input2.data);
        }
        const parsedType = this._getType(input2);
        if (parsedType !== ZodParsedType.date) {
          const ctx2 = this._getOrReturnCtx(input2);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.date,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        if (Number.isNaN(input2.data.getTime())) {
          const ctx2 = this._getOrReturnCtx(input2);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_date
          });
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input2.data.getTime() < check.value) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                message: check.message,
                inclusive: true,
                exact: false,
                minimum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input2.data.getTime() > check.value) {
              ctx = this._getOrReturnCtx(input2, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                message: check.message,
                inclusive: true,
                exact: false,
                maximum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return {
          status: status.value,
          value: new Date(input2.data.getTime())
        };
      }
      _addCheck(check) {
        return new _ZodDate({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      min(minDate, message) {
        return this._addCheck({
          kind: "min",
          value: minDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      max(maxDate, message) {
        return this._addCheck({
          kind: "max",
          value: maxDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      get minDate() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min != null ? new Date(min) : null;
      }
      get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max != null ? new Date(max) : null;
      }
    };
    ZodDate.create = (params) => {
      return new ZodDate({
        checks: [],
        coerce: params?.coerce || false,
        typeName: ZodFirstPartyTypeKind.ZodDate,
        ...processCreateParams(params)
      });
    };
    ZodSymbol = class extends ZodType {
      _parse(input2) {
        const parsedType = this._getType(input2);
        if (parsedType !== ZodParsedType.symbol) {
          const ctx = this._getOrReturnCtx(input2);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.symbol,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input2.data);
      }
    };
    ZodSymbol.create = (params) => {
      return new ZodSymbol({
        typeName: ZodFirstPartyTypeKind.ZodSymbol,
        ...processCreateParams(params)
      });
    };
    ZodUndefined = class extends ZodType {
      _parse(input2) {
        const parsedType = this._getType(input2);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input2);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.undefined,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input2.data);
      }
    };
    ZodUndefined.create = (params) => {
      return new ZodUndefined({
        typeName: ZodFirstPartyTypeKind.ZodUndefined,
        ...processCreateParams(params)
      });
    };
    ZodNull = class extends ZodType {
      _parse(input2) {
        const parsedType = this._getType(input2);
        if (parsedType !== ZodParsedType.null) {
          const ctx = this._getOrReturnCtx(input2);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.null,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input2.data);
      }
    };
    ZodNull.create = (params) => {
      return new ZodNull({
        typeName: ZodFirstPartyTypeKind.ZodNull,
        ...processCreateParams(params)
      });
    };
    ZodAny = class extends ZodType {
      constructor() {
        super(...arguments);
        this._any = true;
      }
      _parse(input2) {
        return OK(input2.data);
      }
    };
    ZodAny.create = (params) => {
      return new ZodAny({
        typeName: ZodFirstPartyTypeKind.ZodAny,
        ...processCreateParams(params)
      });
    };
    ZodUnknown = class extends ZodType {
      constructor() {
        super(...arguments);
        this._unknown = true;
      }
      _parse(input2) {
        return OK(input2.data);
      }
    };
    ZodUnknown.create = (params) => {
      return new ZodUnknown({
        typeName: ZodFirstPartyTypeKind.ZodUnknown,
        ...processCreateParams(params)
      });
    };
    ZodNever = class extends ZodType {
      _parse(input2) {
        const ctx = this._getOrReturnCtx(input2);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.never,
          received: ctx.parsedType
        });
        return INVALID;
      }
    };
    ZodNever.create = (params) => {
      return new ZodNever({
        typeName: ZodFirstPartyTypeKind.ZodNever,
        ...processCreateParams(params)
      });
    };
    ZodVoid = class extends ZodType {
      _parse(input2) {
        const parsedType = this._getType(input2);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input2);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.void,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input2.data);
      }
    };
    ZodVoid.create = (params) => {
      return new ZodVoid({
        typeName: ZodFirstPartyTypeKind.ZodVoid,
        ...processCreateParams(params)
      });
    };
    ZodArray = class _ZodArray extends ZodType {
      _parse(input2) {
        const { ctx, status } = this._processInputParams(input2);
        const def = this._def;
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (def.exactLength !== null) {
          const tooBig = ctx.data.length > def.exactLength.value;
          const tooSmall = ctx.data.length < def.exactLength.value;
          if (tooBig || tooSmall) {
            addIssueToContext(ctx, {
              code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
              minimum: tooSmall ? def.exactLength.value : void 0,
              maximum: tooBig ? def.exactLength.value : void 0,
              type: "array",
              inclusive: true,
              exact: true,
              message: def.exactLength.message
            });
            status.dirty();
          }
        }
        if (def.minLength !== null) {
          if (ctx.data.length < def.minLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.minLength.message
            });
            status.dirty();
          }
        }
        if (def.maxLength !== null) {
          if (ctx.data.length > def.maxLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.maxLength.message
            });
            status.dirty();
          }
        }
        if (ctx.common.async) {
          return Promise.all([...ctx.data].map((item, i) => {
            return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
          })).then((result2) => {
            return ParseStatus.mergeArray(status, result2);
          });
        }
        const result = [...ctx.data].map((item, i) => {
          return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return ParseStatus.mergeArray(status, result);
      }
      get element() {
        return this._def.type;
      }
      min(minLength, message) {
        return new _ZodArray({
          ...this._def,
          minLength: { value: minLength, message: errorUtil.toString(message) }
        });
      }
      max(maxLength, message) {
        return new _ZodArray({
          ...this._def,
          maxLength: { value: maxLength, message: errorUtil.toString(message) }
        });
      }
      length(len, message) {
        return new _ZodArray({
          ...this._def,
          exactLength: { value: len, message: errorUtil.toString(message) }
        });
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodArray.create = (schema, params) => {
      return new ZodArray({
        type: schema,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: ZodFirstPartyTypeKind.ZodArray,
        ...processCreateParams(params)
      });
    };
    ZodObject = class _ZodObject extends ZodType {
      constructor() {
        super(...arguments);
        this._cached = null;
        this.nonstrict = this.passthrough;
        this.augment = this.extend;
      }
      _getCached() {
        if (this._cached !== null)
          return this._cached;
        const shape = this._def.shape();
        const keys = util.objectKeys(shape);
        this._cached = { shape, keys };
        return this._cached;
      }
      _parse(input2) {
        const parsedType = this._getType(input2);
        if (parsedType !== ZodParsedType.object) {
          const ctx2 = this._getOrReturnCtx(input2);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        const { status, ctx } = this._processInputParams(input2);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
          for (const key in ctx.data) {
            if (!shapeKeys.includes(key)) {
              extraKeys.push(key);
            }
          }
        }
        const pairs = [];
        for (const key of shapeKeys) {
          const keyValidator = shape[key];
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (this._def.catchall instanceof ZodNever) {
          const unknownKeys = this._def.unknownKeys;
          if (unknownKeys === "passthrough") {
            for (const key of extraKeys) {
              pairs.push({
                key: { status: "valid", value: key },
                value: { status: "valid", value: ctx.data[key] }
              });
            }
          } else if (unknownKeys === "strict") {
            if (extraKeys.length > 0) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.unrecognized_keys,
                keys: extraKeys
              });
              status.dirty();
            }
          } else if (unknownKeys === "strip") {
          } else {
            throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
          }
        } else {
          const catchall = this._def.catchall;
          for (const key of extraKeys) {
            const value = ctx.data[key];
            pairs.push({
              key: { status: "valid", value: key },
              value: catchall._parse(
                new ParseInputLazyPath(ctx, value, ctx.path, key)
                //, ctx.child(key), value, getParsedType(value)
              ),
              alwaysSet: key in ctx.data
            });
          }
        }
        if (ctx.common.async) {
          return Promise.resolve().then(async () => {
            const syncPairs = [];
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              syncPairs.push({
                key,
                value,
                alwaysSet: pair.alwaysSet
              });
            }
            return syncPairs;
          }).then((syncPairs) => {
            return ParseStatus.mergeObjectSync(status, syncPairs);
          });
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get shape() {
        return this._def.shape();
      }
      strict(message) {
        errorUtil.errToObj;
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strict",
          ...message !== void 0 ? {
            errorMap: (issue, ctx) => {
              const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
              if (issue.code === "unrecognized_keys")
                return {
                  message: errorUtil.errToObj(message).message ?? defaultError
                };
              return {
                message: defaultError
              };
            }
          } : {}
        });
      }
      strip() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strip"
        });
      }
      passthrough() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "passthrough"
        });
      }
      // const AugmentFactory =
      //   <Def extends ZodObjectDef>(def: Def) =>
      //   <Augmentation extends ZodRawShape>(
      //     augmentation: Augmentation
      //   ): ZodObject<
      //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
      //     Def["unknownKeys"],
      //     Def["catchall"]
      //   > => {
      //     return new ZodObject({
      //       ...def,
      //       shape: () => ({
      //         ...def.shape(),
      //         ...augmentation,
      //       }),
      //     }) as any;
      //   };
      extend(augmentation) {
        return new _ZodObject({
          ...this._def,
          shape: () => ({
            ...this._def.shape(),
            ...augmentation
          })
        });
      }
      /**
       * Prior to zod@1.0.12 there was a bug in the
       * inferred type of merged objects. Please
       * upgrade if you are experiencing issues.
       */
      merge(merging) {
        const merged = new _ZodObject({
          unknownKeys: merging._def.unknownKeys,
          catchall: merging._def.catchall,
          shape: () => ({
            ...this._def.shape(),
            ...merging._def.shape()
          }),
          typeName: ZodFirstPartyTypeKind.ZodObject
        });
        return merged;
      }
      // merge<
      //   Incoming extends AnyZodObject,
      //   Augmentation extends Incoming["shape"],
      //   NewOutput extends {
      //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
      //       ? Augmentation[k]["_output"]
      //       : k extends keyof Output
      //       ? Output[k]
      //       : never;
      //   },
      //   NewInput extends {
      //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
      //       ? Augmentation[k]["_input"]
      //       : k extends keyof Input
      //       ? Input[k]
      //       : never;
      //   }
      // >(
      //   merging: Incoming
      // ): ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"],
      //   NewOutput,
      //   NewInput
      // > {
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      setKey(key, schema) {
        return this.augment({ [key]: schema });
      }
      // merge<Incoming extends AnyZodObject>(
      //   merging: Incoming
      // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
      // ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"]
      // > {
      //   // const mergedShape = objectUtil.mergeShapes(
      //   //   this._def.shape(),
      //   //   merging._def.shape()
      //   // );
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      catchall(index) {
        return new _ZodObject({
          ...this._def,
          catchall: index
        });
      }
      pick(mask) {
        const shape = {};
        for (const key of util.objectKeys(mask)) {
          if (mask[key] && this.shape[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      omit(mask) {
        const shape = {};
        for (const key of util.objectKeys(this.shape)) {
          if (!mask[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      /**
       * @deprecated
       */
      deepPartial() {
        return deepPartialify(this);
      }
      partial(mask) {
        const newShape = {};
        for (const key of util.objectKeys(this.shape)) {
          const fieldSchema = this.shape[key];
          if (mask && !mask[key]) {
            newShape[key] = fieldSchema;
          } else {
            newShape[key] = fieldSchema.optional();
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      required(mask) {
        const newShape = {};
        for (const key of util.objectKeys(this.shape)) {
          if (mask && !mask[key]) {
            newShape[key] = this.shape[key];
          } else {
            const fieldSchema = this.shape[key];
            let newField = fieldSchema;
            while (newField instanceof ZodOptional) {
              newField = newField._def.innerType;
            }
            newShape[key] = newField;
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      keyof() {
        return createZodEnum(util.objectKeys(this.shape));
      }
    };
    ZodObject.create = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.strictCreate = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strict",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.lazycreate = (shape, params) => {
      return new ZodObject({
        shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodUnion = class extends ZodType {
      _parse(input2) {
        const { ctx } = this._processInputParams(input2);
        const options = this._def.options;
        function handleResults(results) {
          for (const result of results) {
            if (result.result.status === "valid") {
              return result.result;
            }
          }
          for (const result of results) {
            if (result.result.status === "dirty") {
              ctx.common.issues.push(...result.ctx.common.issues);
              return result.result;
            }
          }
          const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
        if (ctx.common.async) {
          return Promise.all(options.map(async (option) => {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            return {
              result: await option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: childCtx
              }),
              ctx: childCtx
            };
          })).then(handleResults);
        } else {
          let dirty = void 0;
          const issues = [];
          for (const option of options) {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            const result = option._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx
            });
            if (result.status === "valid") {
              return result;
            } else if (result.status === "dirty" && !dirty) {
              dirty = { result, ctx: childCtx };
            }
            if (childCtx.common.issues.length) {
              issues.push(childCtx.common.issues);
            }
          }
          if (dirty) {
            ctx.common.issues.push(...dirty.ctx.common.issues);
            return dirty.result;
          }
          const unionErrors = issues.map((issues2) => new ZodError(issues2));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
      }
      get options() {
        return this._def.options;
      }
    };
    ZodUnion.create = (types, params) => {
      return new ZodUnion({
        options: types,
        typeName: ZodFirstPartyTypeKind.ZodUnion,
        ...processCreateParams(params)
      });
    };
    getDiscriminator = (type) => {
      if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
      } else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
      } else if (type instanceof ZodLiteral) {
        return [type.value];
      } else if (type instanceof ZodEnum) {
        return type.options;
      } else if (type instanceof ZodNativeEnum) {
        return util.objectValues(type.enum);
      } else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
      } else if (type instanceof ZodUndefined) {
        return [void 0];
      } else if (type instanceof ZodNull) {
        return [null];
      } else if (type instanceof ZodOptional) {
        return [void 0, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodNullable) {
        return [null, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodBranded) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodReadonly) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodCatch) {
        return getDiscriminator(type._def.innerType);
      } else {
        return [];
      }
    };
    ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
      _parse(input2) {
        const { ctx } = this._processInputParams(input2);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union_discriminator,
            options: Array.from(this.optionsMap.keys()),
            path: [discriminator]
          });
          return INVALID;
        }
        if (ctx.common.async) {
          return option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        } else {
          return option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        }
      }
      get discriminator() {
        return this._def.discriminator;
      }
      get options() {
        return this._def.options;
      }
      get optionsMap() {
        return this._def.optionsMap;
      }
      /**
       * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
       * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
       * have a different value for each object in the union.
       * @param discriminator the name of the discriminator property
       * @param types an array of object schemas
       * @param params
       */
      static create(discriminator, options, params) {
        const optionsMap = /* @__PURE__ */ new Map();
        for (const type of options) {
          const discriminatorValues = getDiscriminator(type.shape[discriminator]);
          if (!discriminatorValues.length) {
            throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
          }
          for (const value of discriminatorValues) {
            if (optionsMap.has(value)) {
              throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
            }
            optionsMap.set(value, type);
          }
        }
        return new _ZodDiscriminatedUnion({
          typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
          discriminator,
          options,
          optionsMap,
          ...processCreateParams(params)
        });
      }
    };
    ZodIntersection = class extends ZodType {
      _parse(input2) {
        const { status, ctx } = this._processInputParams(input2);
        const handleParsed = (parsedLeft, parsedRight) => {
          if (isAborted(parsedLeft) || isAborted(parsedRight)) {
            return INVALID;
          }
          const merged = mergeValues(parsedLeft.value, parsedRight.value);
          if (!merged.valid) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_intersection_types
            });
            return INVALID;
          }
          if (isDirty(parsedLeft) || isDirty(parsedRight)) {
            status.dirty();
          }
          return { status: status.value, value: merged.data };
        };
        if (ctx.common.async) {
          return Promise.all([
            this._def.left._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            }),
            this._def.right._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            })
          ]).then(([left, right]) => handleParsed(left, right));
        } else {
          return handleParsed(this._def.left._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }), this._def.right._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }));
        }
      }
    };
    ZodIntersection.create = (left, right, params) => {
      return new ZodIntersection({
        left,
        right,
        typeName: ZodFirstPartyTypeKind.ZodIntersection,
        ...processCreateParams(params)
      });
    };
    ZodTuple = class _ZodTuple extends ZodType {
      _parse(input2) {
        const { status, ctx } = this._processInputParams(input2);
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          return INVALID;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          status.dirty();
        }
        const items = [...ctx.data].map((item, itemIndex) => {
          const schema = this._def.items[itemIndex] || this._def.rest;
          if (!schema)
            return null;
          return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        }).filter((x) => !!x);
        if (ctx.common.async) {
          return Promise.all(items).then((results) => {
            return ParseStatus.mergeArray(status, results);
          });
        } else {
          return ParseStatus.mergeArray(status, items);
        }
      }
      get items() {
        return this._def.items;
      }
      rest(rest) {
        return new _ZodTuple({
          ...this._def,
          rest
        });
      }
    };
    ZodTuple.create = (schemas, params) => {
      if (!Array.isArray(schemas)) {
        throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
      }
      return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params)
      });
    };
    ZodRecord = class _ZodRecord extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input2) {
        const { status, ctx } = this._processInputParams(input2);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for (const key in ctx.data) {
          pairs.push({
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
            value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (ctx.common.async) {
          return ParseStatus.mergeObjectAsync(status, pairs);
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get element() {
        return this._def.valueType;
      }
      static create(first, second, third) {
        if (second instanceof ZodType) {
          return new _ZodRecord({
            keyType: first,
            valueType: second,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(third)
          });
        }
        return new _ZodRecord({
          keyType: ZodString.create(),
          valueType: first,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(second)
        });
      }
    };
    ZodMap = class extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input2) {
        const { status, ctx } = this._processInputParams(input2);
        if (ctx.parsedType !== ZodParsedType.map) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.map,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [...ctx.data.entries()].map(([key, value], index) => {
          return {
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
            value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
          };
        });
        if (ctx.common.async) {
          const finalMap = /* @__PURE__ */ new Map();
          return Promise.resolve().then(async () => {
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              if (key.status === "aborted" || value.status === "aborted") {
                return INVALID;
              }
              if (key.status === "dirty" || value.status === "dirty") {
                status.dirty();
              }
              finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
          });
        } else {
          const finalMap = /* @__PURE__ */ new Map();
          for (const pair of pairs) {
            const key = pair.key;
            const value = pair.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
        }
      }
    };
    ZodMap.create = (keyType, valueType, params) => {
      return new ZodMap({
        valueType,
        keyType,
        typeName: ZodFirstPartyTypeKind.ZodMap,
        ...processCreateParams(params)
      });
    };
    ZodSet = class _ZodSet extends ZodType {
      _parse(input2) {
        const { status, ctx } = this._processInputParams(input2);
        if (ctx.parsedType !== ZodParsedType.set) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.set,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const def = this._def;
        if (def.minSize !== null) {
          if (ctx.data.size < def.minSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.minSize.message
            });
            status.dirty();
          }
        }
        if (def.maxSize !== null) {
          if (ctx.data.size > def.maxSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.maxSize.message
            });
            status.dirty();
          }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements2) {
          const parsedSet = /* @__PURE__ */ new Set();
          for (const element of elements2) {
            if (element.status === "aborted")
              return INVALID;
            if (element.status === "dirty")
              status.dirty();
            parsedSet.add(element.value);
          }
          return { status: status.value, value: parsedSet };
        }
        const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
          return Promise.all(elements).then((elements2) => finalizeSet(elements2));
        } else {
          return finalizeSet(elements);
        }
      }
      min(minSize, message) {
        return new _ZodSet({
          ...this._def,
          minSize: { value: minSize, message: errorUtil.toString(message) }
        });
      }
      max(maxSize, message) {
        return new _ZodSet({
          ...this._def,
          maxSize: { value: maxSize, message: errorUtil.toString(message) }
        });
      }
      size(size, message) {
        return this.min(size, message).max(size, message);
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodSet.create = (valueType, params) => {
      return new ZodSet({
        valueType,
        minSize: null,
        maxSize: null,
        typeName: ZodFirstPartyTypeKind.ZodSet,
        ...processCreateParams(params)
      });
    };
    ZodFunction = class _ZodFunction extends ZodType {
      constructor() {
        super(...arguments);
        this.validate = this.implement;
      }
      _parse(input2) {
        const { ctx } = this._processInputParams(input2);
        if (ctx.parsedType !== ZodParsedType.function) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.function,
            received: ctx.parsedType
          });
          return INVALID;
        }
        function makeArgsIssue(args, error) {
          return makeIssue({
            data: args,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_arguments,
              argumentsError: error
            }
          });
        }
        function makeReturnsIssue(returns, error) {
          return makeIssue({
            data: returns,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_return_type,
              returnTypeError: error
            }
          });
        }
        const params = { errorMap: ctx.common.contextualErrorMap };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
          const me = this;
          return OK(async function(...args) {
            const error = new ZodError([]);
            const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
              error.addIssue(makeArgsIssue(args, e));
              throw error;
            });
            const result = await Reflect.apply(fn, this, parsedArgs);
            const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
              error.addIssue(makeReturnsIssue(result, e));
              throw error;
            });
            return parsedReturns;
          });
        } else {
          const me = this;
          return OK(function(...args) {
            const parsedArgs = me._def.args.safeParse(args, params);
            if (!parsedArgs.success) {
              throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
            }
            const result = Reflect.apply(fn, this, parsedArgs.data);
            const parsedReturns = me._def.returns.safeParse(result, params);
            if (!parsedReturns.success) {
              throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
            }
            return parsedReturns.data;
          });
        }
      }
      parameters() {
        return this._def.args;
      }
      returnType() {
        return this._def.returns;
      }
      args(...items) {
        return new _ZodFunction({
          ...this._def,
          args: ZodTuple.create(items).rest(ZodUnknown.create())
        });
      }
      returns(returnType) {
        return new _ZodFunction({
          ...this._def,
          returns: returnType
        });
      }
      implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      static create(args, returns, params) {
        return new _ZodFunction({
          args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
          returns: returns || ZodUnknown.create(),
          typeName: ZodFirstPartyTypeKind.ZodFunction,
          ...processCreateParams(params)
        });
      }
    };
    ZodLazy = class extends ZodType {
      get schema() {
        return this._def.getter();
      }
      _parse(input2) {
        const { ctx } = this._processInputParams(input2);
        const lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
      }
    };
    ZodLazy.create = (getter, params) => {
      return new ZodLazy({
        getter,
        typeName: ZodFirstPartyTypeKind.ZodLazy,
        ...processCreateParams(params)
      });
    };
    ZodLiteral = class extends ZodType {
      _parse(input2) {
        if (input2.data !== this._def.value) {
          const ctx = this._getOrReturnCtx(input2);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_literal,
            expected: this._def.value
          });
          return INVALID;
        }
        return { status: "valid", value: input2.data };
      }
      get value() {
        return this._def.value;
      }
    };
    ZodLiteral.create = (value, params) => {
      return new ZodLiteral({
        value,
        typeName: ZodFirstPartyTypeKind.ZodLiteral,
        ...processCreateParams(params)
      });
    };
    ZodEnum = class _ZodEnum extends ZodType {
      _parse(input2) {
        if (typeof input2.data !== "string") {
          const ctx = this._getOrReturnCtx(input2);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            expected: util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(this._def.values);
        }
        if (!this._cache.has(input2.data)) {
          const ctx = this._getOrReturnCtx(input2);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input2.data);
      }
      get options() {
        return this._def.values;
      }
      get enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      extract(values, newDef = this._def) {
        return _ZodEnum.create(values, {
          ...this._def,
          ...newDef
        });
      }
      exclude(values, newDef = this._def) {
        return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
          ...this._def,
          ...newDef
        });
      }
    };
    ZodEnum.create = createZodEnum;
    ZodNativeEnum = class extends ZodType {
      _parse(input2) {
        const nativeEnumValues = util.getValidEnumValues(this._def.values);
        const ctx = this._getOrReturnCtx(input2);
        if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
          const expectedValues = util.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            expected: util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(util.getValidEnumValues(this._def.values));
        }
        if (!this._cache.has(input2.data)) {
          const expectedValues = util.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input2.data);
      }
      get enum() {
        return this._def.values;
      }
    };
    ZodNativeEnum.create = (values, params) => {
      return new ZodNativeEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
        ...processCreateParams(params)
      });
    };
    ZodPromise = class extends ZodType {
      unwrap() {
        return this._def.type;
      }
      _parse(input2) {
        const { ctx } = this._processInputParams(input2);
        if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.promise,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
        return OK(promisified.then((data) => {
          return this._def.type.parseAsync(data, {
            path: ctx.path,
            errorMap: ctx.common.contextualErrorMap
          });
        }));
      }
    };
    ZodPromise.create = (schema, params) => {
      return new ZodPromise({
        type: schema,
        typeName: ZodFirstPartyTypeKind.ZodPromise,
        ...processCreateParams(params)
      });
    };
    ZodEffects = class extends ZodType {
      innerType() {
        return this._def.schema;
      }
      sourceType() {
        return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
      }
      _parse(input2) {
        const { status, ctx } = this._processInputParams(input2);
        const effect = this._def.effect || null;
        const checkCtx = {
          addIssue: (arg) => {
            addIssueToContext(ctx, arg);
            if (arg.fatal) {
              status.abort();
            } else {
              status.dirty();
            }
          },
          get path() {
            return ctx.path;
          }
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
          const processed = effect.transform(ctx.data, checkCtx);
          if (ctx.common.async) {
            return Promise.resolve(processed).then(async (processed2) => {
              if (status.value === "aborted")
                return INVALID;
              const result = await this._def.schema._parseAsync({
                data: processed2,
                path: ctx.path,
                parent: ctx
              });
              if (result.status === "aborted")
                return INVALID;
              if (result.status === "dirty")
                return DIRTY(result.value);
              if (status.value === "dirty")
                return DIRTY(result.value);
              return result;
            });
          } else {
            if (status.value === "aborted")
              return INVALID;
            const result = this._def.schema._parseSync({
              data: processed,
              path: ctx.path,
              parent: ctx
            });
            if (result.status === "aborted")
              return INVALID;
            if (result.status === "dirty")
              return DIRTY(result.value);
            if (status.value === "dirty")
              return DIRTY(result.value);
            return result;
          }
        }
        if (effect.type === "refinement") {
          const executeRefinement = (acc) => {
            const result = effect.refinement(acc, checkCtx);
            if (ctx.common.async) {
              return Promise.resolve(result);
            }
            if (result instanceof Promise) {
              throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
            }
            return acc;
          };
          if (ctx.common.async === false) {
            const inner = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inner.status === "aborted")
              return INVALID;
            if (inner.status === "dirty")
              status.dirty();
            executeRefinement(inner.value);
            return { status: status.value, value: inner.value };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
              if (inner.status === "aborted")
                return INVALID;
              if (inner.status === "dirty")
                status.dirty();
              return executeRefinement(inner.value).then(() => {
                return { status: status.value, value: inner.value };
              });
            });
          }
        }
        if (effect.type === "transform") {
          if (ctx.common.async === false) {
            const base = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (!isValid2(base))
              return INVALID;
            const result = effect.transform(base.value, checkCtx);
            if (result instanceof Promise) {
              throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
            }
            return { status: status.value, value: result };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
              if (!isValid2(base))
                return INVALID;
              return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
                status: status.value,
                value: result
              }));
            });
          }
        }
        util.assertNever(effect);
      }
    };
    ZodEffects.create = (schema, effect, params) => {
      return new ZodEffects({
        schema,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect,
        ...processCreateParams(params)
      });
    };
    ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
      return new ZodEffects({
        schema,
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params)
      });
    };
    ZodOptional = class extends ZodType {
      _parse(input2) {
        const parsedType = this._getType(input2);
        if (parsedType === ZodParsedType.undefined) {
          return OK(void 0);
        }
        return this._def.innerType._parse(input2);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodOptional.create = (type, params) => {
      return new ZodOptional({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodOptional,
        ...processCreateParams(params)
      });
    };
    ZodNullable = class extends ZodType {
      _parse(input2) {
        const parsedType = this._getType(input2);
        if (parsedType === ZodParsedType.null) {
          return OK(null);
        }
        return this._def.innerType._parse(input2);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodNullable.create = (type, params) => {
      return new ZodNullable({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodNullable,
        ...processCreateParams(params)
      });
    };
    ZodDefault = class extends ZodType {
      _parse(input2) {
        const { ctx } = this._processInputParams(input2);
        let data = ctx.data;
        if (ctx.parsedType === ZodParsedType.undefined) {
          data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      removeDefault() {
        return this._def.innerType;
      }
    };
    ZodDefault.create = (type, params) => {
      return new ZodDefault({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodDefault,
        defaultValue: typeof params.default === "function" ? params.default : () => params.default,
        ...processCreateParams(params)
      });
    };
    ZodCatch = class extends ZodType {
      _parse(input2) {
        const { ctx } = this._processInputParams(input2);
        const newCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          }
        };
        const result = this._def.innerType._parse({
          data: newCtx.data,
          path: newCtx.path,
          parent: {
            ...newCtx
          }
        });
        if (isAsync(result)) {
          return result.then((result2) => {
            return {
              status: "valid",
              value: result2.status === "valid" ? result2.value : this._def.catchValue({
                get error() {
                  return new ZodError(newCtx.common.issues);
                },
                input: newCtx.data
              })
            };
          });
        } else {
          return {
            status: "valid",
            value: result.status === "valid" ? result.value : this._def.catchValue({
              get error() {
                return new ZodError(newCtx.common.issues);
              },
              input: newCtx.data
            })
          };
        }
      }
      removeCatch() {
        return this._def.innerType;
      }
    };
    ZodCatch.create = (type, params) => {
      return new ZodCatch({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodCatch,
        catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
        ...processCreateParams(params)
      });
    };
    ZodNaN = class extends ZodType {
      _parse(input2) {
        const parsedType = this._getType(input2);
        if (parsedType !== ZodParsedType.nan) {
          const ctx = this._getOrReturnCtx(input2);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.nan,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return { status: "valid", value: input2.data };
      }
    };
    ZodNaN.create = (params) => {
      return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params)
      });
    };
    BRAND = /* @__PURE__ */ Symbol("zod_brand");
    ZodBranded = class extends ZodType {
      _parse(input2) {
        const { ctx } = this._processInputParams(input2);
        const data = ctx.data;
        return this._def.type._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      unwrap() {
        return this._def.type;
      }
    };
    ZodPipeline = class _ZodPipeline extends ZodType {
      _parse(input2) {
        const { status, ctx } = this._processInputParams(input2);
        if (ctx.common.async) {
          const handleAsync = async () => {
            const inResult = await this._def.in._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inResult.status === "aborted")
              return INVALID;
            if (inResult.status === "dirty") {
              status.dirty();
              return DIRTY(inResult.value);
            } else {
              return this._def.out._parseAsync({
                data: inResult.value,
                path: ctx.path,
                parent: ctx
              });
            }
          };
          return handleAsync();
        } else {
          const inResult = this._def.in._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inResult.status === "aborted")
            return INVALID;
          if (inResult.status === "dirty") {
            status.dirty();
            return {
              status: "dirty",
              value: inResult.value
            };
          } else {
            return this._def.out._parseSync({
              data: inResult.value,
              path: ctx.path,
              parent: ctx
            });
          }
        }
      }
      static create(a, b) {
        return new _ZodPipeline({
          in: a,
          out: b,
          typeName: ZodFirstPartyTypeKind.ZodPipeline
        });
      }
    };
    ZodReadonly = class extends ZodType {
      _parse(input2) {
        const result = this._def.innerType._parse(input2);
        const freeze = (data) => {
          if (isValid2(data)) {
            data.value = Object.freeze(data.value);
          }
          return data;
        };
        return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodReadonly.create = (type, params) => {
      return new ZodReadonly({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodReadonly,
        ...processCreateParams(params)
      });
    };
    late = {
      object: ZodObject.lazycreate
    };
    (function(ZodFirstPartyTypeKind2) {
      ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
      ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
      ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
      ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
      ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
      ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
      ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
      ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
      ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
      ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
      ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
      ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
      ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
      ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
      ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
      ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
      ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
      ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
      ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
      ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
      ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
      ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
      ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
      ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
      ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
      ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
      ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
      ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
      ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
      ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
      ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
      ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
      ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
      ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
      ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
      ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
    })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
    instanceOfType = (cls, params = {
      message: `Input not instance of ${cls.name}`
    }) => custom((data) => data instanceof cls, params);
    stringType = ZodString.create;
    numberType = ZodNumber.create;
    nanType = ZodNaN.create;
    bigIntType = ZodBigInt.create;
    booleanType = ZodBoolean.create;
    dateType = ZodDate.create;
    symbolType = ZodSymbol.create;
    undefinedType = ZodUndefined.create;
    nullType = ZodNull.create;
    anyType = ZodAny.create;
    unknownType = ZodUnknown.create;
    neverType = ZodNever.create;
    voidType = ZodVoid.create;
    arrayType = ZodArray.create;
    objectType = ZodObject.create;
    strictObjectType = ZodObject.strictCreate;
    unionType = ZodUnion.create;
    discriminatedUnionType = ZodDiscriminatedUnion.create;
    intersectionType = ZodIntersection.create;
    tupleType = ZodTuple.create;
    recordType = ZodRecord.create;
    mapType = ZodMap.create;
    setType = ZodSet.create;
    functionType = ZodFunction.create;
    lazyType = ZodLazy.create;
    literalType = ZodLiteral.create;
    enumType = ZodEnum.create;
    nativeEnumType = ZodNativeEnum.create;
    promiseType = ZodPromise.create;
    effectsType = ZodEffects.create;
    optionalType = ZodOptional.create;
    nullableType = ZodNullable.create;
    preprocessType = ZodEffects.createWithPreprocess;
    pipelineType = ZodPipeline.create;
    ostring = () => stringType().optional();
    onumber = () => numberType().optional();
    oboolean = () => booleanType().optional();
    coerce = {
      string: ((arg) => ZodString.create({ ...arg, coerce: true })),
      number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
      boolean: ((arg) => ZodBoolean.create({
        ...arg,
        coerce: true
      })),
      bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
      date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
    };
    NEVER = INVALID;
  }
});

// node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid2,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});
var init_external = __esm({
  "node_modules/zod/v3/external.js"() {
    init_errors2();
    init_parseUtil();
    init_typeAliases();
    init_util4();
    init_types();
    init_ZodError();
  }
});

// node_modules/zod/index.js
var init_zod = __esm({
  "node_modules/zod/index.js"() {
    init_external();
    init_external();
  }
});

// src/env.ts
var EnvSchema, env;
var init_env = __esm({
  "src/env.ts"() {
    "use strict";
    init_zod();
    EnvSchema = external_exports.object({
      DATABASE_URL: external_exports.string().default("sqlite://./data.db"),
      PORT: external_exports.coerce.number().int().positive().default(3e3),
      ADMIN_TOKEN: external_exports.string().min(8).default("dev-token-change-me"),
      // OpenCode Zen — primary LLM gateway. Free models for Tier 1, Haiku for Tier 2.
      OPENCODE_API_KEY: external_exports.string().optional(),
      OPENCODE_BASE_URL: external_exports.string().default("https://opencode.ai/zen/v1"),
      // Direct Anthropic — optional, only if you want to bypass Zen for Claude calls.
      ANTHROPIC_API_KEY: external_exports.string().optional(),
      BRAVE_SEARCH_API_KEY: external_exports.string().optional(),
      // Per-deployment identity. Used in outbound User-Agent strings.
      // KEEP OUT OF GIT. Set in .env; fallback is a generic placeholder.
      CONTACT_EMAIL: external_exports.string().email().optional(),
      // Path to the deployment's marble knowledge-graph JSON file (read-only).
      // KEEP OUT OF GIT. Per-deployment; the engine never persists KG content back to its own DB.
      MARBLE_KG_PATH: external_exports.string().optional(),
      // Shared secret for personalized routes (/me/*). Calendar apps can't add headers,
      // so we pass it as a query param. URL = private capability link.
      // KEEP OUT OF GIT. Generate with `openssl rand -hex 24`.
      ME_TOKEN: external_exports.string().optional(),
      // SMTP for the autonomous weekly cron. For Gmail: smtp.gmail.com:465 + App Password.
      // KEEP OUT OF GIT. Used only by the deliver --send code path; absence falls back to dry-run.
      SMTP_HOST: external_exports.string().optional(),
      SMTP_PORT: external_exports.coerce.number().int().positive().default(465),
      SMTP_USER: external_exports.string().optional(),
      SMTP_PASS: external_exports.string().optional(),
      SMTP_FROM: external_exports.string().optional(),
      SMTP_TO: external_exports.string().email().optional(),
      // Turso (libSQL) for the hosted Vercel deploy. Absence → falls back to file:./data.db.
      TURSO_URL: external_exports.string().optional(),
      TURSO_AUTH_TOKEN: external_exports.string().optional()
    });
    env = EnvSchema.parse(process.env);
  }
});

// src/db/index.ts
function libsqlConfig() {
  if (env.TURSO_URL) {
    return env.TURSO_AUTH_TOKEN ? { url: env.TURSO_URL, authToken: env.TURSO_AUTH_TOKEN } : { url: env.TURSO_URL };
  }
  if (env.DATABASE_URL.startsWith("sqlite://")) {
    return { url: "file:" + env.DATABASE_URL.slice("sqlite://".length) };
  }
  return { url: env.DATABASE_URL };
}
function db() {
  if (_client) return _client;
  const cfg = libsqlConfig();
  _client = createClient(cfg);
  return _client;
}
async function queryAll(sql, args = []) {
  const r = await db().execute({ sql, args });
  return r.rows;
}
async function queryGet(sql, args = []) {
  const r = await db().execute({ sql, args });
  return r.rows[0] ?? null;
}
async function exec(sql, args = []) {
  const r = await db().execute({ sql, args });
  return {
    changes: Number(r.rowsAffected),
    ...r.lastInsertRowid !== void 0 ? { lastInsertRowid: r.lastInsertRowid } : {}
  };
}
async function execBatch(stmts) {
  if (stmts.length === 0) return 0;
  const tx = await db().transaction("write");
  let total = 0;
  try {
    for (const s of stmts) {
      const r = await tx.execute({ sql: s.sql, args: s.args ?? [] });
      total += Number(r.rowsAffected);
    }
    await tx.commit();
  } catch (e) {
    await tx.rollback();
    throw e;
  }
  return total;
}
var _client;
var init_db = __esm({
  "src/db/index.ts"() {
    "use strict";
    init_node4();
    init_env();
    _client = null;
  }
});

// src/db/queries.ts
async function listCities() {
  return queryAll("SELECT * FROM cities ORDER BY name");
}
async function getCityBySlug(slug) {
  return queryGet("SELECT * FROM cities WHERE slug = ?", [slug]);
}
async function listEvents(params) {
  const where = ["c.slug = ?", "e.starts_at >= ?", "e.starts_at < ?"];
  const args = [params.citySlug, params.from, params.to];
  if (params.categories && params.categories.length > 0) {
    const placeholders = params.categories.map(() => "?").join(",");
    where.push(`e.category IN (${placeholders})`);
    args.push(...params.categories);
  }
  if (typeof params.minRarity === "number") {
    where.push("e.rarity_score >= ?");
    args.push(params.minRarity);
  }
  if (params.bbox) {
    where.push("e.venue_lng >= ? AND e.venue_lat >= ? AND e.venue_lng <= ? AND e.venue_lat <= ?");
    args.push(...params.bbox);
  }
  const sql = `
    SELECT e.*, s.name AS source_name
    FROM events e
    JOIN cities c ON c.id = e.city_id
    JOIN sources s ON s.id = e.source_id
    WHERE ${where.join(" AND ")}
    ORDER BY e.starts_at ASC
    LIMIT ? OFFSET ?
  `;
  args.push(params.limit, params.offset);
  return queryAll(sql, args);
}
async function getEventById(id) {
  const sql = `
    SELECT e.*, s.name AS source_name
    FROM events e
    JOIN sources s ON s.id = e.source_id
    WHERE e.id = ?
  `;
  return queryGet(sql, [id]);
}
var init_queries = __esm({
  "src/db/queries.ts"() {
    "use strict";
    init_db();
  }
});

// src/routes/cities.ts
var cities;
var init_cities = __esm({
  "src/routes/cities.ts"() {
    "use strict";
    init_dist();
    init_queries();
    cities = new Hono2();
    cities.get("/", async (c) => {
      const rows = await listCities();
      return c.json({
        cities: rows.map((r) => ({
          slug: r.slug,
          name: r.name,
          country_code: r.country_code,
          timezone: r.timezone,
          bbox: r.bbox_min_lng != null && r.bbox_min_lat != null && r.bbox_max_lng != null && r.bbox_max_lat != null ? [r.bbox_min_lng, r.bbox_min_lat, r.bbox_max_lng, r.bbox_max_lat] : null,
          centroid: r.centroid_lng != null && r.centroid_lat != null ? [r.centroid_lng, r.centroid_lat] : null
        }))
      });
    });
  }
});

// src/routes/events.ts
function serializeEvent(r) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    starts_at: r.starts_at,
    ends_at: r.ends_at,
    venue: r.venue_name ? {
      name: r.venue_name,
      address: r.venue_address,
      location: r.venue_lat != null && r.venue_lng != null ? [r.venue_lng, r.venue_lat] : null
    } : null,
    url: r.url,
    image_url: r.image_url,
    category: r.category,
    tags: safeJsonParse(r.tags, []),
    rarity_score: r.rarity_score,
    confidence: r.confidence,
    source: r.source_name
  };
}
function safeJsonParse(s, fallback) {
  if (!s) return fallback;
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}
var QuerySchema, events;
var init_events = __esm({
  "src/routes/events.ts"() {
    "use strict";
    init_dist();
    init_zod();
    init_queries();
    QuerySchema = external_exports.object({
      city: external_exports.string().min(1),
      from: external_exports.string().min(10),
      to: external_exports.string().min(10),
      category: external_exports.string().optional(),
      min_rarity: external_exports.coerce.number().min(0).max(1).optional(),
      bbox: external_exports.string().optional(),
      limit: external_exports.coerce.number().int().positive().max(500).default(100),
      cursor: external_exports.coerce.number().int().nonnegative().default(0)
    });
    events = new Hono2();
    events.get("/", async (c) => {
      const parsed = QuerySchema.safeParse(c.req.query());
      if (!parsed.success) {
        return c.json({ error: "invalid_query", details: parsed.error.flatten() }, 400);
      }
      const q = parsed.data;
      let bbox;
      if (q.bbox) {
        const parts = q.bbox.split(",").map(Number);
        if (parts.length !== 4 || parts.some(Number.isNaN)) {
          return c.json({ error: "invalid_bbox", message: "bbox=minLng,minLat,maxLng,maxLat" }, 400);
        }
        bbox = parts;
      }
      const rows = await listEvents({
        citySlug: q.city,
        from: q.from,
        to: q.to,
        ...q.category ? { categories: q.category.split(",").map((s) => s.trim()).filter(Boolean) } : {},
        ...q.min_rarity !== void 0 ? { minRarity: q.min_rarity } : {},
        ...bbox ? { bbox } : {},
        limit: q.limit + 1,
        // fetch one extra to detect next page
        offset: q.cursor
      });
      const hasMore = rows.length > q.limit;
      const slice = hasMore ? rows.slice(0, q.limit) : rows;
      return c.json({
        events: slice.map(serializeEvent),
        next_cursor: hasMore ? q.cursor + q.limit : null
      });
    });
    events.get("/:id", async (c) => {
      const id = c.req.param("id");
      const row = await getEventById(id);
      if (!row) return c.json({ error: "not_found" }, 404);
      return c.json({ event: serializeEvent(row) });
    });
  }
});

// src/lib/user-agent.ts
function getUserAgent() {
  const contact = env.CONTACT_EMAIL ?? "noreply@events-x-marble.local";
  return `events-x-marble/0.1 (+contact: ${contact})`;
}
var init_user_agent = __esm({
  "src/lib/user-agent.ts"() {
    "use strict";
    init_env();
  }
});

// src/discovery/fetchers/graphql-api.ts
async function fetchGraphqlApi(source, opts) {
  let cfg;
  try {
    cfg = JSON.parse(source.config);
  } catch (e) {
    return {
      status: "error",
      events: [],
      error: `bad config json: ${errMsg(e)}`
    };
  }
  if (cfg.format !== "graphql" || cfg.provider !== "ra") {
    return {
      status: "error",
      events: [],
      error: `unsupported graphql provider: ${cfg.provider ?? "unset"}`
    };
  }
  if (typeof cfg.area_id !== "number") {
    return { status: "error", events: [], error: "missing area_id in config" };
  }
  const pageSize = cfg.page_size ?? DEFAULT_PAGE_SIZE;
  const maxPages = cfg.max_pages ?? DEFAULT_MAX_PAGES;
  const fromDate = opts.windowStartsAt.toISOString().slice(0, 10);
  const toDate = opts.windowEndsAt.toISOString().slice(0, 10);
  const allEvents = [];
  let totalResults = 0;
  for (let page = 1; page <= maxPages; page++) {
    const body = JSON.stringify({
      query: `{
        eventListings(filters: {areas: {eq: ${cfg.area_id}}, listingDate: {gte: "${fromDate}", lte: "${toDate}"}},
                      pageSize: ${pageSize}, page: ${page}) {
          totalResults
          data {
            event {
              id title date startTime endTime
              venue { name address }
              contentUrl
              images { filename }
            }
          }
        }
      }`
    });
    let res;
    try {
      res = await fetch(source.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Referer: "https://ra.co/",
          "User-Agent": USER_AGENT
        },
        body,
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
      });
    } catch (e) {
      return { status: "error", events: allEvents, error: `network: ${errMsg(e)}` };
    }
    if (!res.ok) {
      return {
        status: "error",
        events: allEvents,
        error: `HTTP ${res.status} on page ${page}`
      };
    }
    let json;
    try {
      json = await res.json();
    } catch (e) {
      return { status: "error", events: allEvents, error: `parse: ${errMsg(e)}` };
    }
    if (json.errors && json.errors.length > 0) {
      return {
        status: "error",
        events: allEvents,
        error: `graphql errors: ${json.errors.map((e) => e.message).join("; ")}`
      };
    }
    const listings = json.data?.eventListings?.data ?? [];
    totalResults = json.data?.eventListings?.totalResults ?? totalResults;
    for (const wrapper of listings) {
      const ev = wrapper.event;
      if (!ev || !ev.id || !ev.title) continue;
      const startMs = parseRaTimestamp(ev.startTime ?? ev.date);
      if (!Number.isFinite(startMs)) continue;
      if (startMs < opts.windowStartsAt.getTime() || startMs > opts.windowEndsAt.getTime()) continue;
      const endMs = ev.endTime ? parseRaTimestamp(ev.endTime) : NaN;
      allEvents.push({
        title: ev.title.trim(),
        starts_at: new Date(startMs).toISOString(),
        ends_at: Number.isFinite(endMs) ? new Date(endMs).toISOString() : null,
        venue_name: ev.venue?.name ?? null,
        venue_address: ev.venue?.address ?? null,
        url: ev.contentUrl ? `https://ra.co${ev.contentUrl}` : null,
        image_url: ev.images?.[0]?.filename ?? null,
        category: cfg.category ?? "nightlife",
        rarity_score: cfg.rarity_score ?? 0.3,
        confidence: 1,
        raw_extract: { ra_event_id: ev.id, ra_date_raw: ev.date ?? null }
      });
    }
    if (listings.length < pageSize) break;
    if (page * pageSize >= totalResults) break;
  }
  return {
    status: "ok",
    events: allEvents,
    tokens_used: 0,
    cost_usd: 0,
    model_used: "ra-graphql"
  };
}
function parseRaTimestamp(s) {
  if (!s) return NaN;
  const hasTz = /(?:Z|[+-]\d{2}:?\d{2})$/.test(s);
  return Date.parse(hasTz ? s : `${s}Z`);
}
function errMsg(e) {
  return e instanceof Error ? e.message : String(e);
}
var USER_AGENT, FETCH_TIMEOUT_MS, DEFAULT_PAGE_SIZE, DEFAULT_MAX_PAGES;
var init_graphql_api = __esm({
  "src/discovery/fetchers/graphql-api.ts"() {
    "use strict";
    init_user_agent();
    USER_AGENT = getUserAgent();
    FETCH_TIMEOUT_MS = 3e4;
    DEFAULT_PAGE_SIZE = 50;
    DEFAULT_MAX_PAGES = 5;
  }
});

// node_modules/ical.js/dist/ical.js
function parseDurationChunk(letter, number2, object2) {
  let type;
  switch (letter) {
    case "P":
      if (number2 && number2 === "-") {
        object2.isNegative = true;
      } else {
        object2.isNegative = false;
      }
      break;
    case "D":
      type = "days";
      break;
    case "W":
      type = "weeks";
      break;
    case "H":
      type = "hours";
      break;
    case "M":
      type = "minutes";
      break;
    case "S":
      type = "seconds";
      break;
    default:
      return 0;
  }
  if (type) {
    if (!number2 && number2 !== 0) {
      throw new Error(
        'invalid duration value: Missing number before "' + letter + '"'
      );
    }
    let num = parseInt(number2, 10);
    if (isStrictlyNaN(num)) {
      throw new Error(
        'invalid duration value: Invalid number "' + number2 + '" before "' + letter + '"'
      );
    }
    object2[type] = num;
  }
  return 1;
}
function parse(input2) {
  let state = {};
  let root = state.component = [];
  state.stack = [root];
  parse._eachLine(input2, function(err, line) {
    parse._handleContentLine(line, state);
  });
  if (state.stack.length > 1) {
    throw new ParserError(
      "invalid ical body. component began but did not end"
    );
  }
  state = null;
  return root.length == 1 ? root[0] : root;
}
function updateTimezones(vcal) {
  let allsubs, properties, vtimezones, reqTzid, i;
  if (!vcal || vcal.name !== "vcalendar") {
    return vcal;
  }
  allsubs = vcal.getAllSubcomponents();
  properties = [];
  vtimezones = {};
  for (i = 0; i < allsubs.length; i++) {
    if (allsubs[i].name === "vtimezone") {
      let tzid = allsubs[i].getFirstProperty("tzid").getFirstValue();
      vtimezones[tzid] = allsubs[i];
    } else {
      properties = properties.concat(allsubs[i].getAllProperties());
    }
  }
  reqTzid = {};
  for (i = 0; i < properties.length; i++) {
    let tzid = properties[i].getParameter("tzid");
    if (tzid) {
      reqTzid[tzid] = true;
    }
  }
  for (let [tzid, comp] of Object.entries(vtimezones)) {
    if (!reqTzid[tzid]) {
      vcal.removeSubcomponent(comp);
    }
  }
  for (let tzid of Object.keys(reqTzid)) {
    if (!vtimezones[tzid] && TimezoneService.has(tzid)) {
      vcal.addSubcomponent(TimezoneService.get(tzid).component);
    }
  }
  return vcal;
}
function isStrictlyNaN(number2) {
  return typeof number2 === "number" && isNaN(number2);
}
function strictParseInt(string2) {
  let result = parseInt(string2, 10);
  if (isStrictlyNaN(result)) {
    throw new Error(
      'Could not extract integer from "' + string2 + '"'
    );
  }
  return result;
}
function formatClassType(data, type) {
  if (typeof data === "undefined") {
    return void 0;
  }
  if (data instanceof type) {
    return data;
  }
  return new type(data);
}
function unescapedIndexOf(buffer, search, pos) {
  while ((pos = buffer.indexOf(search, pos)) !== -1) {
    if (pos > 0 && buffer[pos - 1] === "\\") {
      pos += 1;
    } else {
      return pos;
    }
  }
  return -1;
}
function binsearchInsert(list, seekVal, cmpfunc) {
  if (!list.length)
    return 0;
  let low = 0, high = list.length - 1, mid, cmpval;
  while (low <= high) {
    mid = low + Math.floor((high - low) / 2);
    cmpval = cmpfunc(seekVal, list[mid]);
    if (cmpval < 0)
      high = mid - 1;
    else if (cmpval > 0)
      low = mid + 1;
    else
      break;
  }
  if (cmpval < 0)
    return mid;
  else if (cmpval > 0)
    return mid + 1;
  else
    return mid;
}
function clone(aSrc, aDeep) {
  if (!aSrc || typeof aSrc != "object") {
    return aSrc;
  } else if (aSrc instanceof Date) {
    return new Date(aSrc.getTime());
  } else if ("clone" in aSrc) {
    return aSrc.clone();
  } else if (Array.isArray(aSrc)) {
    let arr = [];
    for (let i = 0; i < aSrc.length; i++) {
      arr.push(aDeep ? clone(aSrc[i], true) : aSrc[i]);
    }
    return arr;
  } else {
    let obj = {};
    for (let [name, value] of Object.entries(aSrc)) {
      if (aDeep) {
        obj[name] = clone(value, true);
      } else {
        obj[name] = value;
      }
    }
    return obj;
  }
}
function foldline(aLine) {
  let result = "";
  let line = aLine || "", pos = 0, line_length = 0;
  while (line.length) {
    let cp = line.codePointAt(pos);
    if (cp < 128) ++line_length;
    else if (cp < 2048) line_length += 2;
    else if (cp < 65536) line_length += 3;
    else line_length += 4;
    if (line_length < ICALmodule.foldLength + 1)
      pos += cp > 65535 ? 2 : 1;
    else {
      result += ICALmodule.newLineChar + " " + line.slice(0, Math.max(0, pos));
      line = line.slice(Math.max(0, pos));
      pos = line_length = 0;
    }
  }
  return result.slice(ICALmodule.newLineChar.length + 1);
}
function pad2(data) {
  if (typeof data !== "string") {
    if (typeof data === "number") {
      data = parseInt(data);
    }
    data = String(data);
  }
  let len = data.length;
  switch (len) {
    case 0:
      return "00";
    case 1:
      return "0" + data;
    default:
      return data;
  }
}
function trunc(number2) {
  return number2 < 0 ? Math.ceil(number2) : Math.floor(number2);
}
function extend(source, target) {
  for (let key in source) {
    let descr = Object.getOwnPropertyDescriptor(source, key);
    if (descr && !Object.getOwnPropertyDescriptor(target, key)) {
      Object.defineProperty(target, key, descr);
    }
  }
  return target;
}
function parseNumericValue(type, min, max, value) {
  let result = value;
  if (value[0] === "+") {
    result = value.slice(1);
  }
  result = strictParseInt(result);
  if (min !== void 0 && value < min) {
    throw new Error(
      type + ': invalid value "' + value + '" must be > ' + min
    );
  }
  if (max !== void 0 && value > max) {
    throw new Error(
      type + ': invalid value "' + value + '" must be < ' + min
    );
  }
  return result;
}
function createTextType(fromNewline, toNewline) {
  let result = {
    matches: /.*/,
    fromICAL: function(aValue, structuredEscape) {
      return replaceNewline(aValue, fromNewline, structuredEscape);
    },
    toICAL: function(aValue, structuredEscape) {
      let regEx = toNewline;
      if (structuredEscape)
        regEx = new RegExp(regEx.source + "|" + structuredEscape, regEx.flags);
      return aValue.replace(regEx, function(str) {
        switch (str) {
          case "\\":
            return "\\\\";
          case ";":
            return "\\;";
          case ",":
            return "\\,";
          case "\n":
            return "\\n";
          /* c8 ignore next 2 */
          default:
            return str;
        }
      });
    }
  };
  return result;
}
function replaceNewlineReplace(string2) {
  switch (string2) {
    case "\\\\":
      return "\\";
    case "\\;":
      return ";";
    case "\\,":
      return ",";
    case "\\n":
    case "\\N":
      return "\n";
    /* c8 ignore next 2 */
    default:
      return string2;
  }
}
function replaceNewline(value, newline, structuredEscape) {
  if (value.indexOf("\\") === -1) {
    return value;
  }
  if (structuredEscape)
    newline = new RegExp(newline.source + "|\\\\" + structuredEscape, newline.flags);
  return value.replace(newline, replaceNewlineReplace);
}
function stringify(jCal) {
  if (typeof jCal[0] == "string") {
    jCal = [jCal];
  }
  let i = 0;
  let len = jCal.length;
  let result = "";
  for (; i < len; i++) {
    result += stringify.component(jCal[i]) + LINE_ENDING;
  }
  return result;
}
function compareRangeException(a, b) {
  if (a[0] > b[0]) return 1;
  if (b[0] > a[0]) return -1;
  return 0;
}
var Binary, DURATION_LETTERS, DATA_PROPS_TO_COPY, Duration, Period, Time, CHAR, VALUE_DELIMITER, PARAM_DELIMITER, PARAM_NAME_DELIMITER, DEFAULT_VALUE_TYPE$1, DEFAULT_PARAM_TYPE, RFC6868_REPLACE_MAP$1, ParserError, OPTIONS, Timezone, zones, TimezoneService, helpers, UtcOffset, VCardTime, RecurIterator, InvalidRecurrenceRuleError, VALID_DAY_NAMES, VALID_BYDAY_PART, DOW_MAP, REVERSE_DOW_MAP, ALLOWED_FREQ, Recur, optionDesign, partDesign, FROM_ICAL_NEWLINE, TO_ICAL_NEWLINE, FROM_VCARD_NEWLINE, TO_VCARD_NEWLINE, DEFAULT_TYPE_TEXT, DEFAULT_TYPE_TEXT_MULTI, DEFAULT_TYPE_TEXT_STRUCTURED, DEFAULT_TYPE_INTEGER, DEFAULT_TYPE_DATETIME_DATE, DEFAULT_TYPE_DATETIME, DEFAULT_TYPE_URI, DEFAULT_TYPE_UTCOFFSET, DEFAULT_TYPE_RECUR, DEFAULT_TYPE_DATE_ANDOR_TIME, commonProperties, commonValues, icalParams, icalValues, icalProperties, vcardValues, vcardParams, vcardProperties, vcard3Values, vcard3Params, vcard3Properties, icalSet, vcardSet, vcard3Set, design, LINE_ENDING, DEFAULT_VALUE_TYPE, RFC6868_REPLACE_MAP, NAME_INDEX$1, PROP_INDEX, TYPE_INDEX, VALUE_INDEX, Property, NAME_INDEX, PROPERTY_INDEX, COMPONENT_INDEX, PROPERTY_NAME_INDEX, PROPERTY_VALUE_INDEX, Component, RecurExpansion, Event, ComponentParser, ICALmodule;
var init_ical = __esm({
  "node_modules/ical.js/dist/ical.js"() {
    Binary = class _Binary {
      /**
       * Creates a binary value from the given string.
       *
       * @param {String} aString        The binary value string
       * @return {Binary}               The binary value instance
       */
      static fromString(aString) {
        return new _Binary(aString);
      }
      /**
       * Creates a new ICAL.Binary instance
       *
       * @param {String} aValue     The binary data for this value
       */
      constructor(aValue) {
        this.value = aValue;
      }
      /**
       * The type name, to be used in the jCal object.
       * @default "binary"
       * @constant
       */
      icaltype = "binary";
      /**
       * Base64 decode the current value
       *
       * @return {String}         The base64-decoded value
       */
      decodeValue() {
        return this._b64_decode(this.value);
      }
      /**
       * Encodes the passed parameter with base64 and sets the internal
       * value to the result.
       *
       * @param {String} aValue      The raw binary value to encode
       */
      setEncodedValue(aValue) {
        this.value = this._b64_encode(aValue);
      }
      _b64_encode(data) {
        let b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        let o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc = "", tmp_arr = [];
        if (!data) {
          return data;
        }
        do {
          o1 = data.charCodeAt(i++);
          o2 = data.charCodeAt(i++);
          o3 = data.charCodeAt(i++);
          bits = o1 << 16 | o2 << 8 | o3;
          h1 = bits >> 18 & 63;
          h2 = bits >> 12 & 63;
          h3 = bits >> 6 & 63;
          h4 = bits & 63;
          tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
        } while (i < data.length);
        enc = tmp_arr.join("");
        let r = data.length % 3;
        return (r ? enc.slice(0, r - 3) : enc) + "===".slice(r || 3);
      }
      _b64_decode(data) {
        let b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        let o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, dec = "", tmp_arr = [];
        if (!data) {
          return data;
        }
        data += "";
        do {
          h1 = b64.indexOf(data.charAt(i++));
          h2 = b64.indexOf(data.charAt(i++));
          h3 = b64.indexOf(data.charAt(i++));
          h4 = b64.indexOf(data.charAt(i++));
          bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
          o1 = bits >> 16 & 255;
          o2 = bits >> 8 & 255;
          o3 = bits & 255;
          if (h3 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1);
          } else if (h4 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1, o2);
          } else {
            tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
          }
        } while (i < data.length);
        dec = tmp_arr.join("");
        return dec;
      }
      /**
       * The string representation of this value
       * @return {String}
       */
      toString() {
        return this.value;
      }
    };
    DURATION_LETTERS = /([PDWHMTS]{1,1})/;
    DATA_PROPS_TO_COPY = ["weeks", "days", "hours", "minutes", "seconds", "isNegative"];
    Duration = class _Duration {
      /**
       * Returns a new ICAL.Duration instance from the passed seconds value.
       *
       * @param {Number} aSeconds       The seconds to create the instance from
       * @return {Duration}             The newly created duration instance
       */
      static fromSeconds(aSeconds) {
        return new _Duration().fromSeconds(aSeconds);
      }
      /**
       * Checks if the given string is an iCalendar duration value.
       *
       * @param {String} value      The raw ical value
       * @return {Boolean}          True, if the given value is of the
       *                              duration ical type
       */
      static isValueString(string2) {
        return string2[0] === "P" || string2[1] === "P";
      }
      /**
       * Creates a new {@link ICAL.Duration} instance from the passed string.
       *
       * @param {String} aStr       The string to parse
       * @return {Duration}         The created duration instance
       */
      static fromString(aStr) {
        let pos = 0;
        let dict = /* @__PURE__ */ Object.create(null);
        let chunks = 0;
        while ((pos = aStr.search(DURATION_LETTERS)) !== -1) {
          let type = aStr[pos];
          let numeric = aStr.slice(0, Math.max(0, pos));
          aStr = aStr.slice(pos + 1);
          chunks += parseDurationChunk(type, numeric, dict);
        }
        if (chunks < 2) {
          throw new Error(
            'invalid duration value: Not enough duration components in "' + aStr + '"'
          );
        }
        return new _Duration(dict);
      }
      /**
       * Creates a new ICAL.Duration instance from the given data object.
       *
       * @param {Object} aData                An object with members of the duration
       * @param {Number=} aData.weeks         Duration in weeks
       * @param {Number=} aData.days          Duration in days
       * @param {Number=} aData.hours         Duration in hours
       * @param {Number=} aData.minutes       Duration in minutes
       * @param {Number=} aData.seconds       Duration in seconds
       * @param {Boolean=} aData.isNegative   If true, the duration is negative
       * @return {Duration}                   The createad duration instance
       */
      static fromData(aData) {
        return new _Duration(aData);
      }
      /**
       * Creates a new ICAL.Duration instance.
       *
       * @param {Object} data                 An object with members of the duration
       * @param {Number=} data.weeks          Duration in weeks
       * @param {Number=} data.days           Duration in days
       * @param {Number=} data.hours          Duration in hours
       * @param {Number=} data.minutes        Duration in minutes
       * @param {Number=} data.seconds        Duration in seconds
       * @param {Boolean=} data.isNegative    If true, the duration is negative
       */
      constructor(data) {
        this.wrappedJSObject = this;
        this.fromData(data);
      }
      /**
       * The weeks in this duration
       * @type {Number}
       * @default 0
       */
      weeks = 0;
      /**
       * The days in this duration
       * @type {Number}
       * @default 0
       */
      days = 0;
      /**
       * The days in this duration
       * @type {Number}
       * @default 0
       */
      hours = 0;
      /**
       * The minutes in this duration
       * @type {Number}
       * @default 0
       */
      minutes = 0;
      /**
       * The seconds in this duration
       * @type {Number}
       * @default 0
       */
      seconds = 0;
      /**
       * The seconds in this duration
       * @type {Boolean}
       * @default false
       */
      isNegative = false;
      /**
       * The class identifier.
       * @constant
       * @type {String}
       * @default "icalduration"
       */
      icalclass = "icalduration";
      /**
       * The type name, to be used in the jCal object.
       * @constant
       * @type {String}
       * @default "duration"
       */
      icaltype = "duration";
      /**
       * Returns a clone of the duration object.
       *
       * @return {Duration}      The cloned object
       */
      clone() {
        return _Duration.fromData(this);
      }
      /**
       * The duration value expressed as a number of seconds.
       *
       * @return {Number}             The duration value in seconds
       */
      toSeconds() {
        let seconds = this.seconds + 60 * this.minutes + 3600 * this.hours + 86400 * this.days + 7 * 86400 * this.weeks;
        return this.isNegative ? -seconds : seconds;
      }
      /**
       * Reads the passed seconds value into this duration object. Afterwards,
       * members like {@link ICAL.Duration#days days} and {@link ICAL.Duration#weeks weeks} will be set up
       * accordingly.
       *
       * @param {Number} aSeconds     The duration value in seconds
       * @return {Duration}           Returns this instance
       */
      fromSeconds(aSeconds) {
        let secs = Math.abs(aSeconds);
        this.isNegative = aSeconds < 0;
        this.days = trunc(secs / 86400);
        if (this.days % 7 == 0) {
          this.weeks = this.days / 7;
          this.days = 0;
        } else {
          this.weeks = 0;
        }
        secs -= (this.days + 7 * this.weeks) * 86400;
        this.hours = trunc(secs / 3600);
        secs -= this.hours * 3600;
        this.minutes = trunc(secs / 60);
        secs -= this.minutes * 60;
        this.seconds = secs;
        return this;
      }
      /**
       * Sets up the current instance using members from the passed data object.
       *
       * @param {Object} aData                An object with members of the duration
       * @param {Number=} aData.weeks         Duration in weeks
       * @param {Number=} aData.days          Duration in days
       * @param {Number=} aData.hours         Duration in hours
       * @param {Number=} aData.minutes       Duration in minutes
       * @param {Number=} aData.seconds       Duration in seconds
       * @param {Boolean=} aData.isNegative   If true, the duration is negative
       */
      fromData(aData) {
        for (let prop3 of DATA_PROPS_TO_COPY) {
          if (aData && prop3 in aData) {
            this[prop3] = aData[prop3];
          } else {
            this[prop3] = 0;
          }
        }
      }
      /**
       * Resets the duration instance to the default values, i.e. PT0S
       */
      reset() {
        this.isNegative = false;
        this.weeks = 0;
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
      }
      /**
       * Compares the duration instance with another one.
       *
       * @param {Duration} aOther             The instance to compare with
       * @return {Number}                     -1, 0 or 1 for less/equal/greater
       */
      compare(aOther) {
        let thisSeconds = this.toSeconds();
        let otherSeconds = aOther.toSeconds();
        return (thisSeconds > otherSeconds) - (thisSeconds < otherSeconds);
      }
      /**
       * Normalizes the duration instance. For example, a duration with a value
       * of 61 seconds will be normalized to 1 minute and 1 second.
       */
      normalize() {
        this.fromSeconds(this.toSeconds());
      }
      /**
       * The string representation of this duration.
       * @return {String}
       */
      toString() {
        if (this.toSeconds() == 0) {
          return "PT0S";
        } else {
          let str = "";
          if (this.isNegative) str += "-";
          str += "P";
          let hasWeeks = false;
          if (this.weeks) {
            if (this.days || this.hours || this.minutes || this.seconds) {
              str += this.weeks * 7 + this.days + "D";
            } else {
              str += this.weeks + "W";
              hasWeeks = true;
            }
          } else if (this.days) {
            str += this.days + "D";
          }
          if (!hasWeeks) {
            if (this.hours || this.minutes || this.seconds) {
              str += "T";
              if (this.hours) {
                str += this.hours + "H";
              }
              if (this.minutes) {
                str += this.minutes + "M";
              }
              if (this.seconds) {
                str += this.seconds + "S";
              }
            }
          }
          return str;
        }
      }
      /**
       * The iCalendar string representation of this duration.
       * @return {String}
       */
      toICALString() {
        return this.toString();
      }
    };
    Period = class _Period {
      /**
       * Creates a new {@link ICAL.Period} instance from the passed string.
       *
       * @param {String} str            The string to parse
       * @param {Property} prop         The property this period will be on
       * @return {Period}               The created period instance
       */
      static fromString(str, prop3) {
        let parts = str.split("/");
        if (parts.length !== 2) {
          throw new Error(
            'Invalid string value: "' + str + '" must contain a "/" char.'
          );
        }
        let options = {
          start: Time.fromDateTimeString(parts[0], prop3)
        };
        let end = parts[1];
        if (Duration.isValueString(end)) {
          options.duration = Duration.fromString(end);
        } else {
          options.end = Time.fromDateTimeString(end, prop3);
        }
        return new _Period(options);
      }
      /**
       * Creates a new {@link ICAL.Period} instance from the given data object.
       * The passed data object cannot contain both and end date and a duration.
       *
       * @param {Object} aData                  An object with members of the period
       * @param {Time=} aData.start             The start of the period
       * @param {Time=} aData.end               The end of the period
       * @param {Duration=} aData.duration      The duration of the period
       * @return {Period}                       The period instance
       */
      static fromData(aData) {
        return new _Period(aData);
      }
      /**
       * Returns a new period instance from the given jCal data array. The first
       * member is always the start date string, the second member is either a
       * duration or end date string.
       *
       * @param {jCalComponent} aData           The jCal data array
       * @param {Property} aProp                The property this jCal data is on
       * @param {Boolean} aLenient              If true, data value can be both date and date-time
       * @return {Period}                       The period instance
       */
      static fromJSON(aData, aProp, aLenient) {
        function fromDateOrDateTimeString(aValue, dateProp) {
          if (aLenient) {
            return Time.fromString(aValue, dateProp);
          } else {
            return Time.fromDateTimeString(aValue, dateProp);
          }
        }
        if (Duration.isValueString(aData[1])) {
          return _Period.fromData({
            start: fromDateOrDateTimeString(aData[0], aProp),
            duration: Duration.fromString(aData[1])
          });
        } else {
          return _Period.fromData({
            start: fromDateOrDateTimeString(aData[0], aProp),
            end: fromDateOrDateTimeString(aData[1], aProp)
          });
        }
      }
      /**
       * Creates a new ICAL.Period instance. The passed data object cannot contain both and end date and
       * a duration.
       *
       * @param {Object} aData                  An object with members of the period
       * @param {Time=} aData.start             The start of the period
       * @param {Time=} aData.end               The end of the period
       * @param {Duration=} aData.duration      The duration of the period
       */
      constructor(aData) {
        this.wrappedJSObject = this;
        if (aData && "start" in aData) {
          if (aData.start && !(aData.start instanceof Time)) {
            throw new TypeError(".start must be an instance of ICAL.Time");
          }
          this.start = aData.start;
        }
        if (aData && aData.end && aData.duration) {
          throw new Error("cannot accept both end and duration");
        }
        if (aData && "end" in aData) {
          if (aData.end && !(aData.end instanceof Time)) {
            throw new TypeError(".end must be an instance of ICAL.Time");
          }
          this.end = aData.end;
        }
        if (aData && "duration" in aData) {
          if (aData.duration && !(aData.duration instanceof Duration)) {
            throw new TypeError(".duration must be an instance of ICAL.Duration");
          }
          this.duration = aData.duration;
        }
      }
      /**
       * The start of the period
       * @type {Time}
       */
      start = null;
      /**
       * The end of the period
       * @type {Time}
       */
      end = null;
      /**
       * The duration of the period
       * @type {Duration}
       */
      duration = null;
      /**
       * The class identifier.
       * @constant
       * @type {String}
       * @default "icalperiod"
       */
      icalclass = "icalperiod";
      /**
       * The type name, to be used in the jCal object.
       * @constant
       * @type {String}
       * @default "period"
       */
      icaltype = "period";
      /**
       * Returns a clone of the duration object.
       *
       * @return {Period}      The cloned object
       */
      clone() {
        return _Period.fromData({
          start: this.start ? this.start.clone() : null,
          end: this.end ? this.end.clone() : null,
          duration: this.duration ? this.duration.clone() : null
        });
      }
      /**
       * Calculates the duration of the period, either directly or by subtracting
       * start from end date.
       *
       * @return {Duration}      The calculated duration
       */
      getDuration() {
        if (this.duration) {
          return this.duration;
        } else {
          return this.end.subtractDate(this.start);
        }
      }
      /**
       * Calculates the end date of the period, either directly or by adding
       * duration to start date.
       *
       * @return {Time}          The calculated end date
       */
      getEnd() {
        if (this.end) {
          return this.end;
        } else {
          let end = this.start.clone();
          end.addDuration(this.duration);
          return end;
        }
      }
      /**
       * Compare this period with a date or other period. To maintain the logic where a.compare(b)
       * returns 1 when a > b, this function will return 1 when the period is after the date, 0 when the
       * date is within the period, and -1 when the period is before the date. When comparing two
       * periods, as soon as they overlap in any way this will return 0.
       *
       * @param {Time|Period} dt    The date or other period to compare with
       */
      compare(dt) {
        if (dt.compare(this.start) < 0) {
          return 1;
        } else if (dt.compare(this.getEnd()) > 0) {
          return -1;
        } else {
          return 0;
        }
      }
      /**
       * The string representation of this period.
       * @return {String}
       */
      toString() {
        return this.start + "/" + (this.end || this.duration);
      }
      /**
       * The jCal representation of this period type.
       * @return {Object}
       */
      toJSON() {
        return [this.start.toString(), (this.end || this.duration).toString()];
      }
      /**
       * The iCalendar string representation of this period.
       * @return {String}
       */
      toICALString() {
        return this.start.toICALString() + "/" + (this.end || this.duration).toICALString();
      }
    };
    Time = class _Time {
      static _dowCache = {};
      static _wnCache = {};
      /**
       * Returns the days in the given month
       *
       * @param {Number} month      The month to check
       * @param {Number} year       The year to check
       * @return {Number}           The number of days in the month
       */
      static daysInMonth(month, year) {
        let _daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let days = 30;
        if (month < 1 || month > 12) return days;
        days = _daysInMonth[month];
        if (month == 2) {
          days += _Time.isLeapYear(year);
        }
        return days;
      }
      /**
       * Checks if the year is a leap year
       *
       * @param {Number} year       The year to check
       * @return {Boolean}          True, if the year is a leap year
       */
      static isLeapYear(year) {
        if (year <= 1752) {
          return year % 4 == 0;
        } else {
          return year % 4 == 0 && year % 100 != 0 || year % 400 == 0;
        }
      }
      /**
       * Create a new ICAL.Time from the day of year and year. The date is returned
       * in floating timezone.
       *
       * @param {Number} aDayOfYear     The day of year
       * @param {Number} aYear          The year to create the instance in
       * @return {Time}                 The created instance with the calculated date
       */
      static fromDayOfYear(aDayOfYear, aYear) {
        let year = aYear;
        let doy = aDayOfYear;
        let tt = new _Time();
        tt.auto_normalize = false;
        let is_leap = _Time.isLeapYear(year) ? 1 : 0;
        if (doy < 1) {
          year--;
          is_leap = _Time.isLeapYear(year) ? 1 : 0;
          doy += _Time.daysInYearPassedMonth[is_leap][12];
          return _Time.fromDayOfYear(doy, year);
        } else if (doy > _Time.daysInYearPassedMonth[is_leap][12]) {
          is_leap = _Time.isLeapYear(year) ? 1 : 0;
          doy -= _Time.daysInYearPassedMonth[is_leap][12];
          year++;
          return _Time.fromDayOfYear(doy, year);
        }
        tt.year = year;
        tt.isDate = true;
        for (let month = 11; month >= 0; month--) {
          if (doy > _Time.daysInYearPassedMonth[is_leap][month]) {
            tt.month = month + 1;
            tt.day = doy - _Time.daysInYearPassedMonth[is_leap][month];
            break;
          }
        }
        tt.auto_normalize = true;
        return tt;
      }
      /**
       * Returns a new ICAL.Time instance from a date string, e.g 2015-01-02.
       *
       * @deprecated                Use {@link ICAL.Time.fromDateString} instead
       * @param {String} str        The string to create from
       * @return {Time}             The date/time instance
       */
      static fromStringv2(str) {
        return new _Time({
          year: parseInt(str.slice(0, 4), 10),
          month: parseInt(str.slice(5, 7), 10),
          day: parseInt(str.slice(8, 10), 10),
          isDate: true
        });
      }
      /**
       * Returns a new ICAL.Time instance from a date string, e.g 2015-01-02.
       *
       * @param {String} aValue     The string to create from
       * @return {Time}             The date/time instance
       */
      static fromDateString(aValue) {
        return new _Time({
          year: strictParseInt(aValue.slice(0, 4)),
          month: strictParseInt(aValue.slice(5, 7)),
          day: strictParseInt(aValue.slice(8, 10)),
          isDate: true
        });
      }
      /**
       * Returns a new ICAL.Time instance from a date-time string, e.g
       * 2015-01-02T03:04:05. If a property is specified, the timezone is set up
       * from the property's TZID parameter.
       *
       * @param {String} aValue         The string to create from
       * @param {Property=} prop        The property the date belongs to
       * @return {Time}                 The date/time instance
       */
      static fromDateTimeString(aValue, prop3) {
        if (aValue.length < 19) {
          throw new Error(
            'invalid date-time value: "' + aValue + '"'
          );
        }
        let zone;
        let zoneId;
        if (aValue.slice(-1) === "Z") {
          zone = Timezone.utcTimezone;
        } else if (prop3) {
          zoneId = prop3.getParameter("tzid");
          if (prop3.parent) {
            if (prop3.parent.name === "standard" || prop3.parent.name === "daylight") {
              zone = Timezone.localTimezone;
            } else if (zoneId) {
              zone = prop3.parent.getTimeZoneByID(zoneId);
            }
          }
        }
        const timeData = {
          year: strictParseInt(aValue.slice(0, 4)),
          month: strictParseInt(aValue.slice(5, 7)),
          day: strictParseInt(aValue.slice(8, 10)),
          hour: strictParseInt(aValue.slice(11, 13)),
          minute: strictParseInt(aValue.slice(14, 16)),
          second: strictParseInt(aValue.slice(17, 19))
        };
        if (zoneId && !zone) {
          timeData.timezone = zoneId;
        }
        return new _Time(timeData, zone);
      }
      /**
       * Returns a new ICAL.Time instance from a date or date-time string,
       *
       * @param {String} aValue         The string to create from
       * @param {Property=} prop        The property the date belongs to
       * @return {Time}                 The date/time instance
       */
      static fromString(aValue, aProperty) {
        if (aValue.length > 10) {
          return _Time.fromDateTimeString(aValue, aProperty);
        } else {
          return _Time.fromDateString(aValue);
        }
      }
      /**
       * Creates a new ICAL.Time instance from the given Javascript Date.
       *
       * @param {?Date} aDate             The Javascript Date to read, or null to reset
       * @param {Boolean} [useUTC=false]  If true, the UTC values of the date will be used
       */
      static fromJSDate(aDate, useUTC) {
        let tt = new _Time();
        return tt.fromJSDate(aDate, useUTC);
      }
      /**
       * Creates a new ICAL.Time instance from the the passed data object.
       *
       * @param {timeInit} aData          Time initialization
       * @param {Timezone=} aZone         Timezone this position occurs in
       */
      static fromData = function fromData(aData, aZone) {
        let t = new _Time();
        return t.fromData(aData, aZone);
      };
      /**
       * Creates a new ICAL.Time instance from the current moment.
       * The instance is “floating” - has no timezone relation.
       * To create an instance considering the time zone, call
       * ICAL.Time.fromJSDate(new Date(), true)
       * @return {Time}
       */
      static now() {
        return _Time.fromJSDate(/* @__PURE__ */ new Date(), false);
      }
      /**
       * Returns the date on which ISO week number 1 starts.
       *
       * @see Time#weekNumber
       * @param {Number} aYear                  The year to search in
       * @param {weekDay=} aWeekStart           The week start weekday, used for calculation.
       * @return {Time}                         The date on which week number 1 starts
       */
      static weekOneStarts(aYear, aWeekStart) {
        let t = _Time.fromData({
          year: aYear,
          month: 1,
          day: 1,
          isDate: true
        });
        let dow = t.dayOfWeek();
        let wkst = aWeekStart || _Time.DEFAULT_WEEK_START;
        if (dow > _Time.THURSDAY) {
          t.day += 7;
        }
        if (wkst > _Time.THURSDAY) {
          t.day -= 7;
        }
        t.day -= dow - wkst;
        return t;
      }
      /**
       * Get the dominical letter for the given year. Letters range from A - G for
       * common years, and AG to GF for leap years.
       *
       * @param {Number} yr           The year to retrieve the letter for
       * @return {String}             The dominical letter.
       */
      static getDominicalLetter(yr) {
        let LTRS = "GFEDCBA";
        let dom = (yr + (yr / 4 | 0) + (yr / 400 | 0) - (yr / 100 | 0) - 1) % 7;
        let isLeap = _Time.isLeapYear(yr);
        if (isLeap) {
          return LTRS[(dom + 6) % 7] + LTRS[dom];
        } else {
          return LTRS[dom];
        }
      }
      static #epochTime = null;
      /**
       * January 1st, 1970 as an ICAL.Time.
       * @type {Time}
       * @constant
       * @instance
       */
      static get epochTime() {
        if (!this.#epochTime) {
          this.#epochTime = _Time.fromData({
            year: 1970,
            month: 1,
            day: 1,
            hour: 0,
            minute: 0,
            second: 0,
            isDate: false,
            timezone: "Z"
          });
        }
        return this.#epochTime;
      }
      static _cmp_attr(a, b, attr) {
        if (a[attr] > b[attr]) return 1;
        if (a[attr] < b[attr]) return -1;
        return 0;
      }
      /**
       * The days that have passed in the year after a given month. The array has
       * two members, one being an array of passed days for non-leap years, the
       * other analog for leap years.
       * @example
       * var isLeapYear = ICAL.Time.isLeapYear(year);
       * var passedDays = ICAL.Time.daysInYearPassedMonth[isLeapYear][month];
       * @type {Array.<Array.<Number>>}
       */
      static daysInYearPassedMonth = [
        [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365],
        [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366]
      ];
      static SUNDAY = 1;
      static MONDAY = 2;
      static TUESDAY = 3;
      static WEDNESDAY = 4;
      static THURSDAY = 5;
      static FRIDAY = 6;
      static SATURDAY = 7;
      /**
       * The default weekday for the WKST part.
       * @constant
       * @default ICAL.Time.MONDAY
       */
      static DEFAULT_WEEK_START = 2;
      // MONDAY
      /**
       * Creates a new ICAL.Time instance.
       *
       * @param {timeInit} data           Time initialization
       * @param {Timezone} zone           timezone this position occurs in
       */
      constructor(data, zone) {
        this.wrappedJSObject = this;
        this._time = /* @__PURE__ */ Object.create(null);
        this._time.year = 0;
        this._time.month = 1;
        this._time.day = 1;
        this._time.hour = 0;
        this._time.minute = 0;
        this._time.second = 0;
        this._time.isDate = false;
        this.fromData(data, zone);
      }
      /**
       * The class identifier.
       * @constant
       * @type {String}
       * @default "icaltime"
       */
      icalclass = "icaltime";
      _cachedUnixTime = null;
      /**
       * The type name, to be used in the jCal object. This value may change and
       * is strictly defined by the {@link ICAL.Time#isDate isDate} member.
       * @type {String}
       * @default "date-time"
       */
      get icaltype() {
        return this.isDate ? "date" : "date-time";
      }
      /**
       * The timezone for this time.
       * @type {Timezone}
       */
      zone = null;
      /**
       * Internal uses to indicate that a change has been made and the next read
       * operation must attempt to normalize the value (for example changing the
       * day to 33).
       *
       * @type {Boolean}
       * @private
       */
      _pendingNormalization = false;
      /**
       * The year of this date.
       * @type {Number}
       */
      get year() {
        return this._getTimeAttr("year");
      }
      set year(val) {
        this._setTimeAttr("year", val);
      }
      /**
       * The month of this date.
       * @type {Number}
       */
      get month() {
        return this._getTimeAttr("month");
      }
      set month(val) {
        this._setTimeAttr("month", val);
      }
      /**
       * The day of this date.
       * @type {Number}
       */
      get day() {
        return this._getTimeAttr("day");
      }
      set day(val) {
        this._setTimeAttr("day", val);
      }
      /**
       * The hour of this date-time.
       * @type {Number}
       */
      get hour() {
        return this._getTimeAttr("hour");
      }
      set hour(val) {
        this._setTimeAttr("hour", val);
      }
      /**
       * The minute of this date-time.
       * @type {Number}
       */
      get minute() {
        return this._getTimeAttr("minute");
      }
      set minute(val) {
        this._setTimeAttr("minute", val);
      }
      /**
       * The second of this date-time.
       * @type {Number}
       */
      get second() {
        return this._getTimeAttr("second");
      }
      set second(val) {
        this._setTimeAttr("second", val);
      }
      /**
       * If true, the instance represents a date (as opposed to a date-time)
       * @type {Boolean}
       */
      get isDate() {
        return this._getTimeAttr("isDate");
      }
      set isDate(val) {
        this._setTimeAttr("isDate", val);
      }
      /**
       * @private
       * @param {String} attr             Attribute to get (one of: year, month,
       *                                  day, hour, minute, second, isDate)
       * @return {Number|Boolean}         Current value for the attribute
       */
      _getTimeAttr(attr) {
        if (this._pendingNormalization) {
          this._normalize();
          this._pendingNormalization = false;
        }
        return this._time[attr];
      }
      /**
       * @private
       * @param {String} attr             Attribute to set (one of: year, month,
       *                                  day, hour, minute, second, isDate)
       * @param {Number|Boolean} val      New value for the attribute
       */
      _setTimeAttr(attr, val) {
        if (attr === "isDate" && val && !this._time.isDate) {
          this.adjust(0, 0, 0, 0);
        }
        this._cachedUnixTime = null;
        this._pendingNormalization = true;
        this._time[attr] = val;
      }
      /**
       * Returns a clone of the time object.
       *
       * @return {Time}              The cloned object
       */
      clone() {
        return new _Time(this._time, this.zone);
      }
      /**
       * Reset the time instance to epoch time
       */
      reset() {
        this.fromData(_Time.epochTime);
        this.zone = Timezone.utcTimezone;
      }
      /**
       * Reset the time instance to the given date/time values.
       *
       * @param {Number} year             The year to set
       * @param {Number} month            The month to set
       * @param {Number} day              The day to set
       * @param {Number} hour             The hour to set
       * @param {Number} minute           The minute to set
       * @param {Number} second           The second to set
       * @param {Timezone} timezone       The timezone to set
       */
      resetTo(year, month, day, hour, minute, second, timezone) {
        this.fromData({
          year,
          month,
          day,
          hour,
          minute,
          second,
          zone: timezone
        });
      }
      /**
       * Set up the current instance from the Javascript date value.
       *
       * @param {?Date} aDate             The Javascript Date to read, or null to reset
       * @param {Boolean} [useUTC=false]  If true, the UTC values of the date will be used
       */
      fromJSDate(aDate, useUTC) {
        if (!aDate) {
          this.reset();
        } else {
          if (useUTC) {
            this.zone = Timezone.utcTimezone;
            this.year = aDate.getUTCFullYear();
            this.month = aDate.getUTCMonth() + 1;
            this.day = aDate.getUTCDate();
            this.hour = aDate.getUTCHours();
            this.minute = aDate.getUTCMinutes();
            this.second = aDate.getUTCSeconds();
          } else {
            this.zone = Timezone.localTimezone;
            this.year = aDate.getFullYear();
            this.month = aDate.getMonth() + 1;
            this.day = aDate.getDate();
            this.hour = aDate.getHours();
            this.minute = aDate.getMinutes();
            this.second = aDate.getSeconds();
          }
        }
        this._cachedUnixTime = null;
        return this;
      }
      /**
       * Sets up the current instance using members from the passed data object.
       *
       * @param {timeInit} aData          Time initialization
       * @param {Timezone=} aZone         Timezone this position occurs in
       */
      fromData(aData, aZone) {
        if (aData) {
          for (let [key, value] of Object.entries(aData)) {
            if (key === "icaltype") continue;
            this[key] = value;
          }
        }
        if (aZone) {
          this.zone = aZone;
        }
        if (aData && !("isDate" in aData)) {
          this.isDate = !("hour" in aData);
        } else if (aData && "isDate" in aData) {
          this.isDate = aData.isDate;
        }
        if (aData && "timezone" in aData) {
          let zone = TimezoneService.get(
            aData.timezone
          );
          this.zone = zone || Timezone.localTimezone;
        }
        if (aData && "zone" in aData) {
          this.zone = aData.zone;
        }
        if (!this.zone) {
          this.zone = Timezone.localTimezone;
        }
        this._cachedUnixTime = null;
        return this;
      }
      /**
       * Calculate the day of week.
       * @param {weekDay=} aWeekStart
       *        The week start weekday, defaults to SUNDAY
       * @return {weekDay}
       */
      dayOfWeek(aWeekStart) {
        let firstDow = aWeekStart || _Time.SUNDAY;
        let dowCacheKey = (this.year << 12) + (this.month << 8) + (this.day << 3) + firstDow;
        if (dowCacheKey in _Time._dowCache) {
          return _Time._dowCache[dowCacheKey];
        }
        let q = this.day;
        let m = this.month + (this.month < 3 ? 12 : 0);
        let Y = this.year - (this.month < 3 ? 1 : 0);
        let h = q + Y + trunc((m + 1) * 26 / 10) + trunc(Y / 4);
        {
          h += trunc(Y / 100) * 6 + trunc(Y / 400);
        }
        h = (h + 7 - firstDow) % 7 + 1;
        _Time._dowCache[dowCacheKey] = h;
        return h;
      }
      /**
       * Calculate the day of year.
       * @return {Number}
       */
      dayOfYear() {
        let is_leap = _Time.isLeapYear(this.year) ? 1 : 0;
        let diypm = _Time.daysInYearPassedMonth;
        return diypm[is_leap][this.month - 1] + this.day;
      }
      /**
       * Returns a copy of the current date/time, rewound to the start of the
       * week. The resulting ICAL.Time instance is of icaltype date, even if this
       * is a date-time.
       *
       * @param {weekDay=} aWeekStart
       *        The week start weekday, defaults to SUNDAY
       * @return {Time}      The start of the week (cloned)
       */
      startOfWeek(aWeekStart) {
        let firstDow = aWeekStart || _Time.SUNDAY;
        let result = this.clone();
        result.day -= (this.dayOfWeek() + 7 - firstDow) % 7;
        result.isDate = true;
        result.hour = 0;
        result.minute = 0;
        result.second = 0;
        return result;
      }
      /**
       * Returns a copy of the current date/time, shifted to the end of the week.
       * The resulting ICAL.Time instance is of icaltype date, even if this is a
       * date-time.
       *
       * @param {weekDay=} aWeekStart
       *        The week start weekday, defaults to SUNDAY
       * @return {Time}      The end of the week (cloned)
       */
      endOfWeek(aWeekStart) {
        let firstDow = aWeekStart || _Time.SUNDAY;
        let result = this.clone();
        result.day += (7 - this.dayOfWeek() + firstDow - _Time.SUNDAY) % 7;
        result.isDate = true;
        result.hour = 0;
        result.minute = 0;
        result.second = 0;
        return result;
      }
      /**
       * Returns a copy of the current date/time, rewound to the start of the
       * month. The resulting ICAL.Time instance is of icaltype date, even if
       * this is a date-time.
       *
       * @return {Time}      The start of the month (cloned)
       */
      startOfMonth() {
        let result = this.clone();
        result.day = 1;
        result.isDate = true;
        result.hour = 0;
        result.minute = 0;
        result.second = 0;
        return result;
      }
      /**
       * Returns a copy of the current date/time, shifted to the end of the
       * month.  The resulting ICAL.Time instance is of icaltype date, even if
       * this is a date-time.
       *
       * @return {Time}      The end of the month (cloned)
       */
      endOfMonth() {
        let result = this.clone();
        result.day = _Time.daysInMonth(result.month, result.year);
        result.isDate = true;
        result.hour = 0;
        result.minute = 0;
        result.second = 0;
        return result;
      }
      /**
       * Returns a copy of the current date/time, rewound to the start of the
       * year. The resulting ICAL.Time instance is of icaltype date, even if
       * this is a date-time.
       *
       * @return {Time}      The start of the year (cloned)
       */
      startOfYear() {
        let result = this.clone();
        result.day = 1;
        result.month = 1;
        result.isDate = true;
        result.hour = 0;
        result.minute = 0;
        result.second = 0;
        return result;
      }
      /**
       * Returns a copy of the current date/time, shifted to the end of the
       * year.  The resulting ICAL.Time instance is of icaltype date, even if
       * this is a date-time.
       *
       * @return {Time}      The end of the year (cloned)
       */
      endOfYear() {
        let result = this.clone();
        result.day = 31;
        result.month = 12;
        result.isDate = true;
        result.hour = 0;
        result.minute = 0;
        result.second = 0;
        return result;
      }
      /**
       * First calculates the start of the week, then returns the day of year for
       * this date. If the day falls into the previous year, the day is zero or negative.
       *
       * @param {weekDay=} aFirstDayOfWeek
       *        The week start weekday, defaults to SUNDAY
       * @return {Number}     The calculated day of year
       */
      startDoyWeek(aFirstDayOfWeek) {
        let firstDow = aFirstDayOfWeek || _Time.SUNDAY;
        let delta = this.dayOfWeek() - firstDow;
        if (delta < 0) delta += 7;
        return this.dayOfYear() - delta;
      }
      /**
       * Get the dominical letter for the current year. Letters range from A - G
       * for common years, and AG to GF for leap years.
       *
       * @param {Number} yr           The year to retrieve the letter for
       * @return {String}             The dominical letter.
       */
      getDominicalLetter() {
        return _Time.getDominicalLetter(this.year);
      }
      /**
       * Finds the nthWeekDay relative to the current month (not day).  The
       * returned value is a day relative the month that this month belongs to so
       * 1 would indicate the first of the month and 40 would indicate a day in
       * the following month.
       *
       * @param {Number} aDayOfWeek   Day of the week see the day name constants
       * @param {Number} aPos         Nth occurrence of a given week day values
       *        of 1 and 0 both indicate the first weekday of that type. aPos may
       *        be either positive or negative
       *
       * @return {Number} numeric value indicating a day relative
       *                   to the current month of this time object
       */
      nthWeekDay(aDayOfWeek, aPos) {
        let daysInMonth = _Time.daysInMonth(this.month, this.year);
        let weekday;
        let pos = aPos;
        let start = 0;
        let otherDay = this.clone();
        if (pos >= 0) {
          otherDay.day = 1;
          if (pos != 0) {
            pos--;
          }
          start = otherDay.day;
          let startDow = otherDay.dayOfWeek();
          let offset = aDayOfWeek - startDow;
          if (offset < 0)
            offset += 7;
          start += offset;
          start -= aDayOfWeek;
          weekday = aDayOfWeek;
        } else {
          otherDay.day = daysInMonth;
          let endDow = otherDay.dayOfWeek();
          pos++;
          weekday = endDow - aDayOfWeek;
          if (weekday < 0) {
            weekday += 7;
          }
          weekday = daysInMonth - weekday;
        }
        weekday += pos * 7;
        return start + weekday;
      }
      /**
       * Checks if current time is the nth weekday, relative to the current
       * month.  Will always return false when rule resolves outside of current
       * month.
       *
       * @param {weekDay} aDayOfWeek                 Day of week to check
       * @param {Number} aPos                        Relative position
       * @return {Boolean}                           True, if it is the nth weekday
       */
      isNthWeekDay(aDayOfWeek, aPos) {
        let dow = this.dayOfWeek();
        if (aPos === 0 && dow === aDayOfWeek) {
          return true;
        }
        let day = this.nthWeekDay(aDayOfWeek, aPos);
        if (day === this.day) {
          return true;
        }
        return false;
      }
      /**
       * Calculates the ISO 8601 week number. The first week of a year is the
       * week that contains the first Thursday. The year can have 53 weeks, if
       * January 1st is a Friday.
       *
       * Note there are regions where the first week of the year is the one that
       * starts on January 1st, which may offset the week number. Also, if a
       * different week start is specified, this will also affect the week
       * number.
       *
       * @see Time.weekOneStarts
       * @param {weekDay} aWeekStart                  The weekday the week starts with
       * @return {Number}                             The ISO week number
       */
      weekNumber(aWeekStart) {
        let wnCacheKey = (this.year << 12) + (this.month << 8) + (this.day << 3) + aWeekStart;
        if (wnCacheKey in _Time._wnCache) {
          return _Time._wnCache[wnCacheKey];
        }
        let week1;
        let dt = this.clone();
        dt.isDate = true;
        let isoyear = this.year;
        if (dt.month == 12 && dt.day > 25) {
          week1 = _Time.weekOneStarts(isoyear + 1, aWeekStart);
          if (dt.compare(week1) < 0) {
            week1 = _Time.weekOneStarts(isoyear, aWeekStart);
          } else {
            isoyear++;
          }
        } else {
          week1 = _Time.weekOneStarts(isoyear, aWeekStart);
          if (dt.compare(week1) < 0) {
            week1 = _Time.weekOneStarts(--isoyear, aWeekStart);
          }
        }
        let daysBetween = dt.subtractDate(week1).toSeconds() / 86400;
        let answer = trunc(daysBetween / 7) + 1;
        _Time._wnCache[wnCacheKey] = answer;
        return answer;
      }
      /**
       * Adds the duration to the current time. The instance is modified in
       * place.
       *
       * @param {Duration} aDuration         The duration to add
       */
      addDuration(aDuration) {
        let mult = aDuration.isNegative ? -1 : 1;
        let second = this.second;
        let minute = this.minute;
        let hour = this.hour;
        let day = this.day;
        second += mult * aDuration.seconds;
        minute += mult * aDuration.minutes;
        hour += mult * aDuration.hours;
        day += mult * aDuration.days;
        day += mult * 7 * aDuration.weeks;
        this.second = second;
        this.minute = minute;
        this.hour = hour;
        this.day = day;
        this._cachedUnixTime = null;
      }
      /**
       * Subtract the date details (_excluding_ timezone).  Useful for finding
       * the relative difference between two time objects excluding their
       * timezone differences.
       *
       * @param {Time} aDate     The date to subtract
       * @return {Duration}      The difference as a duration
       */
      subtractDate(aDate) {
        let unixTime = this.toUnixTime() + this.utcOffset();
        let other = aDate.toUnixTime() + aDate.utcOffset();
        return Duration.fromSeconds(unixTime - other);
      }
      /**
       * Subtract the date details, taking timezones into account.
       *
       * @param {Time} aDate  The date to subtract
       * @return {Duration}   The difference in duration
       */
      subtractDateTz(aDate) {
        let unixTime = this.toUnixTime();
        let other = aDate.toUnixTime();
        return Duration.fromSeconds(unixTime - other);
      }
      /**
       * Compares the ICAL.Time instance with another one, or a period.
       *
       * @param {Time|Period} aOther                  The instance to compare with
       * @return {Number}                             -1, 0 or 1 for less/equal/greater
       */
      compare(other) {
        if (other instanceof Period) {
          return -1 * other.compare(this);
        } else {
          let a = this.toUnixTime();
          let b = other.toUnixTime();
          if (a > b) return 1;
          if (b > a) return -1;
          return 0;
        }
      }
      /**
       * Compares only the date part of this instance with another one.
       *
       * @param {Time} other                  The instance to compare with
       * @param {Timezone} tz                 The timezone to compare in
       * @return {Number}                     -1, 0 or 1 for less/equal/greater
       */
      compareDateOnlyTz(other, tz) {
        let a = this.convertToZone(tz);
        let b = other.convertToZone(tz);
        let rc = 0;
        if ((rc = _Time._cmp_attr(a, b, "year")) != 0) return rc;
        if ((rc = _Time._cmp_attr(a, b, "month")) != 0) return rc;
        if ((rc = _Time._cmp_attr(a, b, "day")) != 0) return rc;
        return rc;
      }
      /**
       * Convert the instance into another timezone. The returned ICAL.Time
       * instance is always a copy.
       *
       * @param {Timezone} zone      The zone to convert to
       * @return {Time}              The copy, converted to the zone
       */
      convertToZone(zone) {
        let copy = this.clone();
        let zone_equals = this.zone.tzid == zone.tzid;
        if (!this.isDate && !zone_equals) {
          Timezone.convert_time(copy, this.zone, zone);
        }
        copy.zone = zone;
        return copy;
      }
      /**
       * Calculates the UTC offset of the current date/time in the timezone it is
       * in.
       *
       * @return {Number}     UTC offset in seconds
       */
      utcOffset() {
        if (this.zone == Timezone.localTimezone || this.zone == Timezone.utcTimezone) {
          return 0;
        } else {
          return this.zone.utcOffset(this);
        }
      }
      /**
       * Returns an RFC 5545 compliant ical representation of this object.
       *
       * @return {String} ical date/date-time
       */
      toICALString() {
        let string2 = this.toString();
        if (string2.length > 10) {
          return design.icalendar.value["date-time"].toICAL(string2);
        } else {
          return design.icalendar.value.date.toICAL(string2);
        }
      }
      /**
       * The string representation of this date/time, in jCal form
       * (including : and - separators).
       * @return {String}
       */
      toString() {
        let result = this.year + "-" + pad2(this.month) + "-" + pad2(this.day);
        if (!this.isDate) {
          result += "T" + pad2(this.hour) + ":" + pad2(this.minute) + ":" + pad2(this.second);
          if (this.zone === Timezone.utcTimezone) {
            result += "Z";
          }
        }
        return result;
      }
      /**
       * Converts the current instance to a Javascript date
       * @return {Date}
       */
      toJSDate() {
        if (this.zone == Timezone.localTimezone) {
          if (this.isDate) {
            return new Date(this.year, this.month - 1, this.day);
          } else {
            return new Date(
              this.year,
              this.month - 1,
              this.day,
              this.hour,
              this.minute,
              this.second,
              0
            );
          }
        } else {
          return new Date(this.toUnixTime() * 1e3);
        }
      }
      _normalize() {
        if (this._time.isDate) {
          this._time.hour = 0;
          this._time.minute = 0;
          this._time.second = 0;
        }
        this.adjust(0, 0, 0, 0);
        return this;
      }
      /**
       * Adjust the date/time by the given offset
       *
       * @param {Number} aExtraDays       The extra amount of days
       * @param {Number} aExtraHours      The extra amount of hours
       * @param {Number} aExtraMinutes    The extra amount of minutes
       * @param {Number} aExtraSeconds    The extra amount of seconds
       * @param {Number=} aTime           The time to adjust, defaults to the
       *                                    current instance.
       */
      adjust(aExtraDays, aExtraHours, aExtraMinutes, aExtraSeconds, aTime) {
        let minutesOverflow, hoursOverflow, daysOverflow = 0, yearsOverflow = 0;
        let second, minute, hour, day;
        let daysInMonth;
        let time = aTime || this._time;
        if (!time.isDate) {
          second = time.second + aExtraSeconds;
          time.second = second % 60;
          minutesOverflow = trunc(second / 60);
          if (time.second < 0) {
            time.second += 60;
            minutesOverflow--;
          }
          minute = time.minute + aExtraMinutes + minutesOverflow;
          time.minute = minute % 60;
          hoursOverflow = trunc(minute / 60);
          if (time.minute < 0) {
            time.minute += 60;
            hoursOverflow--;
          }
          hour = time.hour + aExtraHours + hoursOverflow;
          time.hour = hour % 24;
          daysOverflow = trunc(hour / 24);
          if (time.hour < 0) {
            time.hour += 24;
            daysOverflow--;
          }
        }
        if (time.month > 12) {
          yearsOverflow = trunc((time.month - 1) / 12);
        } else if (time.month < 1) {
          yearsOverflow = trunc(time.month / 12) - 1;
        }
        time.year += yearsOverflow;
        time.month -= 12 * yearsOverflow;
        day = time.day + aExtraDays + daysOverflow;
        if (day > 0) {
          for (; ; ) {
            daysInMonth = _Time.daysInMonth(time.month, time.year);
            if (day <= daysInMonth) {
              break;
            }
            time.month++;
            if (time.month > 12) {
              time.year++;
              time.month = 1;
            }
            day -= daysInMonth;
          }
        } else {
          while (day <= 0) {
            if (time.month == 1) {
              time.year--;
              time.month = 12;
            } else {
              time.month--;
            }
            day += _Time.daysInMonth(time.month, time.year);
          }
        }
        time.day = day;
        this._cachedUnixTime = null;
        return this;
      }
      /**
       * Sets up the current instance from unix time, the number of seconds since
       * January 1st, 1970.
       *
       * @param {Number} seconds      The seconds to set up with
       */
      fromUnixTime(seconds) {
        this.zone = Timezone.utcTimezone;
        let date = new Date(seconds * 1e3);
        this.year = date.getUTCFullYear();
        this.month = date.getUTCMonth() + 1;
        this.day = date.getUTCDate();
        if (this._time.isDate) {
          this.hour = 0;
          this.minute = 0;
          this.second = 0;
        } else {
          this.hour = date.getUTCHours();
          this.minute = date.getUTCMinutes();
          this.second = date.getUTCSeconds();
        }
        this._cachedUnixTime = null;
      }
      /**
       * Converts the current instance to seconds since January 1st 1970.
       *
       * @return {Number}         Seconds since 1970
       */
      toUnixTime() {
        if (this._cachedUnixTime !== null) {
          return this._cachedUnixTime;
        }
        let offset = this.utcOffset();
        let ms = Date.UTC(
          this.year,
          this.month - 1,
          this.day,
          this.hour,
          this.minute,
          this.second - offset
        );
        this._cachedUnixTime = ms / 1e3;
        return this._cachedUnixTime;
      }
      /**
       * Converts time to into Object which can be serialized then re-created
       * using the constructor.
       *
       * @example
       * // toJSON will automatically be called
       * var json = JSON.stringify(mytime);
       *
       * var deserialized = JSON.parse(json);
       *
       * var time = new ICAL.Time(deserialized);
       *
       * @return {Object}
       */
      toJSON() {
        let copy = [
          "year",
          "month",
          "day",
          "hour",
          "minute",
          "second",
          "isDate"
        ];
        let result = /* @__PURE__ */ Object.create(null);
        let i = 0;
        let len = copy.length;
        let prop3;
        for (; i < len; i++) {
          prop3 = copy[i];
          result[prop3] = this[prop3];
        }
        if (this.zone) {
          result.timezone = this.zone.tzid;
        }
        return result;
      }
    };
    CHAR = /[^ \t]/;
    VALUE_DELIMITER = ":";
    PARAM_DELIMITER = ";";
    PARAM_NAME_DELIMITER = "=";
    DEFAULT_VALUE_TYPE$1 = "unknown";
    DEFAULT_PARAM_TYPE = "text";
    RFC6868_REPLACE_MAP$1 = { "^'": '"', "^n": "\n", "^^": "^" };
    parse.property = function(str, designSet) {
      let state = {
        component: [[], []],
        designSet: designSet || design.defaultSet
      };
      parse._handleContentLine(str, state);
      return state.component[1][0];
    };
    parse.component = function(str) {
      return parse(str);
    };
    ParserError = class extends Error {
      name = this.constructor.name;
    };
    parse.ParserError = ParserError;
    parse._handleContentLine = function(line, state) {
      let valuePos = line.indexOf(VALUE_DELIMITER);
      let paramPos = line.indexOf(PARAM_DELIMITER);
      let lastParamIndex;
      let lastValuePos;
      let name;
      let value;
      let params = {};
      if (paramPos !== -1 && valuePos !== -1) {
        if (paramPos > valuePos) {
          paramPos = -1;
        }
      }
      let parsedParams;
      if (paramPos !== -1) {
        name = line.slice(0, Math.max(0, paramPos)).toLowerCase();
        parsedParams = parse._parseParameters(line.slice(Math.max(0, paramPos)), 0, state.designSet);
        if (parsedParams[2] == -1) {
          throw new ParserError("Invalid parameters in '" + line + "'");
        }
        params = parsedParams[0];
        let parsedParamLength;
        if (typeof parsedParams[1] === "string") {
          parsedParamLength = parsedParams[1].length;
        } else {
          parsedParamLength = parsedParams[1].reduce((accumulator, currentValue) => {
            return accumulator + currentValue.length;
          }, 0);
        }
        lastParamIndex = parsedParamLength + parsedParams[2] + paramPos;
        if ((lastValuePos = line.slice(Math.max(0, lastParamIndex)).indexOf(VALUE_DELIMITER)) !== -1) {
          value = line.slice(Math.max(0, lastParamIndex + lastValuePos + 1));
        } else {
          throw new ParserError("Missing parameter value in '" + line + "'");
        }
      } else if (valuePos !== -1) {
        name = line.slice(0, Math.max(0, valuePos)).toLowerCase();
        value = line.slice(Math.max(0, valuePos + 1));
        if (name === "begin") {
          let newComponent = [value.toLowerCase(), [], []];
          if (state.stack.length === 1) {
            state.component.push(newComponent);
          } else {
            state.component[2].push(newComponent);
          }
          state.stack.push(state.component);
          state.component = newComponent;
          if (!state.designSet) {
            state.designSet = design.getDesignSet(state.component[0]);
          }
          return;
        } else if (name === "end") {
          state.component = state.stack.pop();
          return;
        }
      } else {
        throw new ParserError(
          'invalid line (no token ";" or ":") "' + line + '"'
        );
      }
      let valueType;
      let multiValue = false;
      let structuredValue = false;
      let propertyDetails;
      let splitName;
      let ungroupedName;
      if (state.designSet.propertyGroups && name.indexOf(".") !== -1) {
        splitName = name.split(".");
        params.group = splitName[0];
        ungroupedName = splitName[1];
      } else {
        ungroupedName = name;
      }
      if (ungroupedName in state.designSet.property) {
        propertyDetails = state.designSet.property[ungroupedName];
        if ("multiValue" in propertyDetails) {
          multiValue = propertyDetails.multiValue;
        }
        if ("structuredValue" in propertyDetails) {
          structuredValue = propertyDetails.structuredValue;
        }
        if (value && "detectType" in propertyDetails) {
          valueType = propertyDetails.detectType(value);
        }
      }
      if (!valueType) {
        if (!("value" in params)) {
          if (propertyDetails) {
            valueType = propertyDetails.defaultType;
          } else {
            valueType = DEFAULT_VALUE_TYPE$1;
          }
        } else {
          valueType = params.value.toLowerCase();
        }
      }
      delete params.value;
      let result;
      if (multiValue && structuredValue) {
        value = parse._parseMultiValue(value, structuredValue, valueType, [], multiValue, state.designSet, structuredValue);
        result = [ungroupedName, params, valueType, value];
      } else if (multiValue) {
        result = [ungroupedName, params, valueType];
        parse._parseMultiValue(value, multiValue, valueType, result, null, state.designSet, false);
      } else if (structuredValue) {
        value = parse._parseMultiValue(value, structuredValue, valueType, [], null, state.designSet, structuredValue);
        result = [ungroupedName, params, valueType, value];
      } else {
        value = parse._parseValue(value, valueType, state.designSet, false);
        result = [ungroupedName, params, valueType, value];
      }
      if (state.component[0] === "vcard" && state.component[1].length === 0 && !(name === "version" && value === "4.0")) {
        state.designSet = design.getDesignSet("vcard3");
      }
      state.component[1].push(result);
    };
    parse._parseValue = function(value, type, designSet, structuredValue) {
      if (type in designSet.value && "fromICAL" in designSet.value[type]) {
        return designSet.value[type].fromICAL(value, structuredValue);
      }
      return value;
    };
    parse._parseParameters = function(line, start, designSet) {
      let lastParam = start;
      let pos = 0;
      let delim = PARAM_NAME_DELIMITER;
      let result = {};
      let name, lcname;
      let value, valuePos = -1;
      let type, multiValue, mvdelim;
      while (pos !== false && (pos = line.indexOf(delim, pos + 1)) !== -1) {
        name = line.slice(lastParam + 1, pos);
        if (name.length == 0) {
          throw new ParserError("Empty parameter name in '" + line + "'");
        }
        lcname = name.toLowerCase();
        mvdelim = false;
        multiValue = false;
        if (lcname in designSet.param && designSet.param[lcname].valueType) {
          type = designSet.param[lcname].valueType;
        } else {
          type = DEFAULT_PARAM_TYPE;
        }
        if (lcname in designSet.param) {
          multiValue = designSet.param[lcname].multiValue;
          if (designSet.param[lcname].multiValueSeparateDQuote) {
            mvdelim = parse._rfc6868Escape('"' + multiValue + '"');
          }
        }
        let nextChar = line[pos + 1];
        if (nextChar === '"') {
          valuePos = pos + 2;
          pos = line.indexOf('"', valuePos);
          if (multiValue && pos != -1) {
            let extendedValue = true;
            while (extendedValue) {
              if (line[pos + 1] == multiValue && line[pos + 2] == '"') {
                pos = line.indexOf('"', pos + 3);
              } else {
                extendedValue = false;
              }
            }
          }
          if (pos === -1) {
            throw new ParserError(
              'invalid line (no matching double quote) "' + line + '"'
            );
          }
          value = line.slice(valuePos, pos);
          lastParam = line.indexOf(PARAM_DELIMITER, pos);
          let propValuePos = line.indexOf(VALUE_DELIMITER, pos);
          if (lastParam === -1 || propValuePos !== -1 && lastParam > propValuePos) {
            pos = false;
          }
        } else {
          valuePos = pos + 1;
          let nextPos = line.indexOf(PARAM_DELIMITER, valuePos);
          let propValuePos = line.indexOf(VALUE_DELIMITER, valuePos);
          if (propValuePos !== -1 && nextPos > propValuePos) {
            nextPos = propValuePos;
            pos = false;
          } else if (nextPos === -1) {
            if (propValuePos === -1) {
              nextPos = line.length;
            } else {
              nextPos = propValuePos;
            }
            pos = false;
          } else {
            lastParam = nextPos;
            pos = nextPos;
          }
          value = line.slice(valuePos, nextPos);
        }
        const length_before = value.length;
        value = parse._rfc6868Escape(value);
        valuePos += length_before - value.length;
        if (multiValue) {
          let delimiter = mvdelim || multiValue;
          value = parse._parseMultiValue(value, delimiter, type, [], null, designSet);
        } else {
          value = parse._parseValue(value, type, designSet);
        }
        if (multiValue && lcname in result) {
          if (Array.isArray(result[lcname])) {
            result[lcname].push(value);
          } else {
            result[lcname] = [
              result[lcname],
              value
            ];
          }
        } else {
          result[lcname] = value;
        }
      }
      return [result, value, valuePos];
    };
    parse._rfc6868Escape = function(val) {
      return val.replace(/\^['n^]/g, function(x) {
        return RFC6868_REPLACE_MAP$1[x];
      });
    };
    parse._parseMultiValue = function(buffer, delim, type, result, innerMulti, designSet, structuredValue) {
      let pos = 0;
      let lastPos = 0;
      let value;
      if (delim.length === 0) {
        return buffer;
      }
      while ((pos = unescapedIndexOf(buffer, delim, lastPos)) !== -1) {
        value = buffer.slice(lastPos, pos);
        if (innerMulti) {
          value = parse._parseMultiValue(value, innerMulti, type, [], null, designSet, structuredValue);
        } else {
          value = parse._parseValue(value, type, designSet, structuredValue);
        }
        result.push(value);
        lastPos = pos + delim.length;
      }
      value = buffer.slice(lastPos);
      if (innerMulti) {
        value = parse._parseMultiValue(value, innerMulti, type, [], null, designSet, structuredValue);
      } else {
        value = parse._parseValue(value, type, designSet, structuredValue);
      }
      result.push(value);
      return result.length == 1 ? result[0] : result;
    };
    parse._eachLine = function(buffer, callback) {
      let len = buffer.length;
      let lastPos = buffer.search(CHAR);
      let pos = lastPos;
      let line;
      let firstChar;
      let newlineOffset;
      do {
        pos = buffer.indexOf("\n", lastPos) + 1;
        if (pos > 1 && buffer[pos - 2] === "\r") {
          newlineOffset = 2;
        } else {
          newlineOffset = 1;
        }
        if (pos === 0) {
          pos = len;
          newlineOffset = 0;
        }
        firstChar = buffer[lastPos];
        if (firstChar === " " || firstChar === "	") {
          line += buffer.slice(lastPos + 1, pos - newlineOffset);
        } else {
          if (line)
            callback(null, line);
          line = buffer.slice(lastPos, pos - newlineOffset);
        }
        lastPos = pos;
      } while (pos !== len);
      line = line.trim();
      if (line.length)
        callback(null, line);
    };
    OPTIONS = ["tzid", "location", "tznames", "latitude", "longitude"];
    Timezone = class _Timezone {
      static _compare_change_fn(a, b) {
        if (a.year < b.year) return -1;
        else if (a.year > b.year) return 1;
        if (a.month < b.month) return -1;
        else if (a.month > b.month) return 1;
        if (a.day < b.day) return -1;
        else if (a.day > b.day) return 1;
        if (a.hour < b.hour) return -1;
        else if (a.hour > b.hour) return 1;
        if (a.minute < b.minute) return -1;
        else if (a.minute > b.minute) return 1;
        if (a.second < b.second) return -1;
        else if (a.second > b.second) return 1;
        return 0;
      }
      /**
       * Convert the date/time from one zone to the next.
       *
       * @param {Time} tt                  The time to convert
       * @param {Timezone} from_zone       The source zone to convert from
       * @param {Timezone} to_zone         The target zone to convert to
       * @return {Time}                    The converted date/time object
       */
      static convert_time(tt, from_zone, to_zone) {
        if (tt.isDate || from_zone.tzid == to_zone.tzid || from_zone == _Timezone.localTimezone || to_zone == _Timezone.localTimezone) {
          tt.zone = to_zone;
          return tt;
        }
        let utcOffset = from_zone.utcOffset(tt);
        tt.adjust(0, 0, 0, -utcOffset);
        utcOffset = to_zone.utcOffset(tt);
        tt.adjust(0, 0, 0, utcOffset);
        return null;
      }
      /**
       * Creates a new ICAL.Timezone instance from the passed data object.
       *
       * @param {Component|Object} aData options for class
       * @param {String|Component} aData.component
       *        If aData is a simple object, then this member can be set to either a
       *        string containing the component data, or an already parsed
       *        ICAL.Component
       * @param {String} aData.tzid      The timezone identifier
       * @param {String} aData.location  The timezone locationw
       * @param {String} aData.tznames   An alternative string representation of the
       *                                  timezone
       * @param {Number} aData.latitude  The latitude of the timezone
       * @param {Number} aData.longitude The longitude of the timezone
       */
      static fromData(aData) {
        let tt = new _Timezone();
        return tt.fromData(aData);
      }
      /**
       * The instance describing the UTC timezone
       * @type {Timezone}
       * @constant
       * @instance
       */
      static #utcTimezone = null;
      static get utcTimezone() {
        if (!this.#utcTimezone) {
          this.#utcTimezone = _Timezone.fromData({
            tzid: "UTC"
          });
        }
        return this.#utcTimezone;
      }
      /**
       * The instance describing the local timezone
       * @type {Timezone}
       * @constant
       * @instance
       */
      static #localTimezone = null;
      static get localTimezone() {
        if (!this.#localTimezone) {
          this.#localTimezone = _Timezone.fromData({
            tzid: "floating"
          });
        }
        return this.#localTimezone;
      }
      /**
       * Adjust a timezone change object.
       * @private
       * @param {Object} change     The timezone change object
       * @param {Number} days       The extra amount of days
       * @param {Number} hours      The extra amount of hours
       * @param {Number} minutes    The extra amount of minutes
       * @param {Number} seconds    The extra amount of seconds
       */
      static adjust_change(change, days, hours, minutes, seconds) {
        return Time.prototype.adjust.call(
          change,
          days,
          hours,
          minutes,
          seconds,
          change
        );
      }
      static _minimumExpansionYear = -1;
      static EXTRA_COVERAGE = 5;
      /**
       * Creates a new ICAL.Timezone instance, by passing in a tzid and component.
       *
       * @param {Component|Object} data options for class
       * @param {String|Component} data.component
       *        If data is a simple object, then this member can be set to either a
       *        string containing the component data, or an already parsed
       *        ICAL.Component
       * @param {String} data.tzid      The timezone identifier
       * @param {String} data.location  The timezone locationw
       * @param {String} data.tznames   An alternative string representation of the
       *                                  timezone
       * @param {Number} data.latitude  The latitude of the timezone
       * @param {Number} data.longitude The longitude of the timezone
       */
      constructor(data) {
        this.wrappedJSObject = this;
        this.fromData(data);
      }
      /**
       * Timezone identifier
       * @type {String}
       */
      tzid = "";
      /**
       * Timezone location
       * @type {String}
       */
      location = "";
      /**
       * Alternative timezone name, for the string representation
       * @type {String}
       */
      tznames = "";
      /**
       * The primary latitude for the timezone.
       * @type {Number}
       */
      latitude = 0;
      /**
       * The primary longitude for the timezone.
       * @type {Number}
       */
      longitude = 0;
      /**
       * The vtimezone component for this timezone.
       * @type {Component}
       */
      component = null;
      /**
       * The year this timezone has been expanded to. All timezone transition
       * dates until this year are known and can be used for calculation
       *
       * @private
       * @type {Number}
       */
      expandedUntilYear = 0;
      /**
       * The class identifier.
       * @constant
       * @type {String}
       * @default "icaltimezone"
       */
      icalclass = "icaltimezone";
      /**
       * Sets up the current instance using members from the passed data object.
       *
       * @param {Component|Object} aData options for class
       * @param {String|Component} aData.component
       *        If aData is a simple object, then this member can be set to either a
       *        string containing the component data, or an already parsed
       *        ICAL.Component
       * @param {String} aData.tzid      The timezone identifier
       * @param {String} aData.location  The timezone locationw
       * @param {String} aData.tznames   An alternative string representation of the
       *                                  timezone
       * @param {Number} aData.latitude  The latitude of the timezone
       * @param {Number} aData.longitude The longitude of the timezone
       */
      fromData(aData) {
        this.expandedUntilYear = 0;
        this.changes = [];
        if (aData instanceof Component) {
          this.component = aData;
        } else {
          if (aData && "component" in aData) {
            if (typeof aData.component == "string") {
              let jCal = parse(aData.component);
              this.component = new Component(jCal);
            } else if (aData.component instanceof Component) {
              this.component = aData.component;
            } else {
              this.component = null;
            }
          }
          for (let prop3 of OPTIONS) {
            if (aData && prop3 in aData) {
              this[prop3] = aData[prop3];
            }
          }
        }
        if (this.component instanceof Component && !this.tzid) {
          this.tzid = this.component.getFirstPropertyValue("tzid");
        }
        return this;
      }
      /**
       * Finds the utcOffset the given time would occur in this timezone.
       *
       * @param {Time} tt         The time to check for
       * @return {Number}         utc offset in seconds
       */
      utcOffset(tt) {
        if (this == _Timezone.utcTimezone || this == _Timezone.localTimezone) {
          return 0;
        }
        this._ensureCoverage(tt.year);
        if (!this.changes.length) {
          return 0;
        }
        let tt_change = {
          year: tt.year,
          month: tt.month,
          day: tt.day,
          hour: tt.hour,
          minute: tt.minute,
          second: tt.second
        };
        let change_num = this._findNearbyChange(tt_change);
        let change_num_to_use = -1;
        let step = 1;
        for (; ; ) {
          let change = clone(this.changes[change_num], true);
          if (change.utcOffset < change.prevUtcOffset) {
            _Timezone.adjust_change(change, 0, 0, 0, change.utcOffset);
          } else {
            _Timezone.adjust_change(
              change,
              0,
              0,
              0,
              change.prevUtcOffset
            );
          }
          let cmp = _Timezone._compare_change_fn(tt_change, change);
          if (cmp >= 0) {
            change_num_to_use = change_num;
          } else {
            step = -1;
          }
          if (step == -1 && change_num_to_use != -1) {
            break;
          }
          change_num += step;
          if (change_num < 0) {
            return 0;
          }
          if (change_num >= this.changes.length) {
            break;
          }
        }
        let zone_change = this.changes[change_num_to_use];
        let utcOffset_change = zone_change.utcOffset - zone_change.prevUtcOffset;
        if (utcOffset_change < 0 && change_num_to_use > 0) {
          let tmp_change = clone(zone_change, true);
          _Timezone.adjust_change(tmp_change, 0, 0, 0, tmp_change.prevUtcOffset);
          if (_Timezone._compare_change_fn(tt_change, tmp_change) < 0) {
            let prev_zone_change = this.changes[change_num_to_use - 1];
            let want_daylight = false;
            if (zone_change.is_daylight != want_daylight && prev_zone_change.is_daylight == want_daylight) {
              zone_change = prev_zone_change;
            }
          }
        }
        return zone_change.utcOffset;
      }
      _findNearbyChange(change) {
        let idx = binsearchInsert(
          this.changes,
          change,
          _Timezone._compare_change_fn
        );
        if (idx >= this.changes.length) {
          return this.changes.length - 1;
        }
        return idx;
      }
      _ensureCoverage(aYear) {
        if (_Timezone._minimumExpansionYear == -1) {
          let today = Time.now();
          _Timezone._minimumExpansionYear = today.year;
        }
        let changesEndYear = aYear;
        if (changesEndYear < _Timezone._minimumExpansionYear) {
          changesEndYear = _Timezone._minimumExpansionYear;
        }
        changesEndYear += _Timezone.EXTRA_COVERAGE;
        if (!this.changes.length || this.expandedUntilYear < aYear) {
          let subcomps = this.component.getAllSubcomponents();
          let compLen = subcomps.length;
          let compIdx = 0;
          for (; compIdx < compLen; compIdx++) {
            this._expandComponent(
              subcomps[compIdx],
              changesEndYear,
              this.changes
            );
          }
          this.changes.sort(_Timezone._compare_change_fn);
          this.expandedUntilYear = changesEndYear;
        }
      }
      _expandComponent(aComponent, aYear, changes) {
        if (!aComponent.hasProperty("dtstart") || !aComponent.hasProperty("tzoffsetto") || !aComponent.hasProperty("tzoffsetfrom")) {
          return null;
        }
        let dtstart = aComponent.getFirstProperty("dtstart").getFirstValue();
        let change;
        function convert_tzoffset(offset) {
          return offset.factor * (offset.hours * 3600 + offset.minutes * 60);
        }
        function init_changes() {
          let changebase = {};
          changebase.is_daylight = aComponent.name == "daylight";
          changebase.utcOffset = convert_tzoffset(
            aComponent.getFirstProperty("tzoffsetto").getFirstValue()
          );
          changebase.prevUtcOffset = convert_tzoffset(
            aComponent.getFirstProperty("tzoffsetfrom").getFirstValue()
          );
          return changebase;
        }
        if (!aComponent.hasProperty("rrule") && !aComponent.hasProperty("rdate")) {
          change = init_changes();
          change.year = dtstart.year;
          change.month = dtstart.month;
          change.day = dtstart.day;
          change.hour = dtstart.hour;
          change.minute = dtstart.minute;
          change.second = dtstart.second;
          _Timezone.adjust_change(change, 0, 0, 0, -change.prevUtcOffset);
          changes.push(change);
        } else {
          let props = aComponent.getAllProperties("rdate");
          for (let rdate of props) {
            let time = rdate.getFirstValue();
            change = init_changes();
            change.year = time.year;
            change.month = time.month;
            change.day = time.day;
            if (time.isDate) {
              change.hour = dtstart.hour;
              change.minute = dtstart.minute;
              change.second = dtstart.second;
              if (dtstart.zone != _Timezone.utcTimezone) {
                _Timezone.adjust_change(change, 0, 0, 0, -change.prevUtcOffset);
              }
            } else {
              change.hour = time.hour;
              change.minute = time.minute;
              change.second = time.second;
              if (time.zone != _Timezone.utcTimezone) {
                _Timezone.adjust_change(change, 0, 0, 0, -change.prevUtcOffset);
              }
            }
            changes.push(change);
          }
          let rrule = aComponent.getFirstProperty("rrule");
          if (rrule) {
            rrule = rrule.getFirstValue();
            change = init_changes();
            if (rrule.until && rrule.until.zone == _Timezone.utcTimezone) {
              rrule.until.adjust(0, 0, 0, change.prevUtcOffset);
              rrule.until.zone = _Timezone.localTimezone;
            }
            let iterator = rrule.iterator(dtstart);
            let occ;
            while (occ = iterator.next()) {
              change = init_changes();
              if (occ.year > aYear || !occ) {
                break;
              }
              change.year = occ.year;
              change.month = occ.month;
              change.day = occ.day;
              change.hour = occ.hour;
              change.minute = occ.minute;
              change.second = occ.second;
              change.isDate = occ.isDate;
              _Timezone.adjust_change(change, 0, 0, 0, -change.prevUtcOffset);
              changes.push(change);
            }
          }
        }
        return changes;
      }
      /**
       * The string representation of this timezone.
       * @return {String}
       */
      toString() {
        return this.tznames ? this.tznames : this.tzid;
      }
    };
    zones = null;
    TimezoneService = {
      get count() {
        if (zones === null) {
          return 0;
        }
        return Object.keys(zones).length;
      },
      reset: function() {
        zones = /* @__PURE__ */ Object.create(null);
        let utc = Timezone.utcTimezone;
        zones.Z = utc;
        zones.UTC = utc;
        zones.GMT = utc;
      },
      _hard_reset: function() {
        zones = null;
      },
      /**
       * Checks if timezone id has been registered.
       *
       * @param {String} tzid     Timezone identifier (e.g. America/Los_Angeles)
       * @return {Boolean}        False, when not present
       */
      has: function(tzid) {
        if (zones === null) {
          return false;
        }
        return !!zones[tzid];
      },
      /**
       * Returns a timezone by its tzid if present.
       *
       * @param {String} tzid               Timezone identifier (e.g. America/Los_Angeles)
       * @return {Timezone | undefined}     The timezone, or undefined if not found
       */
      get: function(tzid) {
        if (zones === null) {
          this.reset();
        }
        return zones[tzid];
      },
      /**
       * Registers a timezone object or component.
       *
       * @param {Component|Timezone} timezone
       *        The initialized zone or vtimezone.
       *
       * @param {String=} name
       *        The name of the timezone. Defaults to the component's TZID if not
       *        passed.
       */
      register: function(timezone, name) {
        if (zones === null) {
          this.reset();
        }
        if (typeof timezone === "string" && name instanceof Timezone) {
          [timezone, name] = [name, timezone];
        }
        if (!name) {
          if (timezone instanceof Timezone) {
            name = timezone.tzid;
          } else {
            if (timezone.name === "vtimezone") {
              timezone = new Timezone(timezone);
              name = timezone.tzid;
            }
          }
        }
        if (!name) {
          throw new TypeError("Neither a timezone nor a name was passed");
        }
        if (timezone instanceof Timezone) {
          zones[name] = timezone;
        } else {
          throw new TypeError("timezone must be ICAL.Timezone or ICAL.Component");
        }
      },
      /**
       * Removes a timezone by its tzid from the list.
       *
       * @param {String} tzid     Timezone identifier (e.g. America/Los_Angeles)
       * @return {?Timezone}      The removed timezone, or null if not registered
       */
      remove: function(tzid) {
        if (zones === null) {
          return null;
        }
        return delete zones[tzid];
      }
    };
    helpers = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      binsearchInsert,
      clone,
      extend,
      foldline,
      formatClassType,
      isStrictlyNaN,
      pad2,
      strictParseInt,
      trunc,
      unescapedIndexOf,
      updateTimezones
    });
    UtcOffset = class _UtcOffset {
      /**
       * Creates a new {@link ICAL.UtcOffset} instance from the passed string.
       *
       * @param {String} aString    The string to parse
       * @return {Duration}         The created utc-offset instance
       */
      static fromString(aString) {
        let options = {};
        options.factor = aString[0] === "+" ? 1 : -1;
        options.hours = strictParseInt(aString.slice(1, 3));
        options.minutes = strictParseInt(aString.slice(4, 6));
        return new _UtcOffset(options);
      }
      /**
       * Creates a new {@link ICAL.UtcOffset} instance from the passed seconds
       * value.
       *
       * @param {Number} aSeconds       The number of seconds to convert
       */
      static fromSeconds(aSeconds) {
        let instance = new _UtcOffset();
        instance.fromSeconds(aSeconds);
        return instance;
      }
      /**
       * Creates a new ICAL.UtcOffset instance.
       *
       * @param {Object} aData          An object with members of the utc offset
       * @param {Number=} aData.hours   The hours for the utc offset
       * @param {Number=} aData.minutes The minutes in the utc offset
       * @param {Number=} aData.factor  The factor for the utc-offset, either -1 or 1
       */
      constructor(aData) {
        this.fromData(aData);
      }
      /**
       * The hours in the utc-offset
       * @type {Number}
       */
      hours = 0;
      /**
       * The minutes in the utc-offset
       * @type {Number}
       */
      minutes = 0;
      /**
       * The sign of the utc offset, 1 for positive offset, -1 for negative
       * offsets.
       * @type {Number}
       */
      factor = 1;
      /**
       * The type name, to be used in the jCal object.
       * @constant
       * @type {String}
       * @default "utc-offset"
       */
      icaltype = "utc-offset";
      /**
       * Returns a clone of the utc offset object.
       *
       * @return {UtcOffset}     The cloned object
       */
      clone() {
        return _UtcOffset.fromSeconds(this.toSeconds());
      }
      /**
       * Sets up the current instance using members from the passed data object.
       *
       * @param {Object} aData          An object with members of the utc offset
       * @param {Number=} aData.hours   The hours for the utc offset
       * @param {Number=} aData.minutes The minutes in the utc offset
       * @param {Number=} aData.factor  The factor for the utc-offset, either -1 or 1
       */
      fromData(aData) {
        if (aData) {
          for (let [key, value] of Object.entries(aData)) {
            this[key] = value;
          }
        }
        this._normalize();
      }
      /**
       * Sets up the current instance from the given seconds value. The seconds
       * value is truncated to the minute. Offsets are wrapped when the world
       * ends, the hour after UTC+14:00 is UTC-12:00.
       *
       * @param {Number} aSeconds         The seconds to convert into an offset
       */
      fromSeconds(aSeconds) {
        let secs = Math.abs(aSeconds);
        this.factor = aSeconds < 0 ? -1 : 1;
        this.hours = trunc(secs / 3600);
        secs -= this.hours * 3600;
        this.minutes = trunc(secs / 60);
        return this;
      }
      /**
       * Convert the current offset to a value in seconds
       *
       * @return {Number}                 The offset in seconds
       */
      toSeconds() {
        return this.factor * (60 * this.minutes + 3600 * this.hours);
      }
      /**
       * Compare this utc offset with another one.
       *
       * @param {UtcOffset} other             The other offset to compare with
       * @return {Number}                     -1, 0 or 1 for less/equal/greater
       */
      compare(other) {
        let a = this.toSeconds();
        let b = other.toSeconds();
        return (a > b) - (b > a);
      }
      _normalize() {
        let secs = this.toSeconds();
        let factor = this.factor;
        while (secs < -43200) {
          secs += 97200;
        }
        while (secs > 50400) {
          secs -= 97200;
        }
        this.fromSeconds(secs);
        if (secs == 0) {
          this.factor = factor;
        }
      }
      /**
       * The iCalendar string representation of this utc-offset.
       * @return {String}
       */
      toICALString() {
        return design.icalendar.value["utc-offset"].toICAL(this.toString());
      }
      /**
       * The string representation of this utc-offset.
       * @return {String}
       */
      toString() {
        return (this.factor == 1 ? "+" : "-") + pad2(this.hours) + ":" + pad2(this.minutes);
      }
    };
    VCardTime = class _VCardTime extends Time {
      /**
       * Returns a new ICAL.VCardTime instance from a date and/or time string.
       *
       * @param {String} aValue     The string to create from
       * @param {String} aIcalType  The type for this instance, e.g. date-and-or-time
       * @return {VCardTime}        The date/time instance
       */
      static fromDateAndOrTimeString(aValue, aIcalType) {
        function part(v, s, e) {
          return v ? strictParseInt(v.slice(s, s + e)) : null;
        }
        let parts = aValue.split("T");
        let dt = parts[0], tmz = parts[1];
        let splitzone = tmz ? design.vcard.value.time._splitZone(tmz) : [];
        let zone = splitzone[0], tm = splitzone[1];
        let dtlen = dt ? dt.length : 0;
        let tmlen = tm ? tm.length : 0;
        let hasDashDate = dt && dt[0] == "-" && dt[1] == "-";
        let hasDashTime = tm && tm[0] == "-";
        let o = {
          year: hasDashDate ? null : part(dt, 0, 4),
          month: hasDashDate && (dtlen == 4 || dtlen == 7) ? part(dt, 2, 2) : dtlen == 7 ? part(dt, 5, 2) : dtlen == 10 ? part(dt, 5, 2) : null,
          day: dtlen == 5 ? part(dt, 3, 2) : dtlen == 7 && hasDashDate ? part(dt, 5, 2) : dtlen == 10 ? part(dt, 8, 2) : null,
          hour: hasDashTime ? null : part(tm, 0, 2),
          minute: hasDashTime && tmlen == 3 ? part(tm, 1, 2) : tmlen > 4 ? hasDashTime ? part(tm, 1, 2) : part(tm, 3, 2) : null,
          second: tmlen == 4 ? part(tm, 2, 2) : tmlen == 6 ? part(tm, 4, 2) : tmlen == 8 ? part(tm, 6, 2) : null
        };
        if (zone == "Z") {
          zone = Timezone.utcTimezone;
        } else if (zone && zone[3] == ":") {
          zone = UtcOffset.fromString(zone);
        } else {
          zone = null;
        }
        return new _VCardTime(o, zone, aIcalType);
      }
      /**
       * Creates a new ICAL.VCardTime instance.
       *
       * @param {Object} data                           The data for the time instance
       * @param {Number=} data.year                     The year for this date
       * @param {Number=} data.month                    The month for this date
       * @param {Number=} data.day                      The day for this date
       * @param {Number=} data.hour                     The hour for this date
       * @param {Number=} data.minute                   The minute for this date
       * @param {Number=} data.second                   The second for this date
       * @param {Timezone|UtcOffset} zone               The timezone to use
       * @param {String} icaltype                       The type for this date/time object
       */
      constructor(data, zone, icaltype) {
        super(data, zone);
        this.icaltype = icaltype || "date-and-or-time";
      }
      /**
       * The class identifier.
       * @constant
       * @type {String}
       * @default "vcardtime"
       */
      icalclass = "vcardtime";
      /**
       * The type name, to be used in the jCal object.
       * @type {String}
       * @default "date-and-or-time"
       */
      icaltype = "date-and-or-time";
      /**
       * Returns a clone of the vcard date/time object.
       *
       * @return {VCardTime}     The cloned object
       */
      clone() {
        return new _VCardTime(this._time, this.zone, this.icaltype);
      }
      _normalize() {
        return this;
      }
      /**
       * @inheritdoc
       */
      utcOffset() {
        if (this.zone instanceof UtcOffset) {
          return this.zone.toSeconds();
        } else {
          return Time.prototype.utcOffset.apply(this, arguments);
        }
      }
      /**
       * Returns an RFC 6350 compliant representation of this object.
       *
       * @return {String}         vcard date/time string
       */
      toICALString() {
        return design.vcard.value[this.icaltype].toICAL(this.toString());
      }
      /**
       * The string representation of this date/time, in jCard form
       * (including : and - separators).
       * @return {String}
       */
      toString() {
        let y = this.year, m = this.month, d = this.day;
        let h = this.hour, mm = this.minute, s = this.second;
        let hasYear = y !== null, hasMonth = m !== null, hasDay = d !== null;
        let hasHour = h !== null, hasMinute = mm !== null, hasSecond = s !== null;
        let datepart = (hasYear ? pad2(y) + (hasMonth || hasDay ? "-" : "") : hasMonth || hasDay ? "--" : "") + (hasMonth ? pad2(m) : "") + (hasDay ? "-" + pad2(d) : "");
        let timepart = (hasHour ? pad2(h) : "-") + (hasHour && hasMinute ? ":" : "") + (hasMinute ? pad2(mm) : "") + (!hasHour && !hasMinute ? "-" : "") + (hasMinute && hasSecond ? ":" : "") + (hasSecond ? pad2(s) : "");
        let zone;
        if (this.zone === Timezone.utcTimezone) {
          zone = "Z";
        } else if (this.zone instanceof UtcOffset) {
          zone = this.zone.toString();
        } else if (this.zone === Timezone.localTimezone) {
          zone = "";
        } else if (this.zone instanceof Timezone) {
          let offset = UtcOffset.fromSeconds(this.zone.utcOffset(this));
          zone = offset.toString();
        } else {
          zone = "";
        }
        switch (this.icaltype) {
          case "time":
            return timepart + zone;
          case "date-and-or-time":
          case "date-time":
            return datepart + (timepart == "--" ? "" : "T" + timepart + zone);
          case "date":
            return datepart;
        }
        return null;
      }
    };
    RecurIterator = class _RecurIterator {
      static _indexMap = {
        "BYSECOND": 0,
        "BYMINUTE": 1,
        "BYHOUR": 2,
        "BYDAY": 3,
        "BYMONTHDAY": 4,
        "BYYEARDAY": 5,
        "BYWEEKNO": 6,
        "BYMONTH": 7,
        "BYSETPOS": 8
      };
      static _expandMap = {
        "SECONDLY": [1, 1, 1, 1, 1, 1, 1, 1],
        "MINUTELY": [2, 1, 1, 1, 1, 1, 1, 1],
        "HOURLY": [2, 2, 1, 1, 1, 1, 1, 1],
        "DAILY": [2, 2, 2, 1, 1, 1, 1, 1],
        "WEEKLY": [2, 2, 2, 2, 3, 3, 1, 1],
        "MONTHLY": [2, 2, 2, 2, 2, 3, 3, 1],
        "YEARLY": [2, 2, 2, 2, 2, 2, 2, 2]
      };
      static UNKNOWN = 0;
      static CONTRACT = 1;
      static EXPAND = 2;
      static ILLEGAL = 3;
      /**
       * Creates a new ICAL.RecurIterator instance. The options object may contain additional members
       * when resuming iteration from a previous run.
       *
       * @param {Object} options                The iterator options
       * @param {Recur} options.rule            The rule to iterate.
       * @param {Time} options.dtstart          The start date of the event.
       * @param {Boolean=} options.initialized  When true, assume that options are
       *        from a previously constructed iterator. Initialization will not be
       *        repeated.
       */
      constructor(options) {
        this.fromData(options);
      }
      /**
       * True when iteration is finished.
       * @type {Boolean}
       */
      completed = false;
      /**
       * The rule that is being iterated
       * @type {Recur}
       */
      rule = null;
      /**
       * The start date of the event being iterated.
       * @type {Time}
       */
      dtstart = null;
      /**
       * The last occurrence that was returned from the
       * {@link RecurIterator#next} method.
       * @type {Time}
       */
      last = null;
      /**
       * The sequence number from the occurrence
       * @type {Number}
       */
      occurrence_number = 0;
      /**
       * The indices used for the {@link ICAL.RecurIterator#by_data} object.
       * @type {Object}
       * @private
       */
      by_indices = null;
      /**
       * If true, the iterator has already been initialized
       * @type {Boolean}
       * @private
       */
      initialized = false;
      /**
       * The initializd by-data.
       * @type {Object}
       * @private
       */
      by_data = null;
      /**
       * The expanded yeardays
       * @type {Array}
       * @private
       */
      days = null;
      /**
       * The index in the {@link ICAL.RecurIterator#days} array.
       * @type {Number}
       * @private
       */
      days_index = 0;
      /**
       * Initialize the recurrence iterator from the passed data object. This
       * method is usually not called directly, you can initialize the iterator
       * through the constructor.
       *
       * @param {Object} options                The iterator options
       * @param {Recur} options.rule            The rule to iterate.
       * @param {Time} options.dtstart          The start date of the event.
       * @param {Boolean=} options.initialized  When true, assume that options are
       *        from a previously constructed iterator. Initialization will not be
       *        repeated.
       */
      fromData(options) {
        this.rule = formatClassType(options.rule, Recur);
        if (!this.rule) {
          throw new Error("iterator requires a (ICAL.Recur) rule");
        }
        this.dtstart = formatClassType(options.dtstart, Time);
        if (!this.dtstart) {
          throw new Error("iterator requires a (ICAL.Time) dtstart");
        }
        if (options.by_data) {
          this.by_data = options.by_data;
        } else {
          this.by_data = clone(this.rule.parts, true);
        }
        if (options.occurrence_number)
          this.occurrence_number = options.occurrence_number;
        this.days = options.days || [];
        if (options.last) {
          this.last = formatClassType(options.last, Time);
        }
        this.by_indices = options.by_indices;
        if (!this.by_indices) {
          this.by_indices = {
            "BYSECOND": 0,
            "BYMINUTE": 0,
            "BYHOUR": 0,
            "BYDAY": 0,
            "BYMONTH": 0,
            "BYWEEKNO": 0,
            "BYMONTHDAY": 0
          };
        }
        this.initialized = options.initialized || false;
        if (!this.initialized) {
          try {
            this.init();
          } catch (e) {
            if (e instanceof InvalidRecurrenceRuleError) {
              this.completed = true;
            } else {
              throw e;
            }
          }
        }
      }
      /**
       * Initialize the iterator
       * @private
       */
      init() {
        this.initialized = true;
        this.last = this.dtstart.clone();
        let parts = this.by_data;
        if ("BYDAY" in parts) {
          this.sort_byday_rules(parts.BYDAY);
        }
        if ("BYYEARDAY" in parts) {
          if ("BYMONTH" in parts || "BYWEEKNO" in parts || "BYMONTHDAY" in parts) {
            throw new Error("Invalid BYYEARDAY rule");
          }
        }
        if ("BYWEEKNO" in parts && "BYMONTHDAY" in parts) {
          throw new Error("BYWEEKNO does not fit to BYMONTHDAY");
        }
        if (this.rule.freq == "MONTHLY" && ("BYYEARDAY" in parts || "BYWEEKNO" in parts)) {
          throw new Error("For MONTHLY recurrences neither BYYEARDAY nor BYWEEKNO may appear");
        }
        if (this.rule.freq == "WEEKLY" && ("BYYEARDAY" in parts || "BYMONTHDAY" in parts)) {
          throw new Error("For WEEKLY recurrences neither BYMONTHDAY nor BYYEARDAY may appear");
        }
        if (this.rule.freq != "YEARLY" && "BYYEARDAY" in parts) {
          throw new Error("BYYEARDAY may only appear in YEARLY rules");
        }
        this.last.second = this.setup_defaults("BYSECOND", "SECONDLY", this.dtstart.second);
        this.last.minute = this.setup_defaults("BYMINUTE", "MINUTELY", this.dtstart.minute);
        this.last.hour = this.setup_defaults("BYHOUR", "HOURLY", this.dtstart.hour);
        this.last.day = this.setup_defaults("BYMONTHDAY", "DAILY", this.dtstart.day);
        this.last.month = this.setup_defaults("BYMONTH", "MONTHLY", this.dtstart.month);
        if (this.rule.freq == "WEEKLY") {
          if ("BYDAY" in parts) {
            let [, dow] = this.ruleDayOfWeek(parts.BYDAY[0], this.rule.wkst);
            let wkdy = dow - this.last.dayOfWeek(this.rule.wkst);
            if (this.last.dayOfWeek(this.rule.wkst) < dow && wkdy >= 0 || wkdy < 0) {
              this.last.day += wkdy;
            }
          } else {
            let dayName = Recur.numericDayToIcalDay(this.dtstart.dayOfWeek());
            parts.BYDAY = [dayName];
          }
        }
        if (this.rule.freq == "YEARLY") {
          const untilYear = this.rule.until ? this.rule.until.year : 2e4;
          while (this.last.year <= untilYear) {
            this.expand_year_days(this.last.year);
            if (this.days.length > 0) {
              break;
            }
            this.increment_year(this.rule.interval);
          }
          if (this.days.length == 0) {
            throw new InvalidRecurrenceRuleError();
          }
          if (!this._nextByYearDay() && !this.next_year() && !this.next_year() && !this.next_year()) {
            throw new InvalidRecurrenceRuleError();
          }
        }
        if (this.rule.freq == "MONTHLY") {
          if (this.has_by_data("BYDAY")) {
            let tempLast = null;
            let initLast = this.last.clone();
            let daysInMonth = Time.daysInMonth(this.last.month, this.last.year);
            for (let bydow of this.by_data.BYDAY) {
              this.last = initLast.clone();
              let [pos, dow] = this.ruleDayOfWeek(bydow);
              let dayOfMonth = this.last.nthWeekDay(dow, pos);
              if (pos >= 6 || pos <= -6) {
                throw new Error("Malformed values in BYDAY part");
              }
              if (dayOfMonth > daysInMonth || dayOfMonth <= 0) {
                if (tempLast && tempLast.month == initLast.month) {
                  continue;
                }
                while (dayOfMonth > daysInMonth || dayOfMonth <= 0) {
                  this.increment_month();
                  daysInMonth = Time.daysInMonth(this.last.month, this.last.year);
                  dayOfMonth = this.last.nthWeekDay(dow, pos);
                }
              }
              this.last.day = dayOfMonth;
              if (!tempLast || this.last.compare(tempLast) < 0) {
                tempLast = this.last.clone();
              }
            }
            this.last = tempLast.clone();
            if (this.has_by_data("BYMONTHDAY")) {
              this._byDayAndMonthDay(true);
            }
            if (this.last.day > daysInMonth || this.last.day == 0) {
              throw new Error("Malformed values in BYDAY part");
            }
          } else if (this.has_by_data("BYMONTHDAY")) {
            this.last.day = 1;
            let normalized = this.normalizeByMonthDayRules(
              this.last.year,
              this.last.month,
              this.rule.parts.BYMONTHDAY
            ).filter((d) => d >= this.last.day);
            if (normalized.length) {
              this.last.day = normalized[0];
              this.by_data.BYMONTHDAY = normalized;
            } else {
              if (!this.next_month() && !this.next_month() && !this.next_month()) {
                throw new InvalidRecurrenceRuleError();
              }
            }
          }
        }
      }
      /**
       * Retrieve the next occurrence from the iterator.
       * @return {Time}
       */
      next(again = false) {
        let before = this.last ? this.last.clone() : null;
        if (this.rule.count && this.occurrence_number >= this.rule.count || this.rule.until && this.last.compare(this.rule.until) > 0) {
          this.completed = true;
        }
        if (this.completed) {
          return null;
        }
        if (this.occurrence_number == 0 && this.last.compare(this.dtstart) >= 0) {
          this.occurrence_number++;
          return this.last;
        }
        let valid;
        let invalid_count = 0;
        do {
          valid = 1;
          switch (this.rule.freq) {
            case "SECONDLY":
              this.next_second();
              break;
            case "MINUTELY":
              this.next_minute();
              break;
            case "HOURLY":
              this.next_hour();
              break;
            case "DAILY":
              this.next_day();
              break;
            case "WEEKLY":
              this.next_week();
              break;
            case "MONTHLY":
              valid = this.next_month();
              if (valid) {
                invalid_count = 0;
              } else if (++invalid_count == 336) {
                this.completed = true;
                return null;
              }
              break;
            case "YEARLY":
              valid = this.next_year();
              if (valid) {
                invalid_count = 0;
              } else if (++invalid_count == 28) {
                this.completed = true;
                return null;
              }
              break;
            default:
              return null;
          }
        } while (!this.check_contracting_rules() || this.last.compare(this.dtstart) < 0 || !valid);
        if (this.last.compare(before) == 0) {
          if (again) {
            throw new Error("Same occurrence found twice, protecting you from death by recursion");
          }
          this.next(true);
        }
        if (this.rule.until && this.last.compare(this.rule.until) > 0) {
          this.completed = true;
          return null;
        } else {
          this.occurrence_number++;
          return this.last;
        }
      }
      next_second() {
        return this.next_generic("BYSECOND", "SECONDLY", "second", "minute");
      }
      increment_second(inc) {
        return this.increment_generic(inc, "second", 60, "minute");
      }
      next_minute() {
        return this.next_generic(
          "BYMINUTE",
          "MINUTELY",
          "minute",
          "hour",
          "next_second"
        );
      }
      increment_minute(inc) {
        return this.increment_generic(inc, "minute", 60, "hour");
      }
      next_hour() {
        return this.next_generic(
          "BYHOUR",
          "HOURLY",
          "hour",
          "monthday",
          "next_minute"
        );
      }
      increment_hour(inc) {
        this.increment_generic(inc, "hour", 24, "monthday");
      }
      next_day() {
        let this_freq = this.rule.freq == "DAILY";
        if (this.next_hour() == 0) {
          return 0;
        }
        if (this_freq) {
          this.increment_monthday(this.rule.interval);
        } else {
          this.increment_monthday(1);
        }
        return 0;
      }
      next_week() {
        let end_of_data = 0;
        if (this.next_weekday_by_week() == 0) {
          return end_of_data;
        }
        if (this.has_by_data("BYWEEKNO")) {
          this.by_indices.BYWEEKNO++;
          if (this.by_indices.BYWEEKNO == this.by_data.BYWEEKNO.length) {
            this.by_indices.BYWEEKNO = 0;
            end_of_data = 1;
          }
          this.last.month = 1;
          this.last.day = 1;
          let week_no = this.by_data.BYWEEKNO[this.by_indices.BYWEEKNO];
          this.last.day += 7 * week_no;
          if (end_of_data) {
            this.increment_year(1);
          }
        } else {
          this.increment_monthday(7 * this.rule.interval);
        }
        return end_of_data;
      }
      /**
       * Normalize each by day rule for a given year/month.
       * Takes into account ordering and negative rules
       *
       * @private
       * @param {Number} year         Current year.
       * @param {Number} month        Current month.
       * @param {Array}  rules        Array of rules.
       *
       * @return {Array} sorted and normalized rules.
       *                 Negative rules will be expanded to their
       *                 correct positive values for easier processing.
       */
      normalizeByMonthDayRules(year, month, rules) {
        let daysInMonth = Time.daysInMonth(month, year);
        let newRules = [];
        let ruleIdx = 0;
        let len = rules.length;
        let rule;
        for (; ruleIdx < len; ruleIdx++) {
          rule = parseInt(rules[ruleIdx], 10);
          if (isNaN(rule)) {
            throw new Error("Invalid BYMONTHDAY value");
          }
          if (Math.abs(rule) > daysInMonth) {
            continue;
          }
          if (rule < 0) {
            rule = daysInMonth + (rule + 1);
          } else if (rule === 0) {
            continue;
          }
          if (newRules.indexOf(rule) === -1) {
            newRules.push(rule);
          }
        }
        return newRules.sort(function(a, b) {
          return a - b;
        });
      }
      /**
       * NOTES:
       * We are given a list of dates in the month (BYMONTHDAY) (23, etc..)
       * Also we are given a list of days (BYDAY) (MO, 2SU, etc..) when
       * both conditions match a given date (this.last.day) iteration stops.
       *
       * @private
       * @param {Boolean=} isInit     When given true will not increment the
       *                                current day (this.last).
       */
      _byDayAndMonthDay(isInit) {
        let byMonthDay;
        let byDay = this.by_data.BYDAY;
        let date;
        let dateIdx = 0;
        let dateLen;
        let dayLen = byDay.length;
        let dataIsValid = 0;
        let daysInMonth;
        let self = this;
        let lastDay = this.last.day;
        function initMonth() {
          daysInMonth = Time.daysInMonth(
            self.last.month,
            self.last.year
          );
          byMonthDay = self.normalizeByMonthDayRules(
            self.last.year,
            self.last.month,
            self.by_data.BYMONTHDAY
          );
          dateLen = byMonthDay.length;
          while (byMonthDay[dateIdx] <= lastDay && !(isInit && byMonthDay[dateIdx] == lastDay) && dateIdx < dateLen - 1) {
            dateIdx++;
          }
        }
        function nextMonth() {
          lastDay = 0;
          self.increment_month();
          dateIdx = 0;
          initMonth();
        }
        initMonth();
        if (isInit) {
          lastDay -= 1;
        }
        let monthsCounter = 48;
        while (!dataIsValid && monthsCounter) {
          monthsCounter--;
          date = lastDay + 1;
          if (date > daysInMonth) {
            nextMonth();
            continue;
          }
          let next = byMonthDay[dateIdx++];
          if (next >= date) {
            lastDay = next;
          } else {
            nextMonth();
            continue;
          }
          for (let dayIdx = 0; dayIdx < dayLen; dayIdx++) {
            let parts = this.ruleDayOfWeek(byDay[dayIdx]);
            let pos = parts[0];
            let dow = parts[1];
            this.last.day = lastDay;
            if (this.last.isNthWeekDay(dow, pos)) {
              dataIsValid = 1;
              break;
            }
          }
          if (!dataIsValid && dateIdx === dateLen) {
            nextMonth();
            continue;
          }
        }
        if (monthsCounter <= 0) {
          throw new Error("Malformed values in BYDAY combined with BYMONTHDAY parts");
        }
        return dataIsValid;
      }
      next_month() {
        let data_valid = 1;
        if (this.next_hour() == 0) {
          return data_valid;
        }
        if (this.has_by_data("BYDAY") && this.has_by_data("BYMONTHDAY")) {
          data_valid = this._byDayAndMonthDay();
        } else if (this.has_by_data("BYDAY")) {
          let daysInMonth = Time.daysInMonth(this.last.month, this.last.year);
          let setpos = 0;
          let setpos_total = 0;
          if (this.has_by_data("BYSETPOS")) {
            let last_day = this.last.day;
            for (let day2 = 1; day2 <= daysInMonth; day2++) {
              this.last.day = day2;
              if (this.is_day_in_byday(this.last)) {
                setpos_total++;
                if (day2 <= last_day) {
                  setpos++;
                }
              }
            }
            this.last.day = last_day;
          }
          data_valid = 0;
          let day;
          for (day = this.last.day + 1; day <= daysInMonth; day++) {
            this.last.day = day;
            if (this.is_day_in_byday(this.last)) {
              if (!this.has_by_data("BYSETPOS") || this.check_set_position(++setpos) || this.check_set_position(setpos - setpos_total - 1)) {
                data_valid = 1;
                break;
              }
            }
          }
          if (day > daysInMonth) {
            this.last.day = 1;
            this.increment_month();
            if (this.is_day_in_byday(this.last)) {
              if (!this.has_by_data("BYSETPOS") || this.check_set_position(1)) {
                data_valid = 1;
              }
            } else {
              data_valid = 0;
            }
          }
        } else if (this.has_by_data("BYMONTHDAY")) {
          this.by_indices.BYMONTHDAY++;
          if (this.by_indices.BYMONTHDAY >= this.by_data.BYMONTHDAY.length) {
            this.by_indices.BYMONTHDAY = 0;
            this.increment_month();
            if (this.by_indices.BYMONTHDAY >= this.by_data.BYMONTHDAY.length) {
              return 0;
            }
          }
          let daysInMonth = Time.daysInMonth(this.last.month, this.last.year);
          let day = this.by_data.BYMONTHDAY[this.by_indices.BYMONTHDAY];
          if (day < 0) {
            day = daysInMonth + day + 1;
          }
          if (day > daysInMonth) {
            this.last.day = 1;
            data_valid = this.is_day_in_byday(this.last);
          } else {
            this.last.day = day;
          }
        } else {
          this.increment_month();
          let daysInMonth = Time.daysInMonth(this.last.month, this.last.year);
          if (this.by_data.BYMONTHDAY[0] > daysInMonth) {
            data_valid = 0;
          } else {
            this.last.day = this.by_data.BYMONTHDAY[0];
          }
        }
        return data_valid;
      }
      next_weekday_by_week() {
        let end_of_data = 0;
        if (this.next_hour() == 0) {
          return end_of_data;
        }
        if (!this.has_by_data("BYDAY")) {
          return 1;
        }
        for (; ; ) {
          let tt = new Time();
          this.by_indices.BYDAY++;
          if (this.by_indices.BYDAY == Object.keys(this.by_data.BYDAY).length) {
            this.by_indices.BYDAY = 0;
            end_of_data = 1;
          }
          let coded_day = this.by_data.BYDAY[this.by_indices.BYDAY];
          let parts = this.ruleDayOfWeek(coded_day);
          let dow = parts[1];
          dow -= this.rule.wkst;
          if (dow < 0) {
            dow += 7;
          }
          tt.year = this.last.year;
          tt.month = this.last.month;
          tt.day = this.last.day;
          let startOfWeek = tt.startDoyWeek(this.rule.wkst);
          if (dow + startOfWeek < 1) {
            if (!end_of_data) {
              continue;
            }
          }
          let next = Time.fromDayOfYear(startOfWeek + dow, this.last.year);
          this.last.year = next.year;
          this.last.month = next.month;
          this.last.day = next.day;
          return end_of_data;
        }
      }
      next_year() {
        if (this.next_hour() == 0) {
          return 0;
        }
        if (this.days.length == 0 || ++this.days_index == this.days.length) {
          this.days_index = 0;
          this.increment_year(this.rule.interval);
          if (this.has_by_data("BYMONTHDAY")) {
            this.by_data.BYMONTHDAY = this.normalizeByMonthDayRules(
              this.last.year,
              this.last.month,
              this.rule.parts.BYMONTHDAY
            );
          }
          this.expand_year_days(this.last.year);
          if (this.days.length == 0) {
            return 0;
          }
        }
        return this._nextByYearDay();
      }
      _nextByYearDay() {
        let doy = this.days[this.days_index];
        let year = this.last.year;
        if (Math.abs(doy) == 366 && !Time.isLeapYear(this.last.year)) {
          return 0;
        }
        if (doy < 1) {
          doy += 1;
          year += 1;
        }
        let next = Time.fromDayOfYear(doy, year);
        this.last.day = next.day;
        this.last.month = next.month;
        return 1;
      }
      /**
       * @param dow (eg: '1TU', '-1MO')
       * @param {weekDay=} aWeekStart The week start weekday
       * @return [pos, numericDow] (eg: [1, 3]) numericDow is relative to aWeekStart
       */
      ruleDayOfWeek(dow, aWeekStart) {
        let matches = dow.match(/([+-]?[0-9])?(MO|TU|WE|TH|FR|SA|SU)/);
        if (matches) {
          let pos = parseInt(matches[1] || 0, 10);
          dow = Recur.icalDayToNumericDay(matches[2], aWeekStart);
          return [pos, dow];
        } else {
          return [0, 0];
        }
      }
      next_generic(aRuleType, aInterval, aDateAttr, aFollowingAttr, aPreviousIncr) {
        let has_by_rule = aRuleType in this.by_data;
        let this_freq = this.rule.freq == aInterval;
        let end_of_data = 0;
        if (aPreviousIncr && this[aPreviousIncr]() == 0) {
          return end_of_data;
        }
        if (has_by_rule) {
          this.by_indices[aRuleType]++;
          let dta = this.by_data[aRuleType];
          if (this.by_indices[aRuleType] == dta.length) {
            this.by_indices[aRuleType] = 0;
            end_of_data = 1;
          }
          this.last[aDateAttr] = dta[this.by_indices[aRuleType]];
        } else if (this_freq) {
          this["increment_" + aDateAttr](this.rule.interval);
        }
        if (has_by_rule && end_of_data && this_freq) {
          this["increment_" + aFollowingAttr](1);
        }
        return end_of_data;
      }
      increment_monthday(inc) {
        for (let i = 0; i < inc; i++) {
          let daysInMonth = Time.daysInMonth(this.last.month, this.last.year);
          this.last.day++;
          if (this.last.day > daysInMonth) {
            this.last.day -= daysInMonth;
            this.increment_month();
          }
        }
      }
      increment_month() {
        this.last.day = 1;
        if (this.has_by_data("BYMONTH")) {
          this.by_indices.BYMONTH++;
          if (this.by_indices.BYMONTH == this.by_data.BYMONTH.length) {
            this.by_indices.BYMONTH = 0;
            this.increment_year(1);
          }
          this.last.month = this.by_data.BYMONTH[this.by_indices.BYMONTH];
        } else {
          if (this.rule.freq == "MONTHLY") {
            this.last.month += this.rule.interval;
          } else {
            this.last.month++;
          }
          this.last.month--;
          let years = trunc(this.last.month / 12);
          this.last.month %= 12;
          this.last.month++;
          if (years != 0) {
            this.increment_year(years);
          }
        }
        if (this.has_by_data("BYMONTHDAY")) {
          this.by_data.BYMONTHDAY = this.normalizeByMonthDayRules(
            this.last.year,
            this.last.month,
            this.rule.parts.BYMONTHDAY
          );
        }
      }
      increment_year(inc) {
        this.last.day = 1;
        this.last.year += inc;
      }
      increment_generic(inc, aDateAttr, aFactor, aNextIncrement) {
        this.last[aDateAttr] += inc;
        let nextunit = trunc(this.last[aDateAttr] / aFactor);
        this.last[aDateAttr] %= aFactor;
        if (nextunit != 0) {
          this["increment_" + aNextIncrement](nextunit);
        }
      }
      has_by_data(aRuleType) {
        return aRuleType in this.rule.parts;
      }
      expand_year_days(aYear) {
        let t = new Time();
        this.days = [];
        let parts = {};
        let rules = ["BYDAY", "BYWEEKNO", "BYMONTHDAY", "BYMONTH", "BYYEARDAY"];
        for (let part of rules) {
          if (part in this.rule.parts) {
            parts[part] = this.rule.parts[part];
          }
        }
        if ("BYMONTH" in parts && "BYWEEKNO" in parts) {
          let valid = 1;
          let validWeeks = {};
          t.year = aYear;
          t.isDate = true;
          for (let monthIdx = 0; monthIdx < this.by_data.BYMONTH.length; monthIdx++) {
            let month = this.by_data.BYMONTH[monthIdx];
            t.month = month;
            t.day = 1;
            let first_week = t.weekNumber(this.rule.wkst);
            t.day = Time.daysInMonth(month, aYear);
            let last_week = t.weekNumber(this.rule.wkst);
            for (monthIdx = first_week; monthIdx < last_week; monthIdx++) {
              validWeeks[monthIdx] = 1;
            }
          }
          for (let weekIdx = 0; weekIdx < this.by_data.BYWEEKNO.length && valid; weekIdx++) {
            let weekno = this.by_data.BYWEEKNO[weekIdx];
            if (weekno < 52) {
              valid &= validWeeks[weekIdx];
            } else {
              valid = 0;
            }
          }
          if (valid) {
            delete parts.BYMONTH;
          } else {
            delete parts.BYWEEKNO;
          }
        }
        let partCount = Object.keys(parts).length;
        if (partCount == 0) {
          let t1 = this.dtstart.clone();
          t1.year = this.last.year;
          this.days.push(t1.dayOfYear());
        } else if (partCount == 1 && "BYMONTH" in parts) {
          for (let month of this.by_data.BYMONTH) {
            let t2 = this.dtstart.clone();
            t2.year = aYear;
            t2.month = month;
            t2.isDate = true;
            this.days.push(t2.dayOfYear());
          }
        } else if (partCount == 1 && "BYMONTHDAY" in parts) {
          for (let monthday of this.by_data.BYMONTHDAY) {
            let t3 = this.dtstart.clone();
            if (monthday < 0) {
              let daysInMonth = Time.daysInMonth(t3.month, aYear);
              monthday = monthday + daysInMonth + 1;
            }
            t3.day = monthday;
            t3.year = aYear;
            t3.isDate = true;
            this.days.push(t3.dayOfYear());
          }
        } else if (partCount == 2 && "BYMONTHDAY" in parts && "BYMONTH" in parts) {
          for (let month of this.by_data.BYMONTH) {
            let daysInMonth = Time.daysInMonth(month, aYear);
            for (let monthday of this.by_data.BYMONTHDAY) {
              if (monthday < 0) {
                monthday = monthday + daysInMonth + 1;
              }
              t.day = monthday;
              t.month = month;
              t.year = aYear;
              t.isDate = true;
              this.days.push(t.dayOfYear());
            }
          }
        } else if (partCount == 1 && "BYWEEKNO" in parts) ;
        else if (partCount == 2 && "BYWEEKNO" in parts && "BYMONTHDAY" in parts) ;
        else if (partCount == 1 && "BYDAY" in parts) {
          this.days = this.days.concat(this.expand_by_day(aYear));
        } else if (partCount == 2 && "BYDAY" in parts && "BYMONTH" in parts) {
          for (let month of this.by_data.BYMONTH) {
            let daysInMonth = Time.daysInMonth(month, aYear);
            t.year = aYear;
            t.month = month;
            t.day = 1;
            t.isDate = true;
            let first_dow = t.dayOfWeek();
            let doy_offset = t.dayOfYear() - 1;
            t.day = daysInMonth;
            let last_dow = t.dayOfWeek();
            if (this.has_by_data("BYSETPOS")) {
              let by_month_day = [];
              for (let day = 1; day <= daysInMonth; day++) {
                t.day = day;
                if (this.is_day_in_byday(t)) {
                  by_month_day.push(day);
                }
              }
              for (let spIndex = 0; spIndex < by_month_day.length; spIndex++) {
                if (this.check_set_position(spIndex + 1) || this.check_set_position(spIndex - by_month_day.length)) {
                  this.days.push(doy_offset + by_month_day[spIndex]);
                }
              }
            } else {
              for (let coded_day of this.by_data.BYDAY) {
                let bydayParts = this.ruleDayOfWeek(coded_day);
                let pos = bydayParts[0];
                let dow = bydayParts[1];
                let month_day;
                let first_matching_day = (dow + 7 - first_dow) % 7 + 1;
                let last_matching_day = daysInMonth - (last_dow + 7 - dow) % 7;
                if (pos == 0) {
                  for (let day = first_matching_day; day <= daysInMonth; day += 7) {
                    this.days.push(doy_offset + day);
                  }
                } else if (pos > 0) {
                  month_day = first_matching_day + (pos - 1) * 7;
                  if (month_day <= daysInMonth) {
                    this.days.push(doy_offset + month_day);
                  }
                } else {
                  month_day = last_matching_day + (pos + 1) * 7;
                  if (month_day > 0) {
                    this.days.push(doy_offset + month_day);
                  }
                }
              }
            }
          }
          this.days.sort(function(a, b) {
            return a - b;
          });
        } else if (partCount == 2 && "BYDAY" in parts && "BYMONTHDAY" in parts) {
          let expandedDays = this.expand_by_day(aYear);
          for (let day of expandedDays) {
            let tt = Time.fromDayOfYear(day, aYear);
            if (this.by_data.BYMONTHDAY.indexOf(tt.day) >= 0) {
              this.days.push(day);
            }
          }
        } else if (partCount == 3 && "BYDAY" in parts && "BYMONTHDAY" in parts && "BYMONTH" in parts) {
          let expandedDays = this.expand_by_day(aYear);
          for (let day of expandedDays) {
            let tt = Time.fromDayOfYear(day, aYear);
            if (this.by_data.BYMONTH.indexOf(tt.month) >= 0 && this.by_data.BYMONTHDAY.indexOf(tt.day) >= 0) {
              this.days.push(day);
            }
          }
        } else if (partCount == 2 && "BYDAY" in parts && "BYWEEKNO" in parts) {
          let expandedDays = this.expand_by_day(aYear);
          for (let day of expandedDays) {
            let tt = Time.fromDayOfYear(day, aYear);
            let weekno = tt.weekNumber(this.rule.wkst);
            if (this.by_data.BYWEEKNO.indexOf(weekno)) {
              this.days.push(day);
            }
          }
        } else if (partCount == 3 && "BYDAY" in parts && "BYWEEKNO" in parts && "BYMONTHDAY" in parts) ;
        else if (partCount == 1 && "BYYEARDAY" in parts) {
          this.days = this.days.concat(this.by_data.BYYEARDAY);
        } else if (partCount == 2 && "BYYEARDAY" in parts && "BYDAY" in parts) {
          let daysInYear2 = Time.isLeapYear(aYear) ? 366 : 365;
          let expandedDays = new Set(this.expand_by_day(aYear));
          for (let doy of this.by_data.BYYEARDAY) {
            if (doy < 0) {
              doy += daysInYear2 + 1;
            }
            if (expandedDays.has(doy)) {
              this.days.push(doy);
            }
          }
        } else {
          this.days = [];
        }
        let daysInYear = Time.isLeapYear(aYear) ? 366 : 365;
        this.days.sort((a, b) => {
          if (a < 0) a += daysInYear + 1;
          if (b < 0) b += daysInYear + 1;
          return a - b;
        });
        return 0;
      }
      expand_by_day(aYear) {
        let days_list = [];
        let tmp = this.last.clone();
        tmp.year = aYear;
        tmp.month = 1;
        tmp.day = 1;
        tmp.isDate = true;
        let start_dow = tmp.dayOfWeek();
        tmp.month = 12;
        tmp.day = 31;
        tmp.isDate = true;
        let end_dow = tmp.dayOfWeek();
        let end_year_day = tmp.dayOfYear();
        for (let day of this.by_data.BYDAY) {
          let parts = this.ruleDayOfWeek(day);
          let pos = parts[0];
          let dow = parts[1];
          if (pos == 0) {
            let tmp_start_doy = (dow + 7 - start_dow) % 7 + 1;
            for (let doy = tmp_start_doy; doy <= end_year_day; doy += 7) {
              days_list.push(doy);
            }
          } else if (pos > 0) {
            let first;
            if (dow >= start_dow) {
              first = dow - start_dow + 1;
            } else {
              first = dow - start_dow + 8;
            }
            days_list.push(first + (pos - 1) * 7);
          } else {
            let last;
            pos = -pos;
            if (dow <= end_dow) {
              last = end_year_day - end_dow + dow;
            } else {
              last = end_year_day - end_dow + dow - 7;
            }
            days_list.push(last - (pos - 1) * 7);
          }
        }
        return days_list;
      }
      is_day_in_byday(tt) {
        if (this.by_data.BYDAY) {
          for (let day of this.by_data.BYDAY) {
            let parts = this.ruleDayOfWeek(day);
            let pos = parts[0];
            let dow = parts[1];
            let this_dow = tt.dayOfWeek();
            if (pos == 0 && dow == this_dow || tt.nthWeekDay(dow, pos) == tt.day) {
              return 1;
            }
          }
        }
        return 0;
      }
      /**
       * Checks if given value is in BYSETPOS.
       *
       * @private
       * @param {Numeric} aPos position to check for.
       * @return {Boolean} false unless BYSETPOS rules exist
       *                   and the given value is present in rules.
       */
      check_set_position(aPos) {
        if (this.has_by_data("BYSETPOS")) {
          let idx = this.by_data.BYSETPOS.indexOf(aPos);
          return idx !== -1;
        }
        return false;
      }
      sort_byday_rules(aRules) {
        for (let i = 0; i < aRules.length; i++) {
          for (let j = 0; j < i; j++) {
            let one = this.ruleDayOfWeek(aRules[j], this.rule.wkst)[1];
            let two = this.ruleDayOfWeek(aRules[i], this.rule.wkst)[1];
            if (one > two) {
              let tmp = aRules[i];
              aRules[i] = aRules[j];
              aRules[j] = tmp;
            }
          }
        }
      }
      check_contract_restriction(aRuleType, v) {
        let indexMapValue = _RecurIterator._indexMap[aRuleType];
        let ruleMapValue = _RecurIterator._expandMap[this.rule.freq][indexMapValue];
        let pass = false;
        if (aRuleType in this.by_data && ruleMapValue == _RecurIterator.CONTRACT) {
          let ruleType = this.by_data[aRuleType];
          for (let bydata of ruleType) {
            if (bydata == v) {
              pass = true;
              break;
            }
          }
        } else {
          pass = true;
        }
        return pass;
      }
      check_contracting_rules() {
        let dow = this.last.dayOfWeek();
        let weekNo = this.last.weekNumber(this.rule.wkst);
        let doy = this.last.dayOfYear();
        return this.check_contract_restriction("BYSECOND", this.last.second) && this.check_contract_restriction("BYMINUTE", this.last.minute) && this.check_contract_restriction("BYHOUR", this.last.hour) && this.check_contract_restriction("BYDAY", Recur.numericDayToIcalDay(dow)) && this.check_contract_restriction("BYWEEKNO", weekNo) && this.check_contract_restriction("BYMONTHDAY", this.last.day) && this.check_contract_restriction("BYMONTH", this.last.month) && this.check_contract_restriction("BYYEARDAY", doy);
      }
      setup_defaults(aRuleType, req, deftime) {
        let indexMapValue = _RecurIterator._indexMap[aRuleType];
        let ruleMapValue = _RecurIterator._expandMap[this.rule.freq][indexMapValue];
        if (ruleMapValue != _RecurIterator.CONTRACT) {
          if (!(aRuleType in this.by_data)) {
            this.by_data[aRuleType] = [deftime];
          }
          if (this.rule.freq != req) {
            return this.by_data[aRuleType][0];
          }
        }
        return deftime;
      }
      /**
       * Convert iterator into a serialize-able object.  Will preserve current
       * iteration sequence to ensure the seamless continuation of the recurrence
       * rule.
       * @return {Object}
       */
      toJSON() {
        let result = /* @__PURE__ */ Object.create(null);
        result.initialized = this.initialized;
        result.rule = this.rule.toJSON();
        result.dtstart = this.dtstart.toJSON();
        result.by_data = this.by_data;
        result.days = this.days;
        result.last = this.last.toJSON();
        result.by_indices = this.by_indices;
        result.occurrence_number = this.occurrence_number;
        return result;
      }
    };
    InvalidRecurrenceRuleError = class extends Error {
      constructor() {
        super("Recurrence rule has no valid occurrences");
      }
    };
    VALID_DAY_NAMES = /^(SU|MO|TU|WE|TH|FR|SA)$/;
    VALID_BYDAY_PART = /^([+-])?(5[0-3]|[1-4][0-9]|[1-9])?(SU|MO|TU|WE|TH|FR|SA)$/;
    DOW_MAP = {
      SU: Time.SUNDAY,
      MO: Time.MONDAY,
      TU: Time.TUESDAY,
      WE: Time.WEDNESDAY,
      TH: Time.THURSDAY,
      FR: Time.FRIDAY,
      SA: Time.SATURDAY
    };
    REVERSE_DOW_MAP = Object.fromEntries(Object.entries(DOW_MAP).map((entry) => entry.reverse()));
    ALLOWED_FREQ = [
      "SECONDLY",
      "MINUTELY",
      "HOURLY",
      "DAILY",
      "WEEKLY",
      "MONTHLY",
      "YEARLY"
    ];
    Recur = class _Recur {
      /**
       * Creates a new {@link ICAL.Recur} instance from the passed string.
       *
       * @param {String} string         The string to parse
       * @return {Recur}                The created recurrence instance
       */
      static fromString(string2) {
        let data = this._stringToData(string2, false);
        return new _Recur(data);
      }
      /**
       * Creates a new {@link ICAL.Recur} instance using members from the passed
       * data object.
       *
       * @param {Object} aData                              An object with members of the recurrence
       * @param {frequencyValues=} aData.freq               The frequency value
       * @param {Number=} aData.interval                    The INTERVAL value
       * @param {weekDay=} aData.wkst                       The week start value
       * @param {Time=} aData.until                         The end of the recurrence set
       * @param {Number=} aData.count                       The number of occurrences
       * @param {Array.<Number>=} aData.bysecond            The seconds for the BYSECOND part
       * @param {Array.<Number>=} aData.byminute            The minutes for the BYMINUTE part
       * @param {Array.<Number>=} aData.byhour              The hours for the BYHOUR part
       * @param {Array.<String>=} aData.byday               The BYDAY values
       * @param {Array.<Number>=} aData.bymonthday          The days for the BYMONTHDAY part
       * @param {Array.<Number>=} aData.byyearday           The days for the BYYEARDAY part
       * @param {Array.<Number>=} aData.byweekno            The weeks for the BYWEEKNO part
       * @param {Array.<Number>=} aData.bymonth             The month for the BYMONTH part
       * @param {Array.<Number>=} aData.bysetpos            The positionals for the BYSETPOS part
       */
      static fromData(aData) {
        return new _Recur(aData);
      }
      /**
       * Converts a recurrence string to a data object, suitable for the fromData
       * method.
       *
       * @private
       * @param {String} string     The string to parse
       * @param {Boolean} fmtIcal   If true, the string is considered to be an
       *                              iCalendar string
       * @return {Recur}            The recurrence instance
       */
      static _stringToData(string2, fmtIcal) {
        let dict = /* @__PURE__ */ Object.create(null);
        let values = string2.split(";");
        let len = values.length;
        for (let i = 0; i < len; i++) {
          let parts = values[i].split("=");
          let ucname = parts[0].toUpperCase();
          let lcname = parts[0].toLowerCase();
          let name = fmtIcal ? lcname : ucname;
          let value = parts[1];
          if (ucname in partDesign) {
            let partArr = value.split(",");
            let partSet = /* @__PURE__ */ new Set();
            for (let part of partArr) {
              partSet.add(partDesign[ucname](part));
            }
            partArr = [...partSet];
            dict[name] = partArr.length == 1 ? partArr[0] : partArr;
          } else if (ucname in optionDesign) {
            optionDesign[ucname](value, dict, fmtIcal);
          } else {
            dict[lcname] = value;
          }
        }
        return dict;
      }
      /**
       * Convert an ical representation of a day (SU, MO, etc..)
       * into a numeric value of that day.
       *
       * @param {String} string     The iCalendar day name
       * @param {weekDay=} aWeekStart
       *        The week start weekday, defaults to SUNDAY
       * @return {Number}           Numeric value of given day
       */
      static icalDayToNumericDay(string2, aWeekStart) {
        let firstDow = aWeekStart || Time.SUNDAY;
        return (DOW_MAP[string2] - firstDow + 7) % 7 + 1;
      }
      /**
       * Convert a numeric day value into its ical representation (SU, MO, etc..)
       *
       * @param {Number} num        Numeric value of given day
       * @param {weekDay=} aWeekStart
       *        The week start weekday, defaults to SUNDAY
       * @return {String}           The ICAL day value, e.g SU,MO,...
       */
      static numericDayToIcalDay(num, aWeekStart) {
        let firstDow = aWeekStart || Time.SUNDAY;
        let dow = num + firstDow - Time.SUNDAY;
        if (dow > 7) {
          dow -= 7;
        }
        return REVERSE_DOW_MAP[dow];
      }
      /**
       * Create a new instance of the Recur class.
       *
       * @param {Object} data                               An object with members of the recurrence
       * @param {frequencyValues=} data.freq                The frequency value
       * @param {Number=} data.interval                     The INTERVAL value
       * @param {weekDay=} data.wkst                        The week start value
       * @param {Time=} data.until                          The end of the recurrence set
       * @param {Number=} data.count                        The number of occurrences
       * @param {Array.<Number>=} data.bysecond             The seconds for the BYSECOND part
       * @param {Array.<Number>=} data.byminute             The minutes for the BYMINUTE part
       * @param {Array.<Number>=} data.byhour               The hours for the BYHOUR part
       * @param {Array.<String>=} data.byday                The BYDAY values
       * @param {Array.<Number>=} data.bymonthday           The days for the BYMONTHDAY part
       * @param {Array.<Number>=} data.byyearday            The days for the BYYEARDAY part
       * @param {Array.<Number>=} data.byweekno             The weeks for the BYWEEKNO part
       * @param {Array.<Number>=} data.bymonth              The month for the BYMONTH part
       * @param {Array.<Number>=} data.bysetpos             The positionals for the BYSETPOS part
       */
      constructor(data) {
        this.wrappedJSObject = this;
        this.parts = {};
        if (data && typeof data === "object") {
          this.fromData(data);
        }
      }
      /**
       * An object holding the BY-parts of the recurrence rule
       * @memberof ICAL.Recur
       * @typedef {Object} byParts
       * @property {Array.<Number>=} BYSECOND            The seconds for the BYSECOND part
       * @property {Array.<Number>=} BYMINUTE            The minutes for the BYMINUTE part
       * @property {Array.<Number>=} BYHOUR              The hours for the BYHOUR part
       * @property {Array.<String>=} BYDAY               The BYDAY values
       * @property {Array.<Number>=} BYMONTHDAY          The days for the BYMONTHDAY part
       * @property {Array.<Number>=} BYYEARDAY           The days for the BYYEARDAY part
       * @property {Array.<Number>=} BYWEEKNO            The weeks for the BYWEEKNO part
       * @property {Array.<Number>=} BYMONTH             The month for the BYMONTH part
       * @property {Array.<Number>=} BYSETPOS            The positionals for the BYSETPOS part
       */
      /**
       * An object holding the BY-parts of the recurrence rule
       * @type {byParts}
       */
      parts = null;
      /**
       * The interval value for the recurrence rule.
       * @type {Number}
       */
      interval = 1;
      /**
       * The week start day
       *
       * @type {weekDay}
       * @default ICAL.Time.MONDAY
       */
      wkst = Time.MONDAY;
      /**
       * The end of the recurrence
       * @type {?Time}
       */
      until = null;
      /**
       * The maximum number of occurrences
       * @type {?Number}
       */
      count = null;
      /**
       * The frequency value.
       * @type {frequencyValues}
       */
      freq = null;
      /**
       * The class identifier.
       * @constant
       * @type {String}
       * @default "icalrecur"
       */
      icalclass = "icalrecur";
      /**
       * The type name, to be used in the jCal object.
       * @constant
       * @type {String}
       * @default "recur"
       */
      icaltype = "recur";
      /**
       * Create a new iterator for this recurrence rule. The passed start date
       * must be the start date of the event, not the start of the range to
       * search in.
       *
       * @example
       * let recur = comp.getFirstPropertyValue('rrule');
       * let dtstart = comp.getFirstPropertyValue('dtstart');
       * let iter = recur.iterator(dtstart);
       * for (let next = iter.next(); next; next = iter.next()) {
       *   if (next.compare(rangeStart) < 0) {
       *     continue;
       *   }
       *   console.log(next.toString());
       * }
       *
       * @param {Time} aStart        The item's start date
       * @return {RecurIterator}     The recurrence iterator
       */
      iterator(aStart) {
        return new RecurIterator({
          rule: this,
          dtstart: aStart
        });
      }
      /**
       * Returns a clone of the recurrence object.
       *
       * @return {Recur}      The cloned object
       */
      clone() {
        return new _Recur(this.toJSON());
      }
      /**
       * Checks if the current rule is finite, i.e. has a count or until part.
       *
       * @return {Boolean}        True, if the rule is finite
       */
      isFinite() {
        return !!(this.count || this.until);
      }
      /**
       * Checks if the current rule has a count part, and not limited by an until
       * part.
       *
       * @return {Boolean}        True, if the rule is by count
       */
      isByCount() {
        return !!(this.count && !this.until);
      }
      /**
       * Adds a component (part) to the recurrence rule. This is not a component
       * in the sense of {@link ICAL.Component}, but a part of the recurrence
       * rule, i.e. BYMONTH.
       *
       * @param {String} aType            The name of the component part
       * @param {Array|String} aValue     The component value
       */
      addComponent(aType, aValue) {
        let ucname = aType.toUpperCase();
        if (ucname in this.parts) {
          this.parts[ucname].push(aValue);
        } else {
          this.parts[ucname] = [aValue];
        }
      }
      /**
       * Sets the component value for the given by-part.
       *
       * @param {String} aType        The component part name
       * @param {Array} aValues       The component values
       */
      setComponent(aType, aValues) {
        this.parts[aType.toUpperCase()] = aValues.slice();
      }
      /**
       * Gets (a copy) of the requested component value.
       *
       * @param {String} aType        The component part name
       * @return {Array}              The component part value
       */
      getComponent(aType) {
        let ucname = aType.toUpperCase();
        return ucname in this.parts ? this.parts[ucname].slice() : [];
      }
      /**
       * Retrieves the next occurrence after the given recurrence id. See the
       * guide on {@tutorial terminology} for more details.
       *
       * NOTE: Currently, this method iterates all occurrences from the start
       * date. It should not be called in a loop for performance reasons. If you
       * would like to get more than one occurrence, you can iterate the
       * occurrences manually, see the example on the
       * {@link ICAL.Recur#iterator iterator} method.
       *
       * @param {Time} aStartTime        The start of the event series
       * @param {Time} aRecurrenceId     The date of the last occurrence
       * @return {Time}                  The next occurrence after
       */
      getNextOccurrence(aStartTime, aRecurrenceId) {
        let iter = this.iterator(aStartTime);
        let next;
        do {
          next = iter.next();
        } while (next && next.compare(aRecurrenceId) <= 0);
        if (next && aRecurrenceId.zone) {
          next.zone = aRecurrenceId.zone;
        }
        return next;
      }
      /**
       * Sets up the current instance using members from the passed data object.
       *
       * @param {Object} data                               An object with members of the recurrence
       * @param {frequencyValues=} data.freq                The frequency value
       * @param {Number=} data.interval                     The INTERVAL value
       * @param {weekDay=} data.wkst                        The week start value
       * @param {Time=} data.until                          The end of the recurrence set
       * @param {Number=} data.count                        The number of occurrences
       * @param {Array.<Number>=} data.bysecond             The seconds for the BYSECOND part
       * @param {Array.<Number>=} data.byminute             The minutes for the BYMINUTE part
       * @param {Array.<Number>=} data.byhour               The hours for the BYHOUR part
       * @param {Array.<String>=} data.byday                The BYDAY values
       * @param {Array.<Number>=} data.bymonthday           The days for the BYMONTHDAY part
       * @param {Array.<Number>=} data.byyearday            The days for the BYYEARDAY part
       * @param {Array.<Number>=} data.byweekno             The weeks for the BYWEEKNO part
       * @param {Array.<Number>=} data.bymonth              The month for the BYMONTH part
       * @param {Array.<Number>=} data.bysetpos             The positionals for the BYSETPOS part
       */
      fromData(data) {
        for (let key in data) {
          let uckey = key.toUpperCase();
          if (uckey in partDesign) {
            if (Array.isArray(data[key])) {
              this.parts[uckey] = data[key];
            } else {
              this.parts[uckey] = [data[key]];
            }
          } else {
            this[key] = data[key];
          }
        }
        if (this.interval && typeof this.interval != "number") {
          optionDesign.INTERVAL(this.interval, this);
        }
        if (this.wkst && typeof this.wkst != "number") {
          this.wkst = _Recur.icalDayToNumericDay(this.wkst);
        }
        if (this.until && !(this.until instanceof Time)) {
          this.until = Time.fromString(this.until);
        }
      }
      /**
       * The jCal representation of this recurrence type.
       * @return {Object}
       */
      toJSON() {
        let res = /* @__PURE__ */ Object.create(null);
        res.freq = this.freq;
        if (this.count) {
          res.count = this.count;
        }
        if (this.interval > 1) {
          res.interval = this.interval;
        }
        for (let [k, kparts] of Object.entries(this.parts)) {
          if (Array.isArray(kparts) && kparts.length == 1) {
            res[k.toLowerCase()] = kparts[0];
          } else {
            res[k.toLowerCase()] = clone(kparts);
          }
        }
        if (this.until) {
          res.until = this.until.toString();
        }
        if ("wkst" in this && this.wkst !== Time.DEFAULT_WEEK_START) {
          res.wkst = _Recur.numericDayToIcalDay(this.wkst);
        }
        return res;
      }
      /**
       * The string representation of this recurrence rule.
       * @return {String}
       */
      toString() {
        let str = "FREQ=" + this.freq;
        if (this.count) {
          str += ";COUNT=" + this.count;
        }
        if (this.interval > 1) {
          str += ";INTERVAL=" + this.interval;
        }
        for (let [k, v] of Object.entries(this.parts)) {
          str += ";" + k + "=" + v;
        }
        if (this.until) {
          str += ";UNTIL=" + this.until.toICALString();
        }
        if ("wkst" in this && this.wkst !== Time.DEFAULT_WEEK_START) {
          str += ";WKST=" + _Recur.numericDayToIcalDay(this.wkst);
        }
        return str;
      }
    };
    optionDesign = {
      FREQ: function(value, dict, fmtIcal) {
        if (ALLOWED_FREQ.indexOf(value) !== -1) {
          dict.freq = value;
        } else {
          throw new Error(
            'invalid frequency "' + value + '" expected: "' + ALLOWED_FREQ.join(", ") + '"'
          );
        }
      },
      COUNT: function(value, dict, fmtIcal) {
        dict.count = strictParseInt(value);
      },
      INTERVAL: function(value, dict, fmtIcal) {
        dict.interval = strictParseInt(value);
        if (dict.interval < 1) {
          dict.interval = 1;
        }
      },
      UNTIL: function(value, dict, fmtIcal) {
        if (value.length > 10) {
          dict.until = design.icalendar.value["date-time"].fromICAL(value);
        } else {
          dict.until = design.icalendar.value.date.fromICAL(value);
        }
        if (!fmtIcal) {
          dict.until = Time.fromString(dict.until);
        }
      },
      WKST: function(value, dict, fmtIcal) {
        if (VALID_DAY_NAMES.test(value)) {
          dict.wkst = Recur.icalDayToNumericDay(value);
        } else {
          throw new Error('invalid WKST value "' + value + '"');
        }
      }
    };
    partDesign = {
      BYSECOND: parseNumericValue.bind(void 0, "BYSECOND", 0, 60),
      BYMINUTE: parseNumericValue.bind(void 0, "BYMINUTE", 0, 59),
      BYHOUR: parseNumericValue.bind(void 0, "BYHOUR", 0, 23),
      BYDAY: function(value) {
        if (VALID_BYDAY_PART.test(value)) {
          return value;
        } else {
          throw new Error('invalid BYDAY value "' + value + '"');
        }
      },
      BYMONTHDAY: parseNumericValue.bind(void 0, "BYMONTHDAY", -31, 31),
      BYYEARDAY: parseNumericValue.bind(void 0, "BYYEARDAY", -366, 366),
      BYWEEKNO: parseNumericValue.bind(void 0, "BYWEEKNO", -53, 53),
      BYMONTH: parseNumericValue.bind(void 0, "BYMONTH", 1, 12),
      BYSETPOS: parseNumericValue.bind(void 0, "BYSETPOS", -366, 366)
    };
    FROM_ICAL_NEWLINE = /\\\\|\\;|\\,|\\[Nn]/g;
    TO_ICAL_NEWLINE = /\\|;|,|\n/g;
    FROM_VCARD_NEWLINE = /\\\\|\\,|\\[Nn]/g;
    TO_VCARD_NEWLINE = /\\|,|\n/g;
    DEFAULT_TYPE_TEXT = { defaultType: "text" };
    DEFAULT_TYPE_TEXT_MULTI = { defaultType: "text", multiValue: "," };
    DEFAULT_TYPE_TEXT_STRUCTURED = { defaultType: "text", structuredValue: ";" };
    DEFAULT_TYPE_INTEGER = { defaultType: "integer" };
    DEFAULT_TYPE_DATETIME_DATE = { defaultType: "date-time", allowedTypes: ["date-time", "date"] };
    DEFAULT_TYPE_DATETIME = { defaultType: "date-time" };
    DEFAULT_TYPE_URI = { defaultType: "uri" };
    DEFAULT_TYPE_UTCOFFSET = { defaultType: "utc-offset" };
    DEFAULT_TYPE_RECUR = { defaultType: "recur" };
    DEFAULT_TYPE_DATE_ANDOR_TIME = { defaultType: "date-and-or-time", allowedTypes: ["date-time", "date", "text"] };
    commonProperties = {
      "categories": DEFAULT_TYPE_TEXT_MULTI,
      "url": DEFAULT_TYPE_URI,
      "version": DEFAULT_TYPE_TEXT,
      "uid": DEFAULT_TYPE_TEXT
    };
    commonValues = {
      "boolean": {
        values: ["TRUE", "FALSE"],
        fromICAL: function(aValue) {
          switch (aValue) {
            case "TRUE":
              return true;
            case "FALSE":
              return false;
            default:
              return false;
          }
        },
        toICAL: function(aValue) {
          if (aValue) {
            return "TRUE";
          }
          return "FALSE";
        }
      },
      float: {
        matches: /^[+-]?\d+\.\d+$/,
        fromICAL: function(aValue) {
          let parsed = parseFloat(aValue);
          if (isStrictlyNaN(parsed)) {
            return 0;
          }
          return parsed;
        },
        toICAL: function(aValue) {
          return String(aValue);
        }
      },
      integer: {
        fromICAL: function(aValue) {
          let parsed = parseInt(aValue);
          if (isStrictlyNaN(parsed)) {
            return 0;
          }
          return parsed;
        },
        toICAL: function(aValue) {
          return String(aValue);
        }
      },
      "utc-offset": {
        toICAL: function(aValue) {
          if (aValue.length < 7) {
            return aValue.slice(0, 3) + aValue.slice(4, 6);
          } else {
            return aValue.slice(0, 3) + aValue.slice(4, 6) + aValue.slice(7, 9);
          }
        },
        fromICAL: function(aValue) {
          if (aValue.length < 6) {
            return aValue.slice(0, 3) + ":" + aValue.slice(3, 5);
          } else {
            return aValue.slice(0, 3) + ":" + aValue.slice(3, 5) + ":" + aValue.slice(5, 7);
          }
        },
        decorate: function(aValue) {
          return UtcOffset.fromString(aValue);
        },
        undecorate: function(aValue) {
          return aValue.toString();
        }
      }
    };
    icalParams = {
      // Although the syntax is DQUOTE uri DQUOTE, I don't think we should
      // enforce anything aside from it being a valid content line.
      //
      // At least some params require - if multi values are used - DQUOTEs
      // for each of its values - e.g. delegated-from="uri1","uri2"
      // To indicate this, I introduced the new k/v pair
      // multiValueSeparateDQuote: true
      //
      // "ALTREP": { ... },
      // CN just wants a param-value
      // "CN": { ... }
      "cutype": {
        values: ["INDIVIDUAL", "GROUP", "RESOURCE", "ROOM", "UNKNOWN"],
        allowXName: true,
        allowIanaToken: true
      },
      "delegated-from": {
        valueType: "cal-address",
        multiValue: ",",
        multiValueSeparateDQuote: true
      },
      "delegated-to": {
        valueType: "cal-address",
        multiValue: ",",
        multiValueSeparateDQuote: true
      },
      // "DIR": { ... }, // See ALTREP
      "encoding": {
        values: ["8BIT", "BASE64"]
      },
      // "FMTTYPE": { ... }, // See ALTREP
      "fbtype": {
        values: ["FREE", "BUSY", "BUSY-UNAVAILABLE", "BUSY-TENTATIVE"],
        allowXName: true,
        allowIanaToken: true
      },
      // "LANGUAGE": { ... }, // See ALTREP
      "member": {
        valueType: "cal-address",
        multiValue: ",",
        multiValueSeparateDQuote: true
      },
      "partstat": {
        // TODO These values are actually different per-component
        values: [
          "NEEDS-ACTION",
          "ACCEPTED",
          "DECLINED",
          "TENTATIVE",
          "DELEGATED",
          "COMPLETED",
          "IN-PROCESS"
        ],
        allowXName: true,
        allowIanaToken: true
      },
      "range": {
        values: ["THISANDFUTURE"]
      },
      "related": {
        values: ["START", "END"]
      },
      "reltype": {
        values: ["PARENT", "CHILD", "SIBLING"],
        allowXName: true,
        allowIanaToken: true
      },
      "role": {
        values: [
          "REQ-PARTICIPANT",
          "CHAIR",
          "OPT-PARTICIPANT",
          "NON-PARTICIPANT"
        ],
        allowXName: true,
        allowIanaToken: true
      },
      "rsvp": {
        values: ["TRUE", "FALSE"]
      },
      "sent-by": {
        valueType: "cal-address"
      },
      "tzid": {
        matches: /^\//
      },
      "value": {
        // since the value here is a 'type' lowercase is used.
        values: [
          "binary",
          "boolean",
          "cal-address",
          "date",
          "date-time",
          "duration",
          "float",
          "integer",
          "period",
          "recur",
          "text",
          "time",
          "uri",
          "utc-offset"
        ],
        allowXName: true,
        allowIanaToken: true
      }
    };
    icalValues = extend(commonValues, {
      text: createTextType(FROM_ICAL_NEWLINE, TO_ICAL_NEWLINE),
      uri: {
        // TODO
        /* ... */
      },
      "binary": {
        decorate: function(aString) {
          return Binary.fromString(aString);
        },
        undecorate: function(aBinary) {
          return aBinary.toString();
        }
      },
      "cal-address": {
        // needs to be an uri
      },
      "date": {
        decorate: function(aValue, aProp) {
          if (design.strict) {
            return Time.fromDateString(aValue, aProp);
          } else {
            return Time.fromString(aValue, aProp);
          }
        },
        /**
         * undecorates a time object.
         */
        undecorate: function(aValue) {
          return aValue.toString();
        },
        fromICAL: function(aValue) {
          if (!design.strict && aValue.length >= 15) {
            return icalValues["date-time"].fromICAL(aValue);
          } else {
            return aValue.slice(0, 4) + "-" + aValue.slice(4, 6) + "-" + aValue.slice(6, 8);
          }
        },
        toICAL: function(aValue) {
          let len = aValue.length;
          if (len == 10) {
            return aValue.slice(0, 4) + aValue.slice(5, 7) + aValue.slice(8, 10);
          } else if (len >= 19) {
            return icalValues["date-time"].toICAL(aValue);
          } else {
            return aValue;
          }
        }
      },
      "date-time": {
        fromICAL: function(aValue) {
          if (!design.strict && aValue.length == 8) {
            return icalValues.date.fromICAL(aValue);
          } else {
            let result = aValue.slice(0, 4) + "-" + aValue.slice(4, 6) + "-" + aValue.slice(6, 8) + "T" + aValue.slice(9, 11) + ":" + aValue.slice(11, 13) + ":" + aValue.slice(13, 15);
            if (aValue[15] && aValue[15] === "Z") {
              result += "Z";
            }
            return result;
          }
        },
        toICAL: function(aValue) {
          let len = aValue.length;
          if (len == 10 && !design.strict) {
            return icalValues.date.toICAL(aValue);
          } else if (len >= 19) {
            let result = aValue.slice(0, 4) + aValue.slice(5, 7) + // grab the (DDTHH) segment
            aValue.slice(8, 13) + // MM
            aValue.slice(14, 16) + // SS
            aValue.slice(17, 19);
            if (aValue[19] && aValue[19] === "Z") {
              result += "Z";
            }
            return result;
          } else {
            return aValue;
          }
        },
        decorate: function(aValue, aProp) {
          if (design.strict) {
            return Time.fromDateTimeString(aValue, aProp);
          } else {
            return Time.fromString(aValue, aProp);
          }
        },
        undecorate: function(aValue) {
          return aValue.toString();
        }
      },
      duration: {
        decorate: function(aValue) {
          return Duration.fromString(aValue);
        },
        undecorate: function(aValue) {
          return aValue.toString();
        }
      },
      period: {
        fromICAL: function(string2) {
          let parts = string2.split("/");
          parts[0] = icalValues["date-time"].fromICAL(parts[0]);
          if (!Duration.isValueString(parts[1])) {
            parts[1] = icalValues["date-time"].fromICAL(parts[1]);
          }
          return parts;
        },
        toICAL: function(parts) {
          parts = parts.slice();
          if (!design.strict && parts[0].length == 10) {
            parts[0] = icalValues.date.toICAL(parts[0]);
          } else {
            parts[0] = icalValues["date-time"].toICAL(parts[0]);
          }
          if (!Duration.isValueString(parts[1])) {
            if (!design.strict && parts[1].length == 10) {
              parts[1] = icalValues.date.toICAL(parts[1]);
            } else {
              parts[1] = icalValues["date-time"].toICAL(parts[1]);
            }
          }
          return parts.join("/");
        },
        decorate: function(aValue, aProp) {
          return Period.fromJSON(aValue, aProp, !design.strict);
        },
        undecorate: function(aValue) {
          return aValue.toJSON();
        }
      },
      recur: {
        fromICAL: function(string2) {
          return Recur._stringToData(string2, true);
        },
        toICAL: function(data) {
          let str = "";
          for (let [k, val] of Object.entries(data)) {
            if (k == "until") {
              if (val.length > 10) {
                val = icalValues["date-time"].toICAL(val);
              } else {
                val = icalValues.date.toICAL(val);
              }
            } else if (k == "wkst") {
              if (typeof val === "number") {
                val = Recur.numericDayToIcalDay(val);
              }
            } else if (Array.isArray(val)) {
              val = val.join(",");
            }
            str += k.toUpperCase() + "=" + val + ";";
          }
          return str.slice(0, Math.max(0, str.length - 1));
        },
        decorate: function decorate(aValue) {
          return Recur.fromData(aValue);
        },
        undecorate: function(aRecur) {
          return aRecur.toJSON();
        }
      },
      time: {
        fromICAL: function(aValue) {
          if (aValue.length < 6) {
            return aValue;
          }
          let result = aValue.slice(0, 2) + ":" + aValue.slice(2, 4) + ":" + aValue.slice(4, 6);
          if (aValue[6] === "Z") {
            result += "Z";
          }
          return result;
        },
        toICAL: function(aValue) {
          if (aValue.length < 8) {
            return aValue;
          }
          let result = aValue.slice(0, 2) + aValue.slice(3, 5) + aValue.slice(6, 8);
          if (aValue[8] === "Z") {
            result += "Z";
          }
          return result;
        }
      }
    });
    icalProperties = extend(commonProperties, {
      "action": DEFAULT_TYPE_TEXT,
      "attach": { defaultType: "uri" },
      "attendee": { defaultType: "cal-address" },
      "calscale": DEFAULT_TYPE_TEXT,
      "class": DEFAULT_TYPE_TEXT,
      "comment": DEFAULT_TYPE_TEXT,
      "completed": DEFAULT_TYPE_DATETIME,
      "contact": DEFAULT_TYPE_TEXT,
      "created": DEFAULT_TYPE_DATETIME,
      "description": DEFAULT_TYPE_TEXT,
      "dtend": DEFAULT_TYPE_DATETIME_DATE,
      "dtstamp": DEFAULT_TYPE_DATETIME,
      "dtstart": DEFAULT_TYPE_DATETIME_DATE,
      "due": DEFAULT_TYPE_DATETIME_DATE,
      "duration": { defaultType: "duration" },
      "exdate": {
        defaultType: "date-time",
        allowedTypes: ["date-time", "date"],
        multiValue: ","
      },
      "exrule": DEFAULT_TYPE_RECUR,
      "freebusy": { defaultType: "period", multiValue: "," },
      "geo": { defaultType: "float", structuredValue: ";" },
      "last-modified": DEFAULT_TYPE_DATETIME,
      "location": DEFAULT_TYPE_TEXT,
      "method": DEFAULT_TYPE_TEXT,
      "organizer": { defaultType: "cal-address" },
      "percent-complete": DEFAULT_TYPE_INTEGER,
      "priority": DEFAULT_TYPE_INTEGER,
      "prodid": DEFAULT_TYPE_TEXT,
      "related-to": DEFAULT_TYPE_TEXT,
      "repeat": DEFAULT_TYPE_INTEGER,
      "rdate": {
        defaultType: "date-time",
        allowedTypes: ["date-time", "date", "period"],
        multiValue: ",",
        detectType: function(string2) {
          if (string2.indexOf("/") !== -1) {
            return "period";
          }
          return string2.indexOf("T") === -1 ? "date" : "date-time";
        }
      },
      "recurrence-id": DEFAULT_TYPE_DATETIME_DATE,
      "resources": DEFAULT_TYPE_TEXT_MULTI,
      "request-status": DEFAULT_TYPE_TEXT_STRUCTURED,
      "rrule": DEFAULT_TYPE_RECUR,
      "sequence": DEFAULT_TYPE_INTEGER,
      "status": DEFAULT_TYPE_TEXT,
      "summary": DEFAULT_TYPE_TEXT,
      "transp": DEFAULT_TYPE_TEXT,
      "trigger": { defaultType: "duration", allowedTypes: ["duration", "date-time"] },
      "tzoffsetfrom": DEFAULT_TYPE_UTCOFFSET,
      "tzoffsetto": DEFAULT_TYPE_UTCOFFSET,
      "tzurl": DEFAULT_TYPE_URI,
      "tzid": DEFAULT_TYPE_TEXT,
      "tzname": DEFAULT_TYPE_TEXT
    });
    vcardValues = extend(commonValues, {
      text: createTextType(FROM_VCARD_NEWLINE, TO_VCARD_NEWLINE),
      uri: createTextType(FROM_VCARD_NEWLINE, TO_VCARD_NEWLINE),
      date: {
        decorate: function(aValue) {
          return VCardTime.fromDateAndOrTimeString(aValue, "date");
        },
        undecorate: function(aValue) {
          return aValue.toString();
        },
        fromICAL: function(aValue) {
          if (aValue.length == 8) {
            return icalValues.date.fromICAL(aValue);
          } else if (aValue[0] == "-" && aValue.length == 6) {
            return aValue.slice(0, 4) + "-" + aValue.slice(4);
          } else {
            return aValue;
          }
        },
        toICAL: function(aValue) {
          if (aValue.length == 10) {
            return icalValues.date.toICAL(aValue);
          } else if (aValue[0] == "-" && aValue.length == 7) {
            return aValue.slice(0, 4) + aValue.slice(5);
          } else {
            return aValue;
          }
        }
      },
      time: {
        decorate: function(aValue) {
          return VCardTime.fromDateAndOrTimeString("T" + aValue, "time");
        },
        undecorate: function(aValue) {
          return aValue.toString();
        },
        fromICAL: function(aValue) {
          let splitzone = vcardValues.time._splitZone(aValue, true);
          let zone = splitzone[0], value = splitzone[1];
          if (value.length == 6) {
            value = value.slice(0, 2) + ":" + value.slice(2, 4) + ":" + value.slice(4, 6);
          } else if (value.length == 4 && value[0] != "-") {
            value = value.slice(0, 2) + ":" + value.slice(2, 4);
          } else if (value.length == 5) {
            value = value.slice(0, 3) + ":" + value.slice(3, 5);
          }
          if (zone.length == 5 && (zone[0] == "-" || zone[0] == "+")) {
            zone = zone.slice(0, 3) + ":" + zone.slice(3);
          }
          return value + zone;
        },
        toICAL: function(aValue) {
          let splitzone = vcardValues.time._splitZone(aValue);
          let zone = splitzone[0], value = splitzone[1];
          if (value.length == 8) {
            value = value.slice(0, 2) + value.slice(3, 5) + value.slice(6, 8);
          } else if (value.length == 5 && value[0] != "-") {
            value = value.slice(0, 2) + value.slice(3, 5);
          } else if (value.length == 6) {
            value = value.slice(0, 3) + value.slice(4, 6);
          }
          if (zone.length == 6 && (zone[0] == "-" || zone[0] == "+")) {
            zone = zone.slice(0, 3) + zone.slice(4);
          }
          return value + zone;
        },
        _splitZone: function(aValue, isFromIcal) {
          let lastChar = aValue.length - 1;
          let signChar = aValue.length - (isFromIcal ? 5 : 6);
          let sign = aValue[signChar];
          let zone, value;
          if (aValue[lastChar] == "Z") {
            zone = aValue[lastChar];
            value = aValue.slice(0, Math.max(0, lastChar));
          } else if (aValue.length > 6 && (sign == "-" || sign == "+")) {
            zone = aValue.slice(signChar);
            value = aValue.slice(0, Math.max(0, signChar));
          } else {
            zone = "";
            value = aValue;
          }
          return [zone, value];
        }
      },
      "date-time": {
        decorate: function(aValue) {
          return VCardTime.fromDateAndOrTimeString(aValue, "date-time");
        },
        undecorate: function(aValue) {
          return aValue.toString();
        },
        fromICAL: function(aValue) {
          return vcardValues["date-and-or-time"].fromICAL(aValue);
        },
        toICAL: function(aValue) {
          return vcardValues["date-and-or-time"].toICAL(aValue);
        }
      },
      "date-and-or-time": {
        decorate: function(aValue) {
          return VCardTime.fromDateAndOrTimeString(aValue, "date-and-or-time");
        },
        undecorate: function(aValue) {
          return aValue.toString();
        },
        fromICAL: function(aValue) {
          let parts = aValue.split("T");
          return (parts[0] ? vcardValues.date.fromICAL(parts[0]) : "") + (parts[1] ? "T" + vcardValues.time.fromICAL(parts[1]) : "");
        },
        toICAL: function(aValue) {
          let parts = aValue.split("T");
          return vcardValues.date.toICAL(parts[0]) + (parts[1] ? "T" + vcardValues.time.toICAL(parts[1]) : "");
        }
      },
      timestamp: icalValues["date-time"],
      "language-tag": {
        matches: /^[a-zA-Z0-9-]+$/
        // Could go with a more strict regex here
      },
      "phone-number": {
        fromICAL: function(aValue) {
          return Array.from(aValue).filter(function(c) {
            return c === "\\" ? void 0 : c;
          }).join("");
        },
        toICAL: function(aValue) {
          return Array.from(aValue).map(function(c) {
            return c === "," || c === ";" ? "\\" + c : c;
          }).join("");
        }
      }
    });
    vcardParams = {
      "type": {
        valueType: "text",
        multiValue: ","
      },
      "value": {
        // since the value here is a 'type' lowercase is used.
        values: [
          "text",
          "uri",
          "date",
          "time",
          "date-time",
          "date-and-or-time",
          "timestamp",
          "boolean",
          "integer",
          "float",
          "utc-offset",
          "language-tag"
        ],
        allowXName: true,
        allowIanaToken: true
      }
    };
    vcardProperties = extend(commonProperties, {
      "adr": { defaultType: "text", structuredValue: ";", multiValue: "," },
      "anniversary": DEFAULT_TYPE_DATE_ANDOR_TIME,
      "bday": DEFAULT_TYPE_DATE_ANDOR_TIME,
      "caladruri": DEFAULT_TYPE_URI,
      "caluri": DEFAULT_TYPE_URI,
      "clientpidmap": DEFAULT_TYPE_TEXT_STRUCTURED,
      "email": DEFAULT_TYPE_TEXT,
      "fburl": DEFAULT_TYPE_URI,
      "fn": DEFAULT_TYPE_TEXT,
      "gender": DEFAULT_TYPE_TEXT_STRUCTURED,
      "geo": DEFAULT_TYPE_URI,
      "impp": DEFAULT_TYPE_URI,
      "key": DEFAULT_TYPE_URI,
      "kind": DEFAULT_TYPE_TEXT,
      "lang": { defaultType: "language-tag" },
      "logo": DEFAULT_TYPE_URI,
      "member": DEFAULT_TYPE_URI,
      "n": { defaultType: "text", structuredValue: ";", multiValue: "," },
      "nickname": DEFAULT_TYPE_TEXT_MULTI,
      "note": DEFAULT_TYPE_TEXT,
      "org": { defaultType: "text", structuredValue: ";" },
      "photo": DEFAULT_TYPE_URI,
      "related": DEFAULT_TYPE_URI,
      "rev": { defaultType: "timestamp" },
      "role": DEFAULT_TYPE_TEXT,
      "sound": DEFAULT_TYPE_URI,
      "source": DEFAULT_TYPE_URI,
      "tel": { defaultType: "uri", allowedTypes: ["uri", "text"] },
      "title": DEFAULT_TYPE_TEXT,
      "tz": { defaultType: "text", allowedTypes: ["text", "utc-offset", "uri"] },
      "xml": DEFAULT_TYPE_TEXT
    });
    vcard3Values = extend(commonValues, {
      binary: icalValues.binary,
      date: vcardValues.date,
      "date-time": vcardValues["date-time"],
      "phone-number": vcardValues["phone-number"],
      uri: icalValues.uri,
      text: vcardValues.text,
      time: icalValues.time,
      vcard: icalValues.text,
      "utc-offset": {
        toICAL: function(aValue) {
          return aValue.slice(0, 7);
        },
        fromICAL: function(aValue) {
          return aValue.slice(0, 7);
        },
        decorate: function(aValue) {
          return UtcOffset.fromString(aValue);
        },
        undecorate: function(aValue) {
          return aValue.toString();
        }
      }
    });
    vcard3Params = {
      "type": {
        valueType: "text",
        multiValue: ","
      },
      "value": {
        // since the value here is a 'type' lowercase is used.
        values: [
          "text",
          "uri",
          "date",
          "date-time",
          "phone-number",
          "time",
          "boolean",
          "integer",
          "float",
          "utc-offset",
          "vcard",
          "binary"
        ],
        allowXName: true,
        allowIanaToken: true
      }
    };
    vcard3Properties = extend(commonProperties, {
      fn: DEFAULT_TYPE_TEXT,
      n: { defaultType: "text", structuredValue: ";", multiValue: "," },
      nickname: DEFAULT_TYPE_TEXT_MULTI,
      photo: { defaultType: "binary", allowedTypes: ["binary", "uri"] },
      bday: {
        defaultType: "date-time",
        allowedTypes: ["date-time", "date"],
        detectType: function(string2) {
          return string2.indexOf("T") === -1 ? "date" : "date-time";
        }
      },
      adr: { defaultType: "text", structuredValue: ";", multiValue: "," },
      label: DEFAULT_TYPE_TEXT,
      tel: { defaultType: "phone-number" },
      email: DEFAULT_TYPE_TEXT,
      mailer: DEFAULT_TYPE_TEXT,
      tz: { defaultType: "utc-offset", allowedTypes: ["utc-offset", "text"] },
      geo: { defaultType: "float", structuredValue: ";" },
      title: DEFAULT_TYPE_TEXT,
      role: DEFAULT_TYPE_TEXT,
      logo: { defaultType: "binary", allowedTypes: ["binary", "uri"] },
      agent: { defaultType: "vcard", allowedTypes: ["vcard", "text", "uri"] },
      org: DEFAULT_TYPE_TEXT_STRUCTURED,
      note: DEFAULT_TYPE_TEXT_MULTI,
      prodid: DEFAULT_TYPE_TEXT,
      rev: {
        defaultType: "date-time",
        allowedTypes: ["date-time", "date"],
        detectType: function(string2) {
          return string2.indexOf("T") === -1 ? "date" : "date-time";
        }
      },
      "sort-string": DEFAULT_TYPE_TEXT,
      sound: { defaultType: "binary", allowedTypes: ["binary", "uri"] },
      class: DEFAULT_TYPE_TEXT,
      key: { defaultType: "binary", allowedTypes: ["binary", "text"] }
    });
    icalSet = {
      name: "ical",
      value: icalValues,
      param: icalParams,
      property: icalProperties,
      propertyGroups: false
    };
    vcardSet = {
      name: "vcard4",
      value: vcardValues,
      param: vcardParams,
      property: vcardProperties,
      propertyGroups: true
    };
    vcard3Set = {
      name: "vcard3",
      value: vcard3Values,
      param: vcard3Params,
      property: vcard3Properties,
      propertyGroups: true
    };
    design = {
      /**
       * Can be set to false to make the parser more lenient.
       */
      strict: true,
      /**
       * The default set for new properties and components if none is specified.
       * @type {designSet}
       */
      defaultSet: icalSet,
      /**
       * The default type for unknown properties
       * @type {String}
       */
      defaultType: "unknown",
      /**
       * Holds the design set for known top-level components
       *
       * @type {Object}
       * @property {designSet} vcard       vCard VCARD
       * @property {designSet} vevent      iCalendar VEVENT
       * @property {designSet} vtodo       iCalendar VTODO
       * @property {designSet} vjournal    iCalendar VJOURNAL
       * @property {designSet} valarm      iCalendar VALARM
       * @property {designSet} vtimezone   iCalendar VTIMEZONE
       * @property {designSet} daylight    iCalendar DAYLIGHT
       * @property {designSet} standard    iCalendar STANDARD
       *
       * @example
       * let propertyName = 'fn';
       * let componentDesign = ICAL.design.components.vcard;
       * let propertyDetails = componentDesign.property[propertyName];
       * if (propertyDetails.defaultType == 'text') {
       *   // Yep, sure is...
       * }
       */
      components: {
        vcard: vcardSet,
        vcard3: vcard3Set,
        vevent: icalSet,
        vtodo: icalSet,
        vjournal: icalSet,
        valarm: icalSet,
        vtimezone: icalSet,
        daylight: icalSet,
        standard: icalSet
      },
      /**
       * The design set for iCalendar (rfc5545/rfc7265) components.
       * @type {designSet}
       */
      icalendar: icalSet,
      /**
       * The design set for vCard (rfc6350/rfc7095) components.
       * @type {designSet}
       */
      vcard: vcardSet,
      /**
       * The design set for vCard (rfc2425/rfc2426/rfc7095) components.
       * @type {designSet}
       */
      vcard3: vcard3Set,
      /**
       * Gets the design set for the given component name.
       *
       * @param {String} componentName        The name of the component
       * @return {designSet}      The design set for the component
       */
      getDesignSet: function(componentName) {
        let isInDesign = componentName && componentName in design.components;
        return isInDesign ? design.components[componentName] : design.defaultSet;
      }
    };
    LINE_ENDING = "\r\n";
    DEFAULT_VALUE_TYPE = "unknown";
    RFC6868_REPLACE_MAP = { '"': "^'", "\n": "^n", "^": "^^" };
    stringify.component = function(component, designSet) {
      let name = component[0].toUpperCase();
      let result = "BEGIN:" + name + LINE_ENDING;
      let props = component[1];
      let propIdx = 0;
      let propLen = props.length;
      let designSetName = component[0];
      if (designSetName === "vcard" && component[1].length > 0 && !(component[1][0][0] === "version" && component[1][0][3] === "4.0")) {
        designSetName = "vcard3";
      }
      designSet = designSet || design.getDesignSet(designSetName);
      for (; propIdx < propLen; propIdx++) {
        result += stringify.property(props[propIdx], designSet) + LINE_ENDING;
      }
      let comps = component[2] || [];
      let compIdx = 0;
      let compLen = comps.length;
      for (; compIdx < compLen; compIdx++) {
        result += stringify.component(comps[compIdx], designSet) + LINE_ENDING;
      }
      result += "END:" + name;
      return result;
    };
    stringify.property = function(property, designSet, noFold) {
      let name = property[0].toUpperCase();
      let jsName = property[0];
      let params = property[1];
      if (!designSet) {
        designSet = design.defaultSet;
      }
      let groupName = params.group;
      let line;
      if (designSet.propertyGroups && groupName) {
        line = groupName.toUpperCase() + "." + name;
      } else {
        line = name;
      }
      for (let [paramName, value] of Object.entries(params)) {
        if (designSet.propertyGroups && paramName == "group") {
          continue;
        }
        let paramDesign = designSet.param[paramName];
        let multiValue2 = paramDesign && paramDesign.multiValue;
        if (multiValue2 && Array.isArray(value)) {
          value = value.map(function(val) {
            val = stringify._rfc6868Unescape(val);
            val = stringify.paramPropertyValue(val, paramDesign.multiValueSeparateDQuote);
            return val;
          });
          value = stringify.multiValue(value, multiValue2, "unknown", null, designSet);
        } else {
          value = stringify._rfc6868Unescape(value);
          value = stringify.paramPropertyValue(value);
        }
        line += ";" + paramName.toUpperCase() + "=" + value;
      }
      if (property.length === 3) {
        return line + ":";
      }
      let valueType = property[2];
      let propDetails;
      let multiValue = false;
      let structuredValue = false;
      let isDefault = false;
      if (jsName in designSet.property) {
        propDetails = designSet.property[jsName];
        if ("multiValue" in propDetails) {
          multiValue = propDetails.multiValue;
        }
        if ("structuredValue" in propDetails && Array.isArray(property[3])) {
          structuredValue = propDetails.structuredValue;
        }
        if ("defaultType" in propDetails) {
          if (valueType === propDetails.defaultType) {
            isDefault = true;
          }
        } else {
          if (valueType === DEFAULT_VALUE_TYPE) {
            isDefault = true;
          }
        }
      } else {
        if (valueType === DEFAULT_VALUE_TYPE) {
          isDefault = true;
        }
      }
      if (!isDefault) {
        line += ";VALUE=" + valueType.toUpperCase();
      }
      line += ":";
      if (multiValue && structuredValue) {
        line += stringify.multiValue(
          property[3],
          structuredValue,
          valueType,
          multiValue,
          designSet,
          structuredValue
        );
      } else if (multiValue) {
        line += stringify.multiValue(
          property.slice(3),
          multiValue,
          valueType,
          null,
          designSet,
          false
        );
      } else if (structuredValue) {
        line += stringify.multiValue(
          property[3],
          structuredValue,
          valueType,
          null,
          designSet,
          structuredValue
        );
      } else {
        line += stringify.value(property[3], valueType, designSet, false);
      }
      return noFold ? line : foldline(line);
    };
    stringify.paramPropertyValue = function(value, force) {
      if (!force && value.indexOf(",") === -1 && value.indexOf(":") === -1 && value.indexOf(";") === -1) {
        return value;
      }
      return '"' + value + '"';
    };
    stringify.multiValue = function(values, delim, type, innerMulti, designSet, structuredValue) {
      let result = "";
      let len = values.length;
      let i = 0;
      for (; i < len; i++) {
        if (innerMulti && Array.isArray(values[i])) {
          result += stringify.multiValue(values[i], innerMulti, type, null, designSet, structuredValue);
        } else {
          result += stringify.value(values[i], type, designSet, structuredValue);
        }
        if (i !== len - 1) {
          result += delim;
        }
      }
      return result;
    };
    stringify.value = function(value, type, designSet, structuredValue) {
      if (type in designSet.value && "toICAL" in designSet.value[type]) {
        return designSet.value[type].toICAL(value, structuredValue);
      }
      return value;
    };
    stringify._rfc6868Unescape = function(val) {
      return val.replace(/[\n^"]/g, function(x) {
        return RFC6868_REPLACE_MAP[x];
      });
    };
    NAME_INDEX$1 = 0;
    PROP_INDEX = 1;
    TYPE_INDEX = 2;
    VALUE_INDEX = 3;
    Property = class _Property {
      /**
       * Create an {@link ICAL.Property} by parsing the passed iCalendar string.
       *
       * @param {String} str            The iCalendar string to parse
       * @param {designSet=} designSet  The design data to use for this property
       * @return {Property}             The created iCalendar property
       */
      static fromString(str, designSet) {
        return new _Property(parse.property(str, designSet));
      }
      /**
       * Creates a new ICAL.Property instance.
       *
       * It is important to note that mutations done in the wrapper directly mutate the jCal object used
       * to initialize.
       *
       * Can also be used to create new properties by passing the name of the property (as a String).
       *
       * @param {Array|String} jCal         Raw jCal representation OR the new name of the property
       * @param {Component=} parent         Parent component
       */
      constructor(jCal, parent) {
        this._parent = parent || null;
        if (typeof jCal === "string") {
          this.jCal = [jCal, {}, design.defaultType];
          this.jCal[TYPE_INDEX] = this.getDefaultType();
        } else {
          this.jCal = jCal;
        }
        this._updateType();
      }
      /**
       * The value type for this property
       * @type {String}
       */
      get type() {
        return this.jCal[TYPE_INDEX];
      }
      /**
       * The name of this property, in lowercase.
       * @type {String}
       */
      get name() {
        return this.jCal[NAME_INDEX$1];
      }
      /**
       * The parent component for this property.
       * @type {Component}
       */
      get parent() {
        return this._parent;
      }
      set parent(p) {
        let designSetChanged = !this._parent || p && p._designSet != this._parent._designSet;
        this._parent = p;
        if (this.type == design.defaultType && designSetChanged) {
          this.jCal[TYPE_INDEX] = this.getDefaultType();
          this._updateType();
        }
      }
      /**
       * The design set for this property, e.g. icalendar vs vcard
       *
       * @type {designSet}
       * @private
       */
      get _designSet() {
        return this.parent ? this.parent._designSet : design.defaultSet;
      }
      /**
       * Updates the type metadata from the current jCal type and design set.
       *
       * @private
       */
      _updateType() {
        let designSet = this._designSet;
        if (this.type in designSet.value) {
          if ("decorate" in designSet.value[this.type]) {
            this.isDecorated = true;
          } else {
            this.isDecorated = false;
          }
          if (this.name in designSet.property) {
            this.isMultiValue = "multiValue" in designSet.property[this.name];
            this.isStructuredValue = "structuredValue" in designSet.property[this.name];
          }
        }
      }
      /**
       * Hydrate a single value. The act of hydrating means turning the raw jCal
       * value into a potentially wrapped object, for example {@link ICAL.Time}.
       *
       * @private
       * @param {Number} index        The index of the value to hydrate
       * @return {?Object}             The decorated value.
       */
      _hydrateValue(index) {
        if (this._values && this._values[index]) {
          return this._values[index];
        }
        if (this.jCal.length <= VALUE_INDEX + index) {
          return null;
        }
        if (this.isDecorated) {
          if (!this._values) {
            this._values = [];
          }
          return this._values[index] = this._decorate(
            this.jCal[VALUE_INDEX + index]
          );
        } else {
          return this.jCal[VALUE_INDEX + index];
        }
      }
      /**
       * Decorate a single value, returning its wrapped object. This is used by
       * the hydrate function to actually wrap the value.
       *
       * @private
       * @param {?} value         The value to decorate
       * @return {Object}         The decorated value
       */
      _decorate(value) {
        return this._designSet.value[this.type].decorate(value, this);
      }
      /**
       * Undecorate a single value, returning its raw jCal data.
       *
       * @private
       * @param {Object} value         The value to undecorate
       * @return {?}                   The undecorated value
       */
      _undecorate(value) {
        return this._designSet.value[this.type].undecorate(value, this);
      }
      /**
       * Sets the value at the given index while also hydrating it. The passed
       * value can either be a decorated or undecorated value.
       *
       * @private
       * @param {?} value             The value to set
       * @param {Number} index        The index to set it at
       */
      _setDecoratedValue(value, index) {
        if (!this._values) {
          this._values = [];
        }
        if (typeof value === "object" && "icaltype" in value) {
          this.jCal[VALUE_INDEX + index] = this._undecorate(value);
          this._values[index] = value;
        } else {
          this.jCal[VALUE_INDEX + index] = value;
          this._values[index] = this._decorate(value);
        }
      }
      /**
       * Gets a parameter on the property.
       *
       * @param {String}        name   Parameter name (lowercase)
       * @return {Array|String}        Parameter value
       */
      getParameter(name) {
        if (name in this.jCal[PROP_INDEX]) {
          return this.jCal[PROP_INDEX][name];
        } else {
          return void 0;
        }
      }
      /**
       * Gets first parameter on the property.
       *
       * @param {String}        name   Parameter name (lowercase)
       * @return {String}        Parameter value
       */
      getFirstParameter(name) {
        let parameters = this.getParameter(name);
        if (Array.isArray(parameters)) {
          return parameters[0];
        }
        return parameters;
      }
      /**
       * Sets a parameter on the property.
       *
       * @param {String}       name     The parameter name
       * @param {Array|String} value    The parameter value
       */
      setParameter(name, value) {
        let lcname = name.toLowerCase();
        if (typeof value === "string" && lcname in this._designSet.param && "multiValue" in this._designSet.param[lcname]) {
          value = [value];
        }
        this.jCal[PROP_INDEX][name] = value;
      }
      /**
       * Removes a parameter
       *
       * @param {String} name     The parameter name
       */
      removeParameter(name) {
        delete this.jCal[PROP_INDEX][name];
      }
      /**
       * Get the default type based on this property's name.
       *
       * @return {String}     The default type for this property
       */
      getDefaultType() {
        let name = this.jCal[NAME_INDEX$1];
        let designSet = this._designSet;
        if (name in designSet.property) {
          let details = designSet.property[name];
          if ("defaultType" in details) {
            return details.defaultType;
          }
        }
        return design.defaultType;
      }
      /**
       * Sets type of property and clears out any existing values of the current
       * type.
       *
       * @param {String} type     New iCAL type (see design.*.values)
       */
      resetType(type) {
        this.removeAllValues();
        this.jCal[TYPE_INDEX] = type;
        this._updateType();
      }
      /**
       * Finds the first property value.
       *
       * @return {Binary | Duration | Period |
       * Recur | Time | UtcOffset | Geo | string | null}         First property value
       */
      getFirstValue() {
        return this._hydrateValue(0);
      }
      /**
       * Gets all values on the property.
       *
       * NOTE: this creates an array during each call.
       *
       * @return {Array}          List of values
       */
      getValues() {
        let len = this.jCal.length - VALUE_INDEX;
        if (len < 1) {
          return [];
        }
        let i = 0;
        let result = [];
        for (; i < len; i++) {
          result[i] = this._hydrateValue(i);
        }
        return result;
      }
      /**
       * Removes all values from this property
       */
      removeAllValues() {
        if (this._values) {
          this._values.length = 0;
        }
        this.jCal.length = 3;
      }
      /**
       * Sets the values of the property.  Will overwrite the existing values.
       * This can only be used for multi-value properties.
       *
       * @param {Array} values    An array of values
       */
      setValues(values) {
        if (!this.isMultiValue) {
          throw new Error(
            this.name + ": does not not support mulitValue.\noverride isMultiValue"
          );
        }
        let len = values.length;
        let i = 0;
        this.removeAllValues();
        if (len > 0 && typeof values[0] === "object" && "icaltype" in values[0]) {
          this.resetType(values[0].icaltype);
        }
        if (this.isDecorated) {
          for (; i < len; i++) {
            this._setDecoratedValue(values[i], i);
          }
        } else {
          for (; i < len; i++) {
            this.jCal[VALUE_INDEX + i] = values[i];
          }
        }
      }
      /**
       * Sets the current value of the property. If this is a multi-value
       * property, all other values will be removed.
       *
       * @param {String|Object} value     New property value.
       */
      setValue(value) {
        this.removeAllValues();
        if (typeof value === "object" && "icaltype" in value) {
          this.resetType(value.icaltype);
        }
        if (this.isDecorated) {
          this._setDecoratedValue(value, 0);
        } else {
          this.jCal[VALUE_INDEX] = value;
        }
      }
      /**
       * Returns the Object representation of this component. The returned object
       * is a live jCal object and should be cloned if modified.
       * @return {Object}
       */
      toJSON() {
        return this.jCal;
      }
      /**
       * The string representation of this component.
       * @return {String}
       */
      toICALString() {
        return stringify.property(
          this.jCal,
          this._designSet,
          true
        );
      }
    };
    NAME_INDEX = 0;
    PROPERTY_INDEX = 1;
    COMPONENT_INDEX = 2;
    PROPERTY_NAME_INDEX = 0;
    PROPERTY_VALUE_INDEX = 3;
    Component = class _Component {
      /**
       * Create an {@link ICAL.Component} by parsing the passed iCalendar string.
       *
       * @param {String} str        The iCalendar string to parse
       */
      static fromString(str) {
        return new _Component(parse.component(str));
      }
      /**
       * Creates a new Component instance.
       *
       * @param {Array|String} jCal         Raw jCal component data OR name of new
       *                                      component
       * @param {Component=} parent     Parent component to associate
       */
      constructor(jCal, parent) {
        if (typeof jCal === "string") {
          jCal = [jCal, [], []];
        }
        this.jCal = jCal;
        this.parent = parent || null;
        if (!this.parent && this.name === "vcalendar") {
          this._timezoneCache = /* @__PURE__ */ new Map();
        }
      }
      /**
       * Hydrated properties are inserted into the _properties array at the same
       * position as in the jCal array, so it is possible that the array contains
       * undefined values for unhydrdated properties. To avoid iterating the
       * array when checking if all properties have been hydrated, we save the
       * count here.
       *
       * @type {Number}
       * @private
       */
      _hydratedPropertyCount = 0;
      /**
       * The same count as for _hydratedPropertyCount, but for subcomponents
       *
       * @type {Number}
       * @private
       */
      _hydratedComponentCount = 0;
      /**
       * A cache of hydrated time zone objects which may be used by consumers, keyed
       * by time zone ID.
       *
       * @type {Map}
       * @private
       */
      _timezoneCache = null;
      /**
       * @private
       */
      _components = null;
      /**
       * @private
       */
      _properties = null;
      /**
       * The name of this component
       *
       * @type {String}
       */
      get name() {
        return this.jCal[NAME_INDEX];
      }
      /**
       * The design set for this component, e.g. icalendar vs vcard
       *
       * @type {designSet}
       * @private
       */
      get _designSet() {
        let parentDesign = this.parent && this.parent._designSet;
        if (!parentDesign && this.name == "vcard") {
          let versionProp = this.jCal[PROPERTY_INDEX]?.[0];
          if (versionProp && versionProp[PROPERTY_NAME_INDEX] == "version" && versionProp[PROPERTY_VALUE_INDEX] == "3.0") {
            return design.getDesignSet("vcard3");
          }
        }
        return parentDesign || design.getDesignSet(this.name);
      }
      /**
       * @private
       */
      _hydrateComponent(index) {
        if (!this._components) {
          this._components = [];
          this._hydratedComponentCount = 0;
        }
        if (this._components[index]) {
          return this._components[index];
        }
        let comp = new _Component(
          this.jCal[COMPONENT_INDEX][index],
          this
        );
        this._hydratedComponentCount++;
        return this._components[index] = comp;
      }
      /**
       * @private
       */
      _hydrateProperty(index) {
        if (!this._properties) {
          this._properties = [];
          this._hydratedPropertyCount = 0;
        }
        if (this._properties[index]) {
          return this._properties[index];
        }
        let prop3 = new Property(
          this.jCal[PROPERTY_INDEX][index],
          this
        );
        this._hydratedPropertyCount++;
        return this._properties[index] = prop3;
      }
      /**
       * Finds first sub component, optionally filtered by name.
       *
       * @param {String=} name        Optional name to filter by
       * @return {?Component}     The found subcomponent
       */
      getFirstSubcomponent(name) {
        if (name) {
          let i = 0;
          let comps = this.jCal[COMPONENT_INDEX];
          let len = comps.length;
          for (; i < len; i++) {
            if (comps[i][NAME_INDEX] === name) {
              let result = this._hydrateComponent(i);
              return result;
            }
          }
        } else {
          if (this.jCal[COMPONENT_INDEX].length) {
            return this._hydrateComponent(0);
          }
        }
        return null;
      }
      /**
       * Finds all sub components, optionally filtering by name.
       *
       * @param {String=} name            Optional name to filter by
       * @return {Component[]}       The found sub components
       */
      getAllSubcomponents(name) {
        let jCalLen = this.jCal[COMPONENT_INDEX].length;
        let i = 0;
        if (name) {
          let comps = this.jCal[COMPONENT_INDEX];
          let result = [];
          for (; i < jCalLen; i++) {
            if (name === comps[i][NAME_INDEX]) {
              result.push(
                this._hydrateComponent(i)
              );
            }
          }
          return result;
        } else {
          if (!this._components || this._hydratedComponentCount !== jCalLen) {
            for (; i < jCalLen; i++) {
              this._hydrateComponent(i);
            }
          }
          return this._components || [];
        }
      }
      /**
       * Returns true when a named property exists.
       *
       * @param {String} name     The property name
       * @return {Boolean}        True, when property is found
       */
      hasProperty(name) {
        let props = this.jCal[PROPERTY_INDEX];
        let len = props.length;
        let i = 0;
        for (; i < len; i++) {
          if (props[i][NAME_INDEX] === name) {
            return true;
          }
        }
        return false;
      }
      /**
       * Finds the first property, optionally with the given name.
       *
       * @param {String=} name        Lowercase property name
       * @return {?Property}     The found property
       */
      getFirstProperty(name) {
        if (name) {
          let i = 0;
          let props = this.jCal[PROPERTY_INDEX];
          let len = props.length;
          for (; i < len; i++) {
            if (props[i][NAME_INDEX] === name) {
              let result = this._hydrateProperty(i);
              return result;
            }
          }
        } else {
          if (this.jCal[PROPERTY_INDEX].length) {
            return this._hydrateProperty(0);
          }
        }
        return null;
      }
      /**
       * Returns first property's value, if available.
       *
       * @param {String=} name                    Lowercase property name
       * @return {Binary | Duration | Period |
       * Recur | Time | UtcOffset | Geo | string | null}         The found property value.
       */
      getFirstPropertyValue(name) {
        let prop3 = this.getFirstProperty(name);
        if (prop3) {
          return prop3.getFirstValue();
        }
        return null;
      }
      /**
       * Get all properties in the component, optionally filtered by name.
       *
       * @param {String=} name        Lowercase property name
       * @return {Property[]}    List of properties
       */
      getAllProperties(name) {
        let jCalLen = this.jCal[PROPERTY_INDEX].length;
        let i = 0;
        if (name) {
          let props = this.jCal[PROPERTY_INDEX];
          let result = [];
          for (; i < jCalLen; i++) {
            if (name === props[i][NAME_INDEX]) {
              result.push(
                this._hydrateProperty(i)
              );
            }
          }
          return result;
        } else {
          if (!this._properties || this._hydratedPropertyCount !== jCalLen) {
            for (; i < jCalLen; i++) {
              this._hydrateProperty(i);
            }
          }
          return this._properties || [];
        }
      }
      /**
       * @private
       */
      _removeObjectByIndex(jCalIndex, cache, index) {
        cache = cache || [];
        if (cache[index]) {
          let obj = cache[index];
          if ("parent" in obj) {
            obj.parent = null;
          }
        }
        cache.splice(index, 1);
        this.jCal[jCalIndex].splice(index, 1);
      }
      /**
       * @private
       */
      _removeObject(jCalIndex, cache, nameOrObject) {
        let i = 0;
        let objects = this.jCal[jCalIndex];
        let len = objects.length;
        let cached = this[cache];
        if (typeof nameOrObject === "string") {
          for (; i < len; i++) {
            if (objects[i][NAME_INDEX] === nameOrObject) {
              this._removeObjectByIndex(jCalIndex, cached, i);
              return true;
            }
          }
        } else if (cached) {
          for (; i < len; i++) {
            if (cached[i] && cached[i] === nameOrObject) {
              this._removeObjectByIndex(jCalIndex, cached, i);
              return true;
            }
          }
        }
        return false;
      }
      /**
       * @private
       */
      _removeAllObjects(jCalIndex, cache, name) {
        let cached = this[cache];
        let objects = this.jCal[jCalIndex];
        let i = objects.length - 1;
        for (; i >= 0; i--) {
          if (!name || objects[i][NAME_INDEX] === name) {
            this._removeObjectByIndex(jCalIndex, cached, i);
          }
        }
      }
      /**
       * Adds a single sub component.
       *
       * @param {Component} component        The component to add
       * @return {Component}                 The passed in component
       */
      addSubcomponent(component) {
        if (!this._components) {
          this._components = [];
          this._hydratedComponentCount = 0;
        }
        if (component.parent) {
          component.parent.removeSubcomponent(component);
        }
        let idx = this.jCal[COMPONENT_INDEX].push(component.jCal);
        this._components[idx - 1] = component;
        this._hydratedComponentCount++;
        component.parent = this;
        return component;
      }
      /**
       * Removes a single component by name or the instance of a specific
       * component.
       *
       * @param {Component|String} nameOrComp    Name of component, or component
       * @return {Boolean}                            True when comp is removed
       */
      removeSubcomponent(nameOrComp) {
        let removed = this._removeObject(COMPONENT_INDEX, "_components", nameOrComp);
        if (removed) {
          this._hydratedComponentCount--;
        }
        return removed;
      }
      /**
       * Removes all components or (if given) all components by a particular
       * name.
       *
       * @param {String=} name            Lowercase component name
       */
      removeAllSubcomponents(name) {
        let removed = this._removeAllObjects(COMPONENT_INDEX, "_components", name);
        this._hydratedComponentCount = 0;
        return removed;
      }
      /**
       * Adds an {@link ICAL.Property} to the component.
       *
       * @param {Property} property      The property to add
       * @return {Property}              The passed in property
       */
      addProperty(property) {
        if (!(property instanceof Property)) {
          throw new TypeError("must be instance of ICAL.Property");
        }
        if (!this._properties) {
          this._properties = [];
          this._hydratedPropertyCount = 0;
        }
        if (property.parent) {
          property.parent.removeProperty(property);
        }
        let idx = this.jCal[PROPERTY_INDEX].push(property.jCal);
        this._properties[idx - 1] = property;
        this._hydratedPropertyCount++;
        property.parent = this;
        return property;
      }
      /**
       * Helper method to add a property with a value to the component.
       *
       * @param {String}               name         Property name to add
       * @param {String|Number|Object} value        Property value
       * @return {Property}                    The created property
       */
      addPropertyWithValue(name, value) {
        let prop3 = new Property(name);
        prop3.setValue(value);
        this.addProperty(prop3);
        return prop3;
      }
      /**
       * Helper method that will update or create a property of the given name
       * and sets its value. If multiple properties with the given name exist,
       * only the first is updated.
       *
       * @param {String}               name         Property name to update
       * @param {String|Number|Object} value        Property value
       * @return {Property}                    The created property
       */
      updatePropertyWithValue(name, value) {
        let prop3 = this.getFirstProperty(name);
        if (prop3) {
          prop3.setValue(value);
        } else {
          prop3 = this.addPropertyWithValue(name, value);
        }
        return prop3;
      }
      /**
       * Removes a single property by name or the instance of the specific
       * property.
       *
       * @param {String|Property} nameOrProp     Property name or instance to remove
       * @return {Boolean}                            True, when deleted
       */
      removeProperty(nameOrProp) {
        let removed = this._removeObject(PROPERTY_INDEX, "_properties", nameOrProp);
        if (removed) {
          this._hydratedPropertyCount--;
        }
        return removed;
      }
      /**
       * Removes all properties associated with this component, optionally
       * filtered by name.
       *
       * @param {String=} name        Lowercase property name
       * @return {Boolean}            True, when deleted
       */
      removeAllProperties(name) {
        let removed = this._removeAllObjects(PROPERTY_INDEX, "_properties", name);
        this._hydratedPropertyCount = 0;
        return removed;
      }
      /**
       * Returns the Object representation of this component. The returned object
       * is a live jCal object and should be cloned if modified.
       * @return {Object}
       */
      toJSON() {
        return this.jCal;
      }
      /**
       * The string representation of this component.
       * @return {String}
       */
      toString() {
        return stringify.component(
          this.jCal,
          this._designSet
        );
      }
      /**
       * Retrieve a time zone definition from the component tree, if any is present.
       * If the tree contains no time zone definitions or the TZID cannot be
       * matched, returns null.
       *
       * @param {String} tzid     The ID of the time zone to retrieve
       * @return {Timezone}  The time zone corresponding to the ID, or null
       */
      getTimeZoneByID(tzid) {
        if (this.parent) {
          return this.parent.getTimeZoneByID(tzid);
        }
        if (!this._timezoneCache) {
          return null;
        }
        if (this._timezoneCache.has(tzid)) {
          return this._timezoneCache.get(tzid);
        }
        const zones2 = this.getAllSubcomponents("vtimezone");
        for (const zone of zones2) {
          if (zone.getFirstProperty("tzid").getFirstValue() === tzid) {
            const hydratedZone = new Timezone({
              component: zone,
              tzid
            });
            this._timezoneCache.set(tzid, hydratedZone);
            return hydratedZone;
          }
        }
        return null;
      }
    };
    RecurExpansion = class {
      /**
       * Creates a new ICAL.RecurExpansion instance.
       *
       * The options object can be filled with the specified initial values. It can also contain
       * additional members, as a result of serializing a previous expansion state, as shown in the
       * example.
       *
       * @param {Object} options
       *        Recurrence expansion options
       * @param {Time} options.dtstart
       *        Start time of the event
       * @param {Component=} options.component
       *        Component for expansion, required if not resuming.
       */
      constructor(options) {
        this.ruleDates = [];
        this.exDates = [];
        this.fromData(options);
      }
      /**
       * True when iteration is fully completed.
       * @type {Boolean}
       */
      complete = false;
      /**
       * Array of rrule iterators.
       *
       * @type {RecurIterator[]}
       * @private
       */
      ruleIterators = null;
      /**
       * Array of rdate instances.
       *
       * @type {Time[]}
       * @private
       */
      ruleDates = null;
      /**
       * Array of exdate instances.
       *
       * @type {Time[]}
       * @private
       */
      exDates = null;
      /**
       * Current position in ruleDates array.
       * @type {Number}
       * @private
       */
      ruleDateInc = 0;
      /**
       * Current position in exDates array
       * @type {Number}
       * @private
       */
      exDateInc = 0;
      /**
       * Current negative date.
       *
       * @type {Time}
       * @private
       */
      exDate = null;
      /**
       * Current additional date.
       *
       * @type {Time}
       * @private
       */
      ruleDate = null;
      /**
       * Start date of recurring rules.
       *
       * @type {Time}
       */
      dtstart = null;
      /**
       * Last expanded time
       *
       * @type {Time}
       */
      last = null;
      /**
       * Initialize the recurrence expansion from the data object. The options
       * object may also contain additional members, see the
       * {@link ICAL.RecurExpansion constructor} for more details.
       *
       * @param {Object} options
       *        Recurrence expansion options
       * @param {Time} options.dtstart
       *        Start time of the event
       * @param {Component=} options.component
       *        Component for expansion, required if not resuming.
       */
      fromData(options) {
        let start = formatClassType(options.dtstart, Time);
        if (!start) {
          throw new Error(".dtstart (ICAL.Time) must be given");
        } else {
          this.dtstart = start;
        }
        if (options.component) {
          this._init(options.component);
        } else {
          this.last = formatClassType(options.last, Time) || start.clone();
          if (!options.ruleIterators) {
            throw new Error(".ruleIterators or .component must be given");
          }
          this.ruleIterators = options.ruleIterators.map(function(item) {
            return formatClassType(item, RecurIterator);
          });
          this.ruleDateInc = options.ruleDateInc;
          this.exDateInc = options.exDateInc;
          if (options.ruleDates) {
            this.ruleDates = options.ruleDates.map((item) => formatClassType(item, Time));
            this.ruleDate = this.ruleDates[this.ruleDateInc];
          }
          if (options.exDates) {
            this.exDates = options.exDates.map((item) => formatClassType(item, Time));
            this.exDate = this.exDates[this.exDateInc];
          }
          if (typeof options.complete !== "undefined") {
            this.complete = options.complete;
          }
        }
      }
      /**
       * Compare two ICAL.Time objects.  When the second parameter is a DATE and the first parameter is
       * DATE-TIME, strip the time and compare only the days.
       *
       * @private
       * @param {Time} a   The one object to compare
       * @param {Time} b   The other object to compare
       */
      _compare_special(a, b) {
        if (!a.isDate && b.isDate)
          return new Time({ year: a.year, month: a.month, day: a.day }).compare(b);
        return a.compare(b);
      }
      /**
       * Retrieve the next occurrence in the series.
       * @return {Time}
       */
      next() {
        let iter;
        let next;
        let compare;
        let maxTries = 500;
        let currentTry = 0;
        while (true) {
          if (currentTry++ > maxTries) {
            throw new Error(
              "max tries have occurred, rule may be impossible to fulfill."
            );
          }
          next = this.ruleDate;
          iter = this._nextRecurrenceIter(this.last);
          if (!next && !iter) {
            this.complete = true;
            break;
          }
          if (!next || iter && next.compare(iter.last) > 0) {
            next = iter.last.clone();
            iter.next();
          }
          if (this.ruleDate === next) {
            this._nextRuleDay();
          }
          this.last = next;
          if (this.exDate) {
            compare = this._compare_special(this.last, this.exDate);
            if (compare > 0) {
              this._nextExDay();
            }
            if (compare === 0) {
              this._nextExDay();
              continue;
            }
          }
          return this.last;
        }
      }
      /**
       * Converts object into a serialize-able format. This format can be passed
       * back into the expansion to resume iteration.
       * @return {Object}
       */
      toJSON() {
        function toJSON(item) {
          return item.toJSON();
        }
        let result = /* @__PURE__ */ Object.create(null);
        result.ruleIterators = this.ruleIterators.map(toJSON);
        if (this.ruleDates) {
          result.ruleDates = this.ruleDates.map(toJSON);
        }
        if (this.exDates) {
          result.exDates = this.exDates.map(toJSON);
        }
        result.ruleDateInc = this.ruleDateInc;
        result.exDateInc = this.exDateInc;
        result.last = this.last.toJSON();
        result.dtstart = this.dtstart.toJSON();
        result.complete = this.complete;
        return result;
      }
      /**
       * Extract all dates from the properties in the given component. The
       * properties will be filtered by the property name.
       *
       * @private
       * @param {Component} component             The component to search in
       * @param {String} propertyName             The property name to search for
       * @return {Time[]}                         The extracted dates.
       */
      _extractDates(component, propertyName) {
        let result = [];
        let props = component.getAllProperties(propertyName);
        for (let i = 0, len = props.length; i < len; i++) {
          for (let prop3 of props[i].getValues()) {
            let idx = binsearchInsert(
              result,
              prop3,
              (a, b) => a.compare(b)
            );
            result.splice(idx, 0, prop3);
          }
        }
        return result;
      }
      /**
       * Initialize the recurrence expansion.
       *
       * @private
       * @param {Component} component    The component to initialize from.
       */
      _init(component) {
        this.ruleIterators = [];
        this.last = this.dtstart.clone();
        if (!component.hasProperty("rdate") && !component.hasProperty("rrule") && !component.hasProperty("recurrence-id")) {
          this.ruleDate = this.last.clone();
          this.complete = true;
          return;
        }
        if (component.hasProperty("rdate")) {
          this.ruleDates = this._extractDates(component, "rdate");
          if (this.ruleDates[0] && this.ruleDates[0].compare(this.dtstart) < 0) {
            this.ruleDateInc = 0;
            this.last = this.ruleDates[0].clone();
          } else {
            this.ruleDateInc = binsearchInsert(
              this.ruleDates,
              this.last,
              (a, b) => a.compare(b)
            );
          }
          this.ruleDate = this.ruleDates[this.ruleDateInc];
        }
        if (component.hasProperty("rrule")) {
          let rules = component.getAllProperties("rrule");
          let i = 0;
          let len = rules.length;
          let rule;
          let iter;
          for (; i < len; i++) {
            rule = rules[i].getFirstValue();
            iter = rule.iterator(this.dtstart);
            this.ruleIterators.push(iter);
            iter.next();
          }
        }
        if (component.hasProperty("exdate")) {
          this.exDates = this._extractDates(component, "exdate");
          this.exDateInc = binsearchInsert(
            this.exDates,
            this.last,
            this._compare_special
          );
          this.exDate = this.exDates[this.exDateInc];
        }
      }
      /**
       * Advance to the next exdate
       * @private
       */
      _nextExDay() {
        this.exDate = this.exDates[++this.exDateInc];
      }
      /**
       * Advance to the next rule date
       * @private
       */
      _nextRuleDay() {
        this.ruleDate = this.ruleDates[++this.ruleDateInc];
      }
      /**
       * Find and return the recurrence rule with the most recent event and
       * return it.
       *
       * @private
       * @return {?RecurIterator}    Found iterator.
       */
      _nextRecurrenceIter() {
        let iters = this.ruleIterators;
        if (iters.length === 0) {
          return null;
        }
        let len = iters.length;
        let iter;
        let iterTime;
        let iterIdx = 0;
        let chosenIter;
        for (; iterIdx < len; iterIdx++) {
          iter = iters[iterIdx];
          iterTime = iter.last;
          if (iter.completed) {
            len--;
            if (iterIdx !== 0) {
              iterIdx--;
            }
            iters.splice(iterIdx, 1);
            continue;
          }
          if (!chosenIter || chosenIter.last.compare(iterTime) > 0) {
            chosenIter = iter;
          }
        }
        return chosenIter;
      }
    };
    Event = class _Event {
      /**
       * Creates a new ICAL.Event instance.
       *
       * @param {Component=} component              The ICAL.Component to base this event on
       * @param {Object} [options]                  Options for this event
       * @param {Boolean=} options.strictExceptions  When true, will verify exceptions are related by
       *                                              their UUID
       * @param {Array<Component|Event>=} options.exceptions
       *          Exceptions to this event, either as components or events. If not
       *            specified exceptions will automatically be set in relation of
       *            component's parent
       */
      constructor(component, options) {
        if (!(component instanceof Component)) {
          options = component;
          component = null;
        }
        if (component) {
          this.component = component;
        } else {
          this.component = new Component("vevent");
        }
        this._rangeExceptionCache = /* @__PURE__ */ Object.create(null);
        this.exceptions = /* @__PURE__ */ Object.create(null);
        this.rangeExceptions = [];
        if (options && options.strictExceptions) {
          this.strictExceptions = options.strictExceptions;
        }
        if (options && options.exceptions) {
          options.exceptions.forEach(this.relateException, this);
        } else if (this.component.parent && !this.isRecurrenceException()) {
          this.component.parent.getAllSubcomponents("vevent").forEach(function(event) {
            if (event.hasProperty("recurrence-id")) {
              this.relateException(event);
            }
          }, this);
        }
      }
      static THISANDFUTURE = "THISANDFUTURE";
      /**
       * List of related event exceptions.
       *
       * @type {Event[]}
       */
      exceptions = null;
      /**
       * When true, will verify exceptions are related by their UUID.
       *
       * @type {Boolean}
       */
      strictExceptions = false;
      /**
       * Relates a given event exception to this object.  If the given component
       * does not share the UID of this event it cannot be related and will throw
       * an exception.
       *
       * If this component is an exception it cannot have other exceptions
       * related to it.
       *
       * @param {Component|Event} obj       Component or event
       */
      relateException(obj) {
        if (this.isRecurrenceException()) {
          throw new Error("cannot relate exception to exceptions");
        }
        if (obj instanceof Component) {
          obj = new _Event(obj);
        }
        if (this.strictExceptions && obj.uid !== this.uid) {
          throw new Error("attempted to relate unrelated exception");
        }
        let id = obj.recurrenceId.toString();
        this.exceptions[id] = obj;
        if (obj.modifiesFuture()) {
          let item = [
            obj.recurrenceId.toUnixTime(),
            id
          ];
          let idx = binsearchInsert(
            this.rangeExceptions,
            item,
            compareRangeException
          );
          this.rangeExceptions.splice(idx, 0, item);
        }
      }
      /**
       * Checks if this record is an exception and has the RANGE=THISANDFUTURE
       * value.
       *
       * @return {Boolean}        True, when exception is within range
       */
      modifiesFuture() {
        if (!this.component.hasProperty("recurrence-id")) {
          return false;
        }
        let range = this.component.getFirstProperty("recurrence-id").getParameter("range");
        return range === _Event.THISANDFUTURE;
      }
      /**
       * Finds the range exception nearest to the given date.
       *
       * @param {Time} time   usually an occurrence time of an event
       * @return {?Event}     the related event/exception or null
       */
      findRangeException(time) {
        if (!this.rangeExceptions.length) {
          return null;
        }
        let utc = time.toUnixTime();
        let idx = binsearchInsert(
          this.rangeExceptions,
          [utc],
          compareRangeException
        );
        idx -= 1;
        if (idx < 0) {
          return null;
        }
        let rangeItem = this.rangeExceptions[idx];
        if (utc < rangeItem[0]) {
          return null;
        }
        return rangeItem[1];
      }
      /**
       * Returns the occurrence details based on its start time.  If the
       * occurrence has an exception will return the details for that exception.
       *
       * NOTE: this method is intend to be used in conjunction
       *       with the {@link ICAL.Event#iterator iterator} method.
       *
       * @param {Time} occurrence               time occurrence
       * @return {occurrenceDetails}            Information about the occurrence
       */
      getOccurrenceDetails(occurrence) {
        let id = occurrence.toString();
        let utcId = occurrence.convertToZone(Timezone.utcTimezone).toString();
        let item;
        let result = {
          //XXX: Clone?
          recurrenceId: occurrence
        };
        if (id in this.exceptions) {
          item = result.item = this.exceptions[id];
          result.startDate = item.startDate;
          result.endDate = item.endDate;
          result.item = item;
        } else if (utcId in this.exceptions) {
          item = this.exceptions[utcId];
          result.startDate = item.startDate;
          result.endDate = item.endDate;
          result.item = item;
        } else {
          let rangeExceptionId = this.findRangeException(
            occurrence
          );
          let end;
          if (rangeExceptionId) {
            let exception = this.exceptions[rangeExceptionId];
            result.item = exception;
            let startDiff = this._rangeExceptionCache[rangeExceptionId];
            if (!startDiff) {
              let original = exception.recurrenceId.clone();
              let newStart = exception.startDate.clone();
              original.zone = newStart.zone;
              startDiff = newStart.subtractDate(original);
              this._rangeExceptionCache[rangeExceptionId] = startDiff;
            }
            let start = occurrence.clone();
            start.zone = exception.startDate.zone;
            start.addDuration(startDiff);
            end = start.clone();
            end.addDuration(exception.duration);
            result.startDate = start;
            result.endDate = end;
          } else {
            end = occurrence.clone();
            end.addDuration(this.duration);
            result.endDate = end;
            result.startDate = occurrence;
            result.item = this;
          }
        }
        return result;
      }
      /**
       * Builds a recur expansion instance for a specific point in time (defaults
       * to startDate).
       *
       * @param {Time=} startTime     Starting point for expansion
       * @return {RecurExpansion}    Expansion object
       */
      iterator(startTime) {
        return new RecurExpansion({
          component: this.component,
          dtstart: startTime || this.startDate
        });
      }
      /**
       * Checks if the event is recurring
       *
       * @return {Boolean}        True, if event is recurring
       */
      isRecurring() {
        let comp = this.component;
        return comp.hasProperty("rrule") || comp.hasProperty("rdate");
      }
      /**
       * Checks if the event describes a recurrence exception. See
       * {@tutorial terminology} for details.
       *
       * @return {Boolean}    True, if the event describes a recurrence exception
       */
      isRecurrenceException() {
        return this.component.hasProperty("recurrence-id");
      }
      /**
       * Returns the types of recurrences this event may have.
       *
       * Returned as an object with the following possible keys:
       *
       *    - YEARLY
       *    - MONTHLY
       *    - WEEKLY
       *    - DAILY
       *    - MINUTELY
       *    - SECONDLY
       *
       * @return {Object.<frequencyValues, Boolean>}
       *          Object of recurrence flags
       */
      getRecurrenceTypes() {
        let rules = this.component.getAllProperties("rrule");
        let i = 0;
        let len = rules.length;
        let result = /* @__PURE__ */ Object.create(null);
        for (; i < len; i++) {
          let value = rules[i].getFirstValue();
          result[value.freq] = true;
        }
        return result;
      }
      /**
       * The uid of this event
       * @type {String}
       */
      get uid() {
        return this._firstProp("uid");
      }
      set uid(value) {
        this._setProp("uid", value);
      }
      /**
       * The start date
       * @type {Time}
       */
      get startDate() {
        return this._firstProp("dtstart");
      }
      set startDate(value) {
        this._setTime("dtstart", value);
      }
      /**
       * The end date. This can be the result directly from the property, or the
       * end date calculated from start date and duration. Setting the property
       * will remove any duration properties.
       * @type {Time}
       */
      get endDate() {
        let endDate = this._firstProp("dtend");
        if (!endDate) {
          let duration = this._firstProp("duration");
          endDate = this.startDate.clone();
          if (duration) {
            endDate.addDuration(duration);
          } else if (endDate.isDate) {
            endDate.day += 1;
          }
        }
        return endDate;
      }
      set endDate(value) {
        if (this.component.hasProperty("duration")) {
          this.component.removeProperty("duration");
        }
        this._setTime("dtend", value);
      }
      /**
       * The duration. This can be the result directly from the property, or the
       * duration calculated from start date and end date. Setting the property
       * will remove any `dtend` properties.
       * @type {Duration}
       */
      get duration() {
        let duration = this._firstProp("duration");
        if (!duration) {
          return this.endDate.subtractDateTz(this.startDate);
        }
        return duration;
      }
      set duration(value) {
        if (this.component.hasProperty("dtend")) {
          this.component.removeProperty("dtend");
        }
        this._setProp("duration", value);
      }
      /**
       * The location of the event.
       * @type {String}
       */
      get location() {
        return this._firstProp("location");
      }
      set location(value) {
        this._setProp("location", value);
      }
      /**
       * The attendees in the event
       * @type {Property[]}
       */
      get attendees() {
        return this.component.getAllProperties("attendee");
      }
      /**
       * The event summary
       * @type {String}
       */
      get summary() {
        return this._firstProp("summary");
      }
      set summary(value) {
        this._setProp("summary", value);
      }
      /**
       * The event description.
       * @type {String}
       */
      get description() {
        return this._firstProp("description");
      }
      set description(value) {
        this._setProp("description", value);
      }
      /**
       * The event color from [rfc7986](https://datatracker.ietf.org/doc/html/rfc7986)
       * @type {String}
       */
      get color() {
        return this._firstProp("color");
      }
      set color(value) {
        this._setProp("color", value);
      }
      /**
       * The organizer value as an uri. In most cases this is a mailto: uri, but
       * it can also be something else, like urn:uuid:...
       * @type {String}
       */
      get organizer() {
        return this._firstProp("organizer");
      }
      set organizer(value) {
        this._setProp("organizer", value);
      }
      /**
       * The sequence value for this event. Used for scheduling
       * see {@tutorial terminology}.
       * @type {Number}
       */
      get sequence() {
        return this._firstProp("sequence");
      }
      set sequence(value) {
        this._setProp("sequence", value);
      }
      /**
       * The recurrence id for this event. See {@tutorial terminology} for details.
       * @type {Time}
       */
      get recurrenceId() {
        return this._firstProp("recurrence-id");
      }
      set recurrenceId(value) {
        this._setTime("recurrence-id", value);
      }
      /**
       * Set/update a time property's value.
       * This will also update the TZID of the property.
       *
       * TODO: this method handles the case where we are switching
       * from a known timezone to an implied timezone (one without TZID).
       * This does _not_ handle the case of moving between a known
       *  (by TimezoneService) timezone to an unknown timezone...
       *
       * We will not add/remove/update the VTIMEZONE subcomponents
       *  leading to invalid ICAL data...
       * @private
       * @param {String} propName     The property name
       * @param {Time} time           The time to set
       */
      _setTime(propName, time) {
        let prop3 = this.component.getFirstProperty(propName);
        if (!prop3) {
          prop3 = new Property(propName);
          this.component.addProperty(prop3);
        }
        if (time.zone === Timezone.localTimezone || time.zone === Timezone.utcTimezone) {
          prop3.removeParameter("tzid");
        } else {
          prop3.setParameter("tzid", time.zone.tzid);
        }
        prop3.setValue(time);
      }
      _setProp(name, value) {
        this.component.updatePropertyWithValue(name, value);
      }
      _firstProp(name) {
        return this.component.getFirstPropertyValue(name);
      }
      /**
       * The string representation of this event.
       * @return {String}
       */
      toString() {
        return this.component.toString();
      }
    };
    ComponentParser = class {
      /**
       * Creates a new ICAL.ComponentParser instance.
       *
       * @param {Object=} options                   Component parser options
       * @param {Boolean} options.parseEvent        Whether events should be parsed
       * @param {Boolean} options.parseTimezeone    Whether timezones should be parsed
       */
      constructor(options) {
        if (typeof options === "undefined") {
          options = {};
        }
        for (let [key, value] of Object.entries(options)) {
          this[key] = value;
        }
      }
      /**
       * When true, parse events
       *
       * @type {Boolean}
       */
      parseEvent = true;
      /**
       * When true, parse timezones
       *
       * @type {Boolean}
       */
      parseTimezone = true;
      /* SAX like events here for reference */
      /**
       * Fired when parsing is complete
       * @callback
       */
      oncomplete = (
        /* c8 ignore next */
        function() {
        }
      );
      /**
       * Fired if an error occurs during parsing.
       *
       * @callback
       * @param {Error} err details of error
       */
      onerror = (
        /* c8 ignore next */
        function(err) {
        }
      );
      /**
       * Fired when a top level component (VTIMEZONE) is found
       *
       * @callback
       * @param {Timezone} component     Timezone object
       */
      ontimezone = (
        /* c8 ignore next */
        function(component) {
        }
      );
      /**
       * Fired when a top level component (VEVENT) is found.
       *
       * @callback
       * @param {Event} component    Top level component
       */
      onevent = (
        /* c8 ignore next */
        function(component) {
        }
      );
      /**
       * Process a string or parse ical object.  This function itself will return
       * nothing but will start the parsing process.
       *
       * Events must be registered prior to calling this method.
       *
       * @param {Component|String|Object} ical      The component to process,
       *        either in its final form, as a jCal Object, or string representation
       */
      process(ical) {
        if (typeof ical === "string") {
          ical = parse(ical);
        }
        if (!(ical instanceof Component)) {
          ical = new Component(ical);
        }
        let components = ical.getAllSubcomponents();
        let i = 0;
        let len = components.length;
        let component;
        for (; i < len; i++) {
          component = components[i];
          switch (component.name) {
            case "vtimezone":
              if (this.parseTimezone) {
                let tzid = component.getFirstPropertyValue("tzid");
                if (tzid) {
                  this.ontimezone(new Timezone({
                    tzid,
                    component
                  }));
                }
              }
              break;
            case "vevent":
              if (this.parseEvent) {
                this.onevent(new Event(component));
              }
              break;
            default:
              continue;
          }
        }
        this.oncomplete();
      }
    };
    ICALmodule = {
      /**
       * The number of characters before iCalendar line folding should occur
       * @type {Number}
       * @default 75
       */
      foldLength: 75,
      debug: false,
      /**
       * The character(s) to be used for a newline. The default value is provided by
       * rfc5545.
       * @type {String}
       * @default "\r\n"
       */
      newLineChar: "\r\n",
      Binary,
      Component,
      ComponentParser,
      Duration,
      Event,
      Period,
      Property,
      Recur,
      RecurExpansion,
      RecurIterator,
      Time,
      Timezone,
      TimezoneService,
      UtcOffset,
      VCardTime,
      parse,
      stringify,
      design,
      helpers
    };
  }
});

// src/discovery/fetchers/ical.ts
async function fetchIcal(source, opts) {
  let text;
  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": USER_AGENT2, Accept: "text/calendar, */*;q=0.5" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS2)
    });
    if (!res.ok) {
      return { status: "error", events: [], error: `HTTP ${res.status} ${res.statusText}` };
    }
    text = await res.text();
  } catch (e) {
    return { status: "error", events: [], error: errMessage(e) };
  }
  let jcal;
  try {
    jcal = ICALmodule.parse(text);
  } catch (e) {
    return { status: "error", events: [], error: `iCal parse failed: ${errMessage(e)}` };
  }
  const events2 = [];
  try {
    const comp = new ICALmodule.Component(jcal);
    const vevents = comp.getAllSubcomponents("vevent");
    const horizonStart = opts.windowStartsAt.getTime();
    const horizonEnd = opts.windowEndsAt.getTime();
    for (const ve of vevents) {
      const event = new ICALmodule.Event(ve);
      if (!event.startDate) continue;
      if (event.isRecurring()) {
        const iterator = event.iterator();
        for (let i = 0; i < 200; i++) {
          const next = iterator.next();
          if (!next) break;
          const startMs = next.toJSDate().getTime();
          if (startMs > horizonEnd) break;
          if (startMs < horizonStart) continue;
          try {
            const occ = event.getOccurrenceDetails(next);
            events2.push(mapIcalEvent(event, occ.startDate, occ.endDate, source.url));
          } catch {
          }
        }
      } else {
        const startMs = event.startDate.toJSDate().getTime();
        if (startMs < horizonStart || startMs > horizonEnd) continue;
        events2.push(mapIcalEvent(event, event.startDate, event.endDate, source.url));
      }
    }
  } catch (e) {
    return { status: "error", events: events2, error: `iCal walk failed: ${errMessage(e)}` };
  }
  return { status: "ok", events: events2 };
}
function mapIcalEvent(event, start, end, sourceUrl) {
  const title2 = (event.summary ?? "Untitled").toString().trim();
  return {
    title: title2 || "Untitled",
    description: event.description ? String(event.description).trim() : null,
    starts_at: start.toJSDate().toISOString(),
    ends_at: end ? end.toJSDate().toISOString() : null,
    venue_name: event.location ? String(event.location).trim() : null,
    url: sourceUrl,
    confidence: 1
  };
}
function errMessage(e) {
  if (e instanceof Error) return e.message;
  return String(e);
}
var USER_AGENT2, FETCH_TIMEOUT_MS2;
var init_ical2 = __esm({
  "src/discovery/fetchers/ical.ts"() {
    "use strict";
    init_ical();
    init_user_agent();
    USER_AGENT2 = getUserAgent();
    FETCH_TIMEOUT_MS2 = 3e4;
  }
});

// src/discovery/fetchers/json-api.ts
async function fetchJsonApi(source, opts) {
  let cfg;
  try {
    cfg = JSON.parse(source.config);
    if (cfg.format !== "json" || !cfg.items_path || !cfg.map) {
      return {
        status: "error",
        events: [],
        error: "json source config requires {format:'json', items_path, map}"
      };
    }
  } catch (e) {
    return { status: "error", events: [], error: `bad config json: ${errMessage2(e)}` };
  }
  const url = buildUrlWithQuery(source.url, cfg.query);
  let body;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT3,
        Accept: "application/json",
        ...cfg.headers ?? {}
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS3)
    });
    if (!res.ok) {
      return { status: "error", events: [], error: `HTTP ${res.status} ${res.statusText}` };
    }
    body = await res.json();
  } catch (e) {
    return { status: "error", events: [], error: errMessage2(e) };
  }
  const items = getPath2(body, cfg.items_path);
  if (!Array.isArray(items)) {
    return {
      status: "error",
      events: [],
      error: `items_path '${cfg.items_path}' did not yield an array`
    };
  }
  const horizonStart = opts.windowStartsAt.getTime();
  const horizonEnd = opts.windowEndsAt.getTime();
  const events2 = [];
  for (const item of items) {
    const title2 = readMapped(item, cfg.map.title);
    const starts = readMapped(item, cfg.map.starts_at);
    if (!title2 || !starts) continue;
    const startMs = Date.parse(starts);
    if (!Number.isFinite(startMs)) continue;
    if (startMs < horizonStart || startMs > horizonEnd) continue;
    const endsRaw = cfg.map.ends_at ? readMapped(item, cfg.map.ends_at) : null;
    const candidate = {
      title: title2.trim(),
      starts_at: new Date(startMs).toISOString(),
      ends_at: endsRaw && Number.isFinite(Date.parse(endsRaw)) ? new Date(Date.parse(endsRaw)).toISOString() : null,
      description: cfg.map.description ? readMapped(item, cfg.map.description) : null,
      venue_name: (cfg.map.venue_name ? readMapped(item, cfg.map.venue_name) : null) ?? cfg.default_venue?.name ?? null,
      venue_address: (cfg.map.venue_address ? readMapped(item, cfg.map.venue_address) : null) ?? cfg.default_venue?.address ?? null,
      venue_lat: cfg.default_venue?.lat ?? null,
      venue_lng: cfg.default_venue?.lng ?? null,
      url: cfg.map.url ? readMapped(item, cfg.map.url) : source.url,
      image_url: cfg.map.image_url ? readMapped(item, cfg.map.image_url) : null,
      category: cfg.category ?? null,
      rarity_score: cfg.rarity_score ?? 0.3,
      confidence: 1,
      raw_extract: null
    };
    events2.push(candidate);
  }
  return { status: "ok", events: events2 };
}
function buildUrlWithQuery(base, query) {
  if (!query || Object.keys(query).length === 0) return base;
  const u = new URL(base);
  for (const [k, v] of Object.entries(query)) u.searchParams.set(k, v);
  return u.toString();
}
function getPath2(obj, path) {
  if (!path) return obj;
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) {
      cur = cur[p];
    } else {
      return void 0;
    }
  }
  return cur;
}
function readMapped(item, mapValue) {
  const v = getPath2(item, mapValue);
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return null;
}
function errMessage2(e) {
  if (e instanceof Error) return e.message;
  return String(e);
}
var USER_AGENT3, FETCH_TIMEOUT_MS3;
var init_json_api = __esm({
  "src/discovery/fetchers/json-api.ts"() {
    "use strict";
    init_user_agent();
    USER_AGENT3 = getUserAgent();
    FETCH_TIMEOUT_MS3 = 3e4;
  }
});

// src/lib/fetch.ts
async function getBrowser() {
  if (_browser && _browser.isConnected()) return _browser;
  const { chromium } = await import("playwright");
  _browser = await chromium.launch({ headless: true });
  return _browser;
}
async function fetchAsMarkdown(url) {
  const viaJina = await tryJina(url);
  if (viaJina.ok) return viaJina;
  const viaRaw = await tryRawHtml(url);
  if (viaRaw.ok) return viaRaw;
  if (process.env.DISABLE_PLAYWRIGHT !== "1") {
    const viaPlaywright = await tryPlaywright(url);
    if (viaPlaywright.ok) return viaPlaywright;
    return {
      ok: false,
      markdown: "",
      via: "failed",
      error: `jina: ${viaJina.error}; raw: ${viaRaw.error}; playwright: ${viaPlaywright.error}`
    };
  }
  return {
    ok: false,
    markdown: "",
    via: "failed",
    error: `jina: ${viaJina.error}; raw: ${viaRaw.error}`
  };
}
async function tryJina(url) {
  try {
    const res = await fetch(JINA_BASE + url, {
      headers: { "User-Agent": USER_AGENT4, Accept: "text/markdown, text/plain, */*" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS4)
    });
    if (!res.ok) {
      return { ok: false, markdown: "", via: "failed", error: `Jina HTTP ${res.status}` };
    }
    const text = await res.text();
    if (!text.trim()) {
      return { ok: false, markdown: "", via: "failed", error: "Jina empty body" };
    }
    const upstreamErr = text.match(/Warning:\s*Target URL returned error\s*(\d{3})/i);
    if (upstreamErr) {
      return {
        ok: false,
        markdown: "",
        via: "failed",
        error: `upstream HTTP ${upstreamErr[1]} (reported by Jina)`
      };
    }
    return { ok: true, markdown: text, via: "jina" };
  } catch (e) {
    return { ok: false, markdown: "", via: "failed", error: e instanceof Error ? e.message : String(e) };
  }
}
async function tryRawHtml(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT4, Accept: "text/html, */*" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS4)
    });
    if (!res.ok) {
      return { ok: false, markdown: "", via: "failed", error: `Raw HTTP ${res.status}` };
    }
    const html2 = await res.text();
    const cleaned = stripHtmlToText(html2);
    if (cleaned.length < 64) {
      return { ok: false, markdown: "", via: "failed", error: "raw page too short after strip" };
    }
    return { ok: true, markdown: cleaned, via: "raw" };
  } catch (e) {
    return { ok: false, markdown: "", via: "failed", error: e instanceof Error ? e.message : String(e) };
  }
}
async function tryPlaywright(url) {
  try {
    const browser = await getBrowser();
    const context = await browser.newContext({ userAgent: USER_AGENT4 });
    const page = await context.newPage();
    try {
      await page.goto(url, {
        waitUntil: "networkidle",
        timeout: PLAYWRIGHT_TIMEOUT_MS
      });
      const text = await page.evaluate(() => document.body.innerText);
      if (!text || text.trim().length < 64) {
        return { ok: false, markdown: "", via: "failed", error: "Playwright page body too short" };
      }
      return { ok: true, markdown: text.trim(), via: "playwright" };
    } finally {
      await context.close();
    }
  } catch (e) {
    return {
      ok: false,
      markdown: "",
      via: "failed",
      error: e instanceof Error ? e.message : String(e)
    };
  }
}
function stripHtmlToText(html2) {
  return html2.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<noscript[\s\S]*?<\/noscript>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ").replace(/<head[\s\S]*?<\/head>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
}
var USER_AGENT4, FETCH_TIMEOUT_MS4, PLAYWRIGHT_TIMEOUT_MS, JINA_BASE, _browser;
var init_fetch = __esm({
  "src/lib/fetch.ts"() {
    "use strict";
    init_user_agent();
    USER_AGENT4 = getUserAgent();
    FETCH_TIMEOUT_MS4 = 3e4;
    PLAYWRIGHT_TIMEOUT_MS = 3e4;
    JINA_BASE = "https://r.jina.ai/";
    _browser = null;
  }
});

// src/lib/llm.ts
async function extractJson(opts) {
  const key = env.OPENCODE_API_KEY;
  if (!key) {
    return emptyResult({ error: "OPENCODE_API_KEY missing" });
  }
  const models = opts.models ?? DEFAULT_FREE_MODELS;
  let lastError = "no models tried";
  for (const model of models) {
    const baseTokens = opts.maxTokens ?? 800;
    const maxTokens = model.reasoning ? Math.max(4e3, baseTokens * 5) : baseTokens;
    const t0 = performance.now();
    const result = await callChatCompletion({
      apiKey: key,
      model: model.id,
      maxTokens,
      messages: [
        { role: "system", content: opts.systemPrompt },
        { role: "user", content: opts.userMessage }
      ]
    });
    const elapsed = (performance.now() - t0).toFixed(0);
    if (!result.ok) {
      lastError = `${model.id}: ${result.error}`;
      continue;
    }
    const parsed = extractJsonFromText(result.text);
    if (!parsed.ok) {
      lastError = `${model.id}: no parseable JSON (${parsed.reason})`;
      console.warn(`[llm] ${model.id} ${elapsed}ms \u2014 no JSON: ${parsed.reason}`);
      continue;
    }
    if (opts.schema) {
      const validated = opts.schema.safeParse(parsed.value);
      if (!validated.success) {
        lastError = `${model.id}: schema validation failed`;
        console.warn(`[llm] ${model.id} ${elapsed}ms \u2014 schema failed`);
        continue;
      }
      return {
        ok: true,
        model_used: model.id,
        parsed: validated.data,
        raw_text: result.text,
        tokens_used: result.usage.total,
        cost_usd: priceFor(model, result.usage)
      };
    }
    return {
      ok: true,
      model_used: model.id,
      parsed: parsed.value,
      raw_text: result.text,
      tokens_used: result.usage.total,
      cost_usd: priceFor(model, result.usage)
    };
  }
  return emptyResult({ error: lastError });
}
async function callChatCompletion(args) {
  try {
    const res = await fetch(`${OPENCODE_BASE()}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: args.model,
        messages: args.messages,
        temperature: 0,
        max_tokens: args.maxTokens
      }),
      signal: AbortSignal.timeout(6e4)
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, text: "", usage: { input: 0, output: 0, total: 0 }, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    const json = await res.json();
    const text = json.choices?.[0]?.message?.content ?? "";
    const usage = json.usage ?? {};
    return {
      ok: true,
      text,
      usage: {
        input: usage.prompt_tokens ?? 0,
        output: usage.completion_tokens ?? 0,
        total: usage.total_tokens ?? 0
      }
    };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    return { ok: false, text: "", usage: { input: 0, output: 0, total: 0 }, error: err };
  }
}
function extractJsonFromText(text) {
  if (!text || !text.trim()) return { ok: false, reason: "empty" };
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  if (!candidate) return { ok: false, reason: "no candidate" };
  const start = candidate.search(/[{[]/);
  if (start < 0) return { ok: false, reason: "no json brace" };
  const sliced = candidate.slice(start).trim();
  try {
    return { ok: true, value: JSON.parse(sliced) };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "parse error" };
  }
}
function priceFor(model, usage) {
  if (!model.pricing) return 0;
  const [pIn, pOut] = model.pricing;
  return usage.input / 1e6 * pIn + usage.output / 1e6 * pOut;
}
function emptyResult(opts) {
  return {
    ok: false,
    model_used: null,
    parsed: null,
    raw_text: "",
    tokens_used: 0,
    cost_usd: 0,
    error: opts.error
  };
}
var DEFAULT_FREE_MODELS, OPENCODE_BASE;
var init_llm = __esm({
  "src/lib/llm.ts"() {
    "use strict";
    init_env();
    DEFAULT_FREE_MODELS = [
      { id: "nemotron-3-super-free", reasoning: false, pricing: [0, 0] },
      { id: "deepseek-v4-flash-free", reasoning: true, pricing: [0, 0] },
      { id: "minimax-m2.5-free", reasoning: true, pricing: [0, 0] }
    ];
    OPENCODE_BASE = () => env.OPENCODE_BASE_URL.replace(/\/$/, "");
  }
});

// src/discovery/fetchers/scrape-llm.ts
function buildSystemPrompt(today, cityName, timezone, windowFrom, windowTo) {
  return [
    "You extract upcoming events from event-listing web pages.",
    `Today is ${today}. The reader is in city: ${cityName} (timezone: ${timezone}).`,
    `Only return events between ${windowFrom} and ${windowTo} (inclusive).`,
    "Resolve relative dates ('next Friday', 'tonight', 's\xE1bado') using today's date and the city timezone.",
    "",
    "CRITICAL \u2014 EXHAUSTIVE ENUMERATION:",
    "List EVERY event visible in the page content. Do not summarize, do not pick favorites.",
    "If the page lists 40 events, return 40 objects. If it lists 60, return 60.",
    "Each event in the content with a date and title MUST appear in your output unless its date is outside the window.",
    "Do NOT merge similar events \u2014 each occurrence is its own object.",
    "Do NOT stop early. Work through the entire content before producing output.",
    "",
    "Output ONLY a JSON object, no prose, no markdown fences. Schema:",
    '{"events":[{"title":string,"description":string|null,"starts_at":ISO 8601 with timezone,"ends_at":ISO 8601 or null,"venue_name":string|null,"venue_address":string|null,"url":string|null,"category":string|null}]}',
    'If you find nothing, return {"events":[]}.',
    "Never invent dates. If the date is ambiguous or missing, skip that event."
  ].join("\n");
}
function buildTelegramSystemPrompt(today, cityName, timezone, windowFrom, windowTo) {
  return [
    `You're reading recent posts from a public Telegram channel about events in ${cityName}.`,
    `Today is ${today} (timezone: ${timezone}).`,
    `Only return events between ${windowFrom} and ${windowTo} (inclusive).`,
    "",
    "The content is a chronological stream of channel posts. MOST posts are NOT events \u2014 they may be news, opinion, memes, promos, reposts. Extract ONLY messages describing concrete upcoming events.",
    "",
    "Rules:",
    "- A real event has: a date (absolute OR relative) + a venue/location + a title or activity description.",
    "- Resolve relative dates strictly using TODAY. 'este s\xE1bado' = next Saturday; 'ma\xF1ana' = tomorrow; 'el 25' = the 25th of the current month (or next month if 25th has passed). Resolve to ISO 8601 with the city timezone.",
    "- A single message may announce multiple events (e.g. a weekend programme) \u2014 emit each as a separate object.",
    "- Strip emoji/markdown decoration from titles.",
    "- If a post links to an external event page (https://\u2026), set `url` to that link, not the Telegram message URL.",
    "- SKIP posts that lack a concrete date OR lack a venue. SKIP recap/past-tense posts. SKIP news without event-action.",
    "- Languages may be Catalan, Spanish, English, Russian \u2014 handle all.",
    "",
    "Output ONLY a JSON object, no prose, no markdown fences. Schema:",
    '{"events":[{"title":string,"description":string|null,"starts_at":ISO 8601 with timezone,"ends_at":ISO 8601 or null,"venue_name":string|null,"venue_address":string|null,"url":string|null,"category":string|null}]}',
    'If you find nothing extractable, return {"events":[]}. Never invent dates or venues.'
  ].join("\n");
}
function isTelegramSource(url) {
  return /(?:^|\/\/)t\.me\/s\//i.test(url);
}
function buildUserMessage(sourceUrl, sourceName, content) {
  return [
    `Source URL: ${sourceUrl}`,
    `Source name: ${sourceName}`,
    "",
    "Page content (already cleaned to markdown/text):",
    "---",
    content,
    "---"
  ].join("\n");
}
function dedupeKey(title2, startsAt) {
  return `${title2.toLowerCase().replace(/\s+/g, " ").trim()}|${startsAt.slice(0, 16)}`;
}
async function scrapeViaLlm(source, opts) {
  const cfg = parseConfig(source.config);
  const t0 = performance.now();
  const fetched = await fetchAsMarkdown(source.url);
  if (!fetched.ok) {
    return { status: "error", events: [], error: `fetch failed: ${fetched.error}` };
  }
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const windowFrom = opts.windowStartsAt.toISOString().slice(0, 10);
  const windowTo = opts.windowEndsAt.toISOString().slice(0, 10);
  const systemPrompt = isTelegramSource(source.url) ? buildTelegramSystemPrompt(today, opts.city.name, opts.city.timezone, windowFrom, windowTo) : buildSystemPrompt(today, opts.city.name, opts.city.timezone, windowFrom, windowTo);
  const fullMarkdown = fetched.markdown;
  const inputChars = Math.min(fullMarkdown.length, MAX_INPUT_CHARS);
  const content = fullMarkdown.slice(0, MAX_INPUT_CHARS);
  let allDtos = [];
  let tokensUsed = 0;
  let costUsd = 0;
  let modelUsed = null;
  if (opts.deep && fullMarkdown.length > MAX_INPUT_CHARS) {
    const half = Math.ceil(fullMarkdown.length / 2);
    const chunks = [
      fullMarkdown.slice(0, half),
      fullMarkdown.slice(half)
    ];
    for (const chunk of chunks) {
      const chunkContent = chunk.slice(0, MAX_INPUT_CHARS);
      const userMessage = buildUserMessage(source.url, source.name, chunkContent);
      const result = await extractJson({
        systemPrompt,
        userMessage,
        schema: ResultSchema,
        maxTokens: EXTRACTION_MAX_TOKENS
      });
      if (result.ok && result.parsed) {
        allDtos.push(...result.parsed.events);
        if (!modelUsed) modelUsed = result.model_used;
      }
      tokensUsed += result.tokens_used;
      costUsd += result.cost_usd;
    }
    const seen = /* @__PURE__ */ new Set();
    allDtos = allDtos.filter((dto) => {
      const key = dedupeKey(dto.title, dto.starts_at);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } else {
    const FALLBACK_CHARS = MAX_INPUT_CHARS / 2;
    const contentSlices = [content];
    if (fullMarkdown.length > FALLBACK_CHARS) {
      contentSlices.push(fullMarkdown.slice(0, FALLBACK_CHARS));
    }
    let succeeded = false;
    let lastError = "no usable response from any free model";
    for (const slice of contentSlices) {
      const userMessage = buildUserMessage(source.url, source.name, slice);
      const result = await extractJson({
        systemPrompt,
        userMessage,
        schema: ResultSchema,
        maxTokens: EXTRACTION_MAX_TOKENS
      });
      tokensUsed += result.tokens_used;
      costUsd += result.cost_usd;
      if (result.model_used) modelUsed = result.model_used;
      if (result.ok && result.parsed) {
        allDtos = result.parsed.events;
        succeeded = true;
        break;
      }
      lastError = result.error ?? lastError;
    }
    if (!succeeded) {
      const elapsed2 = (performance.now() - t0).toFixed(0);
      console.log(
        `[scrape-llm] ${source.name} | inputChars=${inputChars} outputEvents=0 model=${modelUsed ?? "none"} elapsed=${elapsed2}ms`
      );
      return {
        status: "rate_limited",
        events: [],
        tokens_used: tokensUsed,
        cost_usd: costUsd,
        model_used: modelUsed ?? void 0,
        error: lastError
      };
    }
  }
  const horizonStart = opts.windowStartsAt.getTime();
  const horizonEnd = opts.windowEndsAt.getTime();
  const events2 = [];
  for (const dto of allDtos) {
    const startMs = Date.parse(dto.starts_at);
    if (!Number.isFinite(startMs)) continue;
    if (startMs < horizonStart || startMs > horizonEnd) continue;
    const endMs = dto.ends_at ? Date.parse(dto.ends_at) : NaN;
    events2.push({
      title: dto.title.trim(),
      description: dto.description ?? null,
      starts_at: new Date(startMs).toISOString(),
      ends_at: Number.isFinite(endMs) ? new Date(endMs).toISOString() : null,
      venue_name: dto.venue_name ?? cfg.default_venue?.name ?? null,
      venue_address: dto.venue_address ?? cfg.default_venue?.address ?? null,
      venue_lat: cfg.default_venue?.lat ?? null,
      venue_lng: cfg.default_venue?.lng ?? null,
      url: dto.url ?? source.url,
      category: dto.category ?? cfg.category ?? null,
      rarity_score: cfg.rarity_score ?? 0.4,
      confidence: 0.75,
      raw_extract: { via: fetched.via, model: modelUsed }
    });
  }
  const elapsed = (performance.now() - t0).toFixed(0);
  console.log(
    `[scrape-llm] ${source.name} | inputChars=${inputChars} outputEvents=${events2.length} model=${modelUsed ?? "none"} elapsed=${elapsed}ms`
  );
  return {
    status: "ok",
    events: events2,
    tokens_used: tokensUsed,
    cost_usd: costUsd,
    model_used: modelUsed ?? void 0
  };
}
function parseConfig(raw2) {
  if (!raw2) return {};
  try {
    return JSON.parse(raw2);
  } catch {
    return {};
  }
}
var EventDtoSchema, ResultSchema, MAX_INPUT_CHARS, EXTRACTION_MAX_TOKENS;
var init_scrape_llm = __esm({
  "src/discovery/fetchers/scrape-llm.ts"() {
    "use strict";
    init_zod();
    init_fetch();
    init_llm();
    EventDtoSchema = external_exports.object({
      title: external_exports.string().min(1).max(300),
      description: external_exports.string().max(2e3).optional().nullable(),
      starts_at: external_exports.string().min(10).max(40),
      ends_at: external_exports.string().min(10).max(40).optional().nullable(),
      venue_name: external_exports.string().max(200).optional().nullable(),
      venue_address: external_exports.string().max(300).optional().nullable(),
      url: external_exports.string().url().optional().nullable(),
      category: external_exports.string().max(40).optional().nullable()
    });
    ResultSchema = external_exports.object({
      events: external_exports.array(EventDtoSchema).max(200)
    });
    MAX_INPUT_CHARS = 32e3;
    EXTRACTION_MAX_TOKENS = 2500;
  }
});

// src/lib/dedup.ts
import { createHash } from "node:crypto";
function normalize(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function dateBucketHour(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 13);
}
function dedupHash(input2) {
  const key = [
    normalize(input2.title),
    dateBucketHour(input2.starts_at),
    normalize(input2.venue_name ?? "")
  ].join("|");
  return createHash("sha256").update(key).digest("hex");
}
var init_dedup = __esm({
  "src/lib/dedup.ts"() {
    "use strict";
  }
});

// src/discovery/upsert.ts
import { randomUUID } from "node:crypto";
async function upsertEvents(cityId, sourceId, candidates) {
  const stmts = [];
  for (const c of candidates) {
    if (!c.title || !c.starts_at) continue;
    const hash = dedupHash({
      title: c.title,
      starts_at: c.starts_at,
      venue_name: c.venue_name ?? null
    });
    stmts.push({
      sql: INSERT_SQL,
      args: [
        randomUUID(),
        cityId,
        sourceId,
        c.title,
        c.description ?? null,
        c.starts_at,
        c.ends_at ?? null,
        c.venue_name ?? null,
        c.venue_address ?? null,
        c.venue_lat ?? null,
        c.venue_lng ?? null,
        c.url ?? null,
        c.image_url ?? null,
        c.category ?? null,
        JSON.stringify(c.tags ?? []),
        c.rarity_score ?? 0,
        c.confidence ?? 1,
        hash,
        c.raw_extract ? JSON.stringify(c.raw_extract) : null
      ]
    });
  }
  const inserted = await execBatch(stmts);
  return { found: candidates.length, inserted };
}
var INSERT_SQL;
var init_upsert = __esm({
  "src/discovery/upsert.ts"() {
    "use strict";
    init_db();
    init_dedup();
    INSERT_SQL = `
  INSERT OR IGNORE INTO events (
    id, city_id, source_id, title, description, starts_at, ends_at,
    venue_name, venue_address, venue_lat, venue_lng, url, image_url,
    category, tags, rarity_score, confidence, dedup_hash, raw_extract
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;
  }
});

// src/discovery/pipeline.ts
import { randomUUID as randomUUID2 } from "node:crypto";
async function runPipeline(opts) {
  const city = await queryGet(
    "SELECT * FROM cities WHERE slug = ?",
    [opts.citySlug]
  );
  if (!city) throw new Error(`unknown city slug: ${opts.citySlug}`);
  const windowDays = opts.windowDays ?? 14;
  const windowStartsAt = /* @__PURE__ */ new Date();
  windowStartsAt.setHours(0, 0, 0, 0);
  const windowEndsAt = new Date(windowStartsAt);
  windowEndsAt.setDate(windowEndsAt.getDate() + windowDays);
  const sources = await loadSources(city.id, opts);
  const fetchOpts = { city, windowStartsAt, windowEndsAt };
  const summary = {
    city: city.slug,
    windowFrom: windowStartsAt.toISOString(),
    windowTo: windowEndsAt.toISOString(),
    sources: [],
    totals: { found: 0, inserted: 0, cost_usd: 0 }
  };
  for (const source of sources) {
    const runId = randomUUID2();
    const startedAt = (/* @__PURE__ */ new Date()).toISOString();
    await exec(
      `INSERT INTO source_runs (id, source_id, started_at, status) VALUES (?, ?, ?, 'running')`,
      [runId, source.id, startedAt]
    );
    const outcome = await runOneSource(source, fetchOpts);
    const upsertResult = outcome.status === "ok" && outcome.events.length > 0 ? await upsertEvents(city.id, source.id, outcome.events) : { found: outcome.events.length, inserted: 0 };
    const finishedAt = (/* @__PURE__ */ new Date()).toISOString();
    await exec(
      `UPDATE source_runs
         SET finished_at = ?, events_found = ?, events_new = ?, tokens_used = ?,
             cost_usd = ?, model_used = ?, status = ?, error = ?
       WHERE id = ?`,
      [
        finishedAt,
        upsertResult.found,
        upsertResult.inserted,
        outcome.tokens_used ?? 0,
        outcome.cost_usd ?? 0,
        outcome.model_used ?? null,
        outcome.status,
        outcome.error ?? null,
        runId
      ]
    );
    await exec(
      `UPDATE sources SET last_run_at = ?, last_status = ?, updated_at = ? WHERE id = ?`,
      [finishedAt, outcome.status, finishedAt, source.id]
    );
    summary.sources.push({
      source_id: source.id,
      name: source.name,
      kind: source.kind,
      tier: source.tier,
      status: outcome.status,
      found: upsertResult.found,
      inserted: upsertResult.inserted,
      cost_usd: outcome.cost_usd ?? 0,
      model_used: outcome.model_used ?? null,
      error: outcome.error ?? null
    });
    summary.totals.found += upsertResult.found;
    summary.totals.inserted += upsertResult.inserted;
    summary.totals.cost_usd += outcome.cost_usd ?? 0;
  }
  return summary;
}
async function loadSources(cityId, opts) {
  const filters = ["city_id = ?", "enabled = 1"];
  const args = [cityId];
  if (opts.tier !== "all" && opts.tier !== void 0) {
    filters.push("tier = ?");
    args.push(opts.tier);
  }
  if (opts.sourceIds && opts.sourceIds.length > 0) {
    filters.push(`id IN (${opts.sourceIds.map(() => "?").join(",")})`);
    args.push(...opts.sourceIds);
  }
  return queryAll(
    `SELECT * FROM sources WHERE ${filters.join(" AND ")} ORDER BY tier, name`,
    args
  );
}
async function runOneSource(source, opts) {
  let cfg = {};
  try {
    cfg = source.config ? JSON.parse(source.config) : {};
  } catch {
  }
  if (source.kind === "feed" && cfg.format === "ical") {
    return decorateOutcome(await fetchIcal(source, opts), cfg);
  }
  if (source.kind === "api" && cfg.format === "graphql") {
    return decorateOutcome(await fetchGraphqlApi(source, opts), cfg);
  }
  if (source.kind === "api" || source.kind === "feed" && cfg.format === "json") {
    return decorateOutcome(await fetchJsonApi(source, opts), cfg);
  }
  if (source.kind === "scrape") {
    return decorateOutcome(await scrapeViaLlm(source, opts), cfg);
  }
  if (source.kind === "web_search") {
    return { status: "skipped", events: [], error: "tier 3 deep research is invoked manually" };
  }
  return { status: "error", events: [], error: `unsupported source kind/format: ${source.kind}` };
}
function decorateOutcome(outcome, cfg) {
  if (outcome.status !== "ok") return outcome;
  for (const e of outcome.events) {
    if (cfg.category && !e.category) e.category = cfg.category;
    if (typeof cfg.rarity_score === "number" && e.rarity_score == null) {
      e.rarity_score = cfg.rarity_score;
    }
    if (cfg.default_venue) {
      if (!e.venue_name && cfg.default_venue.name) e.venue_name = cfg.default_venue.name;
      if (!e.venue_address && cfg.default_venue.address) e.venue_address = cfg.default_venue.address;
      if (e.venue_lat == null && cfg.default_venue.lat != null) e.venue_lat = cfg.default_venue.lat;
      if (e.venue_lng == null && cfg.default_venue.lng != null) e.venue_lng = cfg.default_venue.lng;
    }
  }
  return outcome;
}
var init_pipeline = __esm({
  "src/discovery/pipeline.ts"() {
    "use strict";
    init_db();
    init_graphql_api();
    init_ical2();
    init_json_api();
    init_scrape_llm();
    init_upsert();
  }
});

// src/routes/admin.ts
var admin;
var init_admin = __esm({
  "src/routes/admin.ts"() {
    "use strict";
    init_dist();
    init_env();
    init_pipeline();
    admin = new Hono2();
    admin.use("*", async (c, next) => {
      const token = c.req.header("X-Admin-Token");
      if (!token || token !== env.ADMIN_TOKEN) {
        return c.json({ error: "unauthorized" }, 401);
      }
      await next();
    });
    admin.post("/runs/:city", async (c) => {
      const citySlug = c.req.param("city");
      const tierRaw = c.req.query("tier");
      const daysRaw = c.req.query("days");
      const tier = tierRaw === void 0 || tierRaw === "all" ? "all" : Number(tierRaw);
      try {
        const summary = await runPipeline({
          citySlug,
          windowDays: daysRaw ? Number(daysRaw) : 14,
          tier
        });
        return c.json(summary);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return c.json({ error: "pipeline_failed", message }, 500);
      }
    });
    admin.post("/sources", (c) => {
      return c.json(
        {
          error: "not_implemented",
          message: "Use db/seed.ts or raw SQL for now. Source registry editing API lands later."
        },
        501
      );
    });
  }
});

// src/routes/ics.ts
function icsEscape(s) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r\n|\r|\n/g, "\\n");
}
function foldLine(line) {
  const enc = new TextEncoder();
  const parts = [];
  let remaining = line;
  let first = true;
  while (remaining.length > 0) {
    const maxContent = first ? 75 : 74;
    const prefix = first ? "" : " ";
    if (enc.encode(prefix + remaining).length <= maxContent + (first ? 0 : 0)) {
      parts.push(prefix + remaining);
      break;
    }
    let lo = 0;
    let hi = remaining.length;
    while (lo < hi) {
      const mid = lo + hi + 1 >> 1;
      if (enc.encode(prefix + remaining.slice(0, mid)).length <= maxContent) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    if (lo === 0) lo = 1;
    parts.push(prefix + remaining.slice(0, lo));
    remaining = remaining.slice(lo);
    first = false;
  }
  return parts.join("\r\n");
}
function toIcsUtc(date) {
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${date.getUTCFullYear()}${p(date.getUTCMonth() + 1)}${p(date.getUTCDate())}T${p(date.getUTCHours())}${p(date.getUTCMinutes())}${p(date.getUTCSeconds())}Z`;
}
function prop(name, value, params = "") {
  const key = params ? `${name};${params}` : name;
  return foldLine(`${key}:${value}`);
}
function tzForCity(citySlug) {
  return CITY_TZ[citySlug.toLowerCase()] ?? DEFAULT_TZ;
}
function toIcsLocal(isoUtc, _tzid) {
  const d = new Date(isoUtc);
  if (isNaN(d.getTime())) return toIcsUtc(/* @__PURE__ */ new Date());
  return toIcsUtc(d);
}
function buildVEvent(ev, tzid) {
  const lines = [];
  lines.push("BEGIN:VEVENT");
  lines.push(prop("UID", `${ev.id}@events-x-marble`));
  const startsAt = new Date(ev.starts_at);
  lines.push(prop("DTSTART", toIcsLocal(ev.starts_at, tzid)));
  if (ev.ends_at) {
    lines.push(prop("DTEND", toIcsLocal(ev.ends_at, tzid)));
  } else {
    lines.push(prop("DURATION", "PT2H"));
  }
  const summaryPrefix = ev.rarity_score >= 0.7 ? "[rare] " : "";
  lines.push(prop("SUMMARY", icsEscape(summaryPrefix + ev.title)));
  const descParts = [];
  if (ev.description) descParts.push(ev.description);
  descParts.push(`Source: ${ev.source_name}`);
  descParts.push(`Rarity: ${ev.rarity_score.toFixed(2)}`);
  lines.push(prop("DESCRIPTION", icsEscape(descParts.join("\n"))));
  const locParts = [ev.venue_name, ev.venue_address].filter(Boolean);
  if (locParts.length > 0) {
    lines.push(prop("LOCATION", icsEscape(locParts.join(", "))));
  }
  if (ev.url) {
    lines.push(prop("URL", ev.url));
  }
  if (ev.category) {
    lines.push(prop("CATEGORIES", icsEscape(ev.category)));
  }
  if (ev.venue_lat != null && ev.venue_lng != null) {
    lines.push(prop("GEO", `${ev.venue_lat};${ev.venue_lng}`));
  }
  lines.push(prop("DTSTAMP", toIcsUtc(/* @__PURE__ */ new Date())));
  lines.push("END:VEVENT");
  return lines.join("\r\n");
}
var icsApp, VTIMEZONE_MADRID, CITY_TZ, DEFAULT_TZ, IcsQuerySchema;
var init_ics = __esm({
  "src/routes/ics.ts"() {
    "use strict";
    init_dist();
    init_zod();
    init_queries();
    icsApp = new Hono2();
    VTIMEZONE_MADRID = [
      "BEGIN:VTIMEZONE",
      "TZID:Europe/Madrid",
      "BEGIN:STANDARD",
      "TZOFFSETFROM:+0200",
      "TZOFFSETTO:+0100",
      "TZNAME:CET",
      "DTSTART:19701025T030000",
      "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10",
      "END:STANDARD",
      "BEGIN:DAYLIGHT",
      "TZOFFSETFROM:+0100",
      "TZOFFSETTO:+0200",
      "TZNAME:CEST",
      "DTSTART:19700329T020000",
      "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3",
      "END:DAYLIGHT",
      "END:VTIMEZONE"
    ].join("\r\n");
    CITY_TZ = {
      barcelona: "Europe/Madrid",
      madrid: "Europe/Madrid"
    };
    DEFAULT_TZ = "Europe/Madrid";
    IcsQuerySchema = external_exports.object({
      city: external_exports.string().min(1).default("barcelona"),
      from: external_exports.string().optional(),
      to: external_exports.string().optional(),
      days: external_exports.coerce.number().int().positive().max(365).default(30),
      category: external_exports.string().optional(),
      min_rarity: external_exports.coerce.number().min(0).max(1).optional(),
      bbox: external_exports.string().optional()
    });
    icsApp.get("/", async (c) => {
      const parsed = IcsQuerySchema.safeParse(c.req.query());
      if (!parsed.success) {
        return c.text("invalid query: " + JSON.stringify(parsed.error.flatten()), 400);
      }
      const q = parsed.data;
      const now = /* @__PURE__ */ new Date();
      const fromDate = q.from ? /* @__PURE__ */ new Date(`${q.from}T00:00:00.000Z`) : now;
      const toDate = q.to ? /* @__PURE__ */ new Date(`${q.to}T23:59:59.999Z`) : new Date(fromDate.getTime() + q.days * 864e5);
      const from = fromDate.toISOString();
      const to = toDate.toISOString();
      let bbox;
      if (q.bbox) {
        const parts = q.bbox.split(",").map(Number);
        if (parts.length === 4 && !parts.some(Number.isNaN)) {
          bbox = parts;
        }
      }
      const rows = await listEvents({
        citySlug: q.city,
        from,
        to,
        ...q.category ? { categories: q.category.split(",").map((s) => s.trim()).filter(Boolean) } : {},
        ...q.min_rarity !== void 0 ? { minRarity: q.min_rarity } : {},
        ...bbox ? { bbox } : {},
        limit: 2e3,
        offset: 0
      });
      const tzid = tzForCity(q.city);
      const vevents = rows.map((ev) => buildVEvent(ev, tzid));
      const cal = [
        "BEGIN:VCALENDAR",
        prop("VERSION", "2.0"),
        prop("PRODID", "-//events-x-marble//EN"),
        prop("CALSCALE", "GREGORIAN"),
        prop("METHOD", "PUBLISH"),
        prop("X-WR-CALNAME", `Events \xB7 ${q.city}`),
        prop("X-WR-TIMEZONE", tzid),
        VTIMEZONE_MADRID,
        ...vevents,
        "END:VCALENDAR"
      ].join("\r\n");
      return c.text(cal, 200, {
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "public, max-age=300"
      });
    });
  }
});

// src/lib/ics-format.ts
function icsEscape2(s) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r\n|\r|\n/g, "\\n");
}
function foldLine2(line) {
  const enc = new TextEncoder();
  const parts = [];
  let remaining = line;
  let first = true;
  while (remaining.length > 0) {
    const maxContent = first ? 75 : 74;
    const prefix = first ? "" : " ";
    if (enc.encode(prefix + remaining).length <= maxContent) {
      parts.push(prefix + remaining);
      break;
    }
    let lo = 0;
    let hi = remaining.length;
    while (lo < hi) {
      const mid = lo + hi + 1 >> 1;
      if (enc.encode(prefix + remaining.slice(0, mid)).length <= maxContent) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    if (lo === 0) lo = 1;
    parts.push(prefix + remaining.slice(0, lo));
    remaining = remaining.slice(lo);
    first = false;
  }
  return parts.join("\r\n");
}
function toIcsUtc2(date) {
  const p = (n) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}${p(date.getUTCMonth() + 1)}${p(date.getUTCDate())}T${p(date.getUTCHours())}${p(date.getUTCMinutes())}${p(date.getUTCSeconds())}Z`;
}
function toIcsLocal2(isoUtc) {
  const d = new Date(isoUtc);
  if (isNaN(d.getTime())) return toIcsUtc2(/* @__PURE__ */ new Date());
  return toIcsUtc2(d);
}
function prop2(name, value, params = "") {
  const key = params ? `${name};${params}` : name;
  return foldLine2(`${key}:${value}`);
}
function tzForCity2(citySlug) {
  return CITY_TZ2[citySlug.toLowerCase()] ?? "Europe/Madrid";
}
function vtimezoneBlock(tzid) {
  return VTIMEZONES[tzid] ?? VTIMEZONES["Europe/Madrid"];
}
var VTIMEZONES, CITY_TZ2;
var init_ics_format = __esm({
  "src/lib/ics-format.ts"() {
    "use strict";
    VTIMEZONES = {
      "Europe/Madrid": [
        "BEGIN:VTIMEZONE",
        "TZID:Europe/Madrid",
        "BEGIN:STANDARD",
        "TZOFFSETFROM:+0200",
        "TZOFFSETTO:+0100",
        "TZNAME:CET",
        "DTSTART:19701025T030000",
        "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10",
        "END:STANDARD",
        "BEGIN:DAYLIGHT",
        "TZOFFSETFROM:+0100",
        "TZOFFSETTO:+0200",
        "TZNAME:CEST",
        "DTSTART:19700329T020000",
        "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3",
        "END:DAYLIGHT",
        "END:VTIMEZONE"
      ].join("\r\n")
    };
    CITY_TZ2 = {
      barcelona: "Europe/Madrid",
      madrid: "Europe/Madrid"
    };
  }
});

// src/lib/weather.ts
async function fetchDailyForecast(lat, lng, days, timezone) {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lng.toFixed(4),
    timezone,
    forecast_days: String(Math.min(Math.max(days, 1), 16)),
    daily: "weather_code,precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min"
  });
  try {
    const res = await fetch(`${BASE}?${params.toString()}`, {
      headers: { "User-Agent": getUserAgent() },
      signal: AbortSignal.timeout(15e3)
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.error || !json.daily?.time) return null;
    const d = json.daily;
    return d.time.map((date, i) => {
      const code = d.weather_code?.[i] ?? 0;
      return {
        date,
        weather_code: code,
        weather_desc: WMO_DESC[code] ?? `code ${code}`,
        precip_mm: d.precipitation_sum?.[i] ?? 0,
        precip_prob_max: d.precipitation_probability_max?.[i] ?? 0,
        temp_max_c: d.temperature_2m_max?.[i] ?? 0,
        temp_min_c: d.temperature_2m_min?.[i] ?? 0
      };
    });
  } catch {
    return null;
  }
}
function renderForecastForPrompt(forecast) {
  if (forecast.length === 0) return "";
  return [
    "WEATHER FORECAST:",
    ...forecast.map((d) => {
      const rainHint = d.precip_prob_max >= 60 || d.precip_mm >= 5 ? " (rain likely \u2014 outdoor plans risky)" : "";
      return `  - ${d.date}: ${d.weather_desc}, ${d.temp_min_c.toFixed(0)}\u2013${d.temp_max_c.toFixed(0)}\xB0C, precip ${d.precip_mm.toFixed(1)}mm @ ${d.precip_prob_max}%${rainHint}`;
    })
  ].join("\n");
}
var BASE, WMO_DESC;
var init_weather = __esm({
  "src/lib/weather.ts"() {
    "use strict";
    init_user_agent();
    BASE = "https://api.open-meteo.com/v1/forecast";
    WMO_DESC = {
      0: "clear",
      1: "mostly clear",
      2: "partly cloudy",
      3: "overcast",
      45: "fog",
      48: "rime fog",
      51: "light drizzle",
      53: "moderate drizzle",
      55: "heavy drizzle",
      61: "light rain",
      63: "moderate rain",
      65: "heavy rain",
      66: "freezing rain",
      67: "heavy freezing rain",
      71: "light snow",
      73: "moderate snow",
      75: "heavy snow",
      80: "light showers",
      81: "moderate showers",
      82: "heavy showers",
      95: "thunderstorm",
      96: "thunderstorm w/ hail",
      99: "severe thunderstorm"
    };
  }
});

// src/marble/kg-loader.ts
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
async function loadKg(path) {
  const abs = resolve(path);
  const raw2 = await readFile(abs, "utf8");
  const parsed = JSON.parse(raw2);
  const obj = parsed;
  let user;
  if (obj.user) user = obj.user;
  else if (obj.kg?.user) user = obj.kg.user;
  else if (obj.beliefs || obj.preferences || obj.history || obj.interests) {
    user = obj;
  }
  if (!user) {
    throw new Error(
      `Could not locate a Marble user object inside ${abs} \u2014 file shape unrecognized.`
    );
  }
  return { kg: structuredClone({ user }), loadedFrom: abs };
}
function kgCounts(kg) {
  const u = kg.user;
  return {
    beliefs: u.beliefs?.length ?? 0,
    preferences: u.preferences?.length ?? 0,
    identities: u.identities?.length ?? 0,
    interests: u.interests?.length ?? 0,
    history: u.history?.length ?? 0,
    syntheses: u.syntheses?.length ?? 0
  };
}
var init_kg_loader = __esm({
  "src/marble/kg-loader.ts"() {
    "use strict";
  }
});

// src/marble/profile.ts
function profileSnapshot(user, opts = {}) {
  const o = {
    maxBeliefs: opts.maxBeliefs ?? 25,
    maxPreferences: opts.maxPreferences ?? 25,
    maxIdentities: opts.maxIdentities ?? 15,
    maxInterests: opts.maxInterests ?? 20,
    maxTraits: opts.maxTraits ?? 15,
    minBeliefConfidence: opts.minBeliefConfidence ?? 0.5,
    minPreferenceStrength: opts.minPreferenceStrength ?? 0.4,
    minIdentitySalience: opts.minIdentitySalience ?? 0.4
  };
  const interests = (user.interests ?? []).slice().sort((a, b) => (b.weight ?? b.salience ?? 0) - (a.weight ?? a.salience ?? 0)).slice(0, o.maxInterests).map((i) => {
    const w = i.weight ?? i.salience;
    const trend = i.trend ? ` (${i.trend})` : "";
    return w != null ? `${i.topic} [w=${w.toFixed(2)}${trend}]` : `${i.topic}${trend}`;
  });
  const beliefs = (user.beliefs ?? []).filter((b) => (b.confidence ?? 1) >= o.minBeliefConfidence).slice(0, o.maxBeliefs).map((b) => beliefLine(b)).filter(Boolean);
  const preferences = (user.preferences ?? []).filter((p) => (p.strength ?? 1) >= o.minPreferenceStrength).slice(0, o.maxPreferences).map((p) => preferenceLine(p)).filter(Boolean);
  const identities = (user.identities ?? []).filter((i) => (i.salience ?? 1) >= o.minIdentitySalience).slice(0, o.maxIdentities).map((i) => identityLine(i)).filter(Boolean);
  const traits = (user.syntheses ?? []).slice(0, o.maxTraits).map((s) => traitLine(s)).filter(Boolean);
  return { interests, beliefs, preferences, identities, traits };
}
function beliefLine(b) {
  const topic = b.topic ?? "";
  const value = b.value ?? b.claim ?? "";
  if (!topic && !value) return "";
  return topic && value ? `${topic}: ${value}` : topic || value;
}
function preferenceLine(p) {
  const cat = p.category ?? "";
  const val = p.value ?? "";
  if (!cat && !val) return "";
  return cat && val ? `${cat}: ${val}` : cat || val;
}
function identityLine(i) {
  const role = i.role ?? "";
  const val = i.value ?? "";
  if (!role && !val) return "";
  return role && val ? `${role}: ${val}` : role || val;
}
function traitLine(s) {
  const t = s.trait;
  if (!t || !t.dimension || !t.value) return "";
  const tag = s.origin ? ` [${s.origin}]` : "";
  return `${t.dimension}=${t.value}${tag}`;
}
function renderProfileForPrompt(p) {
  const block = (label, items) => items.length > 0 ? `${label}:
${items.map((s) => `  - ${s}`).join("\n")}` : "";
  return [
    block("INTERESTS (highest weight first)", p.interests),
    block("TRAITS (cross-domain synthesized patterns)", p.traits),
    block("IDENTITIES", p.identities),
    block("PREFERENCES", p.preferences),
    block("BELIEFS", p.beliefs)
  ].filter(Boolean).join("\n\n");
}
var init_profile = __esm({
  "src/marble/profile.ts"() {
    "use strict";
  }
});

// src/marble/scorer.ts
async function scoreEventsForUser(events2, opts) {
  const kgPath = env.MARBLE_KG_PATH;
  if (!kgPath) throw new Error("MARBLE_KG_PATH is not set in env");
  return scoreEventsWithKgPath(events2, kgPath, opts);
}
async function scoreEventsWithKgPath(events2, kgPath, opts) {
  const { kg, loadedFrom } = await loadKg(kgPath);
  const counts = kgCounts(kg);
  const threshold = opts.threshold ?? 0.85;
  const forecastDays = opts.forecastDays ?? 7;
  const model = opts.model ?? "claude-haiku-4-5";
  const maxCandidates = opts.maxCandidates ?? 80;
  const candidates = events2.length > maxCandidates ? [...events2].sort((a, b) => (b.rarity_score ?? 0) - (a.rarity_score ?? 0)).slice(0, maxCandidates) : events2;
  let forecast = [];
  if (opts.city.centroid) {
    const f = await fetchDailyForecast(
      opts.city.centroid[1],
      opts.city.centroid[0],
      forecastDays,
      opts.city.timezone
    );
    if (f) forecast = f;
  }
  const { systemPrompt, userMessage } = buildPrompts({
    kg,
    cityName: opts.city.name,
    timezone: opts.city.timezone,
    forecast,
    notes: opts.notes,
    events: candidates
  });
  const res = await extractJson({
    systemPrompt,
    userMessage,
    schema: ResultSchema2,
    maxTokens: 8e3,
    models: [{ id: model, reasoning: false, pricing: pricingFor(model) }]
  });
  if (!res.ok || !res.parsed) {
    throw new Error(`marble scorer failed: ${res.error ?? "no response"}`);
  }
  const byId = new Map(events2.map((e) => [e.id, e]));
  const scored = [];
  for (const r of res.parsed.scored) {
    const e = byId.get(r.event_id);
    if (!e) continue;
    scored.push({ ...e, marble_score: r.score, why: r.why });
  }
  scored.sort((a, b) => b.marble_score - a.marble_score);
  const surfaced = scored.filter((e) => e.marble_score >= threshold);
  return {
    scored,
    surfaced,
    meta: {
      kg_loaded_from: loadedFrom,
      kg_counts: counts,
      forecast_days: forecast.length,
      model_used: res.model_used ?? model,
      tokens_used: res.tokens_used,
      cost_usd: res.cost_usd,
      threshold
    }
  };
}
function buildPrompts(o) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const profile = profileSnapshot(o.kg.user);
  const profileText = renderProfileForPrompt(profile);
  const forecastText = renderForecastForPrompt(o.forecast);
  const systemPrompt = [
    "You score upcoming events for one specific person using their Marble knowledge-graph profile.",
    "",
    `Today is ${today}. The person is in ${o.cityName} (timezone ${o.timezone}).`,
    "",
    "SCORING SCALE (0\u20131):",
    "  0.95\u20131.00  IRRESISTIBLE. Specific, clear hypothesis for WHY THIS PERSON would feel compelled to go.",
    "             E.g. a researcher they cite is giving a one-night talk; their favorite obscure band visits.",
    "  0.85\u20130.94  STRONG. Multiple signals from the profile align AND nothing in the state blocks.",
    "  0.65\u20130.84  PLAUSIBLE. Topic match, but no strong personal hook OR some friction.",
    "  0.30\u20130.64  NEUTRAL. Generic interest match.",
    "  0.00\u20130.29  POOR. Off-profile, blocked by state, or low rarity.",
    "",
    "CRITICAL RULES:",
    "  - Be conservative. Default to a lower score when uncertain. Most events should land below 0.85.",
    "  - Score considers BOTH affinity (does the profile point at it?) AND friction (does the state block it?).",
    "  - State-blocking factors include: weather (outdoor + heavy rain forecast), implicit constraints suggested by the profile (an injury implied by recent context, a kid-week, travel).",
    `  - Reject conjecture: if the profile doesn't actually support "this person would love it", don't pad the score.`,
    "  - The 'why' MUST cite the specific profile element OR state factor driving the score. Generic 'matches your interests' is forbidden; say WHICH interest, WHICH belief, WHICH trait.",
    "  - Output ONLY a JSON object, no prose, no markdown fences:",
    '    {"scored":[{"event_id":string,"score":0-1,"why":"one sentence citing profile or state"}]}',
    "  - Score EVERY event in the input list, even if many score low."
  ].join("\n");
  const userMessage = [
    "USER PROFILE (from Marble KG \u2014 confidential):",
    profileText || "(empty profile)",
    "",
    forecastText,
    o.notes ? `
USER STATE NOTES (free-form):
  ${o.notes}` : "",
    "",
    `EVENT CANDIDATES (${o.events.length}):`,
    JSON.stringify(
      o.events.map((e) => ({
        event_id: e.id,
        title: e.title,
        starts_at: e.starts_at,
        venue: e.venue_name ?? null,
        category: e.category ?? null,
        rarity_score: e.rarity_score,
        source: e.source,
        url: e.url ?? null,
        snippet: e.description?.slice(0, 200) ?? null
      })),
      null,
      0
    )
  ].join("\n");
  return { systemPrompt, userMessage };
}
function pricingFor(model) {
  if (model.startsWith("claude-haiku")) return [1, 5];
  if (model.startsWith("claude-sonnet")) return [5, 25];
  if (model.startsWith("claude-opus")) return [5, 25];
  if (model === "gemini-3-flash") return [0.5, 3];
  if (model === "gemini-3.1-pro") return [3, 15];
  return [0, 0];
}
var ScoredEventSchema, ResultSchema2;
var init_scorer = __esm({
  "src/marble/scorer.ts"() {
    "use strict";
    init_zod();
    init_env();
    init_llm();
    init_weather();
    init_kg_loader();
    init_profile();
    ScoredEventSchema = external_exports.object({
      event_id: external_exports.string().min(1),
      score: external_exports.number().min(0).max(1),
      why: external_exports.string().max(400)
    });
    ResultSchema2 = external_exports.object({
      scored: external_exports.array(ScoredEventSchema).max(200)
    });
  }
});

// src/routes/me-ics.ts
import { createHash as createHash2 } from "node:crypto";
function buildVEvent2(e) {
  const lines = [];
  lines.push("BEGIN:VEVENT");
  lines.push(prop2("UID", `${e.id}@events-x-marble-me`));
  lines.push(prop2("DTSTART", toIcsLocal2(e.starts_at)));
  if (e.ends_at) {
    lines.push(prop2("DTEND", toIcsLocal2(e.ends_at)));
  } else {
    lines.push(prop2("DURATION", "PT2H"));
  }
  const badge = e.marble_score >= 0.95 ? "\u{1F525}\u{1F525} " : "\u{1F525} ";
  lines.push(prop2("SUMMARY", icsEscape2(badge + e.title)));
  const desc = [];
  desc.push(`Why: ${e.why}`);
  desc.push(`Marble score: ${e.marble_score.toFixed(2)}`);
  desc.push(`Rarity: ${e.rarity_score.toFixed(2)}`);
  desc.push(`Source: ${e.source}`);
  if (e.description) desc.push(`
${e.description}`);
  lines.push(prop2("DESCRIPTION", icsEscape2(desc.join("\n"))));
  const loc = [e.venue_name, e.venue_address].filter(Boolean);
  if (loc.length > 0) lines.push(prop2("LOCATION", icsEscape2(loc.join(", "))));
  if (e.url) lines.push(prop2("URL", e.url));
  if (e.category) lines.push(prop2("CATEGORIES", icsEscape2(e.category)));
  if (e.venue_lat != null && e.venue_lng != null) {
    lines.push(prop2("GEO", `${e.venue_lat};${e.venue_lng}`));
  }
  lines.push(prop2("DTSTAMP", toIcsUtc2(/* @__PURE__ */ new Date())));
  lines.push("END:VEVENT");
  return lines.join("\r\n");
}
function cacheKey(city, days, threshold, notes) {
  const h = createHash2("sha256").update(notes).digest("hex").slice(0, 12);
  return `${city}|${days}|${threshold}|${h}`;
}
function emptyCalendar(citySlug, tzid) {
  return [
    "BEGIN:VCALENDAR",
    prop2("VERSION", "2.0"),
    prop2("PRODID", "-//events-x-marble//me//EN"),
    prop2("CALSCALE", "GREGORIAN"),
    prop2("METHOD", "PUBLISH"),
    prop2("X-WR-CALNAME", `Events \xB7 ${citySlug} \xB7 marble (no surfaced events)`),
    prop2("X-WR-TIMEZONE", tzid),
    vtimezoneBlock(tzid),
    "END:VCALENDAR"
  ].join("\r\n");
}
function calHeaders() {
  return {
    "Content-Type": "text/calendar; charset=utf-8",
    // Hint to clients to refresh hourly. We cache scoring server-side for 6h.
    "Cache-Control": "private, max-age=3600"
  };
}
var meIcsApp, QuerySchema2, CACHE, CACHE_TTL_MS;
var init_me_ics = __esm({
  "src/routes/me-ics.ts"() {
    "use strict";
    init_dist();
    init_zod();
    init_env();
    init_db();
    init_ics_format();
    init_scorer();
    meIcsApp = new Hono2();
    QuerySchema2 = external_exports.object({
      city: external_exports.string().min(1).default("barcelona"),
      days: external_exports.coerce.number().int().positive().max(60).default(14),
      threshold: external_exports.coerce.number().min(0).max(1).default(0.85),
      notes: external_exports.string().max(500).optional(),
      token: external_exports.string().min(1),
      // Cache-control escape hatch for debugging.
      no_cache: external_exports.coerce.boolean().optional()
    });
    CACHE = /* @__PURE__ */ new Map();
    CACHE_TTL_MS = 6 * 60 * 60 * 1e3;
    meIcsApp.get("/", async (c) => {
      const parsed = QuerySchema2.safeParse(c.req.query());
      if (!parsed.success) {
        return c.text("invalid query: " + JSON.stringify(parsed.error.flatten()), 400);
      }
      const q = parsed.data;
      if (!env.ME_TOKEN) {
        return c.text("/me routes disabled: ME_TOKEN not set in env", 503);
      }
      if (q.token !== env.ME_TOKEN) {
        return c.text("unauthorized", 401);
      }
      if (!env.MARBLE_KG_PATH) {
        return c.text("MARBLE_KG_PATH not set in env", 503);
      }
      const city = await queryGet(
        "SELECT slug, name, timezone, centroid_lng, centroid_lat FROM cities WHERE slug = ?",
        [q.city]
      );
      if (!city) return c.text(`unknown city: ${q.city}`, 404);
      const now = /* @__PURE__ */ new Date();
      const horizon = new Date(now.getTime() + q.days * 864e5);
      const key = cacheKey(q.city, q.days, q.threshold, q.notes ?? "");
      let result;
      const hit = q.no_cache ? null : CACHE.get(key);
      if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
        result = hit.result;
      } else {
        const rows = await queryAll(
          `SELECT e.id, e.title, e.description, e.starts_at, e.ends_at,
              e.venue_name, e.venue_address, e.venue_lat, e.venue_lng,
              e.category, e.rarity_score, e.url, s.name AS source_name
       FROM events e JOIN sources s ON s.id = e.source_id
       WHERE e.city_id = (SELECT id FROM cities WHERE slug = ?)
         AND e.starts_at >= ? AND e.starts_at < ?
       ORDER BY e.starts_at ASC`,
          [q.city, now.toISOString(), horizon.toISOString()]
        );
        if (rows.length === 0) {
          return c.text(emptyCalendar(q.city, tzForCity2(q.city)), 200, calHeaders());
        }
        const candidates = rows.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          starts_at: r.starts_at,
          ends_at: r.ends_at,
          venue_name: r.venue_name,
          venue_address: r.venue_address,
          venue_lat: r.venue_lat,
          venue_lng: r.venue_lng,
          category: r.category,
          rarity_score: r.rarity_score,
          source: r.source_name,
          url: r.url
        }));
        const centroid = city.centroid_lng != null && city.centroid_lat != null ? [city.centroid_lng, city.centroid_lat] : null;
        try {
          result = await scoreEventsForUser(candidates, {
            city: { name: city.name, centroid, timezone: city.timezone },
            ...q.notes ? { notes: q.notes } : {},
            threshold: q.threshold
          });
          CACHE.set(key, { ts: Date.now(), result });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return c.text(`scoring failed: ${message.slice(0, 200)}`, 502);
        }
      }
      const tzid = tzForCity2(q.city);
      const vevents = result.surfaced.map((e) => buildVEvent2(e));
      const cal = [
        "BEGIN:VCALENDAR",
        prop2("VERSION", "2.0"),
        prop2("PRODID", "-//events-x-marble//me//EN"),
        prop2("CALSCALE", "GREGORIAN"),
        prop2("METHOD", "PUBLISH"),
        prop2("X-WR-CALNAME", `Events \xB7 ${q.city} \xB7 marble`),
        prop2("X-WR-TIMEZONE", tzid),
        prop2(
          "X-WR-CALDESC",
          icsEscape2(
            `Irresistible events for ${q.city} above marble score ${q.threshold}. ${result.surfaced.length}/${result.scored.length} events surfaced.`
          )
        ),
        vtimezoneBlock(tzid),
        ...vevents,
        "END:VCALENDAR"
      ].join("\r\n");
      return c.text(cal, 200, calHeaders());
    });
  }
});

// node_modules/hono/dist/helper/html/index.js
var init_html2 = __esm({
  "node_modules/hono/dist/helper/html/index.js"() {
    init_html();
  }
});

// node_modules/hono/dist/jsx/constants.js
var DOM_RENDERER, DOM_ERROR_HANDLER, DOM_INTERNAL_TAG, PERMALINK;
var init_constants3 = __esm({
  "node_modules/hono/dist/jsx/constants.js"() {
    DOM_RENDERER = /* @__PURE__ */ Symbol("RENDERER");
    DOM_ERROR_HANDLER = /* @__PURE__ */ Symbol("ERROR_HANDLER");
    DOM_INTERNAL_TAG = /* @__PURE__ */ Symbol("INTERNAL");
    PERMALINK = /* @__PURE__ */ Symbol("PERMALINK");
  }
});

// node_modules/hono/dist/jsx/dom/utils.js
var setInternalTagFlag;
var init_utils = __esm({
  "node_modules/hono/dist/jsx/dom/utils.js"() {
    init_constants3();
    setInternalTagFlag = (fn) => {
      ;
      fn[DOM_INTERNAL_TAG] = true;
      return fn;
    };
  }
});

// node_modules/hono/dist/jsx/dom/context.js
var createContextProviderFunction;
var init_context2 = __esm({
  "node_modules/hono/dist/jsx/dom/context.js"() {
    init_constants3();
    init_context3();
    init_utils();
    createContextProviderFunction = (values) => ({ value, children }) => {
      if (!children) {
        return void 0;
      }
      const props = {
        children: [
          {
            tag: setInternalTagFlag(() => {
              values.push(value);
            }),
            props: {}
          }
        ]
      };
      if (Array.isArray(children)) {
        props.children.push(...children.flat());
      } else {
        props.children.push(children);
      }
      props.children.push({
        tag: setInternalTagFlag(() => {
          values.pop();
        }),
        props: {}
      });
      const res = { tag: "", props, type: "" };
      res[DOM_ERROR_HANDLER] = (err) => {
        values.pop();
        throw err;
      };
      return res;
    };
  }
});

// node_modules/hono/dist/jsx/context.js
var globalContexts, createContext, useContext;
var init_context3 = __esm({
  "node_modules/hono/dist/jsx/context.js"() {
    init_html2();
    init_base();
    init_constants3();
    init_context2();
    globalContexts = [];
    createContext = (defaultValue) => {
      const values = [defaultValue];
      const context = ((props) => {
        values.push(props.value);
        let string2;
        try {
          string2 = props.children ? (Array.isArray(props.children) ? new JSXFragmentNode("", {}, props.children) : props.children).toString() : "";
        } catch (e) {
          values.pop();
          throw e;
        }
        if (string2 instanceof Promise) {
          return string2.finally(() => values.pop()).then((resString) => raw(resString, resString.callbacks));
        } else {
          values.pop();
          return raw(string2);
        }
      });
      context.values = values;
      context.Provider = context;
      context[DOM_RENDERER] = createContextProviderFunction(values);
      globalContexts.push(context);
      return context;
    };
    useContext = (context) => {
      return context.values.at(-1);
    };
  }
});

// node_modules/hono/dist/jsx/intrinsic-element/common.js
var deDupeKeyMap, domRenderers, dataPrecedenceAttr, isStylesheetLinkWithPrecedence, shouldDeDupeByKey;
var init_common = __esm({
  "node_modules/hono/dist/jsx/intrinsic-element/common.js"() {
    deDupeKeyMap = {
      title: [],
      script: ["src"],
      style: ["data-href"],
      link: ["href"],
      meta: ["name", "httpEquiv", "charset", "itemProp"]
    };
    domRenderers = {};
    dataPrecedenceAttr = "data-precedence";
    isStylesheetLinkWithPrecedence = (props) => props.rel === "stylesheet" && "precedence" in props;
    shouldDeDupeByKey = (tagName, supportSort) => {
      if (tagName === "link") {
        return supportSort;
      }
      return deDupeKeyMap[tagName].length > 0;
    };
  }
});

// node_modules/hono/dist/jsx/children.js
var toArray;
var init_children = __esm({
  "node_modules/hono/dist/jsx/children.js"() {
    toArray = (children) => Array.isArray(children) ? children : [children];
  }
});

// node_modules/hono/dist/jsx/intrinsic-element/components.js
var components_exports = {};
__export(components_exports, {
  button: () => button,
  form: () => form,
  input: () => input,
  link: () => link,
  meta: () => meta,
  script: () => script,
  style: () => style,
  title: () => title
});
var metaTagMap, insertIntoHead, returnWithoutSpecialBehavior, documentMetadataTag, title, script, style, link, meta, newJSXNode, form, formActionableElement, input, button;
var init_components = __esm({
  "node_modules/hono/dist/jsx/intrinsic-element/components.js"() {
    init_html2();
    init_base();
    init_children();
    init_constants3();
    init_context3();
    init_common();
    metaTagMap = /* @__PURE__ */ new WeakMap();
    insertIntoHead = (tagName, tag, props, precedence) => ({ buffer, context }) => {
      if (!buffer) {
        return;
      }
      const map = metaTagMap.get(context) || {};
      metaTagMap.set(context, map);
      const tags = map[tagName] ||= [];
      let duped = false;
      const deDupeKeys = deDupeKeyMap[tagName];
      const deDupeByKey = shouldDeDupeByKey(tagName, precedence !== void 0);
      if (deDupeByKey) {
        LOOP: for (const [, tagProps] of tags) {
          if (tagName === "link" && !(tagProps.rel === "stylesheet" && tagProps[dataPrecedenceAttr] !== void 0)) {
            continue;
          }
          for (const key of deDupeKeys) {
            if ((tagProps?.[key] ?? null) === props?.[key]) {
              duped = true;
              break LOOP;
            }
          }
        }
      }
      if (duped) {
        buffer[0] = buffer[0].replaceAll(tag, "");
      } else if (deDupeByKey || tagName === "link") {
        tags.push([tag, props, precedence]);
      } else {
        tags.unshift([tag, props, precedence]);
      }
      if (buffer[0].indexOf("</head>") !== -1) {
        let insertTags;
        if (tagName === "link" || precedence !== void 0) {
          const precedences = [];
          insertTags = tags.map(([tag2, , tagPrecedence], index) => {
            if (tagPrecedence === void 0) {
              return [tag2, Number.MAX_SAFE_INTEGER, index];
            }
            let order = precedences.indexOf(tagPrecedence);
            if (order === -1) {
              precedences.push(tagPrecedence);
              order = precedences.length - 1;
            }
            return [tag2, order, index];
          }).sort((a, b) => a[1] - b[1] || a[2] - b[2]).map(([tag2]) => tag2);
        } else {
          insertTags = tags.map(([tag2]) => tag2);
        }
        insertTags.forEach((tag2) => {
          buffer[0] = buffer[0].replaceAll(tag2, "");
        });
        buffer[0] = buffer[0].replace(/(?=<\/head>)/, insertTags.join(""));
      }
    };
    returnWithoutSpecialBehavior = (tag, children, props) => raw(new JSXNode(tag, props, toArray(children ?? [])).toString());
    documentMetadataTag = (tag, children, props, sort) => {
      if ("itemProp" in props) {
        return returnWithoutSpecialBehavior(tag, children, props);
      }
      let { precedence, blocking, ...restProps } = props;
      precedence = sort ? precedence ?? "" : void 0;
      if (sort) {
        restProps[dataPrecedenceAttr] = precedence;
      }
      const string2 = new JSXNode(tag, restProps, toArray(children || [])).toString();
      if (string2 instanceof Promise) {
        return string2.then(
          (resString) => raw(string2, [
            ...resString.callbacks || [],
            insertIntoHead(tag, resString, restProps, precedence)
          ])
        );
      } else {
        return raw(string2, [insertIntoHead(tag, string2, restProps, precedence)]);
      }
    };
    title = ({ children, ...props }) => {
      const nameSpaceContext2 = getNameSpaceContext();
      if (nameSpaceContext2) {
        const context = useContext(nameSpaceContext2);
        if (context === "svg" || context === "head") {
          return new JSXNode(
            "title",
            props,
            toArray(children ?? [])
          );
        }
      }
      return documentMetadataTag("title", children, props, false);
    };
    script = ({
      children,
      ...props
    }) => {
      const nameSpaceContext2 = getNameSpaceContext();
      if (["src", "async"].some((k) => !props[k]) || nameSpaceContext2 && useContext(nameSpaceContext2) === "head") {
        return returnWithoutSpecialBehavior("script", children, props);
      }
      return documentMetadataTag("script", children, props, false);
    };
    style = ({
      children,
      ...props
    }) => {
      if (!["href", "precedence"].every((k) => k in props)) {
        return returnWithoutSpecialBehavior("style", children, props);
      }
      props["data-href"] = props.href;
      delete props.href;
      return documentMetadataTag("style", children, props, true);
    };
    link = ({ children, ...props }) => {
      if (["onLoad", "onError"].some((k) => k in props) || props.rel === "stylesheet" && (!("precedence" in props) || "disabled" in props)) {
        return returnWithoutSpecialBehavior("link", children, props);
      }
      return documentMetadataTag("link", children, props, isStylesheetLinkWithPrecedence(props));
    };
    meta = ({ children, ...props }) => {
      const nameSpaceContext2 = getNameSpaceContext();
      if (nameSpaceContext2 && useContext(nameSpaceContext2) === "head") {
        return returnWithoutSpecialBehavior("meta", children, props);
      }
      return documentMetadataTag("meta", children, props, false);
    };
    newJSXNode = (tag, { children, ...props }) => (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new JSXNode(tag, props, toArray(children ?? []))
    );
    form = (props) => {
      if (typeof props.action === "function") {
        props.action = PERMALINK in props.action ? props.action[PERMALINK] : void 0;
      }
      return newJSXNode("form", props);
    };
    formActionableElement = (tag, props) => {
      if (typeof props.formAction === "function") {
        props.formAction = PERMALINK in props.formAction ? props.formAction[PERMALINK] : void 0;
      }
      return newJSXNode(tag, props);
    };
    input = (props) => formActionableElement("input", props);
    button = (props) => formActionableElement("button", props);
  }
});

// node_modules/hono/dist/jsx/utils.js
var normalizeElementKeyMap, normalizeIntrinsicElementKey, invalidAttributeNameCharRe, validAttributeNameCache, validAttributeNameCacheMax, invalidTagNameCharRe, validTagNameCache, validTagNameCacheMax, cacheValidName, isValidTagName, isValidAttributeName, invalidStylePropertyNameCharRe, validStylePropertyNameCache, validStylePropertyNameCacheMax, isValidStylePropertyName, unsafeStyleValueCharRe, hasUnsafeStyleValue, styleObjectForEach;
var init_utils2 = __esm({
  "node_modules/hono/dist/jsx/utils.js"() {
    normalizeElementKeyMap = /* @__PURE__ */ new Map([
      ["className", "class"],
      ["htmlFor", "for"],
      ["crossOrigin", "crossorigin"],
      ["httpEquiv", "http-equiv"],
      ["itemProp", "itemprop"],
      ["fetchPriority", "fetchpriority"],
      ["noModule", "nomodule"],
      ["formAction", "formaction"]
    ]);
    normalizeIntrinsicElementKey = (key) => normalizeElementKeyMap.get(key) || key;
    invalidAttributeNameCharRe = /[\s"'<>/=`\\\x00-\x1f\x7f-\x9f]/;
    validAttributeNameCache = /* @__PURE__ */ new Set();
    validAttributeNameCacheMax = 1024;
    invalidTagNameCharRe = /^[!?]|[\s"'<>/=`\\\x00-\x1f\x7f-\x9f]/;
    validTagNameCache = /* @__PURE__ */ new Set();
    validTagNameCacheMax = 256;
    cacheValidName = (cache, max, name) => {
      if (cache.size >= max) {
        cache.clear();
      }
      cache.add(name);
    };
    isValidTagName = (name) => {
      if (validTagNameCache.has(name)) {
        return true;
      }
      if (typeof name !== "string") {
        return false;
      }
      if (name.length === 0) {
        return true;
      }
      if (invalidTagNameCharRe.test(name)) {
        return false;
      }
      cacheValidName(validTagNameCache, validTagNameCacheMax, name);
      return true;
    };
    isValidAttributeName = (name) => {
      if (validAttributeNameCache.has(name)) {
        return true;
      }
      const len = name.length;
      if (len === 0) {
        return false;
      }
      for (let i = 0; i < len; i++) {
        const c = name.charCodeAt(i);
        if (!(c >= 97 && c <= 122 || // a-z
        c >= 65 && c <= 90 || // A-Z
        c >= 48 && c <= 57 || // 0-9
        c === 45 || // -
        c === 95 || // _
        c === 46 || // .
        c === 58)) {
          if (!invalidAttributeNameCharRe.test(name)) {
            cacheValidName(validAttributeNameCache, validAttributeNameCacheMax, name);
            return true;
          } else {
            return false;
          }
        }
      }
      cacheValidName(validAttributeNameCache, validAttributeNameCacheMax, name);
      return true;
    };
    invalidStylePropertyNameCharRe = /[\s"'():;\\/\[\]{}\x00-\x1f\x7f-\x9f]/;
    validStylePropertyNameCache = /* @__PURE__ */ new Set();
    validStylePropertyNameCacheMax = 1024;
    isValidStylePropertyName = (name) => {
      if (validStylePropertyNameCache.has(name)) {
        return true;
      }
      const len = name.length;
      if (len === 0) {
        return false;
      }
      for (let i = 0; i < len; i++) {
        const c = name.charCodeAt(i);
        if (!(c >= 97 && c <= 122 || // a-z
        c >= 65 && c <= 90 || // A-Z
        c >= 48 && c <= 57 || // 0-9
        c === 45 || // -
        c === 95)) {
          if (!invalidStylePropertyNameCharRe.test(name)) {
            cacheValidName(validStylePropertyNameCache, validStylePropertyNameCacheMax, name);
            return true;
          } else {
            return false;
          }
        }
      }
      cacheValidName(validStylePropertyNameCache, validStylePropertyNameCacheMax, name);
      return true;
    };
    unsafeStyleValueCharRe = /[;"'\\/\[\](){}]/;
    hasUnsafeStyleValue = (value) => {
      if (!unsafeStyleValueCharRe.test(value)) {
        return false;
      }
      let quote = 0;
      const blockStack = [];
      for (let i = 0, len = value.length; i < len; i++) {
        const c = value.charCodeAt(i);
        if (c === 92) {
          if (i === len - 1) {
            return true;
          }
          i++;
        } else if (quote !== 0) {
          if (c === 10 || c === 12 || c === 13) {
            return true;
          }
          if (c === quote) {
            quote = 0;
          }
        } else if (c === 47 && value.charCodeAt(i + 1) === 42) {
          const end = value.indexOf("*/", i + 2);
          if (end === -1) {
            return true;
          }
          i = end + 1;
        } else if (c === 34 || c === 39) {
          quote = c;
        } else if (c === 40) {
          blockStack.push(41);
        } else if (c === 91) {
          blockStack.push(93);
        } else if (c === 123 || c === 125) {
          return true;
        } else if (c === 41 || c === 93) {
          if (blockStack[blockStack.length - 1] !== c) {
            return true;
          }
          blockStack.pop();
        } else if (c === 59 && blockStack.length === 0) {
          return true;
        }
      }
      return quote !== 0 || blockStack.length !== 0;
    };
    styleObjectForEach = (style2, fn) => {
      for (const [k, v] of Object.entries(style2)) {
        const key = k[0] === "-" || !/[A-Z]/.test(k) ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
        if (!isValidStylePropertyName(key)) {
          continue;
        }
        if (v == null) {
          fn(key, null);
          continue;
        }
        let value;
        if (typeof v === "number") {
          value = !key.match(
            /^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/
          ) ? `${v}px` : `${v}`;
        } else if (typeof v === "string") {
          if (hasUnsafeStyleValue(v)) {
            continue;
          }
          value = v;
        } else {
          continue;
        }
        fn(key, value);
      }
    };
  }
});

// node_modules/hono/dist/jsx/base.js
var nameSpaceContext, getNameSpaceContext, toSVGAttributeName, emptyTags, booleanAttributes, childrenToStringToBuffer, JSXNode, JSXFunctionNode, JSXFragmentNode, initDomRenderer, jsxFn, Fragment;
var init_base = __esm({
  "node_modules/hono/dist/jsx/base.js"() {
    init_html2();
    init_html();
    init_constants3();
    init_context3();
    init_common();
    init_components();
    init_utils2();
    nameSpaceContext = void 0;
    getNameSpaceContext = () => nameSpaceContext;
    toSVGAttributeName = (key) => /[A-Z]/.test(key) && // Presentation attributes are findable in style object. "clip-path", "font-size", "stroke-width", etc.
    // Or other un-deprecated kebab-case attributes. "overline-position", "paint-order", "strikethrough-position", etc.
    key.match(
      /^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/
    ) ? key.replace(/([A-Z])/g, "-$1").toLowerCase() : key;
    emptyTags = [
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "keygen",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr"
    ];
    booleanAttributes = [
      "allowfullscreen",
      "async",
      "autofocus",
      "autoplay",
      "checked",
      "controls",
      "default",
      "defer",
      "disabled",
      "download",
      "formnovalidate",
      "hidden",
      "inert",
      "ismap",
      "itemscope",
      "loop",
      "multiple",
      "muted",
      "nomodule",
      "novalidate",
      "open",
      "playsinline",
      "readonly",
      "required",
      "reversed",
      "selected"
    ];
    childrenToStringToBuffer = (children, buffer) => {
      for (let i = 0, len = children.length; i < len; i++) {
        const child = children[i];
        if (typeof child === "string") {
          escapeToBuffer(child, buffer);
        } else if (typeof child === "boolean" || child === null || child === void 0) {
          continue;
        } else if (child instanceof JSXNode) {
          child.toStringToBuffer(buffer);
        } else if (typeof child === "number" || child.isEscaped) {
          ;
          buffer[0] += child;
        } else if (child instanceof Promise) {
          buffer.unshift("", child);
        } else {
          childrenToStringToBuffer(child, buffer);
        }
      }
    };
    JSXNode = class {
      tag;
      props;
      key;
      children;
      isEscaped = true;
      localContexts;
      constructor(tag, props, children) {
        if (typeof tag !== "function" && !isValidTagName(tag)) {
          throw new Error(`Invalid JSX tag name: ${tag}`);
        }
        this.tag = tag;
        this.props = props;
        this.children = children;
      }
      get type() {
        return this.tag;
      }
      // Added for compatibility with libraries that rely on React's internal structure
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get ref() {
        return this.props.ref || null;
      }
      toString() {
        const buffer = [""];
        this.localContexts?.forEach(([context, value]) => {
          context.values.push(value);
        });
        try {
          this.toStringToBuffer(buffer);
        } finally {
          this.localContexts?.forEach(([context]) => {
            context.values.pop();
          });
        }
        return buffer.length === 1 ? "callbacks" in buffer ? resolveCallbackSync(raw(buffer[0], buffer.callbacks)).toString() : buffer[0] : stringBufferToString(buffer, buffer.callbacks);
      }
      toStringToBuffer(buffer) {
        const tag = this.tag;
        const props = this.props;
        let { children } = this;
        buffer[0] += `<${tag}`;
        const normalizeKey = tag === "svg" || nameSpaceContext && useContext(nameSpaceContext) === "svg" ? (key) => toSVGAttributeName(normalizeIntrinsicElementKey(key)) : (key) => normalizeIntrinsicElementKey(key);
        for (let [key, v] of Object.entries(props)) {
          key = normalizeKey(key);
          if (!isValidAttributeName(key)) {
            continue;
          }
          if (key === "children") {
          } else if (key === "style" && typeof v === "object") {
            let styleStr = "";
            styleObjectForEach(v, (property, value) => {
              if (value != null) {
                styleStr += `${styleStr ? ";" : ""}${property}:${value}`;
              }
            });
            buffer[0] += ' style="';
            escapeToBuffer(styleStr, buffer);
            buffer[0] += '"';
          } else if (typeof v === "string") {
            buffer[0] += ` ${key}="`;
            escapeToBuffer(v, buffer);
            buffer[0] += '"';
          } else if (v === null || v === void 0) {
          } else if (typeof v === "number" || v.isEscaped) {
            buffer[0] += ` ${key}="${v}"`;
          } else if (typeof v === "boolean" && booleanAttributes.includes(key)) {
            if (v) {
              buffer[0] += ` ${key}=""`;
            }
          } else if (key === "dangerouslySetInnerHTML") {
            if (children.length > 0) {
              throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
            }
            children = [raw(v.__html)];
          } else if (v instanceof Promise) {
            buffer[0] += ` ${key}="`;
            buffer.unshift('"', v);
          } else if (typeof v === "function") {
            if (!key.startsWith("on") && key !== "ref") {
              throw new Error(`Invalid prop '${key}' of type 'function' supplied to '${tag}'.`);
            }
          } else {
            buffer[0] += ` ${key}="`;
            escapeToBuffer(v.toString(), buffer);
            buffer[0] += '"';
          }
        }
        if (emptyTags.includes(tag) && children.length === 0) {
          buffer[0] += "/>";
          return;
        }
        buffer[0] += ">";
        childrenToStringToBuffer(children, buffer);
        buffer[0] += `</${tag}>`;
      }
    };
    JSXFunctionNode = class extends JSXNode {
      toStringToBuffer(buffer) {
        const { children } = this;
        const props = { ...this.props };
        if (children.length) {
          props.children = children.length === 1 ? children[0] : children;
        }
        const res = this.tag.call(null, props);
        if (typeof res === "boolean" || res == null) {
          return;
        } else if (res instanceof Promise) {
          if (globalContexts.length === 0) {
            buffer.unshift("", res);
          } else {
            const currentContexts = globalContexts.map((c) => [c, c.values.at(-1)]);
            buffer.unshift(
              "",
              res.then((childRes) => {
                if (childRes instanceof JSXNode) {
                  childRes.localContexts = currentContexts;
                }
                return childRes;
              })
            );
          }
        } else if (res instanceof JSXNode) {
          res.toStringToBuffer(buffer);
        } else if (typeof res === "number" || res.isEscaped) {
          buffer[0] += res;
          if (res.callbacks) {
            buffer.callbacks ||= [];
            buffer.callbacks.push(...res.callbacks);
          }
        } else {
          escapeToBuffer(res, buffer);
        }
      }
    };
    JSXFragmentNode = class extends JSXNode {
      toStringToBuffer(buffer) {
        childrenToStringToBuffer(this.children, buffer);
      }
    };
    initDomRenderer = false;
    jsxFn = (tag, props, children) => {
      if (!initDomRenderer) {
        for (const k in domRenderers) {
          ;
          components_exports[k][DOM_RENDERER] = domRenderers[k];
        }
        initDomRenderer = true;
      }
      if (typeof tag === "function") {
        return new JSXFunctionNode(tag, props, children);
      } else if (components_exports[tag]) {
        return new JSXFunctionNode(
          components_exports[tag],
          props,
          children
        );
      } else if (tag === "svg" || tag === "head") {
        nameSpaceContext ||= createContext("");
        return new JSXNode(tag, props, [
          new JSXFunctionNode(
            nameSpaceContext,
            {
              value: tag
            },
            children
          )
        ]);
      } else {
        return new JSXNode(tag, props, children);
      }
    };
    Fragment = ({
      children
    }) => {
      return new JSXFragmentNode(
        "",
        {
          children
        },
        Array.isArray(children) ? children : children ? [children] : []
      );
    };
  }
});

// node_modules/hono/dist/jsx/jsx-dev-runtime.js
function jsxDEV(tag, props, key) {
  let node;
  if (!props || !("children" in props)) {
    node = jsxFn(tag, props, []);
  } else {
    const children = props.children;
    node = Array.isArray(children) ? jsxFn(tag, props, children) : jsxFn(tag, props, [children]);
  }
  node.key = key;
  return node;
}
var init_jsx_dev_runtime = __esm({
  "node_modules/hono/dist/jsx/jsx-dev-runtime.js"() {
    init_base();
    init_base();
  }
});

// node_modules/hono/dist/jsx/jsx-runtime.js
var init_jsx_runtime = __esm({
  "node_modules/hono/dist/jsx/jsx-runtime.js"() {
    init_jsx_dev_runtime();
    init_jsx_dev_runtime();
    init_html2();
    init_html();
    init_utils2();
  }
});

// src/views/layout.tsx
var Layout, css;
var init_layout = __esm({
  "src/views/layout.tsx"() {
    "use strict";
    init_jsx_runtime();
    Layout = ({ title: title2, children }) => /* @__PURE__ */ jsxDEV("html", { lang: "en", children: [
      /* @__PURE__ */ jsxDEV("head", { children: [
        /* @__PURE__ */ jsxDEV("meta", { charset: "utf-8" }),
        /* @__PURE__ */ jsxDEV("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
        /* @__PURE__ */ jsxDEV("title", { children: title2 ?? "Events x Marble" }),
        /* @__PURE__ */ jsxDEV("style", { children: css })
      ] }),
      /* @__PURE__ */ jsxDEV("body", { children })
    ] });
    css = `
  :root {
    --bg: #0f1115;
    --fg: #e5e7eb;
    --muted: #8b95a3;
    --accent: #f59e0b;
    --rare: #f43f5e;
    --card: #161922;
    --border: #232733;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--bg); color: var(--fg);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; }
  a { color: inherit; }
  header { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; gap: 16px;
    align-items: baseline; flex-wrap: wrap; }
  header h1 { font-size: 20px; margin: 0; font-weight: 600; letter-spacing: -0.01em; }
  header .sub { color: var(--muted); font-size: 13px; }
  main { max-width: 960px; margin: 0 auto; padding: 24px; }
  form.filters { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; align-items: center; }
  form.filters label { font-size: 12px; color: var(--muted); display: flex; flex-direction: column; gap: 4px; }
  form.filters select, form.filters input {
    background: var(--card); color: var(--fg); border: 1px solid var(--border);
    border-radius: 8px; padding: 8px 10px; font: inherit; min-width: 140px;
  }
  form.filters button {
    background: var(--accent); color: #0f1115; border: 0; border-radius: 8px;
    padding: 10px 16px; font-weight: 600; cursor: pointer; align-self: flex-end;
  }
  .day { margin-bottom: 28px; }
  .day h2 { font-size: 14px; font-weight: 600; color: var(--muted); margin: 0 0 12px 0;
    text-transform: uppercase; letter-spacing: 0.06em; }
  .event { background: var(--card); border: 1px solid var(--border); border-radius: 10px;
    padding: 14px 16px; margin-bottom: 8px; display: flex; gap: 14px; align-items: flex-start; }
  .event .time { color: var(--muted); font-variant-numeric: tabular-nums; font-size: 13px;
    min-width: 56px; padding-top: 2px; }
  .event .body { flex: 1; }
  .event .title { font-weight: 600; margin-bottom: 4px; }
  .event .meta { color: var(--muted); font-size: 12px; }
  .event .meta a { color: var(--accent); text-decoration: none; }
  .event .rarity { display: inline-block; font-size: 10px;
    padding: 2px 6px; border-radius: 4px; margin-left: 6px; vertical-align: middle;
    font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
  .rarity-muted { background: #3a3f4a; color: #8b95a3; }
  .rarity-amber { background: #92400e; color: #fbbf24; }
  .rarity-rare { background: #c2410c; color: #fed7aa; }
  .rarity-ultra { background: var(--rare); color: #fff; }
  .source-badge { display: inline-block; background: #232733; color: #8b95a3; font-size: 10px;
    padding: 2px 7px; border-radius: 4px; margin-right: 7px; vertical-align: middle;
    font-weight: 500; letter-spacing: 0.02em; white-space: nowrap; max-width: 140px;
    overflow: hidden; text-overflow: ellipsis; }
  .stats { font-variant-numeric: tabular-nums; }
  .filter-row { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }
  .filter-label { font-size: 11px; color: var(--muted); text-transform: uppercase;
    letter-spacing: 0.06em; white-space: nowrap; }
  .chip { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px;
    background: var(--card); border: 1px solid var(--border); color: var(--muted);
    text-decoration: none; cursor: pointer; transition: border-color 0.15s; }
  .chip:hover { border-color: var(--accent); color: var(--fg); }
  .chip-active { background: var(--accent); color: #0f1115; border-color: var(--accent);
    font-weight: 600; }
  .chip-cat.chip-active { background: #6d28d9; border-color: #6d28d9; color: #fff; }
  .filter-row-wrap { gap: 6px; }
  .empty { color: var(--muted); padding: 40px 0; text-align: center; }
  footer { color: var(--muted); font-size: 12px; padding: 24px; text-align: center; }
`;
  }
});

// src/views/home.tsx
function truncate(s, max) {
  return s.length > max ? s.slice(0, max - 1) + "\u2026" : s;
}
function rarityBadgeClass(score) {
  if (score >= 0.8) return "rarity rarity-ultra";
  if (score >= 0.6) return "rarity rarity-rare";
  if (score >= 0.3) return "rarity rarity-amber";
  return "rarity rarity-muted";
}
function rarityLabel(score) {
  if (score >= 0.8) return `\u{1F525} ultra-rare`;
  if (score >= 0.6) return "rare";
  if (score >= 0.3) return `${Math.round(score * 100)}%`;
  return `${Math.round(score * 100)}%`;
}
function groupByDay(events2, tz, sort) {
  const map = /* @__PURE__ */ new Map();
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  for (const e of events2) {
    const day = fmt.format(new Date(e.starts_at));
    let list = map.get(day);
    if (!list) {
      list = [];
      map.set(day, list);
    }
    list.push(e);
  }
  const entries = [...map.entries()];
  if (sort === "rarity") {
    for (const [, dayEvents] of entries) {
      dayEvents.sort((a, b) => {
        if (b.rarity_score !== a.rarity_score) return b.rarity_score - a.rarity_score;
        return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
      });
    }
  }
  return entries;
}
function formatTime(iso, tz) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  return fmt.format(new Date(iso));
}
var Home;
var init_home = __esm({
  "src/views/home.tsx"() {
    "use strict";
    init_layout();
    init_jsx_runtime();
    Home = ({
      cities: cities2,
      selectedCity,
      from,
      to,
      events: events2,
      totalCount,
      sort,
      minRarity,
      selectedCategories,
      allCategories,
      rareCount
    }) => {
      const grouped = groupByDay(events2, selectedCity?.timezone ?? "UTC", sort);
      const buildQS = (overrides) => {
        const params = {};
        if (selectedCity) params.city = selectedCity.slug;
        if (from) params.from = from.slice(0, 10);
        if (to) params.to = to.slice(0, 10);
        if (sort && sort !== "date") params.sort = sort;
        if (minRarity !== null) params.min_rarity = String(minRarity);
        if (selectedCategories.length > 0) params.category = selectedCategories.join(",");
        for (const [k, v] of Object.entries(overrides)) {
          if (v === null) delete params[k];
          else params[k] = v;
        }
        const qs = new URLSearchParams(params).toString();
        return qs ? `/?${qs}` : "/";
      };
      const categoryCount = allCategories.length;
      return /* @__PURE__ */ jsxDEV(Layout, { title: "Events x Marble", children: [
        /* @__PURE__ */ jsxDEV("header", { children: [
          /* @__PURE__ */ jsxDEV("h1", { children: "Events x Marble" }),
          /* @__PURE__ */ jsxDEV("span", { class: "sub", children: [
            selectedCity ? `${selectedCity.name}, ${selectedCity.country_code}` : "no city",
            " \u2014 ",
            /* @__PURE__ */ jsxDEV("span", { class: "stats", children: [
              totalCount,
              " event",
              totalCount === 1 ? "" : "s",
              " \xB7 ",
              rareCount,
              " rare",
              " \xB7 ",
              categoryCount,
              " ",
              categoryCount === 1 ? "category" : "categories"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxDEV("main", { children: [
          /* @__PURE__ */ jsxDEV("form", { class: "filters", method: "get", action: "/", children: [
            /* @__PURE__ */ jsxDEV("label", { children: [
              "City",
              /* @__PURE__ */ jsxDEV("select", { name: "city", children: cities2.map((c) => /* @__PURE__ */ jsxDEV("option", { value: c.slug, selected: c.slug === selectedCity?.slug, children: c.name })) })
            ] }),
            /* @__PURE__ */ jsxDEV("label", { children: [
              "From",
              /* @__PURE__ */ jsxDEV("input", { type: "date", name: "from", value: from.slice(0, 10) })
            ] }),
            /* @__PURE__ */ jsxDEV("label", { children: [
              "To",
              /* @__PURE__ */ jsxDEV("input", { type: "date", name: "to", value: to.slice(0, 10) })
            ] }),
            sort && sort !== "date" ? /* @__PURE__ */ jsxDEV("input", { type: "hidden", name: "sort", value: sort }) : null,
            minRarity !== null ? /* @__PURE__ */ jsxDEV("input", { type: "hidden", name: "min_rarity", value: String(minRarity) }) : null,
            selectedCategories.length > 0 ? /* @__PURE__ */ jsxDEV("input", { type: "hidden", name: "category", value: selectedCategories.join(",") }) : null,
            /* @__PURE__ */ jsxDEV("button", { type: "submit", children: "Refresh" })
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "filter-row", children: [
            /* @__PURE__ */ jsxDEV("span", { class: "filter-label", children: "Sort:" }),
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: buildQS({ sort: null }),
                class: `chip${!sort || sort === "date" ? " chip-active" : ""}`,
                children: "By date"
              }
            ),
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: buildQS({ sort: "rarity" }),
                class: `chip${sort === "rarity" ? " chip-active" : ""}`,
                children: "By rarity"
              }
            )
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "filter-row", children: [
            /* @__PURE__ */ jsxDEV("span", { class: "filter-label", children: "Rarity:" }),
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: buildQS({ min_rarity: null }),
                class: `chip${minRarity === null ? " chip-active" : ""}`,
                children: "All"
              }
            ),
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: buildQS({ min_rarity: "0.6" }),
                class: `chip${minRarity === 0.6 ? " chip-active" : ""}`,
                children: "Rare (\u22650.6)"
              }
            ),
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: buildQS({ min_rarity: "0.8" }),
                class: `chip${minRarity === 0.8 ? " chip-active" : ""}`,
                children: "Off-the-beaten-path (\u22650.8)"
              }
            )
          ] }),
          allCategories.length > 0 ? /* @__PURE__ */ jsxDEV("div", { class: "filter-row filter-row-wrap", children: [
            /* @__PURE__ */ jsxDEV("span", { class: "filter-label", children: "Category:" }),
            allCategories.map((cat) => {
              const isActive = selectedCategories.includes(cat);
              const newCats = isActive ? selectedCategories.filter((c) => c !== cat) : [...selectedCategories, cat];
              const catParam = newCats.length > 0 ? newCats.join(",") : null;
              return /* @__PURE__ */ jsxDEV(
                "a",
                {
                  href: buildQS({ category: catParam }),
                  class: `chip chip-cat${isActive ? " chip-active" : ""}`,
                  children: cat
                }
              );
            })
          ] }) : null,
          grouped.length === 0 ? /* @__PURE__ */ jsxDEV("div", { class: "empty", children: "No events in this window yet. Run a pipeline to populate." }) : grouped.map(([day, dayEvents]) => /* @__PURE__ */ jsxDEV("section", { class: "day", children: [
            /* @__PURE__ */ jsxDEV("h2", { children: day }),
            dayEvents.map((e) => /* @__PURE__ */ jsxDEV("article", { class: "event", children: [
              /* @__PURE__ */ jsxDEV("div", { class: "time", children: formatTime(e.starts_at, selectedCity?.timezone ?? "UTC") }),
              /* @__PURE__ */ jsxDEV("div", { class: "body", children: [
                /* @__PURE__ */ jsxDEV("div", { class: "title", children: [
                  /* @__PURE__ */ jsxDEV("span", { class: "source-badge", children: truncate(e.source_name, 18) }),
                  e.title,
                  /* @__PURE__ */ jsxDEV("span", { class: rarityBadgeClass(e.rarity_score), children: rarityLabel(e.rarity_score) })
                ] }),
                /* @__PURE__ */ jsxDEV("div", { class: "meta", children: [
                  e.venue_name ?? "\u2014",
                  " \xB7 ",
                  e.category ?? "uncategorized",
                  e.url ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
                    " \xB7 ",
                    /* @__PURE__ */ jsxDEV("a", { href: e.url, target: "_blank", rel: "noopener noreferrer", children: "source \u2197" })
                  ] }) : null
                ] })
              ] })
            ] }))
          ] }))
        ] }),
        /* @__PURE__ */ jsxDEV("footer", { children: "Tier 0 only. Run the discovery pipeline to populate from real sources." })
      ] });
    };
  }
});

// src/app.tsx
var app_exports = {};
__export(app_exports, {
  app: () => app,
  default: () => app_default
});
var app, app_default;
var init_app = __esm({
  "src/app.tsx"() {
    "use strict";
    init_dist();
    init_queries();
    init_cities();
    init_events();
    init_admin();
    init_ics();
    init_me_ics();
    init_home();
    init_jsx_runtime();
    app = new Hono2();
    app.get("/healthz", (c) => c.json({ ok: true, ts: (/* @__PURE__ */ new Date()).toISOString() }));
    app.route("/api/v1/cities", cities);
    app.route("/api/v1/events", events);
    app.route("/api/v1/admin", admin);
    app.route("/calendar.ics", icsApp);
    app.route("/me/calendar.ics", meIcsApp);
    app.get("/", async (c) => {
      const all = await listCities();
      const querySlug = c.req.query("city");
      const selected = querySlug ? await getCityBySlug(querySlug) : all[0] ?? null;
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const weekAhead = new Date(today);
      weekAhead.setDate(today.getDate() + 7);
      const fromQ = c.req.query("from");
      const toQ = c.req.query("to");
      const from = fromQ ? `${fromQ}T00:00:00.000Z` : today.toISOString();
      const to = toQ ? `${toQ}T23:59:59.999Z` : weekAhead.toISOString();
      const sortQ = c.req.query("sort") ?? "date";
      const minRarityQ = c.req.query("min_rarity");
      const minRarity = minRarityQ ? parseFloat(minRarityQ) : null;
      const categoryQ = c.req.query("category");
      const selectedCategories = categoryQ ? categoryQ.split(",").map((s) => s.trim()).filter(Boolean) : [];
      const eventsRows = selected ? await listEvents({
        citySlug: selected.slug,
        from,
        to,
        limit: 500,
        offset: 0,
        ...selectedCategories.length > 0 ? { categories: selectedCategories } : {},
        ...minRarity !== null ? { minRarity } : {}
      }) : [];
      const allEventsForCats = selected ? await listEvents({ citySlug: selected.slug, from, to, limit: 500, offset: 0 }) : [];
      const allCategories = [
        ...new Set(
          allEventsForCats.map((e) => e.category).filter((cat) => Boolean(cat))
        )
      ].sort();
      const rareCount = eventsRows.filter((e) => e.rarity_score >= 0.6).length;
      return c.html(
        /* @__PURE__ */ jsxDEV(
          Home,
          {
            cities: all,
            selectedCity: selected,
            from,
            to,
            events: eventsRows,
            totalCount: eventsRows.length,
            sort: sortQ,
            minRarity,
            selectedCategories,
            allCategories,
            rareCount
          }
        )
      );
    });
    app_default = app;
  }
});

// src/vercel-entry.ts
var _app = null;
var _appError = null;
async function getApp() {
  if (_appError) throw _appError;
  if (_app) return _app;
  try {
    const mod = await Promise.resolve().then(() => (init_app(), app_exports));
    _app = mod.app;
    return _app;
  } catch (e) {
    _appError = e instanceof Error ? e : new Error(String(e));
    throw _appError;
  }
}
async function handler(request) {
  try {
    const app2 = await getApp();
    return await app2.fetch(request);
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}

${e.stack ?? ""}` : String(e);
    return new Response("EXM_ERR\n\n" + msg, {
      status: 500,
      headers: { "Content-Type": "text/plain" }
    });
  }
}
export {
  handler as default
};
//# sourceMappingURL=%5B...path%5D.mjs.map
