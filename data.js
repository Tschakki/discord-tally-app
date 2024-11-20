export let proposalCount = {"total": 0, "active": 0, "failed": 0, "passed": 0};
export let intervalNewProposals = 300000;
export let intervalVotingInfo = 3600000;

export function getIntervalNewProposals(){
    return intervalNewProposals;
}
export function setIntervalNewProposals(newInterval){   
    intervalNewProposals = newInterval;;
}

export function getIntervalVotingInfo(){
    return intervalVotingInfo;
}
export function setIntervalVotingInfo(newInterval){
    intervalVotingInfo = newInterval;
}

export function setProposalCount(newProposalCount){
    proposalCount = newProposalCount;
}
export function getProposalCount(){
    return proposalCount;
}