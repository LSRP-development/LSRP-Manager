import { model, Schema } from "mongoose";
import IMainConfig from "../types/IMainConfig";

export const SMainConfig = new Schema<IMainConfig>({
  departmentRoles: { type: Map, of: String, required: true },
  departmentLeaderRole: { type: String, required: true },
  devOnlyMode: { type: Boolean, required: true },
  rpPermsLifetime: { type: Number, required: true },
  rpPermsMessageDeleteDelay: { type: Number, required: true },
  suggestionUpvoteTreshold: { type: Number, required: true },
  channels: {
    type: {
      suggestions: { type: String, required: true },
      mgmtSuggestionNotifications: { type: String, required: true },
      rpPerms: { type: String, required: true },
      phaseResults: { type: String, required: true },
    },
    required: true
  },
  roles: {
    type: {
      staff: { type: String, required: true },
      MIT: { type: String, required: true },
      TM: { type: String, required: true },
      ModTeam: { type: String, required: true },
      PhaseA: { type: String, required: true },
      PhaseB: { type: String, required: true },
      PhaseC: { type: String, required: true }

    },
    required: true
  },
  phases: {
    type: {
      phaseA: { type: { min: { type: Number, required: true }, max: { type: Number, required: true } }, required: true },
      phaseB: { type: { min: { type: Number, required: true }, max: { type: Number, required: true } }, required: true },
      phaseC: { type: { min: { type: Number, required: true }, max: { type: Number, required: true } }, required: true },
    },
    required: true
  }
});

const MainConfig = model<IMainConfig>("mainConfig", SMainConfig);
export default MainConfig;
