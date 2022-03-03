import { createAction } from '@reduxjs/toolkit'
import { FeeQuoteParams } from 'utils/price'
import { SupportedChainId as ChainId } from 'constants/chains'
import { QuoteInformationObject } from './reducer'

export type UpdateQuoteParams = Omit<QuoteInformationObject, 'lastCheck'>

export interface ClearQuoteParams {
  token: string // token address,
  chainId: ChainId
}

export type GetQuoteParams = FeeQuoteParams
export type RefreshQuoteParams = Pick<GetQuoteParams, 'sellToken' | 'chainId'>

export type QuoteError =
  | 'fetch-quote-error'
  | 'insufficient-liquidity'
  | 'fee-exceeds-sell-amount'
  | 'unsupported-token'
  | 'offline-browser'
  | 'zero-price'
  | 'transfer-eth-to-smart-contract'

export type SetQuoteErrorParams = UpdateQuoteParams & { error?: QuoteError }

export const getNewQuote = createAction<GetQuoteParams>('price/getNewQuote')
export const refreshQuote = createAction<RefreshQuoteParams>('price/refreshQuote')
export const updateQuote = createAction<UpdateQuoteParams>('price/updateQuote')
export const setQuoteError = createAction<SetQuoteErrorParams>('price/setQuoteError')
