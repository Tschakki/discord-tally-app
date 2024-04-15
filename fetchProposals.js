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

    const govData = await fetcher({
        query: GovernorsDocument,
        variables: {
        chainIds: [chainId],
        pagination: { limit: 10, offset: 0 },
        sort: { field: "TOTAL_PROPOSALS", order: "DESC" },
        }
    });
    const { proposalStats } = govData.governors[0] ?? [];
    console.log("+++++ gov data +++++");
    console.log(govData);
    for (let i = 0; i < govData.governors.length; i++) {
        console.log(govData.governors[i].proposalStats);
    }
    console.log("+++++ proposal count +++++");
    console.log("+++++ new +++++");
    console.log(proposalStats);
    console.log("+++++ old +++++");
    console.log(proposalCount);
    if (proposalCount.total < proposalStats.total) {
        const newProposalsCount =  proposalStats.total - proposalCount.total;
        const proposalData = await fetcher({
        query: ProposalsDocument,
        variables: {
            chainId,
            governors: [governorAddr],
            //proposalId: latestProposalID,
            pagination: { limit: newProposalsCount, offset: 0 },
            sort: { field: "CREATED_AT", order: "DESC" },
        },
        })
        const { proposals } = proposalData ?? [];
        console.log("+++++ proposal data +++++");
        console.log(proposalData);
        updateProposalCount(proposalStats);

        messageContent = "!!! Announcement: New Proposal !!! \n";
        for (let i = 0; i < newProposalsCount; i++) {
            messageContent += proposals[i].title + "\n";
            console.log(proposals[i].governor.organization);
        }
        const jsonData = { "content": messageContent };

        const webhookURL = "https://discord.com/api/webhooks/" + whID + "/" + whToken;
        //fetch("https://discord.com/api/webhooks/1228018587797553243/1eMBRsZRdSVc5JfT6E-GUF_QNOUfE_ipqxM8ujNC6GB0C0y47z7fpnluApYbzBtF9KND", {
        //fetch("https://discord.com/api/webhooks/1228281325673250857/cOLF9Bcqc8SsOJkY2YEqxfV8gRwRjdrNOJZEOq9gbBo7p1MP9ej4ALkc2f3l25rYB-mV", {
        fetch(webhookURL, {
            method: "POST",
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(jsonData)
          }).then(res => {
            messageContent = null;
            console.log("Request complete! response:", res);
          });
    }
}