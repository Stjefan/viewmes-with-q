<template>
  <q-page padding>
    <!-- content -->
    <div class="row">
      <q-input
        type="date"
        :model-value="currentDate"
        @update:model-value="foo"
      />
      <q-input
        type="number"
        v-model.number="maxYAxisLr"
        label="Max. Y-Achse Lr"
      />
      <q-input
        type="number"
        v-model.number="intervalYAxisLr"
        label="Intervall Y-Achse Lr"
      />
      <q-select
        class="col-3"
        v-model="selectedImmissionsort"
        option-label="name"
        :options="immissionsortOptions"
        label="Immissionsort"
      />
    </div>
    <div id="lrPlot" style="height: 80vh"></div>
  </q-page>
</template>

<script>
import Plotly from "plotly.js";
import { onMounted, ref, watch, computed } from "vue";
import { api, queryApi } from "../boot/axios";
const dayjs = require("dayjs");
import { useQuasar } from "quasar";
import { useStore } from "vuex";
import _ from "lodash";

export default {
  // name: 'PageName',
  setup() {
    const store = useStore();
    const $q = useQuasar();
    const currentDate = computed(() =>
      dayjs(store.state.example.currentlySelectedDateTime).format("YYYY-MM-DD")
    ); // ref(dayjs().format("YYYY-MM-DD"));
    const projektbezeichnung = store.state.example.projektbezeichnung;
    const immissionsortOptions = store.state.example.immissionsortOptions;
    const selectedImmissionsort = ref(immissionsortOptions[0]);
    const intervalYAxisLr = ref(50);
    const maxYAxisLr = ref(50);

    watch([maxYAxisLr, intervalYAxisLr], () => {
      updateLayout(
        currentDate.value,
        maxYAxisLr.value,
        intervalYAxisLr.value,
        `IO ${selectedImmissionsort.value.id}`
      );
    });

    watch([currentDate, selectedImmissionsort], (newVal, oldVal) => {
      console.log("Wachting currentDate", newVal, oldVal);
      updateLayout(
        currentDate.value,
        maxYAxisLr.value,
        intervalYAxisLr.value,
        `IO ${selectedImmissionsort.value.id}`
      );
      plotLr(selectedImmissionsort.value, currentDate.value);
    });

    function getHoursBeurteilungszeitraum(i) {
      let startingHour = 0;
      let endingHour = 0;
      if (i == 6) {
        startingHour = 6;
        endingHour = 22;
      } else if (i == 7) {
        startingHour = 22;
        endingHour = 23;
      } else if (i == 8) {
        startingHour = 23;
        endingHour = 24;
      } else {
        startingHour = i;
        endingHour = i + 1;
      }
      return { startingHour, endingHour };
    }

    onMounted(() => {
      createPlot();
      updateLayout(
        currentDate.value,
        maxYAxisLr.value,
        intervalYAxisLr.value,
        `IO ${selectedImmissionsort.value.id}`
      );
      plotLr(selectedImmissionsort.value, currentDate.value);
    });

    function plotLr(io, myDate) {
      console.log(dayjs.locale("de"));
      console.log(dayjs.locale());
      $q.loading.show();
      console.log("On mounted");
      let immissionsort = `${io.id}`; // "IO 1";

      // simplePlot();
      const idsBeurteilungszeitraum = [0, 1, 2, 3, 4, 5, 6, 7, 8];

      const myPromiseArray = idsBeurteilungszeitraum.map((i) => {
        const { startingHour, endingHour } = getHoursBeurteilungszeitraum(i);
        console.log("startingHour", startingHour, endingHour);

        const startBeurteilungszeitraum =
          dayjs
            .tz(dayjs(myDate), "Europe/Berlin")
            .add(startingHour, "hour")
            .format("YYYY-MM-DDTHH:mm:ss") + "Z";
        const endBeurteilungszeitraum =
          dayjs
            .tz(dayjs(myDate), "Europe/Berlin")
            .add(endingHour, "hour")
            .format("YYYY-MM-DDTHH:mm:ss") + "Z";

        console.log(startBeurteilungszeitraum, endBeurteilungszeitraum);

        const verursachers = [
          "gesamt",
          "mp1_ohne_ereignis",
          "mp2_ohne_ereignis",
          "mp3_ohne_ereignis",
          "mp4_ohne_ereignis",
          "mp5_ohne_ereignis",
          "mp5_vorbeifahrt",
          "mp6_ohne_ereignis",
        ];
        const fluxQueryLr = `from(bucket: "dauerauswertung_immendingen")
  |> range(start: ${startBeurteilungszeitraum}, stop: ${endBeurteilungszeitraum})
  |> filter(fn: (r) => r["_measurement"] == "auswertung_${projektbezeichnung}_lr")
  |> filter(fn: (r) => r["_field"] == "lr")
  |> filter(fn: (r) => r["immissionsort"] == "${immissionsort}")`; //   |> filter(fn: (r) => r["verursacher"] == "${v}")

        console.log(i, fluxQueryLr);

        return queryApi.collectRows(fluxQueryLr);
        if (false) {
          return api.get(
            `http://localhost:8000/dauerauswertung/lr?datetime__gt=${startBeurteilungszeitraum}&datetime__lt=${endBeurteilungszeitraum}&immissionsort__name=${immissionsort}`
          );
        }
      });
      return Promise.all(myPromiseArray).then((lrCalls) => {
        const totalResult = {};
        for (let beurteilungszeitraum of idsBeurteilungszeitraum) {
          let grouped = _.groupBy(lrCalls[beurteilungszeitraum], "verursacher");
          let result = {};
          let justOnce = true;
          for (let g in grouped) {
            result[g] = {
              x: grouped[g].map(
                (i) =>
                  dayjs
                    .tz(dayjs(i._time.slice(0, -1)))
                    .format("YYYY-MM-DDTHH:mm:ss") + "Z"
              ),
              y: grouped[g].map((i) => i._value),
            };
            if (justOnce) {
              const grenzwert =
                beurteilungszeitraum != 6 ? io.gw_nacht : io.gw_tag;
              result["grenzwert"] = {
                x: grouped[g].map(
                  (i) =>
                    dayjs
                      .tz(dayjs(i._time.slice(0, -1)))
                      .format("YYYY-MM-DDTHH:mm:ss") + "Z"
                ),
                y: grouped[g].map((i) => grenzwert),
              };
              justOnce = false;
            }
          }

          console.log(result);
          if (false) {
            if (beurteilungszeitraum == 6) {
              result["grenzwert"] = {
                x: [
                  new Date(
                    myDate +
                      "T" +
                      `${getBeurteilungszeitraumHours(beurteilungszeitraum)[0]
                        .toString()
                        .padStart(2, "0")}:00`
                  ),
                  new Date(
                    myDate +
                      "T" +
                      `${getBeurteilungszeitraumHours(beurteilungszeitraum)[1]
                        .toString()
                        .padStart(2, "0")}:00`
                  ),
                ],
                y: [grenzwert_tag, grenzwert_tag],
              };
            } else {
              result["grenzwert"] = {
                x: [
                  new Date(
                    myDate +
                      "T" +
                      `${getBeurteilungszeitraumHours(beurteilungszeitraum)[0]
                        .toString()
                        .padStart(2, "0")}:00`
                  ),
                  new Date(
                    myDate +
                      "T" +
                      `${getBeurteilungszeitraumHours(beurteilungszeitraum)[1]
                        .toString()
                        .padStart(2, "0")}:00`
                  ),
                ],
                y: [grenzwert_nacht, grenzwert_nacht],
              };
            }
          }

          console.log(result);
          totalResult[beurteilungszeitraum] = result;
        }
        console.log(totalResult);

        updateChartData(totalResult);

        $q.loading.hide(totalResult);

        console.log("Promise ended", totalResult);
      });
    }

    const colorClasses = {
      gesamt: "blue",
      grenzwert: "red",
      mp1: "magenta",
      mp2: "green",
      mp3: "yellow",
      mp4: "orange",
      mp5: "purple",
      mp1_ohne_ereignis: "magenta",
      mp2_ohne_ereignis: "green",
      mp3_ohne_ereignis: "yellow",
      mp4_ohne_ereignis: "orange",
      mp5_ohne_ereignis: "purple",
      mp6_ohne_ereignis: "rosegreen",
    };

    function mapVerursacherNames(name) {
      const myMapping = {
        gesamt: "Lr",
        mp1_ohne_ereignis: "Anteil von MP 1",
        mp2_ohne_ereignis: "Anteil von MP 2",
        mp3_ohne_ereignis: "Anteil von MP 3",
        mp4_ohne_ereignis: "Anteil von MP 4",
        mp5_ohne_ereignis: "Anteil von MP 5 ohne Vorbeifahrt",
        mp5_vorbeifahrt: "Anteil von erkannten Vorbeifahrten an MP 5",
        mp6_ohne_ereignis: "Anteil von MP 6",
        grenzwert: "Grenzwert",
      };
      let result = myMapping[name];
      if (result != undefined) return result;
      else return name;
    }

    function updatePlotlyLayout(target, args) {
      const graphDiv = document.getElementById(target);
      console.log("Before error?");
      Plotly.relayout(graphDiv, args);
    }

    function updateChartData(updateData) {
      console.log("updateChartData", updateData);
      // console.log("Update data", updateData);
      const myTraces = [];
      const idsBeurteilungszeitraum = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      let hasBeenExecuted = {};
      for (let j of idsBeurteilungszeitraum) {
        const graphDiv = document.getElementById("lrPlot");
        //console.log(j);
        //console.log(graphDiv.data);
        const indices = graphDiv.data
          .map((i, idx) => ({
            is_searched: (i.xaxis === j + 1) != 1 ? `x${j + 1}` : "x",
            index: idx,
          }))
          .filter((i) => i.is_searched)
          .map((i) => i.index);

        //console.log("delete", indices);
        Plotly.deleteTraces(graphDiv, indices);

        if (Object.keys(updateData[j]).length == 0) {
          const myTrace = {
            x: [],
            y: [],
            xaxis: `x${j + 1}`,
            yaxis: `y${j + 1}`,
            line: {
              color: "rgb(82, 82, 82)",
            },
            showlegend: false,
          };
          myTraces.push(myTrace);
        }

        for (let v in updateData[j]) {
          if (updateData[j][v] == undefined) continue;
          const myTrace = {
            x: updateData[j][v].x,
            y: updateData[j][v].y,
            xaxis: `x${j + 1}`,
            yaxis: `y${j + 1}`,
            legendgroup: v,
            line: {
              color: colorClasses[v], //"rgb(82, 82, 82)",
            },
            showlegend: hasBeenExecuted[v] == undefined,
            name: mapVerursacherNames(v),
          };
          hasBeenExecuted[v] = true;
          myTraces.push(myTrace);
        }
        if (myTraces.length > 0) {
          // console.log(hasBeenExecuted);
          Plotly.addTraces(graphDiv, myTraces);
        }
      }
    }
    function updateData() {
      const graphDiv = document.getElementById("lrPlot");
      Plotly.deleteTraces(graphDiv, [...Array(graphDiv.data.length).keys()]);
      console.log("??");

      const myTraces = [];

      for (let v of ["lr", "grenzwert"]) {
        for (let i of [...Array(9).keys()]) {
          const myTime = new Date(2022, 6, 8);
          myTime.setHours(i);
          const myTrace = {
            x: [...Array(12).keys()].map((ii) =>
              myTime.setMinutes(5 * (ii + 1))
            ),
            y: [...Array(12).keys()].map((ii) => Math.random() * 10),
            xaxis: `x${i + 1}`,
            yaxis: `y${i + 1}`,
            legendgroup: v,
            line: {
              color: colorClasses[v], //"rgb(82, 82, 82)",
            },
            showlegend: i == 1,
          };
          myTraces.push(myTrace);
        }
      }
      console.log(myTraces);

      Plotly.addTraces(graphDiv, myTraces);
      //Plotly.update(graphDiv, data_update, layout_update);
    }

    function createPlot() {
      const plotData = [];
      for (let i = 1; i < 10; i++) {
        plotData.push({
          x: [],
          y: [],
          type: "line",
          xaxis: `x${i}`,
          yaxis: `y${i}`,
          //name: mapVerursacherNames(v),
          // legendgroup: v,
          line: {
            // color: colorClasses[v], //"rgb(82, 82, 82)",
          },
          showlegend: i == 1,
        });
      }
      const config = { responsive: true, locale: "de" };
      Plotly.newPlot("lrPlot", plotData, createLaylout(), config);
    }

    function createLaylout() {
      let layout = {
        title: "Beurteilungspegel",

        legend: {
          x: 1,
          y: 0.25,
          xanchor: `auto`,
          yanchor: `top`,
          // orientation: "h",
          font: {
            // size: 8,
          },
        },
      };
      for (let i = 1; i < 10; i++) {
        if (i == 7) {
          const axis7 = {};
          axis7[`yaxis${i}`] = {
            domain: [0.35, 0.65],
            anchor: `x7`,
          };

          axis7[`xaxis${i}`] = { anchor: `y${i}`, type: "date" };

          layout = { ...layout, ...axis7 };
        } else {
          layout = { ...layout, ...builder(i) };
        }
      }

      //console.log(i);
      // console.log(layout);
      return layout;
    }
    function builder(j) {
      const myResult = {};
      const i = j;
      myResult[`xaxis${i}`] = {
        domain: [0.17 * (i - 1), 0.17 * i - 0.02],
        anchor: `y${i}`,
        type: "date",
        /*
    range: [
      chosenDay.getTime() + (i - 1) * 3600 * 1000,
      chosenDay.getTime() + i * 3600 * 1000,
    ],
    */
      };
      myResult[`yaxis${i}`] = {
        domain: [0.75, 1],
        anchor: `x${i}`,
        // range: [maxYAxis - rangeYAxis, maxYAxis],
      };
      if (j >= 8) {
        myResult[`xaxis${i}`].domain = [0.17 * (j - 8), 0.17 * (j - 7) - 0.02];
        // myResult[`xaxis${i}`].range[0] += 15 * 1000 * 3600;
        // myResult[`xaxis${i}`].range[1] += 15 * 1000 * 3600;
        myResult[`yaxis${i}`].domain = [0, 0.25];
      }

      return myResult;
    }

    function updateLayout(myDate, maxYAxisLr, intervalYAxisLr, selectedIO) {
      console.log(myDate);
      const vorhandeneBeurteilungszeitraeume = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      let myUpdateArgs = [];
      for (let i of vorhandeneBeurteilungszeitraeume) {
        const { startingHour, endingHour } = getHoursBeurteilungszeitraum(i);
        console.log(startingHour, endingHour);
        const startBeurteilungszeitraum = dayjs(myDate)
          .add(startingHour, "hour")
          .format("YYYY-MM-DDTHH:mm:ss");

        const endBeurteilungszeitraum = dayjs(myDate)
          .add(endingHour, "hour")
          .format("YYYY-MM-DDTHH:mm:ss");

        let myKey = i == 0 ? "xaxis.range" : `xaxis${i + 1}.range`;

        myUpdateArgs[myKey] = [
          startBeurteilungszeitraum,
          endBeurteilungszeitraum,
        ];

        myUpdateArgs[`yaxis${i == 0 ? "" : i + 1}.range`] = [
          maxYAxisLr - intervalYAxisLr,
          maxYAxisLr,
        ];
      }
      myUpdateArgs = {
        ...myUpdateArgs,
        ...{
          title: `${selectedIO} am ${dayjs(myDate).format("DD.MM.YY")}`,
        },
      };
      updatePlotlyLayout("lrPlot", myUpdateArgs);
    }

    function foo(args) {
      store.commit("setDateTime", args);
    }

    return {
      foo,
      currentDate,
      intervalYAxisLr,
      maxYAxisLr,
      selectedImmissionsort,
      immissionsortOptions,
      store,
    };
  },
};
</script>
