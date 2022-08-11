import {
  InfluxDB,
  FluxTableMetaData,
} from "@influxdata/influxdb-client-browser";

import { boot } from "quasar/wrappers";

const url = "http://localhost:8086";
const token =
  "S3Ou7vqKvLFCkqDG8UgPnGnBVzvR5VngWc3HCzaW2qXQlEvr9-ggfuXIKXzKvzkOozd0kNnKCsZxhDywNG8gTA=="; // KUFI-Server
//"QRNlK60Noca9m2WIjgUSHaE3C1PGnzNZ-qHY1MajJBSDIjkpJdxPwJ1bG11cOYJREvLgEp8D5h_xH1AhvgvBww==";
// "8Zy8LG2UcsS96F3WqPnW7yjUXGVso64AfOfVe6Wiqw4-ysUkWBvq3jKB1W8jbfoZVGhD9IJ7wazX-uSCtHiGWw==";
const org = "kufi";
const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$influx = queryApi;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { queryApi };
