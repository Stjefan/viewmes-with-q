import dayjs from "dayjs";
import { config_immendingen, config_mannheim } from "../../boot/utility";
export default function () {
  return {
    currentlySelectedDateTime: dayjs(),
    count: 77,
    messpunktOptions: config_immendingen.mps,
    immissionsortOptions: config_immendingen.ios,

    //
  };
}
