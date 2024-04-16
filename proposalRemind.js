import { fetcher } from "./fetcher.js";
import { ProposalsDocument } from "./queries.js";

export async function fetchProposalEtas(whID, whToken) {

    const governorAddr = "0xcBf493d00b17Ba252FEB4403BcFf2F0520C52C7D";
    const chainId = "eip155:4202";

    // Fetch proposals where voting period ends soon
    const proposalData = await fetcher({
        query: ProposalsDocument,
        variables: {
            chainId,
            governors: [governorAddr],
            pagination: { limit: 3, offset: 0 },
            sort: { field: "END_BLOCK", order: "DESC" },
        },
    });

    console.log("+++++ proposal data +++++");
    console.log(proposalData);

    const { proposals } = proposalData ?? [];
    // Date now as unix timestamp
    const dateNow = Date.now();
    // Now + 1,5h as Date
    const datePost = new Date(dateNow + (5400*1000));
    // Now - 1h as Date
    const datePre = new Date(dateNow - (3600*1000));
    console.log("+++++ date now +++++");
    console.log(dateNow);
    console.log("+++++ date 1,5h +++++");
    console.log(datePost.getTime());
    let messageContent = "";
    // For every proposal
    for (let i = 0; i < proposals.length; i++) {
        console.log("+++END+++");
        console.log(Date.parse(proposals[i].end.timestamp));
        const proposalEnd = Date.parse(proposals[i].end.timestamp);
        // If voting period ends in less than 1,5h
        if (proposalEnd < datePost.getTime() && proposalEnd > dateNow) {
            messageContent += "!!! Reminder: Proposal Voting period ending soon !!! \n";
            messageContent += "[" + proposals[i].title + "](<https://www.tally.xyz/gov/3rd-testing/proposal/" + proposals[i].id + ">) \n";
            messageContent +=  "Voting period ends at: " + new Date(proposals[i].end.timestamp) + "\n";

        } else if (proposalEnd < dateNow && proposalEnd > datePre.getTime()) {

            console.log("+++ Status Change +++");
            console.log(proposals[i].statusChanges);
            console.log(proposals[i].voteStats);

            let latestStatus = proposals[i].statusChanges.length - 1;
            messageContent += "!!! Proposal Voting period ended !!! \n";
            messageContent += "[" + proposals[i].title + "](<https://www.tally.xyz/gov/3rd-testing/proposal/" + proposals[i].id + ">) \n";
            messageContent +=  "Voting result: " + proposals[i].statusChanges[latestStatus].type + "\n";
            messageContent +=  "For: " + proposals[i].voteStats[0].votes + " votes , voteweight: " + proposals[i].voteStats[0].weight + " \n";
            messageContent +=  "Against: " + proposals[i].voteStats[1].votes + " votes , voteweight: " + proposals[i].voteStats[1].weight + "\n";
            messageContent +=  "Abstain: " + proposals[i].voteStats[2].votes + " votes , voteweight: " + proposals[i].voteStats[2].weight+ "\n";

        }
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
        //console.log("Request complete! response:", res);
        });
}