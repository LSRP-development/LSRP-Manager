import axios from "axios";
import { RobloxUserIDAPIResponce, RobloxUsernameAPIResponce } from "../../types/robloxUser";
import { Collection } from "mongoose";

interface UserIDsObject {
  ids: number[];
}

interface UserUsernamesObject {
  usernames: string[];
}

class RobloxApiWrapper {
  public async getIdsFromUsernames(players: string[]): Promise<UserIDsObject | "ERR" | null> {
    try {
      const robloxUserAxiosResponse = await axios.post<RobloxUsernameAPIResponce>(
        `https://users.roblox.com/v1/usernames/users`,
        {
          "usernames": players,
          excludeBannedUsers: false
        },
        {
          responseType: "json"
        }
      );

      const returnObj: UserIDsObject = {
        ids: robloxUserAxiosResponse.data.data.map(u => u.id)
      }

      return robloxUserAxiosResponse.data.data.length > 0 ? returnObj : null;
    } catch (e) {
      return "ERR";
    }
  }

  public async getUsernamesFromIDs(players: number[]): Promise<UserUsernamesObject | "ERR" | null> {
    try {
      const robloxUserAxiosResponse = await axios.post<RobloxUserIDAPIResponce>(
        `https://users.roblox.com/v1/users`,
        {
          userIds: players,
          excludeBannedUsers: false
        },
        {
          responseType: "json"
        }
      );

      const returnObj: UserUsernamesObject = {
        usernames: robloxUserAxiosResponse.data.data.map(u => u.name)
      }

      return robloxUserAxiosResponse.data.data.length > 0 ? returnObj : null;
    } catch (e) {
      return "ERR";
    }


  }
}

export default new RobloxApiWrapper();
