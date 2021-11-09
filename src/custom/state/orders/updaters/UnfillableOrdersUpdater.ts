import { useCallback, useEffect, useRef } from 'react'

import { useActiveWeb3React } from 'hooks/web3'

import { usePendingOrders, useSetIsOrderUnfillable } from 'state/orders/hooks'
import { Order } from 'state/orders/actions'
import { PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL } from 'state/orders/consts'

import { SupportedChainId as ChainId } from 'constants/chains'

import { getBestQuote, PriceInformation } from 'utils/price'
import { isOrderUnfillable } from 'state/orders/utils'
import useCheckGpQuoteStatus, { GpQuoteStatus } from 'hooks/useGetGpApiStatus'
import { getPromiseFulfilledValue } from 'utils/misc'

/**
 * Thin wrapper around `getBestPrice` that builds the params and returns null on failure
 *
 * @param chainId
 * @param order
 */
async function _getOrderPrice(chainId: ChainId, order: Order, apiStatus: GpQuoteStatus) {
  let amount, baseToken, quoteToken

  if (order.kind === 'sell') {
    amount = order.sellAmount.toString()
    baseToken = order.sellToken
    quoteToken = order.buyToken
  } else {
    amount = order.buyAmount.toString()
    baseToken = order.buyToken
    quoteToken = order.sellToken
  }

  const quoteParams = {
    chainId,
    amount,
    kind: order.kind,
    sellToken: order.sellToken,
    buyToken: order.buyToken,
    baseToken,
    quoteToken,
    fromDecimals: order.inputToken.decimals,
    toDecimals: order.outputToken.decimals,
    validTo: Date.now() / 1000 + 3000,
  }

  try {
    return getBestQuote({ apiStatus, quoteParams, fetchFee: false, isPriceRefresh: false })
  } catch (e) {
    return null
  }
}

/**
 * Updater that checks whether pending orders are still "fillable"
 */
export function UnfillableOrdersUpdater(): null {
  const { chainId } = useActiveWeb3React()
  const pending = usePendingOrders({ chainId })
  const setIsOrderUnfillable = useSetIsOrderUnfillable()
  const gpApiStatus = useCheckGpQuoteStatus((process.env.DEFAULT_GP_API as GpQuoteStatus) || 'LEGACY')

  // Ref, so we don't rerun useEffect
  const pendingRef = useRef(pending)
  pendingRef.current = pending

  const updateIsUnfillableFlag = useCallback(
    (chainId: ChainId, order: Order, price: Required<PriceInformation>) => {
      const isUnfillable = isOrderUnfillable(order, price)

      // Only trigger state update if flag changed
      order.isUnfillable !== isUnfillable && setIsOrderUnfillable({ chainId, id: order.id, isUnfillable })
    },
    [setIsOrderUnfillable]
  )

  const updatePending = useCallback(() => {
    if (!chainId || pendingRef.current.length === 0) {
      return
    }

    pendingRef.current.forEach((order, index) =>
      _getOrderPrice(chainId, order, gpApiStatus).then((quote) => {
        if (quote) {
          const [promisedPrice] = quote
          const price = getPromiseFulfilledValue(promisedPrice, null)
          console.debug(
            `[UnfillableOrdersUpdater::updateUnfillable] did we get any price? ${order.id.slice(0, 8)}|${index}`,
            price ? price.amount : 'no :('
          )
          price?.amount && updateIsUnfillableFlag(chainId, order, price)
        }
      })
    )
  }, [chainId, gpApiStatus, updateIsUnfillableFlag])

  useEffect(() => {
    updatePending()

    const interval = setInterval(updatePending, PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [updatePending])

  return null
}
