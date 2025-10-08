import { beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import config from '../backend/src/config.js'

// From teh root of the project run: node --test tests/backend.walletService.test.js

const TEST_ENCRYPTION_KEY = 'unit-test-secret'

// Ensure encryption key is populated before importing the service module
config.WALLET_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY
process.env.WALLET_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY

const walletService = await import('../backend/src/services/walletService.js')
const {
  HttpError,
  createWallet,
  signMessage,
  listWallets,
  sendTransaction,
  __resetWalletStoreForTests,
} = walletService

beforeEach(() => {
  config.WALLET_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY
  process.env.WALLET_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY
  __resetWalletStoreForTests()
})

test('createWallet stores encrypted wallets and allows signing', async () => {
  const wallet = await createWallet('  Primary ')

  assert.equal(wallet.label, 'Primary')
  assert.match(wallet.address, /^0x[a-fA-F0-9]{40}$/)

  const wallets = listWallets()
  assert.equal(wallets.length, 1)
  assert.equal(wallets[0].label, 'Primary')
  assert.equal(wallets[0].address, wallet.address)

  const signature = await signMessage(wallet.id, 'hello world')
  assert.match(signature, /^0x[a-fA-F0-9]+$/)
})

test('signMessage rejects empty messages', async () => {
  const wallet = await createWallet('Signer')

  await assert.rejects(() => signMessage(wallet.id, '   '), (error) => {
    assert.equal(error.constructor?.name, HttpError.name)
    assert.equal(error.status, 400)
    assert.equal(error.message, 'Message must be a non-empty string')
    return true
  })
})

test('createWallet fails when encryption key is missing', async () => {
  config.WALLET_ENCRYPTION_KEY = ''
  delete process.env.WALLET_ENCRYPTION_KEY

  await assert.rejects(() => createWallet('No Key'), (error) => {
    assert.equal(error.constructor?.name, HttpError.name)
    assert.equal(error.status, 500)
    assert.equal(error.message, 'Wallet encryption key is not configured.')
    return true
  })
})

test('sendTransaction surfaces provider configuration errors', async () => {
  const wallet = await createWallet('Sender')
  const recipient = `0x${'11'.repeat(20)}`

  await assert.rejects(() => sendTransaction(wallet.id, recipient, '0.05'), (error) => {
    assert.equal(error.constructor?.name, HttpError.name)
    assert.equal(error.status, 500)
    assert.ok(error.message.includes('Ethereum RPC provider is not configured'))
    return true
  })
})
