import { Collection, Snowflake, SnowflakeGenerateOptions } from "discord.js";

export default interface IMainConfig {
  /**
   * Key - Discord role ID
   * Value - Department ID
   */
  departmentRoles: Map<Snowflake, string>;
  departmentLeaderRole: Snowflake;
  devOnlyMode: boolean;
  /**
   * How long should roleplay perms last; in milliseconds
  */
  rpPermsLifetime: number;
  /**
   * How long should the bot wait on top of lifetime before deleting perm message; in milliseconds
  */
  rpPermsMessageDeleteDelay: number;
  channels: {
    suggestions: Snowflake;
    rpPerms: Snowflake;
  }
  roles: {
    staff: Snowflake;
  }
}
