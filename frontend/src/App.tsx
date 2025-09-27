import { useEffect, useMemo, useState } from 'react'
import './App.css'
import type { Wallet } from './api'
import { createWallet, getBalance, sendTransaction, signMessage } from './api'

type WalletState = Wallet & { label?: string }

const LS_KEY = 'vencura.wallets'

function App() {
  const [wallets, setWallets] = useState<WalletState[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Actions state
  const [balance, setBalance] = useState<number | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)

  const [message, setMessage] = useState('Hello, VenCura!')
  const [signedMessage, setSignedMessage] = useState<string | null>(null)
  const [loadingSign, setLoadingSign] = useState(false)

  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('0.01')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [loadingSend, setLoadingSend] = useState(false)

  // Load wallets from localStorage on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed: WalletState[] = JSON.parse(raw)
        setWallets(parsed)
        if (parsed.length > 0) setSelectedId(parsed[0].id)
      }
    } catch {
      // ignore
    }
  }, [])

  // Persist wallets any time they change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(wallets))
  }, [wallets])

  const selected = useMemo(
    () => wallets.find((w) => w.id === selectedId) || null,
    [wallets, selectedId],
  )

  async function onCreateWallet() {
    setError(null)
    setIsCreating(true)
    try {
      const w = await createWallet()
      setWallets((prev) => [{ ...w }, ...prev])
      setSelectedId(w.id)
    } catch (e: any) {
      setError(e?.message || 'Failed to create wallet')
    } finally {
      setIsCreating(false)
    }
  }

  async function onGetBalance() {
    if (!selected) return
    setError(null)
    setLoadingBalance(true)
    setBalance(null)
    try {
      const b = await getBalance(selected.id)
      setBalance(b)
    } catch (e: any) {
      setError(e?.message || 'Failed to get balance')
    } finally {
      setLoadingBalance(false)
    }
  }

  async function onSignMessage() {
    if (!selected) return
    setError(null)
    setLoadingSign(true)
    setSignedMessage(null)
    try {
      const sig = await signMessage(selected.id, message)
      setSignedMessage(sig)
    } catch (e: any) {
      setError(e?.message || 'Failed to sign message')
    } finally {
      setLoadingSign(false)
    }
  }

  async function onSendTx() {
    if (!selected) return
    const amt = Number(amount)
    if (!toAddress || !Number.isFinite(amt) || amt <= 0) {
      setError('Enter a valid recipient and amount')
      return
    }
    setError(null)
    setLoadingSend(true)
    setTxHash(null)
    try {
      const hash = await sendTransaction(selected.id, toAddress.trim(), amt)
      setTxHash(hash)
    } catch (e: any) {
      setError(e?.message || 'Failed to send transaction')
    } finally {
      setLoadingSend(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="dot" />
          <span>VenCura</span>
        </div>
        <div className="sub">Minimal custodial wallet demo</div>
      </header>

      {error && <div className="toast error">{error}</div>}

      <section className="wallets">
        <div className="row">
          <h2>Wallets</h2>
          <button className="primary" onClick={onCreateWallet} disabled={isCreating}>
            {isCreating ? 'Creating…' : 'Create Wallet'}
          </button>
        </div>
        {wallets.length === 0 ? (
          <div className="empty">No wallets yet. Create your first one.</div>
        ) : (
          <div className="wallet-list">
            {wallets.map((w) => (
              <button
                key={w.id}
                className={`wallet-item ${selected?.id === w.id ? 'active' : ''}`}
                onClick={() => setSelectedId(w.id)}
                title={w.address}
              >
                <div className="wallet-id">Wallet #{w.id}</div>
                <div className="wallet-addr">{truncate(w.address)}</div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="grid">
        <div className="card">
          <div className="card-head">
            <h3>Balance</h3>
            <button onClick={onGetBalance} disabled={!selected || loadingBalance}>
              {loadingBalance ? 'Fetching…' : 'Get Balance'}
            </button>
          </div>
          <div className="card-body">
            {!selected ? (
              <div className="muted">Select a wallet</div>
            ) : balance === null ? (
              <div className="muted">—</div>
            ) : (
              <div className="balance">{balance} ETH</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Sign Message</h3>
            <button onClick={onSignMessage} disabled={!selected || loadingSign}>
              {loadingSign ? 'Signing…' : 'Sign'}
            </button>
          </div>
          <div className="card-body v">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message to sign"
            />
            {signedMessage && (
              <div className="mono scroll">
                <label>Signature</label>
                <code>{signedMessage}</code>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Send Transaction</h3>
            <button onClick={onSendTx} disabled={!selected || loadingSend}>
              {loadingSend ? 'Sending…' : 'Send'}
            </button>
          </div>
          <div className="card-body v">
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="Recipient 0x address"
              spellCheck={false}
            />
            <div className="row gap">
              <input
                className="sm"
                type="number"
                min="0"
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount (ETH)"
              />
              <span className="unit">ETH</span>
            </div>
            {txHash && (
              <div className="mono scroll">
                <label>Transaction Hash</label>
                <code>{txHash}</code>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="footer">
        <span>Built for the Dynamic take‑home</span>
        <span className="sep">•</span>
        <span>by Adam Soliman</span>
      </footer>
    </div>
  )
}

function truncate(addr?: string, left = 6, right = 4) {
  if (!addr) return ''
  if (addr.length <= left + right + 3) return addr
  return `${addr.slice(0, left)}…${addr.slice(-right)}`
}

export default App
