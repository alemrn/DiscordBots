import "dotenv/config";
import { getRPSChoices } from "./game.js";
import { capitalize, InstallGlobalCommands } from "./utils.js";

// Simple test command
export const TEST_COMMAND = {
  name: "test",
  description: "Basic command",
  type: 1,
};

export const MANIFEST_COMMAND = {
  name: "description",
  description: "Basic command of bungie data",
  type: 1,
};

export const STATS_COMMAND = {
  name: "destiny",
  description: "Command to watch all the stats from a player of destiny 2",
  type: 1,
  options: [
    {
      name: "destinyname",
      description: "destiny 2 user name",
      type: 3,
      required: true,
    },
    {
      name: "destinyid",
      description: "destiny 2 user id",
      type: 3,
      required: true,
    },
  ],
};

export const CHAT_COMMAND = {
  name: "chat",
  description: "Basic command to connect with chatgpt",
  type: 1,
};

const ALL_COMMANDS = [TEST_COMMAND, MANIFEST_COMMAND, STATS_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
