export interface LoyaltyProgram {
  id: string;
  name: string;
  pointsPerEuro: number;
  tiers: LoyaltyTier[];
  rewards: LoyaltyReward[];
  qrSecret: string;
  currency: string;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  color: string;
  benefits: string[];
  multiplier: number;
  icon: string;
  walletLabel: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  costPoints: number;
  type: 'discount_percent' | 'discount_fixed' | 'free_item' | 'upgrade';
  value: number;
  requiredTier?: string;
  maxRedemptionsPerUser?: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface UserLoyalty {
  userId: string;
  walletObjectId: string;
  points: number;
  lifetimePoints: number;
  tierId: string;
  rewardsClaimed: string[];
  currentStreak: number;
  lastVisitDate: number;
  referrals: string[];
  createdAt: number;
  updatedAt: number;
}

export interface LoyaltyQRPayload {
  userId: string;
  timestamp: number;
  signature: string;
  version: number;
}

export interface LoyaltyPassData {
  userId: string;
  points: number;
  tierName: string;
  tierColor: string;
  tierIcon: string;
  qrCode: string;
  nextTierPoints: number;
  benefits: string[];
}

export interface ScanResult {
  success: boolean;
  userId?: string;
  pointsEarned?: number;
  newTotalPoints?: number;
  newTier?: string;
  tierUpgraded?: boolean;
  error?: string;
}

export interface WalletJWTResponse {
  jwt: string;
  objectId: string;
}