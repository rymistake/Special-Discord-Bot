type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
};

type RobloxUserInfo = {
  sub: string;
  name?: string;
  preferred_username?: string;
  nickname?: string;
  profile?: string;
  picture?: string;
};

const AUTHORIZE_URL = "https://apis.roblox.com/oauth/v1/authorize";
const TOKEN_URL = "https://apis.roblox.com/oauth/v1/token";
const USERINFO_URL = "https://apis.roblox.com/oauth/v1/userinfo";

export class RobloxOAuthClient {
  static createAuthorizationUrl(state: string) {
    const clientId = process.env.ROBLOX_CLIENT_ID;
    const redirectUri = process.env.ROBLOX_REDIRECT_URI;

    if (!clientId) throw new Error("ROBLOX_CLIENT_ID is missing.");
    if (!redirectUri) throw new Error("ROBLOX_REDIRECT_URI is missing.");

    const url = new URL(AUTHORIZE_URL);

    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid profile");
    url.searchParams.set("state", state);

    return url.toString();
  }

  static async exchangeCode(code: string): Promise<TokenResponse> {
    const clientId = process.env.ROBLOX_CLIENT_ID;
    const clientSecret = process.env.ROBLOX_CLIENT_SECRET;
    const redirectUri = process.env.ROBLOX_REDIRECT_URI;

    if (!clientId) throw new Error("ROBLOX_CLIENT_ID is missing.");
    if (!clientSecret) throw new Error("ROBLOX_CLIENT_SECRET is missing.");
    if (!redirectUri) throw new Error("ROBLOX_REDIRECT_URI is missing.");

    const body = new URLSearchParams();

    body.set("grant_type", "authorization_code");
    body.set("code", code);
    body.set("client_id", clientId);
    body.set("client_secret", clientSecret);
    body.set("redirect_uri", redirectUri);

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Roblox token exchange failed: ${text}`);
    }

    return response.json() as Promise<TokenResponse>;
  }

  static async getUserInfo(accessToken: string): Promise<RobloxUserInfo> {
    const response = await fetch(USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Roblox userinfo failed: ${text}`);
    }

    return response.json() as Promise<RobloxUserInfo>;
  }
}