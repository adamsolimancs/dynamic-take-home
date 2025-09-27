export type Wallet = {
  id: string
  address: string
}

type ApiError = {
  error?: string
  message?: string
}

const getBaseUrl = () =>
  (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:4000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    let info: ApiError | undefined
    try {
      info = await res.json()
    } catch (_) {
      // ignore
    }
    const msg = info?.message || info?.error || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return res.json()
}

export async function createWallet(): Promise<Wallet> {
  return request<Wallet>('/wallet', { method: 'POST' })
}

export async function getBalance(walletId: string): Promise<number> {
  const data = await request<{ balance: string | number }>(
    `/wallet/${walletId}/balance`,
  )
  const n = typeof data.balance === 'string' ? parseFloat(data.balance) : data.balance
  return Number.isFinite(n) ? n : 0
}

export async function signMessage(walletId: string, message: string): Promise<string> {
  const data = await request<{ signedMessage: string }>(
    `/wallet/${walletId}/signMessage`,
    { method: 'POST', body: JSON.stringify({ message }) },
  )
  return data.signedMessage
}

export async function sendTransaction(
  walletId: string,
  to: string,
  amount: number,
): Promise<string> {
  const data = await request<{ transactionHash: string }>(
    `/wallet/${walletId}/sendTransaction`,
    { method: 'POST', body: JSON.stringify({ to, amount }) },
  )
  return data.transactionHash
}

