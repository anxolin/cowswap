import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { AppState } from 'state'
import { useAppDispatch } from 'state/hooks'
import { updateReferralAddress } from 'state/affiliate/actions'
import { APP_DATA_HASH } from 'constants/index'

export function useAppDataHash() {
  return useSelector<AppState, string>((state) => {
    return state.affiliate.appDataHash || APP_DATA_HASH
  })
}

export function useReferralAddress() {
  return useSelector<
    AppState,
    | {
        value: string
        isValid: boolean
      }
    | undefined
  >((state) => {
    return state.affiliate.referralAddress
  })
}

export function useAddress() {
  return useSelector<AppState, string | undefined>((state) => {
    return state.affiliate.address
  })
}

export function useResetReferralAddress() {
  const dispatch = useAppDispatch()

  return useCallback(() => dispatch(updateReferralAddress(null)), [dispatch])
}

export function useIsNotificationClosed(id?: string): boolean | null {
  return useSelector<AppState, boolean | null>((state) => {
    return id ? state.affiliate.isNotificationClosed?.[id] ?? false : null
  })
}
