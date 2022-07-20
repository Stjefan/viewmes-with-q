<template>
  <q-page padding>
    <!-- content -->
    <div class="row">
      <q-input
        type="datetime-local"
        :model-value="selectedTimePoint"
        step="1"
        @update:model-value="foo"
      />
      <q-select
        :options="messpunktOptions"
        v-model="selectedMesspunkt"
        class="col-3"
        label="Messpunkt"
        option-label="name"
      />
      <q-input
        type="number"
        v-model.number="maxYAxisResu"
        label="Max. Y-Achse LAFeq"
      />
      <q-input
        type="number"
        v-model.number="intervalYAxisResu"
        label="Intervall Y-Achse LAFeq"
      />
      <q-input
        type="number"
        v-model.number="maxYAxisTerz"
        label="Max. Y-Achse Terzfrequenzen"
      />
      <q-input
        type="number"
        v-model.number="intervalYAxisTerz"
        label="Intervall Y-Achse Terzfrequenzen"
      />
    </div>
    <div id="resuPlot" style="height: 40vh" />
    <div id="terzPlot" style="height: 40vh" />
  </q-page>
</template>

<script>
import Plotly from "plotly.js";
import { onMounted, ref, watch, computed } from "vue";
import { api, queryApi } from "../boot/axios";
const dayjs = require("dayjs");
import { useQuasar } from "quasar";
import { useStore } from "vuex";
import { terzProps } from "../boot/utility";

export default {
  // name: 'PageName',
  setup() {
    const store = useStore();
    const $q = useQuasar();

    const currentDateTime = `2022-07-11T07:00:00`;
    const currentDay = dayjs(currentDateTime)
      .format("YYYY-MM-DDTHH:mm:ss")
      .replaceAll(":", "%3A");

    let currentTerzData = null;

    const intervalYAxisTerz = ref(60);
    const maxYAxisTerz = ref(60);

    const intervalYAxisResu = ref(60);
    const maxYAxisResu = ref(60);

    const projektbezeichnung = store.state.example.projektbezeichnung;

    const messpunktOptions = store.state.example.messpunktOptions; // ["MP 1", "MP 2", "MP 3", "MP 4", "MP 5", "MP 6"];
    const selectedMesspunkt = ref(messpunktOptions[0]);

    const selectedTimePoint = computed(() =>
      dayjs(store.state.example.currentlySelectedDateTime).format(
        "YYYY-MM-DDTHH:mm:ss"
      )
    );

    const selectedTimePointRoundedTo15min = computed(() => {
      const parsed = dayjs(selectedTimePoint.value);
      console.log("Parsed", parsed, selectedTimePoint.value);
      const roundedMinute = Math.floor(parsed.minute() / 15) * 15;

      const doesSetterNotWork = parsed.minute(roundedMinute);
      const doesSetterNotWorkPart2 = doesSetterNotWork.second(0);

      const result = doesSetterNotWorkPart2.format("YYYY-MM-DDTHH:mm:ss");
      return result;
    });

    onMounted(() => {
      createTerzChart();
      createResuCharts(onClickOnResuPoint);
      plotMesspunktEvaluation(
        selectedMesspunkt.value,
        selectedTimePointRoundedTo15min.value,
        selectedTimePoint.value
      );
      updateLayout("resuPlot", {
        "yaxis.range": [
          maxYAxisResu.value - intervalYAxisResu.value,
          maxYAxisResu.value,
        ], // updates the end of the yaxis range)
      });
      updateLayout("terzPlot", {
        "yaxis.range": [
          maxYAxisTerz.value - intervalYAxisTerz.value,
          maxYAxisTerz.value,
        ], // updates the end of the yaxis range)
      });
    });

    function onClickOnResuPoint(arg) {
      console.log(arg);
      //selectedTimePoint.value
      foo(dayjs(arg.points[0].x).format("YYYY-MM-DDTHH:mm:ss"));
      updateTerzData(
        selectedTimePoint.value,
        currentTerzData[selectedTimePoint.value]
      );
    }

    watch([selectedMesspunkt, selectedTimePointRoundedTo15min], (newVal) => {
      plotMesspunktEvaluation(
        selectedMesspunkt.value,
        selectedTimePointRoundedTo15min.value,
        selectedTimePoint.value
      );
    });

    watch(
      [selectedTimePoint, selectedTimePointRoundedTo15min],
      (newVal, oldVal) => {
        console.log("selectedTimePoint changed", newVal, oldVal);
        if (oldVal[1] === newVal[1]) {
          updateTerzData(
            selectedTimePoint.value,
            currentTerzData[selectedTimePoint.value]
          );
        }
        // plotMesspunktEvaluation(selectedTimePointRoundedTo15min.value);
      }
    );

    watch([maxYAxisResu, intervalYAxisResu], () => {
      updateLayout("resuPlot", {
        "yaxis.range": [
          maxYAxisResu.value - intervalYAxisResu.value,
          maxYAxisResu.value,
        ], // updates the end of the yaxis range)
      });
    });

    watch([maxYAxisTerz, intervalYAxisTerz], () => {
      updateLayout("terzPlot", {
        "yaxis.range": [
          maxYAxisTerz.value - intervalYAxisTerz.value,
          maxYAxisTerz.value,
        ], // updates the end of the yaxis range)
      });
    });
    const leftJoin = (objArr1, objArr2, key1, key2) => {
      // O(n^2) - left join
      console.log(objArr1, objArr2, key1, key2);
      return objArr1.map((anObj1) => ({
        joined: objArr2.find((anObj2) => anObj1[key1] === anObj2[key2]),
        ...anObj1,
      }));
    };

    const leftJoinExtended = (objArr1, objArr2, key1, key2a, key2b) => {
      // Poor man's interval marking
      console.log(objArr1, objArr2, key1, key2a);
      return objArr1.map((anObj1) => ({
        ...objArr2.find(
          (anObj2) =>
            anObj1[key1] === anObj2[key2a] || anObj1[key1] === anObj2[key2b]
        ),
        ...anObj1,
      }));
    };

    function plotMesspunktEvaluation(
      selectedMesspunkt,
      selectedDatetimeRoundedTo15min,
      selectedDateTime
    ) {
      $q.loading.show();
      console.log(
        "plotMesspunktEvaluation",
        selectedMesspunkt,
        selectedDatetimeRoundedTo15min,
        selectedDateTime
      );
      const currentDateTime = dayjs(selectedDatetimeRoundedTo15min)
        .format("YYYY-MM-DDTHH:mm:ss")
        .replaceAll(":", "%3A");
      const fifteenMinutesLater =
        dayjs(selectedDatetimeRoundedTo15min)
          .add(15, "minute")
          .format("YYYY-MM-DDTHH:mm:ss") + "Z";

      const targetDate =
        dayjs(selectedDatetimeRoundedTo15min).format("YYYY-MM-DDTHH:mm:ss") +
        "Z";

      console.log("Interval to fetch", targetDate, fifteenMinutesLater);

      const fluxQueryResu = `from(bucket: "dauerauswertung_immendingen")
  |> range(start: ${targetDate}, stop: ${fifteenMinutesLater})
  |> filter(fn: (r) => r["_measurement"] == "messwerte_${projektbezeichnung}_resu")
  |> filter(fn: (r) => r["_field"] == "lafeq")
  |> filter(fn: (r) => r["messpunkt"] == "${selectedMesspunkt.name_in_api}")`;
      const fluxQueryTerz = `from(bucket: "dauerauswertung_immendingen")
  |> range(start: ${targetDate}, stop: ${fifteenMinutesLater})
  |> filter(fn: (r) => r["_measurement"] == "messwerte_${projektbezeichnung}_terz")
  |> filter(fn: (r) => r["messpunkt"] == "${selectedMesspunkt.name_in_api}")`;
      const fluxQueryAussortiert = `from(bucket: "dauerauswertung_immendingen")
  |> range(start: ${targetDate}, stop: ${fifteenMinutesLater})
  |> filter(fn: (r) => r["_measurement"] == "auswertung_${projektbezeichnung}_aussortierung")`;
      const fluxQueryErkennung = `from(bucket: "dauerauswertung_immendingen")
  |> range(start: ${targetDate}, stop: ${fifteenMinutesLater})
  |> filter(fn: (r) => r["_measurement"] == "auswertung_${projektbezeichnung}_erkennung")
 |> sort(columns: ["_time"], desc: false)`;

      return Promise.all([
        queryApi.collectRows(fluxQueryResu),
        queryApi.collectRows(fluxQueryTerz),
        queryApi.collectRows(fluxQueryAussortiert),
        queryApi.collectRows(fluxQueryErkennung),
      ])

        .then(([rowsResu, rowsTerz, rowsAussortiert, rowsErkennung]) => {
          console.log(
            "loaded data",
            rowsResu,
            rowsTerz,
            rowsAussortiert,
            rowsErkennung
          );

          const merged_aussortiert = leftJoin(
            rowsResu,
            rowsAussortiert,
            "_time",
            "_time"
          );

          console.log("Joined", merged_aussortiert);

          const groupedErkennung = _.groupBy(rowsErkennung, "_time");
          const modifiedGroupedErkennung = {};
          console.log("groupedErkennung", groupedErkennung);
          for (let g in groupedErkennung) {
            modifiedGroupedErkennung[g] = {
              start: groupedErkennung[g].find((i) => i._field == "start")
                ._value,

              end: groupedErkennung[g].find((i) => i._field == "stop")._value,
            };
          }

          console.log("modifiedGroupedErkennung", modifiedGroupedErkennung);

          const groupedTerz = _.groupBy(rowsTerz, "_time");
          const modifiedGroupedTerz = {};
          for (let g in groupedTerz) {
            const fields = _.groupBy(groupedTerz[g], "_field");

            const currTerzResults = [];
            for (let p of terzProps) {
              currTerzResults.push(fields[p][0]._value);
            }

            modifiedGroupedTerz[
              dayjs.tz(dayjs(g.slice(0, -1))).format("YYYY-MM-DDTHH:mm:ss")
            ] = currTerzResults;

            groupedTerz[g] = currTerzResults;
          }

          console.log(rowsResu, groupedTerz, rowsAussortiert);

          const resuData = {
            datetime: rowsResu.map(
              (i) =>
                dayjs
                  .tz(dayjs(i._time.slice(0, -1)))
                  .format("YYYY-MM-DDTHH:mm:ss") + "Z"
            ),
            lafeq: rowsResu.map((i) => i._value),
          };

          let erkennungen = [];

          let currIdx = 0;

          for (let g in modifiedGroupedErkennung) {
            let start = modifiedGroupedErkennung[g].start + "Z";
            let end = modifiedGroupedErkennung[g].end + "Z";
            let idxStart = rowsResu.findIndex((i) => i._time === start);
            let idxStop = rowsResu.findIndex((i) => i._time === end);
            if (currIdx >= idxStart) continue;
            for (let i = currIdx; i < idxStart; i++) {
              erkennungen.push(null);
            }
            for (let i = idxStart; i < idxStop; i++) {
              erkennungen.push(rowsResu[i]._value);
            }
            console.log("Interval", idxStart, idxStop);
            currIdx = idxStop;
          }
          console.log(erkennungen);

          updateResuData(
            resuData.datetime,
            resuData.lafeq,

            erkennungen, // merged.map((i) => (i.reason != null ? i.lafeq : null))
            merged_aussortiert.map((i) => (i.joined ? i._value : null))
          );
          console.log(modifiedGroupedTerz, selectedDateTime);
          currentTerzData = modifiedGroupedTerz;
          updateTerzData(
            selectedDateTime,
            modifiedGroupedTerz[selectedDateTime]
          );
        })
        .finally(() => {
          $q.loading.hide();
        });

      if (false) {
      }
    }

    const frequencies = [
      "20.00 Hz",
      "25.00 Hz",
      "31.50 Hz",
      "40.00 Hz",
      "50.00 Hz",
      "63.00 Hz",
      "80.00 Hz",
      "100.00 Hz",
      "125.00 Hz",
      "160.00 Hz",
      "200.00 Hz",
      "250.00 Hz",
      "315.00 Hz",
      "400.00 Hz",
      "500.00 Hz",
      "630.00 Hz",
      "800.00 Hz",
      "1000.00 Hz",
      "1.25 kHz",
      "1.60 kHz",
      "2.00 kHz",
      "2.50 kHz",
      "3.15 kHz",
      "4.00 kHz",
      "5.00 kHz",
      "6.30 kHz",
      "8.00 kHz",
      "10.00 kHz",
      "12.50 kHz",
      "16.00 kHz",
      "20.00 kHz",
      // "Gesamt",
    ];

    function updateResuData(
      datetime_arr,
      lafeq_arr,
      vorbeifahrt_arr = [],
      aussortiert_arr = []
    ) {
      console.log("updateResu", datetime_arr, lafeq_arr, aussortiert_arr);
      console.log(aussortiert_arr);

      // Plotly.deleteTraces(graphDiv, [...graphDiv.data.keys()]);

      const data_update = {
        x: datetime_arr.length == 0 ? [] : [datetime_arr],
        y:
          datetime_arr.length == 0
            ? [[], [], []]
            : [lafeq_arr, vorbeifahrt_arr, aussortiert_arr],
        // mode: "markers",
        // marker: { size: 16 },
      };
      console.log("...", data_update);

      const layout_update = {
        //"xaxis.range": [0, 10], // updates the xaxis range
      };

      const graphDiv = document.getElementById("resuPlot");
      Plotly.update(graphDiv, data_update, layout_update, [0, 1, 2]);
    }
    function updateTerzData(selectedDateTime, data) {
      console.log("updateTerzData???", data);
      let data_update = {
        y: [],
        // mode: "markers",
        // marker: { size: 16 },
        marker: {
          color: "rgb(142,124,195)",
        },
      };
      if (data == null) {
        data_update.y = [[]];
      } else {
        data_update.y = [data];
      }

      const layout_update = {
        title: `Terze um ${dayjs(selectedDateTime).format("HH:mm:ss")}`,
        //"xaxis.range": [0, 10], // updates the xaxis range
      };
      const graphDiv = document.getElementById("terzPlot");
      Plotly.update(graphDiv, data_update, layout_update, [0]);
    }

    function updateTerzLayout(newTitle) {
      const graphDiv = document.getElementById("terzPlot");
      var update = {
        title: newTitle, // updates the title
        // "xaxis.range": [0, 5], // updates the xaxis range
        // "yaxis.range[1]": 15, // updates the end of the yaxis range
      };
      Plotly.relayout(graphDiv, update);
    }

    function updateLayout(target, args) {
      console.log("updateLayout", target, args);
      const graphDiv = document.getElementById(target);
      Plotly.relayout(graphDiv, args);
    }

    function createTerzChart() {
      var data = [
        {
          x: frequencies,
          y: [],
          type: "bar",
        },
      ];
      let layout = {
        title: "Terz-Frequenzen",
        yaxis: { range: [30, 60] },
      };
      Plotly.newPlot("terzPlot", data, layout, { responsive: true });
    }
    function createResuCharts(on_click_cb) {
      const myPlot = document.getElementById("resuPlot");

      let x = []; //plotData.map((i) => i.ms);
      let y1 = []; //plotData.map((i) => i.lafeq);
      let y2 = []; //plotData.map((i) => i.aussortiert);
      let y3 = []; //plotData.map((i) => i.erkennung);

      let data = [
        {
          x: [],
          y: [],
          // mode: "markers",
          type: "scatter",
          name: "LAFeq",
          showlegend: true,
          // mode: "markers",
          // marker: { size: 16 },
        },
        {
          x: x,
          y: y2,
          type: "scatter",
          name: "Vorbeifahrt (Immendingen MP 5)",
          // mode: "markers",
          showlegend: true,
        },
        {
          x: x,
          y: y3,
          type: "scatter",
          name: "Aussortiert",
          showlegend: true,
          // mode: "markers",
        },
      ];
      let layout = {
        hovermode: "closest",
        title: "",
        xaxis: {
          type: "date",
        },
        legend: { orientation: "h" },
        // yaxis: { range: [maxYAxis - intervalYAxis, maxYAxis] },
      };

      Plotly.newPlot(myPlot, data, layout, {
        locale: "de",
        responsive: true,
      });
      if (on_click_cb != null) {
        myPlot.on("plotly_click", on_click_cb);
      }
    }

    function foo(args) {
      store.commit("setDate", args);
    }

    return {
      foo,
      selectedTimePoint,
      selectedTimePointRoundedTo15min,
      intervalYAxisTerz,
      maxYAxisTerz,
      intervalYAxisResu,
      maxYAxisResu,
      selectedMesspunkt,
      messpunktOptions,
    };
  },
};
</script>
