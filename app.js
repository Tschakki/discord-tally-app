import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { fetcher } from "./fetcher";
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const chainId = "eip155:1";
const proposalCount = {"total": 0, "active": 0, "failed": 0, "passed": 0};
const latestProposals = [];
const latestProposalID = 0;

const governnorInput = {
  "id": "eip155:1:0x7e90e03654732abedf89Faf87f05BcD03ACEeFdc",
  "slug": "abc123"
};

const GovernorDocument =
   `query Governor($governnorInput: GovernorInput!) {
      governor(governorInput: $governnorInput) {
        id
        chainId
        lastIndexedBlock
        name
        organization
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
    })

    const { proposalStats } = govData ?? [];
    console.log("+++++ gov data +++++");
    console.log(govData);
    proposalCount = proposalStats;

    if (proposalCount.total > proposalStats.total) {

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
          // Fetches a random emoji to send from a helper function
          content: messageContent,
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
