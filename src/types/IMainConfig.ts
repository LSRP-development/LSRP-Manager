import { Collection, Snowflake } from "discord.js";

export default interface IMainConfig {
  /**
   * Key - Discord role ID
   * Value - Department ID
   */
  departmentRoles: Map<Snowflake, string>;
  departmentLeaderRole: Snowflake;   
}
