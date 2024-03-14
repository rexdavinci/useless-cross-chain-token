import { PublicKey, Connection, clusterApiUrl, Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID, createTransferCheckedInstruction } from '@solana/spl-token'

const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed') // connection to mainnet
const secretKeyArray = await Bun.file('./uSEZwk76nxzBCbbPzD9Yc191wYdkQu5wN8GmV7p5zSo.json').json() // generated key is in the same directory as this file
const secretKey = Uint8Array.from(secretKeyArray);
const signer = Keypair.fromSecretKey(secretKey); // derived signer https://solana.com/docs/clients/javascript#quickstart


const decimals = 9 // token decimals during token creation
const uselessTokenAddressSPL = '6QWe8neoMdYUcv7LRnaBguVHTEKxC59j6Fhw8XT2pxqW' // address generated after token was minted
const mySOLWalletAddress = 'uSEZwk76nxzBCbbPzD9Yc191wYdkQu5wN8GmV7p5zSo'

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
