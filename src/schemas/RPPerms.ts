import { model, Schema } from "mongoose";
import IRPPerms from "../types/IRPPerms";

const SRPPerms = new Schema<IRPPerms>({
  ID: { type: String, required: true },
  actionBy: { type: String, required: true },
  active: { type: Boolean, default: true },
  members: { type: [{ type: Number, required: true }], required: true },
  time: {
    type: {
      executed: { type: Number, required: true },
      ends: { type: Number, required: true },
      invalidated: { type: Number, default: null }
    },
    required: true
  },
  type: { type: String, required: true }
});

export const RPPerms = model<IRPPerms>("rp-perms", SRPPerms);
