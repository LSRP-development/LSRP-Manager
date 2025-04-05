import config, {departmentsManager, mainConfigManager} from "../config";
import { client } from "..";
import { Snowflake, Collection } from "discord.js";

/**
 *  @returns
 *  Key - Dept ID
 *  Value - User IDs 
 */
export async function findDeptMembers(): Promise<Readonly<Collection<string, Snowflake[]>>> {
  const deptGuilds = (await client.guilds.fetch()).filter(g => departmentsManager.departmentGuildIDs.includes(g.id));

  const deptMembers = new Collection<string, Snowflake[]>();

  for (const [,OAuthDept] of deptGuilds) {
    const dept = await OAuthDept.fetch();
    const deptConfig = departmentsManager.getConfigByGuildID(dept.id);
    if (!deptConfig) continue;

    const employeeRoles = (await dept.roles.fetch()).filter(r => deptConfig.employeeRoles.includes(r.id)).map(v => v);

    if (employeeRoles.length > 0) {
      deptMembers.set(deptConfig.ID, []);
    } else continue;

    const array = deptMembers.get(deptConfig.ID);
    if (array === undefined) continue;
    
    await dept.members.fetch();

    for (const role of employeeRoles) {
      array.push(...dept.members.cache.filter(m => m.roles.cache.map(v => v.id).includes(role.id)).map(v => v.id));
    }

    // deptMembers.set(deptConfig.ID, arr;ay);
    
  };
  
  return deptMembers;
}

export async function updateRolesInMain() {
  const deptMembers = await findDeptMembers();

  const mainGuild = await (await client.guilds.fetch()).find(g => g.id === config.mainGuildID)?.fetch();
  if (!mainGuild) throw "ERR_NO_MAINGUILD";
  const mainConfig = mainConfigManager.config;
  
  await mainGuild.members.fetch();
  await mainGuild.roles.fetch();
  
  const mainRoles = new Collection<Snowflake, Snowflake[]>();

  for (const [id,members] of deptMembers) {
    const deptConfig = departmentsManager.departments.get(id);
    const roleIDs = mainConfigManager.getRolesFromDeptID(id);
    const roles = roleIDs.map((v) => mainGuild.roles.cache.get(v));

    if (!roleIDs) continue;
    for (const member of members) {
      mainGuild.members.cache.get(member)?.roles.add(roleIDs, "Department role connection");
      for (const roleID of roleIDs) {
        if (mainRoles.get(roleID)) {
          mainRoles.get(roleID)?.push(member);
        } else {
          mainRoles.set(roleID, [member]);
        }
      }
    }
  }

  const actualMainRoles = new Collection<Snowflake, Snowflake[]>();
  for (const roleID of mainConfig.departmentRoles.keys()) {
    const role = mainGuild.roles.cache.get(roleID);
    if (!role) continue;
    actualMainRoles.set(role.id, [...role.members.keys()]);
  } 
  
  for (const [roleID, members] of actualMainRoles) {
    for (const member of members) {
      if (!mainRoles.get(roleID)?.some(v => v === member)) {
        mainGuild.members.cache.get(member)?.roles.remove(roleID, "Department role connection");
      }
    }
  }
}
