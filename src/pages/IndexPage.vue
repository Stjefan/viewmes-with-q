<template>
  <q-page class="flex flex-center">
    <q-btn label="Load from django" @click="load"></q-btn>
    <div class="row">
      <div id="plot_lr_1" class="col-2" />
      <div id="plot_lr_2" class="col-2" />
    </div>
    <div class="row">
      <div id="plot_lr_6" />
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";

import { api } from "../boot/axios";
import Plotly from "plotly.js";

export default defineComponent({
  name: "IndexPage",
  setup() {
    async function load() {
      console.log("load");
      const query_p = "http://localhost:8000/tsdb/projekt/";
      const p = await api.get(query_p);
      const ursachen = p.data[0].laermursacheanimmissionsorten_set;
      for (let h of [1, 2, 6]) {
        const promises = ursachen.map((u) =>
          api.get(
            `http://localhost:8000/tsdb/lr/?verursacht=${u.id}&immissionsort=51&time_after=2022-12-02T0${h}%3A00%3A00&time_before=2022-12-02T0${h}%3A59%3A59`
          )
        );
        const query1 =
          "?verursacht=54&immissionsort=51&time_after=2022-12-02T06%3A00%3A00&time_before=2022-12-02T21%3A59%3A59";
        const query2 =
          "?verursacht=53&immissionsort=51&time_after=2022-12-02T06%3A00%3A00&time_before=2022-12-02T21%3A59%3A59";
        Promise.all(
          promises
          /*[
        api.get(`http://localhost:8000/tsdb/lr/${query1}`),
        api.get(`http://localhost:8000/tsdb/lr/${query2}`),
      ]*/
        ).then((responses) => {
          console.log(responses);
          Plotly.newPlot(
            `plot_lr_${h}`,
            responses.map((response) => ({
              x: response.data.map((i) => i.time),
              y: response.data.map((i) => i.pegel),
            })),
            {
              margin: { t: 0 },
            },
            { responsive: true }
          );
        });
      }
    }
    return { load };
  },
});
</script>
