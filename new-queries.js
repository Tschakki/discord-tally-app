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
  
  export const GovernorsDocument = `query Governors($input: GovernorsInput! ) {
    governors(input: $input) {
        pageInfo {
            firstCursor
            lastCursor
            count
        }
    }
  }`;
  
  export const ProposalsDocument = `query Proposals($input: ProposalsInput!) {
    proposals(input: $input) {
      nodes {
        ... on Proposal {
          id 
          metadata {
            title
          }
          proposer {
            name
            ens
            address
          }
          end {
            ... on Block {
              timestamp
            }
          }
          status
        }
      }
      pageInfo {
        firstCursor
        lastCursor
        count
      }
    }
  }`;