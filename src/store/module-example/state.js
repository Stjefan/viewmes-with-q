import dayjs from "dayjs";
import { config_immendingen, config_mannheim } from "../../boot/utility";

const project = config_mannheim;
export default function () {
  return {
    currentlySelectedDateTime: dayjs(), // "2022-07-02T09:00:00Z",
    count: 77,
    messpunktOptions: project.mps,
    immissionsortOptions: project.ios,
    initialPosition: project.initial_map_position,
    projektbezeichnung: project.bezeichnung,
    showMeteTab: project.hasMeteData,

    //
  };
}
