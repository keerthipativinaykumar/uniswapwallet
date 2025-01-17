import { BigNumber } from 'ethers'
import { ChainId, TESTNET_CHAIN_IDS } from 'wallet/src/constants/chains'
import { PollingInterval } from 'wallet/src/constants/misc'
import { Chain } from 'wallet/src/data/__generated__/types-and-hooks'
import {
  fromGraphQLChain,
  fromMoonpayNetwork,
  getPollingIntervalByBlocktime,
  isTestnet,
  parseActiveChains,
  toGraphQLChain,
  toSupportedChainId,
} from './chainId'

describe(toSupportedChainId, () => {
  it('handles undefined input', () => {
    expect(toSupportedChainId(undefined)).toEqual(null)
  })

  it('handles unsupported chain ID', () => {
    expect(toSupportedChainId(BigNumber.from(6767))).toEqual(null)
  })

  it('handles supported chain ID', () => {
    expect(toSupportedChainId(ChainId.Polygon)).toEqual(137)
  })
})

describe(parseActiveChains, () => {
  it('handles empty string', () => {
    expect(parseActiveChains('')).toEqual([])
  })

  it('handles single chain ID', () => {
    expect(parseActiveChains('1')).toEqual([1])
  })

  it('handles multiple chain IDs', () => {
    expect(parseActiveChains('1,137')).toEqual([1, 137])
  })

  it('handles invalid characters', () => {
    expect(parseActiveChains('1,test')).toEqual([1])
  })
})

describe(isTestnet, () => {
  it('handles non-testnet', () => {
    expect(isTestnet(ChainId.Mainnet)).toEqual(false)
  })

  it('handles testnet', () => {
    expect(isTestnet(TESTNET_CHAIN_IDS[0])).toEqual(true)
  })
})

describe(fromGraphQLChain, () => {
  it('handles undefined', () => {
    expect(fromGraphQLChain(undefined)).toEqual(null)
  })

  it('handles supported chain', () => {
    expect(fromGraphQLChain(Chain.Arbitrum)).toEqual(ChainId.ArbitrumOne)
  })

  it('handles unsupported chain', () => {
    expect(fromGraphQLChain(Chain.Celo)).toEqual(null)
  })
})

describe(toGraphQLChain, () => {
  it('handles supported chain', () => {
    expect(toGraphQLChain(ChainId.Mainnet)).toEqual(Chain.Ethereum)
  })

  it('handle unsupported chain', () => {
    expect(toGraphQLChain(ChainId.PolygonMumbai)).toEqual(null)
  })
})

describe(fromMoonpayNetwork, () => {
  it('handles supported chain', () => {
    expect(fromMoonpayNetwork(undefined)).toEqual(ChainId.Mainnet)
    expect(fromMoonpayNetwork(Chain.Arbitrum.toLowerCase())).toEqual(ChainId.ArbitrumOne)
    expect(fromMoonpayNetwork(Chain.Optimism.toLowerCase())).toEqual(ChainId.Optimism)
    expect(fromMoonpayNetwork(Chain.Polygon.toLowerCase())).toEqual(ChainId.Polygon)
  })

  it('handle unsupported chain', () => {
    expect(() => fromMoonpayNetwork('unkwnown')).toThrow(
      'Moonpay network "unkwnown" can not be mapped'
    )
  })
})

describe(getPollingIntervalByBlocktime, () => {
  it('returns the correct value for L1', () => {
    expect(getPollingIntervalByBlocktime(ChainId.Mainnet)).toEqual(PollingInterval.Fast)
  })

  it('returns the correct value for L2', () => {
    expect(getPollingIntervalByBlocktime(ChainId.Polygon)).toEqual(PollingInterval.LightningMcQueen)
  })
})
