import { PublicKey, Connection, clusterApiUrl, Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID, createTransferCheckedInstruction } from '@solana/spl-token'

import { Contract, JsonRpcProvider } from 'ethers'

const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed') // connection to mainnet
const secretKeyArray = await Bun.file('./uSEZwk76nxzBCbbPzD9Yc191wYdkQu5wN8GmV7p5zSo.json').json() // generated key is in the same directory as this file
const secretKey = Uint8Array.from(secretKeyArray);
const signer = Keypair.fromSecretKey(secretKey); // derived signer https://solana.com/docs/clients/javascript#quickstart


// The `Deposit Event` contains the details needed to fulfill the transfer of tokens
const abi = [	{
  "anonymous": false,
  "inputs": [
    {
      "indexed": false,
      "internalType": "address",
      "name": "bscSender",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "string",
      "name": "solReceiver",
      "type": "string"
    }
  ],
  "name": "Deposit",
  "type": "event"
}]



const decimals = 9 // token decimals during token creation
const uselessTokenAddressSPL = '6QWe8neoMdYUcv7LRnaBguVHTEKxC59j6Fhw8XT2pxqW' // address generated after token was minted
const mySOLWalletAddress = 'uSEZwk76nxzBCbbPzD9Yc191wYdkQu5wN8GmV7p5zSo'
const uselessTokenAddressBSC = '0x84109ff145Df1F2f3df12AD57BC104d96E034f58' // address generated after token was minted

const bscConn = new JsonRpcProvider('https://go.getblock.io/3be5d24b27a9492c9ab2a67e051fbe00')
const uselessPurse = new Contract(uselessTokenAddressBSC, abi, bscConn)

// function to send solana token to given receiver and amount 
const sendSolanaToken = async (solReceiver: string, amount: number) => {
  const uselessToken = new PublicKey(uselessTokenAddressSPL)
  const mySOLWallet = new PublicKey(mySOLWalletAddress)
  const receiver = new PublicKey(solReceiver)

  // this is important because solana spl-tokens use different accounts
  // to hold tokens for different wallets, so if the receiving account
  // doesn't already have an associated account for this token, we will have to create it for them
  // so that they can receive it (Read more at https://spl.solana.com/token#example-transferring-tokens-to-another-user)
  const fromAccount = await getOrCreateAssociatedTokenAccount(connection, signer, uselessToken, mySOLWallet)
  const toAccount = await getOrCreateAssociatedTokenAccount(connection, signer, uselessToken, receiver)

  try {
    // to ensure we are attempting to add our transaction after a previously finalized block
    const latestBlock = await connection.getLatestBlockhash('finalized');
    const tx = new Transaction().add(
      createTransferCheckedInstruction(
        fromAccount.address, uselessToken, toAccount.address, mySOLWallet, amount, decimals, undefined, TOKEN_PROGRAM_ID
      )
    )
    tx.recentBlockhash = latestBlock.blockhash
    tx.lastValidBlockHeight = latestBlock.lastValidBlockHeight

    // broadcast the transaction
    const txHash = await sendAndConfirmTransaction(connection, tx, [signer])
    // log transaction hash
    console.log(txHash)
    return txHash;
  } catch (e) {
    // log error
    console.log('error occurred here', e)
  }
}



// this will watch for the deposit event on our uselesspurse contract 
// this is the entry point to the bridge
uselessPurse.on('Deposit', async(_: string, amount: string, receiver: string) =>  {
  // a good idea would be to queue responses here to fulfill them automatically at intervals 
  // especially because of rate-limiting on the node or in case any transfer fails for any possible reason
  // like if it is an invalid solana address

  // fulfil the token transfer
  await sendSolanaToken(receiver, Number(amount))
})

