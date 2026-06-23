import { Client, Collection, REST, Routes } from "discord.js";

export async function registerCommands(client: Client<boolean> & { commands: Collection<string, any>; }, commands: any[]) {
  const token = process.env.DISCORD_TOKEN;
  if (!token) throw new Error("DISCORD_TOKEN is not defined");

  const rest = new REST({ version: "10" })
    .setToken(token);

  const body = commands.map(cmd => cmd.data.toJSON());

  if (!client.user) throw new Error("Client user is not defined");

  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body }
  );

  console.log(`🌍 Registered ${commands.length} global commands`);
}