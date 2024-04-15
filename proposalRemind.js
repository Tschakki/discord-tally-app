import { fetcher } from "./fetcher.js";
import { ProposalsDocument } from "./queries.js";

export async function fetchProposalEtas(whID, whToken) {

    const governorAddr = "0xcBf493d00b17Ba252FEB4403BcFf2F0520C52C7D";
    const chainId = "eip155:4202";

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
    const dateNow = Date.now();
    const date1h = new Date(dateNow + (5400*1000));
    console.log("+++++ date now +++++");
    console.log(dateNow);
    console.log("+++++ date 1,5h +++++");
    console.log(date1h.getTime());
    let messageContent = "";
    for (let i = 0; i < proposals.length; i++) {
        console.log("+++END+++");
        console.log(Date.parse(proposals[i].end.timestamp));
        if (Date.parse(proposals[i].end.timestamp) < date1h.getTime() && Date.parse(proposals[i].end.timestamp) > dateNow) {
            messageContent += "!!! Reminder: Proposal Voting period ending soon !!! \n";
            messageContent += "[" + proposals[i].title + "](<https://www.tally.xyz/gov/3rd-testing/proposal/" + proposals[i].id + ">) \n";
            messageContent +=  "Voting period ends at: " + new Date(proposals[i].end.timestamp) + "\n";

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