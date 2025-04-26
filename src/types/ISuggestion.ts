import { Snowflake } from "discord.js";
import { uuid } from "./uuid";

export default interface ISuggestion {
  ID: uuid;
  messageID: Snowflake;
  content: string;
  author: Snowflake;
  votes?: {
    up: Snowflake[];
    down: Snowflake[];
  };
  /**
    * "approved" - Approved
    * "denied" - Denied
    * null - No decision
  */
  approvalStatus: "approved" | "denied" | null;
  /**
   * Approved/Denied by
   * Null if no decision
  */
  actionBy: Snowflake | null;
}
