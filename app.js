import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { fetcher } from "./fetcher.js";
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
let proposalCount = {"total": 0, "active": 0, "failed": 0, "passed": 0};
let latestProposals = [];
let latestProposalID = 0;
const governnorInput = {
  "id": "eip155:4202:0xcBf493d00b17Ba252FEB4403BcFf2F0520C52C7D",
  "slug": "3rd-testing"
};

const GovernorDocument =
   `query Governor($governnorInput: GovernorInput!) {
      governor(governorInput: $governnorInput) {
        id
        chainId
        proposalStats
      }
  }
`;

const ProposalsDocument =
`query Proposals($proposalId: ProposalID!, $pagination: Pagination, $sort: ProposalSort) {
  proposals(proposalId: $proposalId, pagination: $pagination, sort: $sort) {
    id
    title
    eta
    governor {
      name
    }
    voteStats {
      support
      weight
      votes
      percent
    }
  }
}
`;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  const intervalID = setInterval(fetchProposalStats, 60, "Parameter 1", "Parameter 2");

  async function fetchProposalStats() {
    const govData = await fetcher({
      query: GovernorDocument,
      variables: {
        governnorInput,
      },
    }).then((data) => {
      console.log("+++++ gov data2 +++++");
      console.log(data);
    });

    const { proposalStats } = govData ?? [];
    console.log("+++++ gov data +++++");
    console.log(govData);
    proposalCount = proposalStats;

    if (proposalCount.total < proposalStats.total) {

      const newProposalsCount = proposalCount.total - proposalStats.total;

      const proposalData = await fetcher({
        query: ProposalsDocument,
        variables: {
          proposalId: latestProposalID + 1,
          pagination: { limit: newProposalsCount, offset: 0 },
          sort: { field: "START_BLOCK", order: "DESC" },
        },
      })
      const { proposals } = proposalData ?? [];
      console.log("+++++ proposal data +++++");
      console.log(proposalData);

      latestProposals = proposals;
      latestProposalID = proposals[newProposalsCount - 1].id;
      proposalCount = proposalStats;

      const messageContent = "!!! Announcement: New Proposal !!! \n";
      for (let i = 0; i < newProposalsCount; i++) {
        messageContent += latestProposals[i].title + "\n";
      }

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: messageContent,
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
