import { useMemo, useState } from 'react'
import './App.css'

type Wallet = {
  id: string
  address: string
}

type WalletState = Wallet & { label?: string }

// Main App component, interfaces the main API routes:
// - Create Wallet
// - Get Balance
// - Sign Message
// - Send Transaction
export default function App() {
  const [wallets, setWallets] = useState<WalletState[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // API data fetching states
  const [balance, setBalance] = useState<number | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)

  const [message, setMessage] = useState('')
  const [signedMessage, setSignedMessage] = useState<string | null>(null)
  const [loadingSign, setLoadingSign] = useState(false)

  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('0.00')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [loadingSend, setLoadingSend] = useState(false)

  const selected = useMemo(
    () => wallets.find((w) => w.id === selectedId) || null,
    [wallets, selectedId],
  )

  /* API helpers using backend routes in walletRoutes.js */
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  // Generic API function
  // Parameters
  // - path: string representing the api path to be attached after the base URL
  // - init: RequestInit representing additional request headers, such as method
  //          or body.
  async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
    if (!res.ok) {
      let msg = `HTTP ${res.status}`
      try {
        const j: any = await res.json()
        msg = j?.message || j?.error || msg
      } catch { }
      throw new Error(msg)
    }
    return res.json()
  }

  async function onCreateWallet() {
    setError(null)
    setIsCreating(true)
    try {
      const w = await api<Wallet>('/api/wallets/create', { method: 'POST' })
      setWallets((prev) => [{ ...w }, ...prev])
      setSelectedId(w.id)
    } catch (e: any) {
      setError(e?.message || 'Failed to create wallet')
    } finally {
      setIsCreating(false)
    }
  }

  async function onGetBalance() {
    if (!selected) {
      console.log('No wallet selected, cannot get balance.')
      return
    }
    setError(null)
    setLoadingBalance(true)
    setBalance(null)
    try {
      const data = await api<{ balance: string | number }>(
        `/api/wallets/${selected.id}/balance`,
      );
      const b = typeof data.balance === 'string' ? parseFloat(data.balance) : data.balance
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
      const data = await api<{ signedMessage: string }>(
        `/api/wallets/${selected.id}/signMessage`,
        { method: 'POST', body: JSON.stringify({ message }) },
      )
      setSignedMessage(data.signedMessage)
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
      const data = await api<{ transactionHash: string }>(
        `/api/wallets/${selected.id}/sendTransaction`,
        { method: 'POST', body: JSON.stringify({ to: toAddress.trim(), amount: amt }) },
      )
      setTxHash(data.transactionHash)
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
          <button className="btn primary" onClick={onCreateWallet} disabled={isCreating}>
            {isCreating ? 'Creating…' : 'Create Wallet'}
          </button>
        </div>
        {(!wallets || wallets.length === 0) ? (
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

      {/* DYNAMICally render other elements once a wallet is created. */}
      {(wallets && wallets.length > 0) && (<div className="api-cards">
        <section className="grid">
          <div className="card">
            <div className="card-head">
              <h3>Balance</h3>
              <button className="btn" onClick={onGetBalance} disabled={!selected || loadingBalance}>
                {loadingBalance ? 'Loading...' : 'Get Balance'}
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
              <button className="btn" onClick={onSignMessage} disabled={!selected || loadingSign}>
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
              <button className="btn" onClick={onSendTx} disabled={!selected || loadingSend}>
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
      </div>)}

    </div>
  )
}

function truncate(addr?: string, left = 6, right = 4) {
  if (!addr) return ''
  if (addr.length <= left + right + 3) return addr
  return `${addr.slice(0, left)}…${addr.slice(-right)}`
}
