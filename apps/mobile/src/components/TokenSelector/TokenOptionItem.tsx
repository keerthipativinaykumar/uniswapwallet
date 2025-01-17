import { ImpactFeedbackStyle } from 'expo-haptics'
import React, { useCallback, useState } from 'react'
import { Keyboard } from 'react-native'
import { useAppTheme } from 'src/app/hooks'
import { TouchableArea } from 'src/components/buttons/TouchableArea'
import { TokenLogo } from 'src/components/CurrencyLogo/TokenLogo'
import { Box, Flex } from 'src/components/layout'
import { InlineNetworkPill } from 'src/components/Network/NetworkPill'
import { Text } from 'src/components/Text'
import TokenWarningModal from 'src/components/tokens/TokenWarningModal'
import WarningIcon from 'src/components/tokens/WarningIcon'
import { TokenOption } from 'src/components/TokenSelector/types'
import { useTokenWarningDismissed } from 'src/features/tokens/safetyHooks'
import { SafetyLevel } from 'wallet/src/data/__generated__/types-and-hooks'
import { formatNumber, formatUSDPrice, NumberType } from 'wallet/src/utils/format'

interface OptionProps {
  option: TokenOption
  showNetworkPill: boolean
  showWarnings: boolean
  onPress: () => void
}

export function TokenOptionItem({
  option,
  showNetworkPill,
  showWarnings,
  onPress,
}: OptionProps): JSX.Element {
  const theme = useAppTheme()

  const { currencyInfo, quantity, balanceUSD } = option
  const { currency, currencyId, safetyLevel, logoUrl } = currencyInfo

  const [showWarningModal, setShowWarningModal] = useState(false)
  const { tokenWarningDismissed, dismissWarningCallback } = useTokenWarningDismissed(currencyId)

  const onPressTokenOption = useCallback(() => {
    if (
      showWarnings &&
      (safetyLevel === SafetyLevel.Blocked ||
        ((safetyLevel === SafetyLevel.MediumWarning || safetyLevel === SafetyLevel.StrongWarning) &&
          !tokenWarningDismissed))
    ) {
      Keyboard.dismiss()
      setShowWarningModal(true)
      return
    }

    onPress()
  }, [onPress, safetyLevel, tokenWarningDismissed, showWarnings])

  const onAcceptTokenWarning = useCallback(() => {
    dismissWarningCallback()
    setShowWarningModal(false)
    onPress()
  }, [dismissWarningCallback, onPress])

  return (
    <>
      <TouchableArea
        hapticFeedback
        hapticStyle={ImpactFeedbackStyle.Light}
        opacity={showWarnings && safetyLevel === SafetyLevel.Blocked ? 0.5 : 1}
        testID={`token-option-${currency.chainId}-${currency.symbol}`}
        onPress={onPressTokenOption}>
        <Flex row alignItems="center" gap="spacing8" justifyContent="space-between" py="spacing12">
          <Flex row shrink alignItems="center" gap="spacing12">
            <TokenLogo
              chainId={currency.chainId}
              symbol={currency.symbol}
              url={currencyInfo.logoUrl ?? undefined}
            />
            <Flex shrink alignItems="flex-start" gap="none">
              <Flex centered row gap="spacing8">
                <Flex shrink>
                  <Text color="textPrimary" numberOfLines={1} variant="bodyLarge">
                    {currency.name}
                  </Text>
                </Flex>
                {(safetyLevel === SafetyLevel.Blocked ||
                  safetyLevel === SafetyLevel.StrongWarning) && (
                  <WarningIcon
                    height={theme.iconSizes.icon16}
                    safetyLevel={safetyLevel}
                    strokeColorOverride="textSecondary"
                    width={theme.iconSizes.icon16}
                  />
                )}
              </Flex>
              <Flex centered row gap="spacing8">
                <Text color="textSecondary" numberOfLines={1} variant="subheadSmall">
                  {currency.symbol}
                </Text>
                {showNetworkPill && <InlineNetworkPill chainId={currency.chainId} />}
              </Flex>
            </Flex>
          </Flex>

          {quantity && quantity !== 0 ? (
            <Box alignItems="flex-end">
              <Text variant="bodyLarge">{formatNumber(quantity, NumberType.TokenTx)}</Text>
              <Text color="textSecondary" variant="subheadSmall">
                {formatUSDPrice(balanceUSD)}
              </Text>
            </Box>
          ) : null}
        </Flex>
      </TouchableArea>

      {showWarningModal ? (
        <TokenWarningModal
          isVisible
          currencyId={currencyId}
          safetyLevel={safetyLevel}
          tokenLogoUrl={logoUrl}
          onAccept={onAcceptTokenWarning}
          onClose={(): void => setShowWarningModal(false)}
        />
      ) : null}
    </>
  )
}
