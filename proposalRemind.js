import { fetcher } from "./fetcher.js";
import { ProposalsDocument } from "./new-queries.js";

export async function fetchProposalEtas(whID, whToken) {

    //const governorAddr = "0x58a61b1807a7bDA541855DaAEAEe89b1DDA48568";
    //const chainId = "eip155:1135";
    const governorAddr = "0xcBf493d00b17Ba252FEB4403BcFf2F0520C52C7D";
    const chainId = "eip155:4202";
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
                    limit:3
                },
                sort: {isDescending: true, sortBy: "id"}
            }
        },
    });

    console.log("+++++ proposal data +++++");
    console.log(proposalData);
    //console.log(proposalData.proposals.nodes[0]);
    const { proposals } = proposalData ?? [];
    // Date now as unix timestamp
    const dateNow = Date.now();
    // Now + 1,5h as Date
    //const datePost = new Date(dateNow + (5400*1000));
    const datePost = new Date(dateNow + (120*1000));
    // Now - 1h as Date
    //const datePre = new Date(dateNow - (3600*1000));
    const datePre = new Date(dateNow - (60*1000));
    let messageContent = "";
    let jsonData;
    // For every proposal
    for (let i = 0; i < proposals.nodes.length; i++) {
        console.log(proposals.nodes[i]);
        console.log("+++END+++");
        const proposalEnd =  Date.parse(proposals.nodes[i].end.timestamp);
        console.log(proposalEnd);
        // If voting period ends in less than 1,5h
        if (proposalEnd < datePost.getTime() && proposalEnd > dateNow) {
            messageContent += "!!! Reminder: Proposal Voting period ending soon !!! \n";
            messageContent += "[" + proposals.nodes[i].title + "](<https://www.tally.xyz/gov/lisk/proposal/" + proposals.nodes[i].id + ">) \n";
            messageContent +=  "Voting period ends at: " + new Date(proposals.nodes[i].end.timestamp) + "\n";
        // If voting period ended in the last hour
        } else if (proposalEnd < dateNow && proposalEnd > datePre.getTime()) {

            console.log("+++ Status Change +++");
            console.log(proposals.nodes[i].status);
            console.log(proposals.nodes[i].voteStats);

            messageContent += "!!! Proposal Voting period ended !!! \n";
            messageContent += "[" + proposals.nodes[i].title + "](<https://www.tally.xyz/gov/lisk/proposal/" + proposals.nodes[i].id + ">) \n";
            messageContent +=  "Voting result: " + proposals.nodes[i].status + "\n";
            messageContent +=  "For: " + proposals.nodes[i].voteStats[0].percentage + "%" + " \n";
            messageContent +=  "Against: " + proposals.nodes[i].voteStats[1].percentage + "%" + "\n";
            messageContent +=  "Abstain: " + proposals.nodes[i].voteStats[2].percentage + "%" + "\n";

        } else {
            console.log("+++++ no ending proposals +++++");
            console.log("+++++ date now +++++");
            console.log(dateNow);
            console.log("+++++ date POST 1,5h +++++");
            console.log(datePost.getTime());
            console.log("+++++ date PRE 1h +++++");
            console.log(datePre.getTime());
        }
        if (messageContent) {
            jsonData = { "content": messageContent };
            console.log("+++++ messageContent +++++");
            console.log(messageContent);
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
            }).catch(err => console.error(err));
        }
        
    }

/*     const jsonData = { "content": messageContent };

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
        }); */
}