<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn label="Immissionsort" :to="{ name: 'io' }" flat />
        <q-btn label="Messpunkt" :to="{ name: 'mp' }" flat />
        <q-btn label="Wetter" :to="{ name: 'mete' }" flat />
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

const linksList = [
  {
    title: "Docs",
    caption: "quasar.dev",
    icon: "school",
    link: "https://quasar.dev",
  },
  {
    title: "Github",
    caption: "github.com/quasarframework",
    icon: "code",
    link: "https://github.com/quasarframework",
  },
  {
    title: "Discord Chat Channel",
    caption: "chat.quasar.dev",
    icon: "chat",
    link: "https://chat.quasar.dev",
  },
  {
    title: "Forum",
    caption: "forum.quasar.dev",
    icon: "record_voice_over",
    link: "https://forum.quasar.dev",
  },
  {
    title: "Twitter",
    caption: "@quasarframework",
    icon: "rss_feed",
    link: "https://twitter.quasar.dev",
  },
  {
    title: "Facebook",
    caption: "@QuasarFramework",
    icon: "public",
    link: "https://facebook.quasar.dev",
  },
  {
    title: "Quasar Awesome",
    caption: "Community Quasar projects",
    icon: "favorite",
    link: "https://awesome.quasar.dev",
  },
];

const dayjs = require("dayjs");
import { useQuasar } from "quasar";

export default defineComponent({
  name: "MainLayout",

  components: {},

  setup() {
    const $q = useQuasar();

    var now = dayjs();
    const leftDrawerOpen = ref(false);

    const currentDate = ref(now.format("YYYY-MM-DD"));

    onErrorCaptured((err, instance, info) => {
      console.log(err, instance, info);
      $q.notify(`Fehler: ${err}`);
    });

    return {
      currentDate,
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
