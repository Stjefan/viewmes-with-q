const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    redirect: "/io",
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      {
        path: "io",
        component: () => import("pages/ImmissionsortPage.vue"),
        name: "io",
      },
      {
        path: "mp/",
        component: () => import("pages/MesspunktPage.vue"),
        name: "mp",
      },
      {
        path: "mete",
        component: () => import("pages/WetterPage.vue"),
        name: "mete",
      },
      {
        path: "map",
        component: () => import("pages/MapPage.vue"),
        name: "map",
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
