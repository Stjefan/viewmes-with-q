<template>
  <div class="q-pa-md">
    <div id="otherMap" style="width: 100%; height: 80vh"></div>
  </div>
</template>

<script>
import { map, tileLayer, marker, icon } from "leaflet";

import { onMounted, ref, watch, computed } from "vue";
import { queryApi } from "../boot/influx";
import moduleExample from "src/store/module-example";
const dayjs = require("dayjs");
import { useQuasar } from "quasar";
import { useStore } from "vuex";

function createMap(myMesspunkte, myImmissionsorte, initalPosition) {
  var myMap = map("otherMap").setView(initalPosition, 13);

  var tiles = tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    {
      maxZoom: 18,
      /*
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      */
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
    }
  ).addTo(myMap);

  let myBlueIcon = icon({
    iconUrl: require("assets/marker-icon-blue.png"), //"icons/marker-icon-blue.png",
  });

  for (let p of myMesspunkte) {
    marker(p.position, { icon: myBlueIcon }).addTo(myMap).bindPopup(p.name);
  }

  let myIcon = icon({
    iconUrl: require("assets/marker-icon-red.png"), // "icons/marker-icon-red.png",
  });
  console.log(myIcon);
  for (let p of myImmissionsorte) {
    const m = marker(p.position, { icon: myIcon })
      .addTo(myMap)
      .bindPopup(p.name);
    console.log(m);
    console.log(m.getIcon());
  }

  /*

  var myMarker = marker([47.915059, 8.737231])
    .addTo(myMap)
    .bindPopup("<b>Hello world!</b><br />I am a popup.");
  // .openPopup();
  */
}
export default {
  // name: 'ComponentName',
  setup() {
    const store = useStore();
    const myMesspunkte = store.state.example.messpunktOptions;
    const myImmissionsorte = store.state.example.immissionsortOptions;
    const initialPosition = store.state.example.initialPosition;
    console.log(initialPosition);
    onMounted(() => {
      createMap(myMesspunkte, myImmissionsorte, initialPosition);
    });
    return {};
  },
};
</script>
<style>
@import "~leaflet/dist/leaflet.css";
</style>
