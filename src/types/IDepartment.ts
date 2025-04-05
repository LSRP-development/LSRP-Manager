import { Snowflake } from "discord.js";

export default interface IDepartment {
  ID: string;
  guildID: Snowflake;
  employeeRoles: Snowflake[];
  leadershipRoles: Snowflake[];
  leaderRole: Snowflake;
}
