import { useMemo } from 'react'
import { ButtonSecondary } from 'components/Button'
import { shortenAddress } from 'utils'
import { TopNav, ClaimAccount, ClaimAccountButtons } from './styled'
import { ClaimCommonTypes } from './types'
import { useClaimDispatchers, useClaimState } from 'state/claim/hooks'
import { ClaimStatus } from 'state/claim/actions'
import Identicon from 'components/Identicon'

type ClaimNavProps = Pick<ClaimCommonTypes, 'account' | 'handleChangeAccount'>

export default function ClaimNav({ account, handleChangeAccount }: ClaimNavProps) {
  const { activeClaimAccount, activeClaimAccountENS, claimStatus, investFlowStep } = useClaimState()
  const { setActiveClaimAccount } = useClaimDispatchers()

  const isAttempting = useMemo(() => claimStatus === ClaimStatus.ATTEMPTING, [claimStatus])
  const hasActiveAccount = activeClaimAccount !== ''

  return (
    <TopNav>
      <ClaimAccount>
        <div>
          {hasActiveAccount && (
            <>
              <Identicon account={activeClaimAccount} size={46} />
              <p>{activeClaimAccountENS ? activeClaimAccountENS : shortenAddress(activeClaimAccount)}</p>
            </>
          )}
        </div>
        <ClaimAccountButtons>
          {!!account && (account !== activeClaimAccount || activeClaimAccount === '') && (
            <ButtonSecondary disabled={isAttempting} onClick={() => setActiveClaimAccount(account)}>
              Switch to connected account
            </ButtonSecondary>
          )}

          {/* Hide account changing action on:
           * last investment step
           * attempted claim in progress
           */}
          {hasActiveAccount && (investFlowStep < 2 || !isAttempting) && (
            <ButtonSecondary disabled={isAttempting} onClick={handleChangeAccount}>
              Change account
            </ButtonSecondary>
          )}
        </ClaimAccountButtons>
      </ClaimAccount>
    </TopNav>
  )
}
