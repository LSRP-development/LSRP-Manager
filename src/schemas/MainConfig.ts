import { model, Schema } from "mongoose";
import IMainConfig from "../types/IMainConfig";

export const SMainConfig = new Schema<IMainConfig>({
  departmentRoles: {type: Map, of: String, required: true},
  departmentLeaderRole: {type: String, require: true}
});

const MainConfig = model<IMainConfig>("mainConfig", SMainConfig);
export default MainConfig;
