import { fetcher } from "./fetcher.js";
import { GovernorsDocument, ProposalsDocument, Chains } from "./queries.js";
import { getProposalCount, updateProposalCount } from "./data.js";

export async function fetchProposalStats(whID, whToken) {
    let messageContent;
    const governorAddr = "0xcBf493d00b17Ba252FEB4403BcFf2F0520C52C7D";
    const chainId = "eip155:4202";
    let proposalCount = getProposalCount();
    /* const chainData = await fetcher({
        query: Chains,
        variables: {
        pagination: { limit: 99, offset: 0 },
        sort: { field: "TOTAL_PROPOSALS", order: "ASC" },
        }
    });
    console.log("+++++ chain data +++++");
    console.log(chainData); */
    // Fetch governors for specified chain ID
    const govData = await fetcher({
        query: GovernorsDocument,
        variables: {
        chainIds: [chainId],
        pagination: { limit: 10, offset: 0 },
        sort: { field: "TOTAL_PROPOSALS", order: "DESC" },
        }
    });

    // Extract proposal stats from governor with most proposals
    const { proposalStats } = govData.governors[0] ?? [];
    console.log("+++++ gov data +++++");
    console.log(govData);
/*     for (let i = 0; i < govData.governors.length; i++) {
        console.log(govData.governors[i].proposalStats);
    } */
    console.log("+++++ proposal count +++++");
    console.log("+++++ new +++++");
    console.log(proposalStats);
    console.log("+++++ old +++++");
    console.log(proposalCount);

    // If new proposals have been created
    if (proposalCount.total > 0 && proposalCount.total < proposalStats.total) {
        const newProposalsCount =  proposalStats.total - proposalCount.total;
        // Fetch new proposals
        const proposalData = await fetcher({
        query: ProposalsDocument,
        variables: {
            chainId,
            governors: [governorAddr],
            pagination: { limit: newProposalsCount, offset: 0 },
            sort: { field: "CREATED_AT", order: "DESC" },
        },
        })
        const { proposals } = proposalData ?? [];
        console.log("+++++ proposal data +++++");
        console.log(proposalData);
        updateProposalCount(proposalStats);

        // Create message content that announces new proposals
        messageContent = "!!! Announcement: New Proposal !!! \n";

        // For every new proposal
        for (let i = 0; i < newProposalsCount; i++) {
            // Add proposal title and proposer to message
            messageContent += "------------------------------------ \n";
            messageContent += "[" + proposals[i].title + "](<https://www.tally.xyz/gov/3rd-testing/proposal/" + proposals[i].id + ">) \n";
            let proposer;
            if (proposals[i].proposer.name) {
                proposer = proposals[i].proposer.name;
            } else if (proposals[i].proposer.ens) {
                proposer = proposals[i].proposer.ens;
            } else {
                proposer = proposals[i].proposer.address;
            }
            messageContent += "Proposed by: " + proposer + "\n";
        }
        const jsonData = { "content": messageContent };

        // Send message to Discord channel via webhook
        const webhookURL = "https://discord.com/api/webhooks/" + whID + "/" + whToken;
        //fetch("https://discord.com/api/webhooks/1228018587797553243/1eMBRsZRdSVc5JfT6E-GUF_QNOUfE_ipqxM8ujNC6GB0C0y47z7fpnluApYbzBtF9KND", {
        //fetch("https://discord.com/api/webhooks/1228281325673250857/cOLF9Bcqc8SsOJkY2YEqxfV8gRwRjdrNOJZEOq9gbBo7p1MP9ej4ALkc2f3l25rYB-mV", {
        fetch(webhookURL, {
            method: "POST",
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(jsonData)
          }).then(res => {
            messageContent = null;
            //console.log("Request complete! response:", res);
          });
    // If proposal count is not initialized yet
    } else if (proposalCount.total == 0){
        // Initialize proposal count values
        updateProposalCount(proposalStats);
        console.log("+++++ initial proposal count +++++");
        console.log(proposalStats);
    }
}