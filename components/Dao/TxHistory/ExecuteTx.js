import React from "react"
import { ethers } from "ethers"
import * as api from "../../../query"
import { useMutation } from "react-query"
import { createSeaport } from "utils/createSeaport"
import { createSafeSdk } from "utils/createSafeSdk"

const ExecuteTx = ({ tx, address }) => {
  const { id, type, value, tokenContract, tokenId, txHash, safeContract, receiver, executor } = tx

  const {
    data: mutateTxData,
    status: mutateTxStatus,
    mutateAsync: mutateTx,
  } = useMutation(api.mutateOffChainTx)

  const {
    data: relationshipTxData,
    status: relationshipTxStatus,
    mutateAsync: createRelationshipTx,
  } = useMutation(api.reqRelationship)

  const {
    data: requestTxData,
    status: requestTxStatus,
    mutateAsync: mutateRelationshipTx,
  } = useMutation(api.updateRelationship)

  const {
    data: storeTxData,
    status: storeTxStatus,
    mutateAsync: storeTxOffChain,
  } = useMutation(api.storeTxOffChain)

  const { 
    data: deleteTxData,
    status: deleteTxStatus, 
    mutateAsync: deleteOffChainTx } = useMutation(api.deleteOffChainTx);

  const handleExecute = async e => {
    e.preventDefault()
    if (type === 1) {
      let acct = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      acct = ethers.utils.getAddress(...acct)
      console.log("addr ", acct)
      // opensea offer tx
      const seaport = await createSeaport()
      let ethValue = ethers.utils.formatEther(value)
      ethValue = Number(ethValue)
      const desiredAsset = await seaport.api.getAsset({
        tokenId,
        tokenAddress: tokenContract,
      })

      const order = {
        asset: {
          tokenId: desiredAsset.tokenId,
          tokenAddress: desiredAsset.tokenAddress,
          schemaName:
            desiredAsset.schemaName === "ERC1155" ? "ERC1155" : "ERC721",
        },
        accountAddress: safeContract, // contract address can't be input here
        startAmount: ethValue,
      }

      const offer = await seaport.createBuyOrder(order)
      console.log("offer", offer)
    }

    if (type === 2) {
      // opensea purchase tx
      let acct = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      acct = ethers.utils.getAddress(...acct)
      console.log("addr ", acct)
      // opensea offer tx
      const seaport = await createSeaport()
      let ethValue = ethers.utils.formatEther(value)
      ethValue = Number(ethValue)
      const desiredAsset = await seaport.api.getAsset({
        tokenId,
        tokenAddress: tokenContract,
      })

      const order = {
        asset: {
          tokenId: desiredAsset.tokenId,
          tokenAddress: desiredAsset.tokenAddress,
          schemaName:
            desiredAsset.schemaName === "ERC1155" ? "ERC1155" : "ERC721",
        },
        accountAddress: safeContract, // contract address can't be input here
        startAmount: ethValue,
      }

      const offer = await seaport.createBuyOrder(order)
      console.log("offer ", offer)

      const transfer = await seaport.fulfillOrder({
        order: offer,
        accountAddress: acct,
        recipientAddress: safeContract,
      })

      console.log("transfer ", transfer)
    }

    if (type === 4) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner(provider.provider.selectedAddress)
         // create fee tx for our safe
        const safeSdk = await createSafeSdk(safeContract)
        console.log('safe in exec ', safeSdk)

        const safeTx = await safeService.getTransaction(txHash)
        const executed = await safeSdk.executeTransaction(safeTx)

        console.log('executed ', executed)

        /*
        if(executed) {
          const tx = {
            id: tx.id,
            txHash
          }
          
          deleteTx(tx)
        }
        */
      } catch(e) {
        console.log('exec error ', e)
      }
    }

    if(type === 6) { // friend request

      if(value === "RESPONSE") {
        // if tx.value === RESPONSE then we just need to edit the current record with their accepted state or delete it if they rejected
        const req = {
          id: tx.executor, 
          status: 5 //pending request to friends
        }

        const txReq = {
          id: tx.id
        }

        await mutateRelationshipTx(req)
        await deleteOffChainTx(txReq)
      }

      if(value === "REQUEST") {
        // if tx.value === REQUEST then we need to make a relationship object between both DAOS and create a tx object for the receiving dao to respond
        const req = {
          initiator: safeContract,
          target: receiver,
          status: 3 //pending request
        }

        

        const reqTx = {
          id: tx.id
        }

        await deleteOffChainTx(reqTx)
        const transaction = await createRelationshipTx(req)

        const resTx = {
          creator: safeContract,
          receiver: safeContract, // the bbyDAO that initiated the request will be the receiver of the response
          safeContract: receiver, // the bbyDAO that needs to respond is the safeContract addr we need to attach tx to
          txHash: "DAOTODAO",
          type: 6,
          value: "RESPONSE",
          executor: transaction.id //the reference to the transaction for editing the relationship for acceptance or deletion
        }

        await storeTxOffChain(resTx)
      }
      
      return
    }

    /*
    // create fee tx for our safe
    const safeSdk = await createSafeSdk(safeContract)
    let wei = ethers.utils.parseEther(value)
    let weiString = wei.toString()
    let fee = (Number(weiString) * 0.01).toString()
    const transactions = [
      {
        to: process.env.dao,
        data: ethers.utils.hexlify([1]),
        value: fee,
      },
    ]
    const safeTransaction = await safeSdk.createTransaction(...transactions)
    const safeTxHash = await safeSdk.getTransactionHash(safeTransaction)
    try {
      // Sign the transaction off-chain (in wallet)
      const signedTransaction = await safeSdk.signTransaction(safeTransaction)
      // mutate tx on backend
      const tx = {
        txHash: txHash,
        executor: address,
      }
      mutateTx(tx)
    } catch (error) {
      // user rejected tx
      console.log("user rejected tx")
      return
    }
    */
  }

  return (
    <button
      className="mr-1 rounded-lg bg-blue-400 p-1 text-xs shadow-sm hover:bg-blue-500"
      onClick={handleExecute}
    >
      execute
    </button>
  )
}

export default ExecuteTx
