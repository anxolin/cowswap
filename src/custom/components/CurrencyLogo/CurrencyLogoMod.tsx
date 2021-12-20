import { Currency } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import { useMemo } from 'react'
import styled from 'styled-components/macro'

import EthereumLogo from 'assets/images/ethereum-logo.png'
import useHttpLocations from 'hooks/useHttpLocations'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import Logo from 'components/Logo'
import { ADDRESS_IMAGE_OVERRIDE } from 'constants/tokens'

// type Network = 'ethereum' | 'arbitrum' | 'optimism'
type Network = 'ethereum' | 'xdai'

function chainIdToNetworkName(networkId: SupportedChainId): Network {
  switch (networkId) {
    case SupportedChainId.MAINNET:
      return 'ethereum'
    case SupportedChainId.XDAI: // mod
      return 'xdai'
    // case SupportedChainId.ARBITRUM_ONE:
    //   return 'arbitrum'
    // case SupportedChainId.OPTIMISM:
    //   return 'optimism'
    default:
      return 'ethereum'
  }
}

export const getTokenLogoURL = (
  address: string,
  chainId: SupportedChainId = SupportedChainId.MAINNET
): string | void => {
  const networkName = chainIdToNetworkName(chainId)
  // const networksWithUrls = [SupportedChainId.ARBITRUM_ONE, SupportedChainId.MAINNET, SupportedChainId.OPTIMISM]
  const networksWithUrls = [SupportedChainId.MAINNET, SupportedChainId.XDAI] // mod
  if (networksWithUrls.includes(chainId)) {
    return `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/${networkName}/assets/${address}/logo.png`
  }
}

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

export const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`

export default function CurrencyLogo({
  currency,
  size = '24px',
  style,
  ...rest
}: {
  currency?: Currency | null
  size?: string
  style?: React.CSSProperties
}) {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (!currency || currency.isNative) return []
    const imageOverride = ADDRESS_IMAGE_OVERRIDE[currency.address]

    if (currency.isToken) {
      const defaultUrls = []
      const url = imageOverride || getTokenLogoURL(currency.address, currency.chainId)
      if (url) {
        defaultUrls.push(url)
      }
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, ...defaultUrls]
      }
      return defaultUrls
    }
    return []
  }, [currency, uriLocations])

  if (currency?.isNative) {
    return <StyledEthereumLogo src={EthereumLogo} alt="ethereum logo" size={size} style={style} {...rest} />
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} {...rest} />
}
