import "dotenv/config";
import fetch from "node-fetch";
import { verifyKey } from "discord-interactions";
import axios from "axios";

import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get("X-Signature-Ed25519");
    const timestamp = req.get("X-Signature-Timestamp");

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send("Bad request signature");
      throw new Error("Bad request signature");
    }
  };
}

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = "https://discord.com/api/v10/" + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent":
        "DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)",
    },
    ...options,
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: "PUT", body: commands });
  } catch (err) {
    console.error(err);
  }
}

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
  const emojiList = [
    "😭",
    "😄",
    "😌",
    "🤓",
    "😎",
    "😤",
    "🤖",
    "😶‍🌫️",
    "🌏",
    "📸",
    "💿",
    "👋",
    "🌊",
    "✨",
  ];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function bungieDestinyStatistics(req, res) {
  const options = req.body.data.options;

  const headers = {
    headers: {
      "X-API-Key": `${process.env.BUNGIE_API_KEY}`,
    },
  };

  const args = {
    displayName: options[0].value,
    displayNameCode: options[1].value,
  };

  try {
    const response = await axios.post(
      "https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayerByBungieName/All/",
      args,
      headers
    );

    const { membershipType, membershipId } = response.data.Response[0];

    const getProfile = await axios.get(
      `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}?components=200`,
      headers
    );

    const { data } = getProfile.data.Response.characters;

    const characterId = Object.keys(data)[0];
    const dateEnd = new Date().toISOString().slice(0, 10);
    const dateStart = new Date();
    dateStart.setDate(dateStart.getDate() - 31);
    dateStart.toISOString().slice(0, 10);

    const uri = `https://www.bungie.net/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/?dayend=${dateEnd}&daystart=${dateStart
      .toISOString()
      .slice(0, 10)}&groups=General&modes=5,7&periodType=0`;

    const getStats = await axios.get(uri, headers);

    console.log(uri);
    const { allPvP, allPvE } = getStats.data.Response;

    const { kills, deaths, efficiency, activitiesEntered, activitiesWon } =
      allPvP.allTime;

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `**PVP**
                **Activities** ${activitiesEntered.basic.value}
                **Activities won** ${activitiesWon.basic.value}
                **Kills**: ${kills.basic.value} pga: ${kills.pga.displayValue}
                **Deaths**: ${deaths.basic.value} and pga: ${deaths.pga.displayValue}
                **Efficiency**: ${efficiency.basic.displayValue}\n**PVE**
                **Activities**: ${allPvE.allTime.activitiesEntered.basic.value}
                **Activities Cleared**: ${allPvE.allTime.activitiesCleared.basic.value}
                **Kills**: ${allPvE.allTime.kills.basic.value}
                **Deaths**: ${allPvE.allTime.deaths.basic.value}
                **Efficiency**: ${allPvE.allTime.efficiency.basic.displayValue}
                **Score**: ${allPvE.allTime.score.basic.value}
                `,
      },
    });
  } catch (err) {
    console.log(`Error: ${err}`);
    throw err;
  }
}

export async function getBungieManifest(req, res) {
  try {
    const response = await axios.get(
      "https://www.bungie.net/Platform/App/FirstParty/",
      {
        headers: {
          "X-API-Key": `${process.env.BUNGIE_API_KEY}`,
        },
      }
    );

    let answer = "Aplicaciones de Destiny 2: ";
    response.data.Response.forEach((response) => {
      console.log(response.name);
      answer = answer + " - " + response.name + " ";
    });

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: JSON.stringify(answer),
      },
    });
  } catch (err) {
    console.log(`Error: ${err}`);
    throw err;
  }
}

export async function getChatGPT(req, res) {
  const openai = new OpenAIApi(configuration);

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: "Escribe la frase completa de lorem epsilum",
    stop: ["\n"],
  });
  const answer = response.data.choices[0].text.trim();
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: JSON.stringify(answer),
    },
  });
}
