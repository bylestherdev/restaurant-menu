'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas as QRCode } from 'qrcode.react'
import { getUserLoyalty, getUserQR, getAvailableRewards, claimReward, getLoyaltyStats, subscribeToLoyalty, initUserLoyalty } from '@/lib/loyaltyStore'
import { loyaltyProgram } from '@/data/loyalty'

export default function LoyaltyPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string>('')
  const [loyalty, setLoyalty] = useState<any>(null)
  const [qrCode, setQrCode] = useState<string>('')
  const [walletJWT, setWalletJWT] = useState<string>('')
  const [hasPass, setHasPass] = useState(false)
  const [rewards, setRewards] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [showWalletButton, setShowWalletButton] = useState(false)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Try to get userId from query param or localStorage or generate a temp one
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const savedId = localStorage.getItem('user_loyalty_id')
    const queryId = urlParams.get('userId')

    let id = queryId || savedId
    if (!id) {
      // Generate a temp userId for demo/public access
      id = 'temp-user-' + Math.random().toString(36).substring(2, 10)
      localStorage.setItem('user_loyalty_id', id)
      setUserId(id)
    } else {
      setUserId(id)
    }

    // Initialize or load loyalty data
    const loyalty = getUserLoyalty(id)
    if (loyalty) {
      setLoyalty(loyalty)
      setQrCode(getUserQR(id))
      setRewards(getAvailableRewards(id))
      setStats(getLoyaltyStats(id))
      setHasPass(!!loyalty.walletObjectId)
    } else {
      // Initialize new user
      const newLoyalty = initUserLoyalty(id, 'Cliente', `${id}@email.com`)
      setLoyalty(newLoyalty)
      setQrCode(getUserQR(id))
      setRewards(getAvailableRewards(id))
      setStats(getLoyaltyStats(id))
      setHasPass(!!newLoyalty.walletObjectId)
      setUserId(id)
      localStorage.setItem('user_loyalty_id', id)
    }
    setIsLoading(false)
  }, [])

  const handleAddToWallet = async () => {
    if (!userId) return

    try {
      const res = await fetch('/api/loyalty/wallet-jwt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await res.json()
      if (data.jwt) {
        setWalletJWT(data.jwt)
        setShowWalletButton(true)
        setHasPass(true)
        showToast('Pass generado. Toca "Añadir a Google Wallet"', 'success')
      }
    } catch (e) {
      showToast('Error generando pass', 'error')
    }
  }

  const handleClaimReward = async (rewardId: string) => {
    if (!userId) return

    setClaiming(rewardId)
    const result = claimReward(userId, rewardId)

    if (result.success) {
      showToast('¡Recompensa canjeada!', 'success')
      setTimeout(loadLoyaltyData, 500)
    } else {
      showToast(result.error || 'Error canjeando', 'error')
    }
    setClaiming(null)
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadLoyaltyData = () => {
    if (!userId) return
    const data = getUserLoyalty(userId)
    if (data) {
      setLoyalty(data)
      setQrCode(getUserQR(data.userId))
      setRewards(getAvailableRewards(data.userId))
      setStats(getLoyaltyStats(data.userId))
      setHasPass(!!data.walletObjectId)
    }
  }

  // Subscribe to cross-tab updates
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail && e.detail.userId === userId) {
        setLoyalty(e.detail)
        setQrCode(getUserQR(e.detail.userId))
        setRewards(getAvailableRewards(e.detail.userId))
        setStats(getLoyaltyStats(e.detail.userId))
        setHasPass(!!e.detail.walletObjectId)
      }
    }
    window.addEventListener('loyalty-updated', handler as EventListener)
    return () => window.removeEventListener('loyalty-updated', handler as EventListener)
  }, [userId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!loyalty) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center text-4xl">🎁</div>
          <h2 className="text-xl font-bold text-amber-900">Club de Lealtad</h2>
          <p className="text-amber-600">Identifica tu cuenta para ver tus puntos y beneficios</p>
        </div>
      </div>
    )
  }

  const tier = loyaltyProgram.tiers.find(t => t.id === loyalty.tierId) || loyaltyProgram.tiers[0]
  const nextTier = stats?.nextTier

  return (
    <div className="min-h-screen bg-amber-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-amber-100">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-amber-900">Mi Club</h1>
          <span className="text-xs text-amber-500">{loyalty.name}</span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Loyalty Card */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: tier.color }}>
          <div className="absolute -top-4 -right-4 opacity-10 text-8xl">{tier.icon}</div>

          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs opacity-80 uppercase tracking-wider">Nivel</p>
                <h2 className="text-3xl font-bold">{tier.icon} {tier.name}</h2>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-80">PUNTOS</p>
                <p className="text-4xl font-bold tabular-nums">{loyalty.points.toLocaleString('es-ES')}</p>
              </div>
            </div>

            {/* Progress to next tier */}
            {nextTier && stats && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="opacity-80">Progreso a {nextTier.icon} {nextTier.name}</span>
                  <span className="font-bold">{stats.pointsToNext} pts</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${stats.progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* QR Code for staff scanning */}
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mt-4">
              <p className="text-xs opacity-80 text-center mb-3">Escanea este código al pagar</p>
              <div className="flex justify-center">
                <QRCode
                  value={qrCode}
                  size={160}
                  bgColor="white"
                  fgColor="#1c1917"
                  level="M"
                  includeMargin={true}
                />
              </div>
              <p className="text-xs opacity-60 text-center mt-2">Se renueva cada 5 min por seguridad</p>
            </div>
          </div>
        </div>

        {/* Wallet Button */}
        {!hasPass && (
          <button
            onClick={handleAddToWallet}
            className="w-full bg-white text-amber-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="currentColor" d="M18 12c0-3.31-2.69-6-6-6S6 8.69 6 12s2.69 6 6 6 6-2.69 6-6zm-1 0c0 2.76-2.24 5-5 5S7 14.76 7 12s2.24-5 5-5 5 2.24 5 5zm-5 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
            Añadir a Google Wallet
          </button>
        )}

        {hasPass && walletJWT && !showWalletButton && (
          <a
            href={`https://pay.google.com/gp/v/save/${walletJWT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-center block shadow-sm"
          >
            Ver en Google Wallet
          </a>
        )}

        {showWalletButton && walletJWT && (
          <a
            href={`https://pay.google.com/gp/v/save/${walletJWT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold text-center block shadow-lg animate-pulse"
          >
            📱 Añadir a Google Wallet ahora
          </a>
        )}

        {/* Benefits */}
        <div className="bg-white rounded-2xl border border-amber-100 p-4">
          <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <span style={{ color: tier.color }}>{tier.icon}</span> Beneficios {tier.name}
          </h3>
          <ul className="space-y-2 text-sm text-amber-700">
            {tier.benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tier.color }} />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Rewards Catalog */}
        <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
          <div className="p-4 border-b border-amber-100 flex items-center justify-between">
            <h3 className="font-semibold text-amber-900">Catálogo de Recompensas</h3>
            <span className="text-xs text-amber-500">{rewards.length} disponibles</span>
          </div>

          {rewards.length === 0 ? (
            <div className="p-8 text-center text-amber-500">
              <p className="mb-1">No hay recompensas disponibles para tu nivel</p>
              <p className="text-sm">Sube de nivel para desbloquear más</p>
            </div>
          ) : (
            <div className="divide-y divide-amber-100">
              {rewards.map(reward => (
                <div key={reward.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-amber-900 truncate">{reward.name}</h4>
                      {reward.requiredTier && (
                        <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                          {reward.requiredTier.toUpperCase()}
                        </span>
                      )}
                      {reward.maxRedemptionsPerUser && reward.maxRedemptionsPerUser === 1 && (
                        <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">1 vez</span>
                      )}
                    </div>
                    <p className="text-sm text-amber-600 truncate">{reward.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-amber-500">
                      <span>💰 {reward.costPoints.toLocaleString()} pts</span>
                      {reward.type === 'discount_percent' && <span>📉 {reward.value}% dto</span>}
                      {reward.type === 'free_item' && <span>🎁 Gratis</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleClaimReward(reward.id)}
                    disabled={claiming === reward.id || !reward.canClaim}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors flex-shrink-0 ${reward.canClaim ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-amber-100 text-amber-400 cursor-not-allowed'}`}
                  >
                    {claiming === reward.id ? '⏳' : reward.canClaim ? 'Canjear' : 'No disponible'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Visitas" value={loyalty.visitCount || 0} icon="📅" color="blue" />
          <StatCard label="Puntos vida" value={loyalty.lifetimePoints.toLocaleString()} icon="⭐" color="yellow" />
          <StatCard label="Recompensas" value={loyalty.rewardsClaimed.length} icon="🎁" color="purple" />
          <StatCard label="Racha" value={`${loyalty.currentStreak || 0} días`} icon="🔥" color="red" />
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 animate-slide-up">
          <div className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => setToast(null)} className="p-1 opacity-70 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      {/* Google Wallet Save Button (hidden, triggered by JWT) */}
      {showWalletButton && walletJWT && (
        <iframe
          src={`https://pay.google.com/gp/v/save/${walletJWT}`}
          style={{ display: 'none' }}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
  }

  return (
    <div className="bg-white rounded-xl border border-amber-100 p-3 text-center">
      <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center mx-auto mb-2`}>
        <span className="text-white text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-amber-900">{value}</p>
      <p className="text-xs text-amber-500">{label}</p>
    </div>
  )
}