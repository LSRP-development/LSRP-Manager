import { Snowflake } from "discord.js";
import { uuid } from "./uuid";

export default interface IRPPerms {
  ID: uuid;
  actionBy: Snowflake;
  time: {
    executed: string;
    ends: string;
  }
  /**
   * Whether the perms are active
   */
  active: boolean;
  /**
   * Member who received the perms
   * Roblox ID
   */
  member: number;
  /**
   * The RP type
  */
  type: string;
}

