import { Snowflake } from "discord.js";
import { uuid } from "./uuid";

export default interface IDepartment {
  ID: uuid;
  guildID: Snowflake;
  employeeRoles: Snowflake[];
  leadershipRoles: Snowflake[];
  leaderRole: Snowflake;
}
