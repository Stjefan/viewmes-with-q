export const shownfrequencies = [
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

export const terzProps = [
  "hz20",
  "hz25",
  "hz31_5",
  "hz40",
  "hz50",
  "hz63",
  "hz80",
  "hz100",
  "hz125",
  "hz160",
  "hz200",
  "hz250",
  "hz315",
  "hz400",
  "hz500",
  "hz630",
  "hz800",
  "hz1000",
  "hz1250",
  "hz1600",
  "hz2000",
  "hz2500",
  "hz3150",
  "hz4000",
  "hz5000",
  "hz6300",
  "hz8000",
  "hz10000",
  "hz12500",
  "hz16000",
  "hz20000",
];

export const config_mannheim = {
  initial_map_position: [49.523202, 8.4872387],
  project_id: 2,
  bezeichnung: "mannheim",
  hasMeteData: false,
  ios: [
    {
      id: 4,
      name: "IO 4 - Fichtenweg 2",
      position: [49.523202, 8.4872387],
      gw_tag: 42,
      gw_nacht: 32,
    },
    {
      id: 5,
      name: "IO 5 - Speckweg 18",
      position: [49.523326, 8.48195],
      gw_tag: 42,
      gw_nacht: 32,
    },
    {
      id: 6,
      name: "IO 6 - Spiegelfabrik 16",
      position: [49.519069, 8.47877],
      gw_tag: 42,
      gw_nacht: 32,
    },
  ],
  mps: [
    {
      id: 1,
      name: "Mannheim MP 1",
      position: [49.521449, 8.4838235],
      name_in_api: "Mannheim MP 1",
    },
  ],
};

export const config_immendingen = {
  initial_map_position: [47.912783, 8.728536],
  project_id: 1,
  bezeichnung: "immendingen",
  hasMeteData: true,
  mps: [
    {
      id: 1,
      name: "MP 1 - Handlingkurs",
      name_in_api: "Immendingen MP 1",
      position: [47.912783, 8.728536],
    },
    {
      id: 2,
      name: "MP 2 - Bertha Leitstand",
      name_in_api: "Immendingen MP 2",
      position: [47.91799, 8.71139],
    },
    {
      id: 3,
      name: "MP 3 - Stadtstraße",
      name_in_api: "Immendingen MP 3",
      position: [47.928551, 8.725036],
    },
    {
      id: 4,
      name: "MP 4 - Innenstadt",
      name_in_api: "Immendingen MP 4",
      position: [47.919428, 8.738175],
    },
    {
      id: 5,
      name: "MP 5 - Fernstraßenoval",
      name_in_api: "Immendingen MP 5",
      position: [47.920379146443693, 8.72609453922426],
    },
    {
      id: 6,
      name_in_api: "Immendingen MP 6",
      name: "MP 6 - Stadtraße Heidestrecke",
      position: [47.930765, 8.739706],
    },
  ],
  ios: [
    {
      name: "Bachzimmer Straße 32",
      id: 1,
      gw_tag: 42,
      gw_nacht: 32,
      position: [47.930765, 8.731831],
    },
    {
      name: "Ziegelhütte 4",
      id: 5,
      gw_tag: 42,
      gw_nacht: 32,
      position: [47.934338, 8.736257],
    },
    {
      name: "Kreutzweg 4",
      id: 9,
      gw_tag: 42,
      gw_nacht: 32,
      position: [47.93568, 8.716572],
    },
    {
      name: "Am Hewenegg 1",
      id: 15,
      gw_tag: 42,
      gw_nacht: 32,
      position: [47.917715, 8.740678],
    },
    {
      name: "Am Hewenegg 8",
      id: 17,
      gw_tag: 42,
      gw_nacht: 32,
      position: [47.915059, 8.737231],
    },
  ],
};
