<template>
  <q-page padding>
    <!-- content -->
    <q-input type="date" :model-value="currentDate" @update:model-value="foo" />
    <div id="mete-charts" style="height: 75vh" />
  </q-page>
</template>

<script>
function updatePlotlyLayout(target, args) {
  const graphDiv = document.getElementById(target);
  Plotly.relayout(graphDiv, args);
}

import { onMounted, ref, watch, computed } from "vue";
import { api } from "../boot/axios";
const dayjs = require("dayjs");
import Plotly from "plotly.js";
import { useQuasar } from "quasar";
import { useStore } from "vuex";

export default {
  // name: 'PageName',
  setup(props) {
    const $q = useQuasar();
    const store = useStore();
    // const currentDate = ref(dayjs().format("YYYY-MM-DD"));
    const currentDate = computed(() =>
      dayjs(store.state.example.currentlySelectedDateTime).format("YYYY-MM-DD")
    ); // ref(dayjs().format("YYYY-MM-DD"));

    onMounted(() => {
      console.log("On mounted");
      createMetePlot();
      plotMete(currentDate.value);
    });

    watch(currentDate, (newVal, oldVal) => {
      console.log("Wachting currentDate", newVal, oldVal);
      plotMete(newVal);
    });

    function plotMete(targetDate) {
      $q.loading.show();
      const nextDay = dayjs(targetDate).add(1, "day").format("YYYY-MM-DD");
      return api
        .get(
          `http://localhost:8000/dauerauswertung/metecharts/?datetime__gt=${targetDate}&datetime__lt=${nextDay}`
        )
        .then((meteCall) => {
          console.log("results", meteCall.data);

          updateChartData(meteCall.data);
          $q.loading.hide();

          return meteCall.data;
        });
    }
    function createMetePlot() {
      var data = [
        {
          x: [], // myData.x,
          y: [], // myData.regen,
          type: "bar",
          xaxis: "x1",
          yaxis: "y1",
          name: "Regen",
        },
        {
          x: [], //myData.x,
          y: [], // myData.temperature,
          type: "line",
          xaxis: "x2",
          yaxis: "y2",
          name: "Temperatur",
        },
        {
          x: [], // myData.x,
          y: [], // myData.windspeed,
          type: "bar",
          xaxis: "x3",
          yaxis: "y3",
          name: "Windgeschwindigkeit",
        },
        {
          x: [], // myData.x,
          y: [], // myData.humidity,
          type: "bar",
          xaxis: "x4",
          yaxis: "y4",
          name: "Luftfeuchtigkeit",
        },
        {
          x: [], // myData.x,
          y: [], // myData.pressure,
          type: "bar",
          xaxis: "x5",
          yaxis: "y5",
          name: "Luftdruck",
        },
      ];

      // window.Plotly.newPlot("mete-charts", data, layout);

      const polardata = [
        {
          type: "scatterpolar",
          mode: "markers",
          r: [], // myData.x,
          theta: [], // myData.winddirection,
          line: {
            color: "black",
          },
          subplot: "polar",
          name: "Windrichtung",
        },
      ];

      // window.Plotly.newPlot("polarcharts", polardata, polarlayout);

      const multiplotLayout = {
        title: "Wetterübersicht",
        xaxis: {
          domain: [0, 0.5],
          anchor: "y1",
          type: "date",
          //range: [shownDate.getTime(), shownDate.getTime() + 24 * 3600 * 1000],
        },
        yaxis: {
          domain: [0.0, 0.22],
          anchor: "x1",
          title: "Regen [mm]",
          range: [0, 10],
        },
        polar: {
          domain: {
            x: [0.65, 1],
            y: [0.25, 1],
          },
          radialaxis: {
            //type: "date",
            visible: true,
            //range: [shownDate.getTime(), shownDate.getTime() + 24 * 3600 * 1000],
          },
        },
        xaxis2: {
          domain: [0, 0.5],
          anchor: "y2",
          type: "date",
          // range: [shownDate.getTime(), shownDate.getTime() + 24 * 3600 * 1000],
        },
        yaxis2: {
          domain: [0.25, 0.48],
          anchor: "x2",
          title: "Temperatur [°C]",
        },
        xaxis3: {
          domain: [0, 0.5],
          anchor: "y3",
          type: "date",

          // range: [shownDate.getTime(), shownDate.getTime() + 24 * 3600 * 1000],
        },
        yaxis3: {
          domain: [0.5, 0.73],
          anchor: "x3",
          title: "Windgeschwindigkeit [m/s]",
        },
        xaxis4: {
          domain: [0, 0.5],
          anchor: "y4",
          type: "date",
          // range: [shownDate.getTime(), shownDate.getTime() + 24 * 3600 * 1000],
        },
        yaxis4: {
          domain: [0.75, 0.98],
          anchor: "x4",
          title: "Luftdruck [mbar]",
          range: [900, 1050],
        },
        xaxis5: {
          domain: [0.65, 1],
          anchor: "y5",
          type: "date",

          // range: [shownDate.getTime(), shownDate.getTime() + 24 * 3600 * 1000],
        },
        yaxis5: {
          domain: [0.0, 0.15],
          anchor: "x5",
          title: "Luftfeuchtigkeit",
        },
      };
      //data.push(polardata[0]);
      var config = { responsive: true, locale: "de" };
      Plotly.newPlot("mete-charts", data, multiplotLayout, config);
    }

    function updateChartData(updateData) {
      const myTraces = [];
      const graphDiv = document.getElementById("mete-charts");

      Plotly.deleteTraces(graphDiv, [...graphDiv.data.keys()]);

      const properties = [
        "rain",
        "temperature",
        "windspeed",
        "winddirection",
        "humidity",
        "pressure",
      ];
      const styling = {
        rain: {
          color: "blue",
          type: "bar",
          name: "Regen",
        },
        temperature: {
          color: "red",
          type: "line",
          name: "Temperatur",
        },
        windspeed: {
          color: "blue",
          type: "bar",
          name: "Windgeschwindigkeit",
        },
        pressure: {
          color: "blue",
          type: "bar",
          name: "Luftdruck",
        },
        humidity: {
          color: "blue",
          type: "bar",
          name: "Luftfeuchtigkeit",
        },
        winddirection: {
          color: "red",
          name: "Windrichtung",
        },
      };
      const prop2Axis = {
        rain: ["x1", "y1"],
        temperature: ["x2", "y2"],
        windspeed: ["x3", "y3"],
        pressure: ["x4", "y4"],
        humidity: ["x5", "y5"],
        winddirection: "polar",
      };

      console.log(updateData);

      for (let p of properties) {
        console.log(p);
        let myTrace;
        if (p != "winddirection") {
          myTrace = {
            x: updateData["datetime"],
            y: updateData[p],
            xaxis: prop2Axis[p][0],
            yaxis: prop2Axis[p][1],
            type: styling[p]["type"],
            marker: {
              color: styling[p]["color"], //"rgb(82, 82, 82)",
            },
            line: {
              color: styling[p]["color"], //"rgb(82, 82, 82)",
            },
            name: styling[p]["name"],
          };
        } else {
          console.log(updateData);
          myTrace = {
            type: "scatterpolar",
            mode: "markers",
            r: updateData["datetime"], // myData.x,
            theta: updateData[p], // myData.winddirection,
            line: {
              color: "red",
            },
            subplot: "polar",
            name: "Windrichtung",
          };
        }
        myTraces.push(myTrace);
      }
      Plotly.addTraces(graphDiv, myTraces);
    }
    function foo(args) {
      store.commit("setDateTime", args);
    }

    return { currentDate, foo };
  },
};
</script>
