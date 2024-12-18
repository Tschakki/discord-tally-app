import { fetcher } from "./fetcher.js";
import { GovernorDocument, ProposalsDocument, Chains } from "./new-queries.js";
import { getProposalCount, setProposalCount } from "./data.js";

export async function fetchProposalStats(whID, whToken) {
    let messageContent;
    const governorAddr = "0x58a61b1807a7bDA541855DaAEAEe89b1DDA48568";
    const chainId = "eip155:1135";
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
        query: GovernorDocument,
        variables: {
            input: {
                id: chainId + ':' + governorAddr,
                slug: 'Lisk Governor'
            }
        }
    });

    console.log("+++++ gov data +++++");
    console.log(govData);
    // Extract proposal stats from governor with most proposals
    const { proposalStats } = govData.governor ?? [];
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
            input: {
                filters: {
                    governorId: chainId + ':' + governorAddr,
                    includeArchived: true,
                    isDraft: false,
                },
                page: {
                    limit:newProposalsCount
                },
                sort: {isDescending: true, sortBy: "id"}
            }
        },
        })
        const { proposals } = proposalData ?? [];
        console.log("+++++ proposal data +++++");
        console.log(proposalData);
        setProposalCount(proposalStats);

        // Create message content that announces new proposals
        messageContent = "!!! Announcement: New Proposal !!! \n";

        // For every new proposal
        for (let i = 0; i < newProposalsCount; i++) {
            // Add proposal title and proposer to message
            messageContent += "------------------------------------ \n";
            messageContent += "[" + proposals[i].title + "](<https://www.tally.xyz/gov/lisk/proposal/" + proposals[i].id + ">) \n";
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
        setProposalCount(proposalStats);
        console.log("+++++ initial proposal count +++++");
        console.log(proposalStats);
    } else {
        console.log("+++++ no new proposals +++++");
    }
}