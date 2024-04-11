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

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const chainId = "eip155:4202";
let proposalCount = {"total": 0, "active": 0, "failed": 0, "passed": 0};
let latestProposals = [];
let latestProposalID = "33870600801586914737837424272564636891728657403370558615211571960791763823273";
const input = {
  "id": "eip155:4202:0xcBf493d00b17Ba252FEB4403BcFf2F0520C52C7D",
  "slug": "3rd-testing"
};

const GovernorDocument =
   `query Governor($input: GovernorInput!) {
      governor(input: $input) {
        id
        chainId
        proposalStats
      }
  }
`;

const GovernorsDocument = `
    query Governors($chainIds: [ChainID!], $pagination: Pagination, $sort: GovernorSort) {
  governors(chainIds: $chainIds, pagination: $pagination, sort: $sort) {
    id
    name
    tokens {
      stats {
        voters
      }
    }
    proposalStats {
      total
      active
    }
  }
}
    `;

const ProposalsDocument =
`query Proposals($chainId: ChainID!, $proposalId: ProposalID!, $pagination: Pagination, $sort: ProposalSort) {
  proposals(chainId: $chainId, proposalId: $proposalId, pagination: $pagination, sort: $sort) {
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

  const intervalID = setInterval(fetchProposalStats, 600, "Parameter 1", "Parameter 2");

  async function fetchProposalStats() {
    const govData = await fetcher({
      /* query: GovernorDocument,
      variables: {
        input,
      }, */
      query: GovernorsDocument,
      variables: {
        chainIds: [chainId],
        pagination: { limit: 1, offset: 0 },
        sort: { field: "TOTAL_PROPOSALS", order: "DESC" },
      }
    });
    const projects = govData;
    const { proposalStats } = govData.governors[0] ?? [];
    console.log("+++++ gov data +++++");
    console.log(govData);
    //const proposalStats = govData.governors[0].proposalStats.total ?? [];

    console.log("+++++ proposal count +++++");
    console.log("+++++ old +++++");
    console.log(proposalCount);
    console.log("+++++ new +++++");
    console.log(proposalStats);
    if (proposalCount.total < proposalStats.total) {

      const newProposalsCount =  proposalStats.total - proposalCount.total;

      const proposalData = await fetcher({
        query: ProposalsDocument,
        variables: {
          chainId,
          proposalId: latestProposalID,
          pagination: { limit: newProposalsCount, offset: 0 },
          sort: { field: "START_BLOCK", order: "DESC" },
        },
      })
      const { proposals } = proposalData ?? [];
      console.log("+++++ proposal data +++++");
      console.log(proposalData);

      latestProposals = proposals;
      latestProposalID = proposals[0].id;
      //latestProposalID = proposals[newProposalsCount - 1].id;
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
