import { model, Schema } from "mongoose";
import IDepartment from "../types/IDepartment";

export const SDepartment = new Schema<IDepartment>({
  ID: { type: String, required: true },
  guildID: { type: String, required: true },
  leadershipRoles: { type: [{ type: String, required: true }], required: true },
  leaderRole: { type: String, required: true },
  employeeRoles: { type: [{ type: String, required: true }], required: true }
});

const Department = model<IDepartment>("departments", SDepartment);
export default Department;
