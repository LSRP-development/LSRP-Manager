import { Snowflake } from "discord.js";
import { uuid } from "./uuid";

export default interface IRPPerms {
  ID: uuid;
  actionBy: Snowflake;
  /**
   * Unix ms format of when the perms start and end
   */
  time: {
    executed: number;
    ends: number;
    invalidated?: number;
  }
  /**
   * Whether the perms are active; defaults to true
   */
  active?: boolean;
  /**
   * Members who received the perms
   * Roblox IDs
   */
  members: number[];
  /**
   * The RP type
  */
  type: string;
}

