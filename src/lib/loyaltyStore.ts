import { UserLoyalty } from '@/types/loyalty';
import { loyaltyProgram, getTierById, calculatePointsEarned, getRewardsForTier } from '@/data/loyalty';
import { generateSignedQR, createOrUpdateLoyaltyPass, updateLoyaltyPassPoints } from '@/lib/wallet/googleWallet';

const LOYALTY_KEY = 'user-loyalty';

/**
 * Persisted loyalty state in localStorage with cross-tab sync.
 * Stores user progress, tier, points, and wallet integration.
 * Emits 'loyalty-updated' CustomEvent on changes for real-time sync.
 */
export interface StoredUserLoyalty extends UserLoyalty {
  name: string;
  email: string;
  walletObjectId: string;
}

/**
 * Reads all stored loyalty data from localStorage.
 * Returns empty object if not in browser environment or on parse error.
 */
function getAllLoyalty(): Record<string, StoredUserLoyalty> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(LOYALTY_KEY) || '{}');
  } catch {
    return {};
  }
}

/**
 * Saves all loyalty data to localStorage and dispatches sync event.
 * No-op if not in browser environment.
 */
function saveAllLoyalty(data: Record<string, StoredUserLoyalty>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOYALTY_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('loyalty-updated', { detail: data }));
}

/**
 * Gets the stored loyalty record for a specific user.
 * @returns The user's loyalty state, or null if not found
 */
export function getUserLoyalty(userId: string): StoredUserLoyalty | null {
  const all = getAllLoyalty();
  return all[userId] || null;
}

/**
 * Initializes a new loyalty record for a user.
 * If user already exists, returns existing record.
 * Sets default tier to the first (lowest) tier in the program.
 * Seeds default zero-point state with empty rewards claim history.
 */
export function initUserLoyalty(userId: string, name: string, email: string): StoredUserLoyalty {
  const all = getAllLoyalty();
  
  if (all[userId]) return all[userId];
  
  const tier = loyaltyProgram.tiers[0];
  const newLoyalty: StoredUserLoyalty = {
    userId,
    name,
    email,
    points: 0,
    lifetimePoints: 0,
    tierId: tier.id,
    walletObjectId: '',
    rewardsClaimed: [],
    currentStreak: 0,
    lastVisitDate: Date.now(),
    referrals: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  all[userId] = newLoyalty;
  saveAllLoyalty(all);
  return newLoyalty;
}

export async function addPointsToUser(
  userId: string,
  amountEuros: number,
  staffId?: string
): Promise<{ 
  loyalty: StoredUserLoyalty; 
  pointsEarned: number; 
  tierUpgraded: boolean; 
  newTier?: StoredUserLoyalty['tierId'];
}> {
  const all = getAllLoyalty();
  const loyalty = all[userId];
  
  if (!loyalty) {
    throw new Error('Usuario no encontrado en programa loyalty');
  }
  
  const tier = getTierById(loyalty.tierId) || loyaltyProgram.tiers[0];
  const pointsEarned = calculatePointsEarned(amountEuros, loyalty.tierId);
  
  loyalty.points += pointsEarned;
  loyalty.lifetimePoints += pointsEarned;
  loyalty.updatedAt = Date.now();
  
  // Check for tier upgrade
  let tierUpgraded = false;
  let newTier: StoredUserLoyalty['tierId'] | undefined;
  
  for (const t of loyaltyProgram.tiers) {
    if (loyalty.points >= t.minPoints && t.minPoints > (getTierById(loyalty.tierId)?.minPoints || 0)) {
      if (t.id !== loyalty.tierId) {
        loyalty.tierId = t.id;
        tierUpgraded = true;
        newTier = t.id;
      }
    }
  }
  
  all[userId] = loyalty;
  saveAllLoyalty(all);
  
  // Update Google Wallet pass in background
  const updatedTier = getTierById(loyalty.tierId) || tier;
  try {
    if (loyalty.walletObjectId) {
      await updateLoyaltyPassPoints(userId, loyalty.points, updatedTier);
    }
  } catch (e) {
    console.error('Failed to update Wallet pass:', e);
  }
  
  // Notify staff if provided
  if (staffId) {
    console.log(`[Loyalty] Staff ${staffId} added ${pointsEarned} pts to ${userId}`);
  }
  
  return { loyalty, pointsEarned, tierUpgraded, newTier };
}

export async function addPointsDirect(
  userId: string,
  points: number,
  staffId?: string
): Promise<{ loyalty: StoredUserLoyalty; tierUpgraded: boolean; newTier?: string }> {
  const all = getAllLoyalty();
  const loyalty = all[userId];
  
  if (!loyalty) throw new Error('Usuario no encontrado');
  
  loyalty.points += points;
  loyalty.lifetimePoints += points;
  loyalty.updatedAt = Date.now();
  
  let tierUpgraded = false;
  let newTier: string | undefined;
  
  for (const t of loyaltyProgram.tiers) {
    if (loyalty.points >= t.minPoints && t.id !== loyalty.tierId) {
      loyalty.tierId = t.id;
      tierUpgraded = true;
      newTier = t.id;
    }
  }
  
  all[userId] = loyalty;
  saveAllLoyalty(all);
  
  const updatedTier = getTierById(loyalty.tierId)!;
  try {
    if (loyalty.walletObjectId) {
      await updateLoyaltyPassPoints(userId, loyalty.points, updatedTier);
    }
  } catch (e) {
    console.error('Wallet update failed:', e);
  }
  
  return { loyalty, tierUpgraded, newTier };
}

export function getUserQR(userId: string): string {
  return generateSignedQR(userId);
}

export function verifyAndGetUser(qrString: string): { valid: boolean; loyalty?: StoredUserLoyalty; error?: string } {
  const verification = require('@/lib/wallet/googleWallet').verifyLoyaltyQR(qrString);
  if (!verification.valid || !verification.userId) {
    return { valid: false, error: verification.error };
  }
  
  const loyalty = getUserLoyalty(verification.userId);
  if (!loyalty) {
    return { valid: false, error: 'Usuario no encontrado en sistema' };
  }
  
  return { valid: true, loyalty };
}

export function claimReward(userId: string, rewardId: string): { success: boolean; error?: string } {
  const all = getAllLoyalty();
  const loyalty = all[userId];
  
  if (!loyalty) return { success: false, error: 'Usuario no encontrado' };
  
  const reward = loyaltyProgram.rewards.find(r => r.id === rewardId);
  if (!reward || !reward.isActive) return { success: false, error: 'Recompensa no disponible' };
  
  // Check tier requirement
  const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
  if (reward.requiredTier) {
    const userTierIndex = tierOrder.indexOf(loyalty.tierId);
    const requiredIndex = tierOrder.indexOf(reward.requiredTier);
    if (userTierIndex < requiredIndex) {
      return { success: false, error: `Requiere nivel ${reward.requiredTier}` };
    }
  }
  
  // Check max redemptions
  if (reward.maxRedemptionsPerUser) {
    const claimed = loyalty.rewardsClaimed.filter(r => r === rewardId).length;
    if (claimed >= reward.maxRedemptionsPerUser) {
      return { success: false, error: 'Ya has canjeado esta recompensa el máximo de veces' };
    }
  }
  
  if (loyalty.points < reward.costPoints) {
    return { success: false, error: 'Puntos insuficientes' };
  }
  
  loyalty.points -= reward.costPoints;
  loyalty.rewardsClaimed.push(rewardId);
  loyalty.updatedAt = Date.now();
  
  all[userId] = loyalty;
  saveAllLoyalty(all);
  
  // Update wallet
  const tier = getTierById(loyalty.tierId)!;
  if (loyalty.walletObjectId) {
    updateLoyaltyPassPoints(userId, loyalty.points, tier).catch(console.error);
  }
  
  return { success: true };
}

export function getAvailableRewards(userId: string) {
  const loyalty = getUserLoyalty(userId);
  if (!loyalty) return [];
  
  return getRewardsForTier(loyalty.tierId).map(reward => ({
    ...reward,
    canClaim: loyalty.points >= reward.costPoints && 
              (!reward.maxRedemptionsPerUser || 
               loyalty.rewardsClaimed.filter(r => r === reward.id).length < reward.maxRedemptionsPerUser),
    claimedCount: loyalty.rewardsClaimed.filter(r => r === reward.id).length,
  }));
}

export function getLoyaltyStats(userId: string) {
  const loyalty = getUserLoyalty(userId);
  if (!loyalty) return null;
  
  const tier = getTierById(loyalty.tierId)!;
  const nextTier = loyaltyProgram.tiers.find(t => t.minPoints > tier.minPoints);
  
  return {
    currentTier: tier,
    nextTier,
    pointsToNext: nextTier ? nextTier.minPoints - loyalty.points : 0,
    progressPercent: nextTier 
      ? Math.min(100, ((loyalty.points - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100)
      : 100,
    lifetimePoints: loyalty.lifetimePoints,
    rewardsClaimed: loyalty.rewardsClaimed.length,
    currentStreak: loyalty.currentStreak,
  };
}

export function subscribeToLoyalty(listener: (data: Record<string, StoredUserLoyalty>) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: CustomEvent) => listener(e.detail);
  window.addEventListener('loyalty-updated', handler as EventListener);
  return () => window.removeEventListener('loyalty-updated', handler as EventListener);
}

// Initialize demo users if empty
export function seedDemoLoyalty() {
  const all = getAllLoyalty();
  if (Object.keys(all).length > 0) return;
  
  const demoUsers = [
    { userId: 'user-1', name: 'Ana García', email: 'ana@email.com', points: 2500, tierId: 'silver' },
    { userId: 'user-2', name: 'Carlos Ruiz', email: 'carlos@email.com', points: 9500, tierId: 'gold' },
    { userId: 'user-3', name: 'María López', email: 'maria@email.com', points: 150, tierId: 'bronze' },
    { userId: 'user-4', name: 'Pedro Martín', email: 'pedro@email.com', points: 22000, tierId: 'platinum' },
  ];
  
  demoUsers.forEach(u => {
    const tier = getTierById(u.tierId)!;
    all[u.userId] = {
      userId: u.userId,
      name: u.name,
      email: u.email,
      points: u.points,
      lifetimePoints: u.points + 500,
      tierId: u.tierId,
      walletObjectId: `${require('@/lib/wallet/googleWallet').ISSUER_ID}.loyalty_${u.userId}`,
      rewardsClaimed: u.points > 1000 ? ['reward-coffee', 'reward-dessert'] : [],
      currentStreak: Math.floor(Math.random() * 10),
      lastVisitDate: Date.now() - Math.random() * 7 * 86400000,
      referrals: [],
      createdAt: Date.now() - 30 * 86400000,
      updatedAt: Date.now(),
    };
  });
  
  saveAllLoyalty(all);
}

// Initialize on import (client only)
if (typeof window !== 'undefined') {
  seedDemoLoyalty();
}