<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn label="Immissionsort" :to="{ name: 'io' }" flat />
        <q-btn label="Messpunkt" :to="{ name: 'mp' }" flat />
        <q-btn label="Wetter" :to="{ name: 'mete' }" flat v-if="showMeteTab" />
        <q-btn label="Karte" :to="{ name: 'map' }" flat />
        <q-toolbar-title></q-toolbar-title>

        <div>ViewMes v07-22</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, onErrorCaptured } from "vue";

const dayjs = require("dayjs");
var utc = require("dayjs/plugin/utc");
var timezone = require("dayjs/plugin/timezone"); //

dayjs.extend(utc);
dayjs.extend(timezone);

import { useQuasar } from "quasar";
import { useStore } from "vuex";

export default defineComponent({
  name: "MainLayout",

  components: {},

  setup() {
    const $q = useQuasar();
    const store = useStore();

    var now = dayjs();
    const leftDrawerOpen = ref(false);

    const showMeteTab = store.state.example.showMeteTab;

    onErrorCaptured((err, instance, info) => {
      console.log(err, instance, info);
      $q.notify(`Fehler: ${err}`);
    });

    return {
      showMeteTab,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
