import fs from "fs";
import { fetcher } from "./fetcher.js";
import { GovernorsDocument, ProposalsDocument } from "./queries.js";

export async function fetchProposalStats() {
    // Store for in-progress games. In production, you'd want to use a DB
    const chainId = "eip155:4202";
    let proposalCount = {"total": 0, "active": 0, "failed": 0, "passed": 0};
    let latestProposals = [];
    let latestProposalID = "33870600801586914737837424272564636891728657403370558615211571960791763823273";
    const input = {
        "id": "eip155:4202:0xcBf493d00b17Ba252FEB4403BcFf2F0520C52C7D",
        "slug": "3rd-testing"
    };

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
            //proposalId: latestProposalID,
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

        let messageContent = "!!! Announcement: New Proposal !!! \n";
        for (let i = 0; i < newProposalsCount; i++) {
            messageContent += latestProposals[i].title + "\n";
        }

        const jsonData = { "content": messageContent };

        fetch("https://discord.com/api/webhooks/1228018587797553243/1eMBRsZRdSVc5JfT6E-GUF_QNOUfE_ipqxM8ujNC6GB0C0y47z7fpnluApYbzBtF9KND", {
            method: "POST",
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(jsonData)
          }).then(res => {
            console.log("Request complete! response:", res);
          });

        /* fs.writeFile("data.json", JSON.stringify(jsonData), function(err) {
            if (err) {
                console.log(err);
            }
        }); */
    }
}