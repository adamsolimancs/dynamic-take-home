import config from "../config.js";
import { JsonRpcProvider, Wallet, formatEther, isAddress, parseEther } from 'ethers'

const RPC_URL = config.ETH_RPC_URL || process.env.ETH_RPC_URL;

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

function requireEncryptionKey() {
  const encryptionKey = config.WALLET_ENCRYPTION_KEY || process.env.WALLET_ENCRYPTION_KEY
  if (!encryptionKey) {
    throw new HttpError(500, 'Wallet encryption key is not configured.')
  }
  return encryptionKey
}

async function loadWallet(record) {
  const wallet = await Wallet.fromEncryptedJson(record.encryptedJson, requireEncryptionKey())
  if (!provider) return wallet
  return wallet.connect(provider)
}

// Create a new wallet with an optional label
export async function createWallet(label) {
  const encryptionKey = requireEncryptionKey()
  // Use ethers to create a random wallet
  const wallet = Wallet.createRandom()
  const encryptedJson = await wallet.encrypt(encryptionKey)
  const id = String(nextId++)
  const normalizedLabel = label?.toString().trim() || undefined

  walletStore.set(id, {
    encryptedJson,
    address: wallet.address,
    label: normalizedLabel,
    createdAt: new Date().toISOString(),
  })

  return {
    id,
    address: wallet.address,
    label: normalizedLabel,
  }
}

// Get the balance of a wallet by ID
export async function getBalance(id) {
  const record = getWalletRecord(id)
  const wallet = await loadWallet(record)
  const activeProvider = wallet.provider

  if (!activeProvider) {
    console.log('Set ETH_RPC_URL or RPC_URL.')
    throw new HttpError(500, 'Internal Server Error: Ethereum RPC provider is not configured.')
  }

  const balance = await activeProvider.getBalance(wallet.address)
  return formatEther(balance)
}

// Sign a message with the wallet's private key
export async function signMessage(id, message) {
  if (typeof message !== 'string' || message.trim().length === 0) {
    throw new HttpError(400, 'Message must be a non-empty string')
  }
  const record = getWalletRecord(id)
  const wallet = await loadWallet(record)
  return wallet.signMessage(message)
}

// Send a transaction from the wallet to another address
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
  const wallet = await loadWallet(record)

  if (!wallet.provider) {
    throw new HttpError(500, 'Ethereum RPC provider is not configured. Set ETH_RPC_URL or RPC_URL.')
  }

  const tx = await wallet.sendTransaction({ to, value })
  return tx.hash
}

// List all wallets (without private keys)
export function listWallets() {
  return Array.from(walletStore.entries()).map(([id, record]) => ({
    id,
    address: record.address,
    label: record.label,
    createdAt: record.createdAt,
  }))
}

// Test-only helper to clear in-memory state between runs
export function __resetWalletStoreForTests() {
  walletStore.clear()
  nextId = 1
}
