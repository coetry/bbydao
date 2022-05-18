import { BigNumber, ethers } from "ethers"
import React from "react"
import { flatten } from "utils/helpers"

const TokenInput = ({
  pair,
  lpToken,
  tokenInputRef,
  handleSetTokenValue,
  handleSetMaxTokenValue,
  state,
  logo,
  setOpenSearch,
  tokens,
  isSwap,
}) => {
  const token = React.useMemo(() => {
    if (!!lpToken) {
      return flatten(lpToken)
    }
  }, [lpToken])

  const isToken0 = React.useMemo(() => {
    if (tokens?.token0) {
      return tokens?.token0?.symbol === token?.symbol
    }
  }, [token, tokens])

  const bbyDaoHasLessOf = React.useMemo(() => {
    if (
      !tokens?.token0 ||
      !tokens?.token1 ||
      (parseInt(tokens?.token0?.fiatBalance) === 0 && parseInt(tokens?.token1?.fiatBalance) === 0)
    ) {
      return undefined
    }

    if (parseInt(tokens?.token0?.fiatBalance) < parseInt(tokens?.token1?.fiatBalance)) {
      return tokens?.token0?.symbol
    } else {
      return tokens?.token1?.symbol
    }
  }, [tokens])

  const isTokenWithLessValue = React.useMemo(() => {
    if (bbyDaoHasLessOf) {
      return bbyDaoHasLessOf === token?.symbol
    }
  }, [bbyDaoHasLessOf])

  const showMax = React.useMemo(() => {
    if (isSwap) {
      return isToken0 && parseFloat(token?.fiatBalance) > 0 && tokens.token0 && tokens.token1
    }

    return isTokenWithLessValue
  }, [isSwap, isToken0, isTokenWithLessValue, token])

  const max = React.useMemo(() => {
    if (!!token) {
      if (token.symbol === "ETH") {
        const max = ethers.utils.formatUnits(BigNumber.from(token?.balance), token?.decimals)
        const uniFee = parseFloat(max) * 0.01 * 0.3
        const gasForSwap = 0.01 // should use API for this value
        return (parseFloat(max) - uniFee - gasForSwap).toFixed(6).toString()
      }

      return ethers.utils.formatUnits(BigNumber.from(token?.balance), token?.decimals)
    }
  }, [token])

  return (
    <div className="flex w-full flex-col rounded-xl border bg-slate-100 p-4 hover:border-[#FC8D4D] dark:bg-slate-800">
      <div className="flex flex-row">
        <input
          value={state?.[token?.symbol]}
          onChange={e => handleSetTokenValue(e, token, tokenInputRef)}
          className="h-16 w-full appearance-none rounded-lg bg-slate-100 py-2 px-3 text-4xl leading-tight focus:outline-none dark:bg-slate-800"
          id="name"
          name={token?.symbol}
          type="number"
          step={0.00001}
          placeholder="0.0"
          required
          max={max || ""}
          ref={tokenInputRef}
          disabled={!pair || !tokens?.token0 || !tokens?.token1}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={!isToken0 || !token ? () => setOpenSearch(true) : () => {}}
          className="text-l my-3 flex items-center justify-center rounded-xl bg-slate-200 py-1 px-6 shadow-xl dark:bg-slate-700"
        >
          {(token && (
            <>
              {logo && (
                <div className="mr-2 flex  h-8 w-8 overflow-hidden rounded-full">
                  <img alt={`${token?.symbol} icon`} src={logo} />
                </div>
              )}
            </>
          )) || <div className="flex h-8 w-8 min-w-fit items-center">Select</div>}
          {token?.symbol ? token?.symbol : ""}
        </button>
      </div>
      <div className="flex w-full flex-row items-end justify-end space-x-2 font-light">
        {token?.balance ? (
          <>
            <div className="text-sm text-slate-600">Balance:</div>
            <div className="text-sm text-slate-600">
              {ethers.utils.formatUnits(token?.balance, token?.decimals).match(/^\d+(?:\.\d{0,5})?/)}
            </div>
          </>
        ) : null}
        {showMax && (
          <div
            className={`flex cursor-pointer justify-end rounded-lg bg-[#eda67e24] py-0.5 px-2 text-[.8rem] text-[#FC8D4D] hover:bg-[#f98c4e57] ${
              !pair ? "pointer-events-none" : ""
            }`}
            onClick={!!pair ? () => handleSetMaxTokenValue(token, tokenInputRef) : () => {}}
          >
            MAX
          </div>
        )}
      </div>
    </div>
  )
}

export default TokenInput
