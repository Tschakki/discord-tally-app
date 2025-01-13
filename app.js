import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { fetchProposalStats } from "./fetchProposals.js";
import { fetchProposalEtas } from "./proposalRemind.js";
import { VerifyDiscordRequest, getRandomEmoji } from './utils.js';


// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));
const NEW_PROPOSAL_INTERVALL = 300000;
const CHECK_PROPOSALS_INTERVALL = 3600000;
let interval1;
let interval2;
let webhookID;
let webhookToken;
/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
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

    // "track" command
    if (name === 'track') {
      // If tracking is already active, stop it
      if (interval1 || interval2) {
        clearInterval(interval1);
        clearInterval(interval2);
        interval1 = null;
        interval2 = null;
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Tracking stopped",
          },
        });
      // If tracking is not active, start it
      } else {
        // Check guild_id to determine which webhook to use
        // Lightcurve
        if (guild_id === "1228281036635508736") {
          //webhookID = "1245678260617220167";
         // webhookToken = "rUAYwMAXbremY1hxGvr4NH2Sxs_QsiGtQnIwvhTVWDTpJPCN3tu9PuRFafVHijjtuHE6";
          webhookID = "1228281325673250857";
          webhookToken = "cOLF9Bcqc8SsOJkY2YEqxfV8gRwRjdrNOJZEOq9gbBo7p1MP9ej4ALkc2f3l25rYB-mV";
        // Chsk
        } else if (guild_id === "723485885374660638") {
          webhookID = "1228018587797553243";
          webhookToken = "1eMBRsZRdSVc5JfT6E-GUF_QNOUfE_ipqxM8ujNC6GB0C0y47z7fpnluApYbzBtF9KND";
        // Lisk
        } else if (guild_id === "405002561775599619") {
          webhookID = "1245678260617220167";
          webhookToken = "rUAYwMAXbremY1hxGvr4NH2Sxs_QsiGtQnIwvhTVWDTpJPCN3tu9PuRFafVHijjtuHE6";
        } 
        // Checks for new proposals every 5min
        await fetchProposalStats(webhookID,webhookToken);
        interval1 = setInterval(fetchProposalStats, NEW_PROPOSAL_INTERVALL, webhookID, webhookToken);
        // Checks for ending proposals every hour
        await fetchProposalEtas(webhookID,webhookToken);
        interval2 = setInterval(fetchProposalEtas, CHECK_PROPOSALS_INTERVALL, webhookID, webhookToken);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Tracking started",
          },
        });
      }
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
