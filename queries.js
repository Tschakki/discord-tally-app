const GovernorDocument = `query Governor($input: GovernorInput!) {
      governor(input: $input) {
        id
        chainId
        proposalStats
      }
  }`;

export const GovernorsDocument = `query Governors($chainIds: [ChainID!], $pagination: Pagination, $sort: GovernorSort) {
  governors(chainIds: $chainIds, pagination: $pagination, sort: $sort) {
    id
    name
    tokens {
      stats {
        voters
      }
    }
    proposalStats {
      total
      active
    }
  }
}`;

export const ProposalsDocument = `query Proposals($chainId: ChainID!, $pagination: Pagination, $sort: ProposalSort) {
  proposals(chainId: $chainId, pagination: $pagination, sort: $sort) {
    id
    title
    eta
    governor {
      name
    }
    voteStats {
      support
      weight
      votes
      percent
    }
  }
}`;