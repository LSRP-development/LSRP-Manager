import { Collection, Snowflake, SnowflakeGenerateOptions } from "discord.js";

export default interface IMainConfig {
  /**
   * Key - Discord role ID
   * Value - Department ID
   */
  departmentRoles: Map<Snowflake, string>;
  departmentLeaderRole: Snowflake;
  devOnlyMode: boolean;
  channels: {
    suggestions: Snowflake;
  }
  roles: {
    staff: Snowflake;
  }
}
