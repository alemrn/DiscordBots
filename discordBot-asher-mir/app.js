import "dotenv/config";
import express from "express";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";
import {
  VerifyDiscordRequest,
  getRandomEmoji,
  DiscordRequest,
  bungieDestinyStatistics,
  getBungieManifest,
  getChatGPT,
} from "./utils.js";
import { STATS_COMMAND, TEST_COMMAND } from "./commands.js";
import axios from "axios";
import { Configuration, OpenAIApi } from "openai";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/interactions", async function (req, res) {
  const { type, id, data } = req.body;

  switch (type) {
    case InteractionType.APPLICATION_COMMAND:
      return getCommands(req, res);
      break;
    case InteractionType.PING:
      return res.send({ type: InteractionResponseType.PONG });
      break;
    default:
      break;
  }
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});

function getCommands(req, res) {
  const { data } = req.body;
  const { name } = data;
  switch (name) {
    case "test":
      break;
    case STATS_COMMAND.name:
      return bungieDestinyStatistics(req, res);

      break;
    case MANIFEST_COMMAND.name:
      return getBungieManifest(req, res);
      break;

    case "chat":
      return getChatGPT(req, res);
      break;

    default:
      break;
  }
}
