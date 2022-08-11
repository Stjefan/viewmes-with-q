import dayjs from "dayjs";
import { config_immendingen, config_mannheim } from "../../boot/utility";

const project =
  process.env.bezeichnungZugeordnetesProjekt == "Immendingen"
    ? config_immendingen
    : config_mannheim;

export default function () {
  return {
    currentlySelectedDateTime: dayjs().add(-15, "minute"), // "2022-07-02T09:00:00Z",

    messpunktOptions: project.mps,
    immissionsortOptions: project.ios,
    initialPosition: project.initial_map_position,
    projektbezeichnung: project.bezeichnung,
    showMeteTab: project.hasMeteData,

    intervalYAxisTerz: 60,
    maxYAxisTerz: 60,

    intervalYAxisResu: 50,
    maxYAxisResu: 70,

    //
  };
}
