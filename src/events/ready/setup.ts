import { updateConfigCaches } from "../../config";
import * as ms from "@lukeed/ms";

export default async function () {
  await updateConfigCaches();
  setInterval(() => { updateConfigCaches() }, ms.parse("1m"));
}
