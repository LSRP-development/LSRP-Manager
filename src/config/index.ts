import { Collection, EmojiResolvable, Snowflake } from "discord.js";
import dev_config from "./a_dev_config";
import config from "./a_main_config";
import IMainConfig from "../types/IMainConfig";
import MainConfig from "../schemas/MainConfig";
import _ from "lodash";
import hasDocProperty from "../utils/hasDocProperty";
import * as ms from "@lukeed/ms";
import IDepartment from "../types/IDepartment";
import Department from "../schemas/Department";

export interface IConfig {
  mainGuildID: Snowflake;
  devUserIDs: Snowflake[];
  devGuildID: Snowflake;
  shrRole: Snowflake;
  /**
   * Emoji markdown
  */
  emoji: {
    loading: string
  }
  channels: {
    globalCommandLogs: Snowflake
  }
}


class MainConfigManager {
  private configCache: IMainConfig;

  public constructor() {
    this.configCache = {} as IMainConfig; // Ignoring this, it will get fetched from the DB on initialization
  }

  public async updateCache(): Promise<void> {
    const updatedConfig = await MainConfig.findOne();
    if (!updatedConfig) {
      console.error("ERR_NO_MAINCONFIG");
      process.exit(9);
    };
    this.configCache = updatedConfig;
  }

  public get config(): IMainConfig {
    return _.cloneDeep(this.configCache);
  };

  public getRolesFromDeptID(deptID: string) {
    const array = [...this.configCache.departmentRoles.entries()];
    return array.filter(([, v]) => v.includes(deptID)).map(([v]) => v);
  }

  public async updateConfig(updatedConfig: IMainConfig): Promise<Readonly<undefined | "ERR_OUTDATED_KEYS" | "ERR_INTERNAL">> {
    await this.updateCache();

    if (!hasDocProperty(this.config) || !hasDocProperty(updatedConfig)) return "ERR_INTERNAL";

    if (!_.isEqual(Object.keys(this.config._doc), Object.keys(updatedConfig._doc))) {
      return "ERR_OUTDATED_KEYS";
    }

    await MainConfig.updateOne({}, updatedConfig);
    await this.updateCache();
  }

}

class DepartmentManager {
  private deptCache: Collection<string, IDepartment>;

  public constructor() {
    this.deptCache = new Collection(); // Ignoring this, it will get fetched from the DB on initialization
  }

  public async updateCache(): Promise<void> {
    const updatedDepartments = await Department.find();
    if (!updatedDepartments) return;
    this.deptCache = new Collection(updatedDepartments.map(v => [v.ID, v]));
  }

  public get departments(): Readonly<Collection<Snowflake, IDepartment>> {
    return new Collection(this.deptCache);
  };

  public get departmentGuildIDs(): Readonly<Snowflake[]> {
    return this.deptCache.map(v => v.guildID);
  }

  public getConfigByGuildID(guildID: Snowflake) {
    return this.deptCache.find(v => v.guildID === guildID);
  }

}

export const mainConfigManager = new MainConfigManager();
export const departmentsManager = new DepartmentManager();

export async function updateConfigCaches() {
  await mainConfigManager.updateCache();
  await departmentsManager.updateCache();
}

export default config;
