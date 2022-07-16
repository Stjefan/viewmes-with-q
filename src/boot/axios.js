import { boot } from "quasar/wrappers";
import axios from "axios";
import _ from "lodash";

import {
  setupCache,
  buildMemoryStorage,
  defaultKeyGenerator,
  defaultHeaderInterpreter,
} from "axios-cache-interceptor";

import { Notify } from "quasar";

import { terzProps } from "./utility";
const api = setupCache(
  // axios instance
  axios.create(),

  // All options with their default values
  {
    // The storage to save the cache data. There are more available by default.
    //
    // https://axios-cache-interceptor.js.org/#/pages/storages
    storage: buildMemoryStorage(),

    // The mechanism to generate a unique key for each request.
    //
    // https://axios-cache-interceptor.js.org/#/pages/request-id
    generateKey: defaultKeyGenerator,

    // The mechanism to interpret headers (when cache.interpretHeader is true).
    //
    // https://axios-cache-interceptor.js.org/#/pages/global-configuration?id=headerinterpreter
    headerInterpreter: defaultHeaderInterpreter,
    cache: {
      update: {
        ["lafeq"]: (cachedValue, response) => {
          console.log("from update");
        },
      },
    },

    // The function that will receive debug information.
    // NOTE: For this to work, you need to enable development mode.
    //
    // https://axios-cache-interceptor.js.org/#/pages/development-mode
    // https://axios-cache-interceptor.js.org/#/pages/global-configuration?id=debug
    debug: undefined,
  }
);

function lrInterceptor(response) {
  console.log("show");
  // Loading.show()
  if (response.data) {
    console.log("response in lrInterceptor", response.data);
    let grouped = _.groupBy(response.data.results, "verursacht");
    let result = {};
    for (let v in grouped) {
      result[v] = {
        x: grouped[v].map((i) => i.datetime),
        y: grouped[v].map((i) => i.lr),
      };
    }
    /*
    if (beurteilungszeitraum == 6) {
      result["grenzwert"] = {
        x: [new Date(myDate + "T" + `${(getBeurteilungszeitraumHours(beurteilungszeitraum)[0].toString()).padStart(2, '0')}:00`), new Date(myDate + "T" + `${(getBeurteilungszeitraumHours(beurteilungszeitraum)[1]).toString().padStart(2, '0')}:00`)],
        y: [grenzwert_tag, grenzwert_tag]
      }

    } else {
      result["grenzwert"] = {
        x: [new Date(myDate + "T" + `${(getBeurteilungszeitraumHours(beurteilungszeitraum)[0].toString()).padStart(2, '0')}:00`), new Date(myDate + "T" + `${(getBeurteilungszeitraumHours(beurteilungszeitraum)[1]).toString().padStart(2, '0')}:00`)],
        y: [grenzwert_nacht, grenzwert_nacht]
      }

    }
    */
    response.data = result;
  }
}

function meteInterceptor(response) {
  const result = {};
  const properties = [
    "rain",
    "temperature",
    "windspeed",
    "winddirection",
    "humidity",
    "pressure",
    "datetime",
  ];
  for (const p of properties) {
    result[p] = [];
  }

  for (let v of response.data.results) {
    for (const p of properties) {
      result[p].push(v[p]);
    }
  }
  console.log(result);
  response.data = result;
  console.log("Mete HANDLER");
}

function resuInterceptor(response) {
  const result = {};
  const properties = ["lafeq", "datetime"];
  for (const p of properties) {
    result[p] = [];
  }

  for (let v of response.data.results) {
    for (const p of properties) {
      result[p].push(v[p]);
    }
  }
  result["response"] = response.data.results;
  console.log(result);
  response.data = result;
}

function terzInterceptor(response) {
  const result = {};
  console.log(terzProps);

  for (let v of response.data.results) {
    result[v.datetime] = [];

    let counter = 0;

    for (const p of terzProps) {
      result[v.datetime].push(v[p]);
    }
  }
  console.log(result);
  response.data = result;
  console.log("Terz HANDLER");
}

api.interceptors.response.use(
  function (response) {
    console.log("response.config.url", response.config.url);
    if (response.config.url.includes("resu")) {
      console.log("RESU HANDLER");
      resuInterceptor(response);
    }
    if (response.config.url.includes("terz")) {
      console.log("Terz HANDLER");
      terzInterceptor(response);
    }
    if (response.config.url.includes("lr")) {
      console.log("LR HANDLER");
      lrInterceptor(response);
    }
    if (response.config.url.includes("mete")) {
      meteInterceptor(response);
    }
    if (response.config.url.includes("erkennung")) {
      console.log("handle erkennung");
    }
    if (response.config.url.includes("aussortierung")) {
      console.log("handle aussortierung");
      aussortierungInterceptor(response);
    }
    let { data, cached, id } = response;
    console.log("Data is from cache:", cached, "id", id);
    // Loading.hide()
    return response;
  },
  function (error) {
    // Do something with request error
    // or with a config object:
    Notify.create({
      message: `${error.message}`,
    });
    return Promise.reject(error);
  }
);

function aussortierungInterceptor(response) {
  console.log("show");
  // Loading.show()
  if (response.data) {
    console.log("response in aussortierungInterceptor", response.data);
    response.data = response.data.results;
  }
}
// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
// const api = axios.create({ baseURL: 'https://api.example.com' })

const token =
  "0ql08EobRW6A23j97jAkLyqNKIfQIKJS9_Wrw4mWIqBu795dl4cSfaykizl261h-QwY9BPDMUXbDCuFzlPQsfg==";
const org = "kufi";
const bucket = "dauerauswertung_immendingen";
const headers = { Authorization: `Token ${token}` };
axios.defaults.headers.common["Authorization"] = `Token ${token}`;

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
