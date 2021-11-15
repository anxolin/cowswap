import { Trans } from '@lingui/macro'
import { Token } from '@uniswap/sdk-core'
// import Card from 'components/Card'
import Column from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import Row, { RowBetween, RowFixed } from 'components/Row'
import { useToken } from 'hooks/Tokens'
import { useActiveWeb3React } from 'hooks/web3'
import { RefObject, useCallback, useMemo, useRef, useState } from 'react'
import { useRemoveUserAddedToken, useUserAddedTokens } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { ButtonText, ExternalLink, ExternalLinkIcon, TrashIcon, TYPE } from 'theme'
import { isAddress } from 'utils'

import useTheme from 'hooks/useTheme'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { CurrencyModalView } from 'components/SearchModal/CurrencySearchModal'
// import ImportRow from 'components/SearchModal/ImportRow'
import { PaddedColumn, Separator, SearchInput } from 'components/SearchModal/styleds'

import { ImportTokensRowProps } from '.' // mod

const Wrapper = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  position: relative;
  padding-bottom: 80px;
`

export const Footer = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  border-radius: 20px;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
  border-top: 1px solid ${({ theme }) => theme.bg3};
  padding: 20px;
  text-align: center;
`

export interface ManageTokensProps {
  setModalView: (view: CurrencyModalView) => void
  setImportToken: (token: Token) => void
  ImportTokensRow: ({ theme, searchToken, setModalView, setImportToken }: ImportTokensRowProps) => JSX.Element
}

export default function ManageTokens({ setModalView, setImportToken, ImportTokensRow }: ManageTokensProps) {
  const { chainId } = useActiveWeb3React()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const theme = useTheme()

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback((event) => {
    const input = event.target.value
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
  }, [])

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery)
  const searchToken = useToken(searchQuery)

  // all tokens for local lisr
  const userAddedTokens: Token[] = useUserAddedTokens()
  const removeToken = useRemoveUserAddedToken()

  const handleRemoveAll = useCallback(() => {
    if (chainId && userAddedTokens) {
      userAddedTokens.map((token) => {
        return removeToken(chainId, token.address)
      })
    }
  }, [removeToken, userAddedTokens, chainId])

  const tokenList = useMemo(() => {
    return (
      chainId &&
      userAddedTokens.map((token) => (
        <RowBetween key={token.address} width="100%">
          <RowFixed>
            <CurrencyLogo currency={token} size={'20px'} />
            <ExternalLink href={getExplorerLink(chainId, token.address, ExplorerDataType.ADDRESS)}>
              <TYPE.main ml={'10px'} fontWeight={600}>
                {token.symbol}
              </TYPE.main>
            </ExternalLink>
          </RowFixed>
          <RowFixed>
            <TrashIcon onClick={() => removeToken(chainId, token.address)} />
            <ExternalLinkIcon href={getExplorerLink(chainId, token.address, ExplorerDataType.ADDRESS)} />
          </RowFixed>
        </RowBetween>
      ))
    )
  }, [userAddedTokens, chainId, removeToken])

  return (
    <Wrapper>
      <Column style={{ width: '100%', height: '100%', flex: '1 1' }}>
        <PaddedColumn gap="14px">
          <Row>
            <SearchInput
              type="text"
              id="token-search-input"
              placeholder={'0x0000'}
              value={searchQuery}
              autoComplete="off"
              ref={inputRef as RefObject<HTMLInputElement>}
              onChange={handleInput}
            />
          </Row>
          {searchQuery !== '' && !isAddressSearch && (
            <TYPE.error error={true}>
              <Trans>Enter valid token address</Trans>
            </TYPE.error>
          )}
          {searchToken && ( // MOD
            <ImportTokensRow
              searchToken={searchToken}
              setModalView={setModalView}
              setImportToken={setImportToken}
              theme={theme}
            />
          )}
        </PaddedColumn>
        <Separator />
        <PaddedColumn gap="lg" style={{ overflow: 'auto', marginBottom: '10px' }}>
          <RowBetween>
            <TYPE.main fontWeight={600}>
              <Trans>{userAddedTokens?.length} Custom Tokens</Trans>
            </TYPE.main>
            {userAddedTokens.length > 0 && (
              <ButtonText onClick={handleRemoveAll}>
                <TYPE.blue>
                  <Trans>Clear all</Trans>
                </TYPE.blue>
              </ButtonText>
            )}
          </RowBetween>
          {tokenList}
        </PaddedColumn>
      </Column>
      <Footer>
        <TYPE.darkGray>
          <Trans>Tip: Custom tokens are stored locally in your browser</Trans>
        </TYPE.darkGray>
      </Footer>
    </Wrapper>
  )
}
