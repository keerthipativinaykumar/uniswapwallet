import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import JSBI from 'jsbi'
import { ChainId } from 'wallet/src/constants/chains'

const NATIVE_CURRENCY_DECIMALS = 18

// TODO(MOB-181): calculate this in a more scientific way
export const MIN_ETH_FOR_GAS: JSBI = JSBI.multiply(
  JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(NATIVE_CURRENCY_DECIMALS - 3)),
  JSBI.BigInt(12)
) // .012 ETH

export const MIN_POLYGON_FOR_GAS: JSBI = JSBI.multiply(
  JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(NATIVE_CURRENCY_DECIMALS - 2)),
  JSBI.BigInt(6)
) // .06 MATIC

export const MIN_ARBITRUM_FOR_GAS: JSBI = JSBI.multiply(
  JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(NATIVE_CURRENCY_DECIMALS - 4)),
  JSBI.BigInt(6)
) // .0006 ETH

export const MIN_OPTIMISM_FOR_GAS: JSBI = MIN_ARBITRUM_FOR_GAS

/**
 * Given some token amount, return the max that can be spent of it
 * https://github.com/Uniswap/interface/blob/main/src/utils/maxAmountSpend.ts
 * @param currencyAmount to return max of
 */
export function maxAmountSpend(
  currencyAmount?: CurrencyAmount<Currency> | null
): CurrencyAmount<Currency> | undefined {
  if (!currencyAmount) return undefined
  if (currencyAmount.currency.isNative) {
    let minAmount
    switch (currencyAmount.currency.chainId) {
      case ChainId.Mainnet:
        minAmount = MIN_ETH_FOR_GAS
        break
      case ChainId.Polygon:
        minAmount = MIN_POLYGON_FOR_GAS
        break
      case ChainId.ArbitrumOne:
        minAmount = MIN_ARBITRUM_FOR_GAS
        break
      case ChainId.Optimism:
        minAmount = MIN_OPTIMISM_FOR_GAS
        break
    }
    if (!minAmount) return undefined
    if (JSBI.greaterThan(currencyAmount.quotient, minAmount)) {
      return CurrencyAmount.fromRawAmount(
        currencyAmount.currency,
        JSBI.subtract(currencyAmount.quotient, minAmount)
      )
    } else {
      return CurrencyAmount.fromRawAmount(currencyAmount.currency, JSBI.BigInt(0))
    }
  }
  return currencyAmount
}
