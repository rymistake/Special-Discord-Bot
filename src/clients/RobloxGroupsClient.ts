type RobloxGroupRole = {
  group: {
    id: number;
    name: string;
  };
  role: {
    id: number;
    name: string;
    rank: number;
  };
};

type RobloxGroupsResponse = {
  data: RobloxGroupRole[];
};

export class RobloxGroupsClient {
  static async getUserGroups(robloxUserId: string | number) {
    const response = await fetch(
      `https://groups.roblox.com/v2/users/${robloxUserId}/groups/roles`
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to fetch Roblox groups: ${text}`);
    }

    const data = (await response.json()) as RobloxGroupsResponse;

    return data.data;
  }
}