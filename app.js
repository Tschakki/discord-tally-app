import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
//import db from "./data.json" assert { type: "json" };;
import { fetcher } from "./fetcher.js";
import { GovernorsDocument, ProposalsDocument } from "./queries.js";
import { fetchProposalStats } from "./fetchProposals.js";
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';


// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

let interval;
let webhookID;
let webhookToken;
/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  console.log("+++++ request +++++");
  console.log(req.body);
  // Interaction type and data
  const { type, id, data, guild_id } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: 'hello world ' + getRandomEmoji(),
        },
      });
    } 

    if (name === 'track') {
      if (interval) {
        clearInterval(interval);
        interval = null;
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Tracking stopped",
          },
        });
      } else {
        if (guild_id === "1228281036635508736") {
          webhookID = "1228281325673250857";
          webhookToken = "cOLF9Bcqc8SsOJkY2YEqxfV8gRwRjdrNOJZEOq9gbBo7p1MP9ej4ALkc2f3l25rYB-mV";
        } 

        interval = setInterval(fetchProposalStats, 60000, webhookID, webhookToken);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Tracking started",
          },
        });
        
      }
    }
  }

  //const messageContent = await fetchProposalStats();

  //Webhook URL:
  //
  // 
  /* if (db.message && db.message.length > 0) {
    console.log("+++++ message content +++++");
    console.log(message);
    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Test",
          //content: messageContent,
        },
    });
  } */
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
