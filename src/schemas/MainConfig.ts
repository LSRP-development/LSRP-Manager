import { model, Schema } from "mongoose";
import IMainConfig from "../types/IMainConfig";

export const SMainConfig = new Schema<IMainConfig>({
  departmentRoles: { type: Map, of: String, required: true },
  departmentLeaderRole: { type: String, required: true },
  devOnlyMode: { type: Boolean, required: true },
  channels: {
    type: {
      suggestions: { type: String, required: true }
    },
    required: true
  },
  roles: {
    type: {
      staff: { type: String, required: true }
    },
    required: true
  }
});

const MainConfig = model<IMainConfig>("mainConfig", SMainConfig);
export default MainConfig;
