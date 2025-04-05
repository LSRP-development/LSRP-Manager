import { updateConfigCaches } from "../../config";
import * as ms from "@lukeed/ms";
import { updateRolesInMain } from "../../funcs/memberRoleCheck";

export default async function() {
  await updateConfigCaches();
  await updateRolesInMain();
  setInterval(() => {updateConfigCaches()}, ms.parse("1m"));
  setInterval(() => {updateRolesInMain()}, ms.parse("10m"));
}
