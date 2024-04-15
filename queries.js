export const Chains = `query Chains {
  chains {
    id
    layer1Id
    name
    mediumName
    shortName
    blockTime
    isTestnet
    nativeCurrency {
      name
      symbol
      decimals
    }
    chain
    blockExplorerAPI
    blockExplorerURL
    useLayer1VotingPeriod
    gnosisServiceURL
    cowswapSupport
    milkmanContract
    envExplorerArg
    envRPCArg
  }
}`

export const GovernorDocument = `query Governor($input: GovernorInput!) {
      governor(input: $input) {
        id
        name
        proposalStats {
          total
          active
        }
      }
  }`;

export const GovernorsV2 =`query GovernorsV2($input: GovernorsInput!) {
  governorsV2(input: $input) {
    pageInfo {
    firstCursor
    lastCursor
    count
  }
}`

export const GovernorsDocument = `query Governors($chainIds: [ChainID!], $pagination: Pagination, $sort: GovernorSort) {
  governors(chainIds: $chainIds, pagination: $pagination, sort: $sort) {
    id
    name
    organization {
      id
      slug
      name
      chainIds
      governorIds
      proposalsCount
    }
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

export const ProposalsDocument = `query Proposals($chainId: ChainID!, $governors: [Address!], $pagination: Pagination, $sort: ProposalSort) {
  proposals(chainId: $chainId, governors: $governors, pagination: $pagination, sort: $sort) {
    id
    title
    eta
    end {
      ... on Block {
        timestamp
      }
      ... on BlocklessTimestamp {
        timestamp
      }
    }
    governor {
      name
      organization {
        id
        name
        chainIds
      }
    }
    block {
      timestamp
    }
    proposer {
      address
      ens
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