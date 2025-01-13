import { fetcher } from "./fetcher.js";
import { ProposalsDocument } from "./new-queries.js";

export async function fetchProposalEtas(whID, whToken) {
    const governorAddr = process.env.GOVERNOR_CONTRACT;
    const chainId = process.env.CHAIN_ID;
    // Fetch proposals where voting period ends soon
    console.log("+++++ REQUEST proposal data +++++");
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
                    limit:10
                },
                sort: {isDescending: true, sortBy: "id"}
            }
        },
    });

    console.log("+++++ proposal data +++++");
    console.log(proposalData);
    const { proposals } = proposalData ?? [];
    console.log(proposals.nodes[0]);
    // Date now as unix timestamp
    const dateNow = Date.now();
    // Now + 24h as Date
    const datePost = new Date(dateNow + (3600*1000*24));
    // Now - 1h as Date
    const datePre = new Date(dateNow - (3600*1000));
    let messageContent = "";
    let jsonData;
    // For every proposal
    for (let i = 0; i < proposals.nodes.length; i++) {
        let proposalEnd =  Date.parse(proposals.nodes[i].end.timestamp);
        // If voting period ends in less than 24h
        if (proposalEnd < datePost.getTime() && proposalEnd > dateNow) {
            messageContent += "!!! Reminder: Proposal Voting period ending soon !!! \n";
            messageContent += "[" + proposals.nodes[i].metadata.title + "](<https://www.tally.xyz/gov/lisk/proposal/" + proposals.nodes[i].id + ">) \n";
            messageContent +=  "Voting period ends at: " + new Date(proposals.nodes[i].end.timestamp) + "\n";
            messageContent += "------------------------------------ \n";
        // If voting period ended in the last hour
        } else if (proposalEnd < dateNow && proposalEnd > datePre.getTime()) {

            console.log("+++ Status Change +++");
            console.log(proposals.nodes[i].status);
            console.log(proposals.nodes[i].voteStats);

            messageContent += "!!! Proposal Voting period ended !!! \n";
            messageContent += "[" + proposals.nodes[i].metadata.title + "](<https://www.tally.xyz/gov/lisk/proposal/" + proposals.nodes[i].id + ">) \n";
            messageContent +=  "Voting result: " + proposals.nodes[i].status + "\n";
            messageContent +=  "For: " + proposals.nodes[i].voteStats[0].percent + "%" + " \n";
            messageContent +=  "Against: " + proposals.nodes[i].voteStats[1].percent + "%" + "\n";
            messageContent +=  "Abstain: " + proposals.nodes[i].voteStats[2].percent + "%" + "\n";
            messageContent += "------------------------------------ \n";
        } 
    }
    if (messageContent) {
        jsonData = { "content": messageContent };
        console.log("+++++ messageContent +++++");
        console.log(messageContent);
        // Send message to Discord channel via webhook
        const webhookURL = "https://discord.com/api/webhooks/" + whID + "/" + whToken;
        fetch(webhookURL, {
            method: "POST",
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(jsonData)
        }).then(res => {
            messageContent = null;
        }).catch(err => console.error(err));
    } else {
        console.log("+++++ no ending proposals +++++");
        /* console.log("+++++ date now +++++");
        console.log(dateNow);
        console.log("+++++ date POST 1,5h +++++");
        console.log(datePost.getTime());
        console.log("+++++ date PRE 1h +++++");
        console.log(datePre.getTime()); */
    }
}