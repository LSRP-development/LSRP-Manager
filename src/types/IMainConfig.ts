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
  suggestionUpvoteTreshold: number;
  channels: {
    suggestions: Snowflake;
    mgmtSuggestionNotifications: Snowflake;
    rpPerms: Snowflake;
    phaseResults: Snowflake;
  }
  roles: {
    staff: Snowflake;
    MIT: Snowflake;
    TM: Snowflake;
    ModTeam: Snowflake;
    PhaseA: Snowflake;
    PhaseB: Snowflake;
    PhaseC: Snowflake;
  }
  phases: {
    phaseA: { min: number, max: number };
    phaseB: { min: number, max: number };
    phaseC: { min: number, max: number };
  }
}
