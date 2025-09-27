import config from "../config.js";
import { JsonRpcProvider, Wallet, formatEther, isAddress, parseEther } from 'ethers'

const RPC_URL = config.ETH_RPC_URL || process.env.ETH_RPC_URL;
console.log('CHECKPOINT -- ETH_RPC_URL:', RPC_URL)


let provider = null
if (RPC_URL) {
  provider = new JsonRpcProvider(RPC_URL)
}

const walletStore = new Map()
let nextId = 1

export class HttpError extends Error {
  status

  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function getWalletRecord(id) {
  const record = walletStore.get(id)
  if (!record) {
    throw new HttpError(404, 'Wallet not found')
  }
  return record
}

function ensureConnectedWallet(record) {
  if (!provider) return record.wallet
  if (record.wallet.provider) return record.wallet
  const connected = record.wallet.connect(provider)
  record.wallet = connected
  return connected
}

export function createWallet(label) {
  const wallet = Wallet.createRandom()
  const connectedWallet = provider ? wallet.connect(provider) : wallet
  const id = String(nextId++)
  const normalizedLabel = label?.toString().trim() || undefined

  walletStore.set(id, {
    wallet: connectedWallet,
    label: normalizedLabel,
    createdAt: new Date().toISOString(),
  })

  return {
    id,
    address: connectedWallet.address,
    label: normalizedLabel,
  }
}

export async function getBalance(id) {
  const record = getWalletRecord(id)
  const wallet = ensureConnectedWallet(record)
  const activeProvider = wallet.provider
  console.log('Active provider:', activeProvider, 'ETH_RPC_URL:', RPC_URL, 'Wallet record:', record, 'Wallet:', wallet)

  if (!activeProvider) {
    console.log('Set ETH_RPC_URL or RPC_URL.')
    throw new HttpError(500, 'Internal Server Error: Ethereum RPC provider is not configured.')
  }

  const balance = await activeProvider.getBalance(wallet.address)
  return formatEther(balance)
}

export async function signMessage(id, message) {
  if (typeof message !== 'string' || message.trim().length === 0) {
    throw new HttpError(400, 'Message must be a non-empty string')
  }
  const record = getWalletRecord(id)
  return record.wallet.signMessage(message)
}

export async function sendTransaction(id, to, amount) {
  if (!isAddress(to)) {
    throw new HttpError(400, 'Recipient address is invalid')
  }

  let value
  try {
    value = parseEther(typeof amount === 'string' ? amount : amount?.toString?.())
  } catch (err) {
    throw new HttpError(400, 'Amount must be a valid Ether value')
  }

  if (value <= 0n) {
    throw new HttpError(400, 'Amount must be greater than zero')
  }

  const record = getWalletRecord(id)
  const wallet = ensureConnectedWallet(record)

  if (!wallet.provider) {
    throw new HttpError(500, 'Ethereum RPC provider is not configured. Set ETH_RPC_URL or RPC_URL.')
  }

  const tx = await wallet.sendTransaction({ to, value })
  return tx.hash
}

export function listWallets() {
  return Array.from(walletStore.entries()).map(([id, record]) => ({
    id,
    address: record.wallet.address,
    label: record.label,
    createdAt: record.createdAt,
  }))
}
