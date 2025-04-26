import { model, Schema } from "mongoose";
import ISuggestion from "../types/ISuggestion";

export const SSuggestion = new Schema<ISuggestion>({
  ID: { type: String, required: true },
  messageID: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  votes: {
    type: {
      up: { type: [{ type: String }], required: true, },
      down: { type: [{ type: String }], required: true, },
    },
    default: {
      up: [],
      down: []
    }
  },
  approvalStatus: { type: String, default: null },
  actionBy: { type: String, default: null }
})

const Suggestions = model<ISuggestion>("suggestions", SSuggestion);
export default Suggestions;
