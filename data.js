export let proposalCount = {"total": 0, "active": 0, "failed": 0, "passed": 0};

export function updateProposalCount(newProposalCount){
    proposalCount = newProposalCount;
}

export function getProposalCount(){
    return proposalCount;
}