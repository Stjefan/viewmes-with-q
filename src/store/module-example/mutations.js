import dayjs from "dayjs";
import AdvancedFormat from "dayjs/plugin/arraySupport";

dayjs.extend(AdvancedFormat);

export function setDateTime(state, payload) {
  const updatedDate = dayjs(payload, "YYYY-MM-DD");
  console.log("setDateTime", payload, updatedDate, state);
  const updatedDateTime = dayjs([
    updatedDate.year(),
    updatedDate.month(),
    updatedDate.date(),
    state.currentlySelectedDateTime.hour(),
    state.currentlySelectedDateTime.minute(),
    state.currentlySelectedDateTime.second(),
  ]);
  console.log(
    "updatedDateTime",
    updatedDate.year(),
    updatedDate.month(),
    updatedDate.date(),
    updatedDateTime
  );
  console.log(updatedDateTime);
  state.currentlySelectedDateTime = updatedDateTime;
}

export function setDate(state, payload) {
  const updatedDate = dayjs(payload, "YYYY-MM-DDTHH:mm:ss");
  console.log(updatedDate);
  state.currentlySelectedDateTime = updatedDate;
}
