import { LoyaltyProgram, LoyaltyTier, LoyaltyReward } from '@/types/loyalty';

export const loyaltyProgram: LoyaltyProgram = {
  id: 'la-casa-del-sabor',
  name: 'La Casa del Sabor - Club',
  pointsPerEuro: 10,
  qrSecret: process.env.LOYALTY_QR_SECRET || 'dev-secret-change-in-production-min-32-chars-long!!',
  currency: 'EUR',
  tiers: [
    {
      id: 'bronze',
      name: 'Bronce',
      minPoints: 0,
      color: '#CD7F32',
      walletLabel: 'BRONCE',
      icon: '🥉',
      multiplier: 1.0,
      benefits: [
        '10 pts por cada € gastado',
        'Acceso a catálogo de recompensas',
        'Cumpleaños: postre gratis',
      ],
    },
    {
      id: 'silver',
      name: 'Plata',
      minPoints: 2000,
      color: '#C0C0C0',
      walletLabel: 'PLATA',
      icon: '🥈',
      multiplier: 1.25,
      benefits: [
        '12.5 pts por cada € gastado',
        'Café gratis en cada visita',
        'Prioridad en reservas',
        'Descuento 5% en carta',
      ],
    },
    {
      id: 'gold',
      name: 'Oro',
      minPoints: 8000,
      color: '#FFD700',
      walletLabel: 'ORO',
      icon: '🥇',
      multiplier: 1.5,
      benefits: [
        '15 pts por cada € gastado',
        'Entrante gratis en cada visita',
        'Reserva preferente 24h',
        'Descuento 10% en carta',
        'Acceso a eventos exclusivos',
      ],
    },
    {
      id: 'platinum',
      name: 'Platino',
      minPoints: 20000,
      color: '#E5E4E2',
      walletLabel: 'PLATINO',
      icon: '💎',
      multiplier: 2.0,
      benefits: [
        '20 pts por cada € gastado',
        'Plato principal gratis / semana',
        'Mesa VIP garantizada',
        'Descuento 15% en carta',
        'Chef experience mensual',
        'Parking gratis',
      ],
    },
  ],
  rewards: [
    {
      id: 'reward-coffee',
      name: 'Café o Infusión Gratis',
      description: 'Cualquier café o infusión de la carta',
      costPoints: 500,
      type: 'free_item',
      value: 0,
      requiredTier: 'silver',
      isActive: true,
    },
    {
      id: 'reward-dessert',
      name: 'Postre de la Casa',
      description: 'Tarta de queso, Coulant o Torrija',
      costPoints: 800,
      type: 'free_item',
      value: 0,
      isActive: true,
    },
    {
      id: 'reward-starter',
      name: 'Entrante a Elegir',
      description: 'Croquetas, Pimientos, Gazpacho o Ensalada',
      costPoints: 1200,
      type: 'free_item',
      value: 0,
      requiredTier: 'gold',
      isActive: true,
    },
    {
      id: 'reward-main',
      name: 'Plato Principal Gratis',
      description: 'Cualquier principal (máx 25€)',
      costPoints: 3000,
      type: 'free_item',
      value: 2500,
      requiredTier: 'platinum',
      maxRedemptionsPerUser: 1,
      isActive: true,
    },
    {
      id: 'reward-5pct',
      name: '5% Descuento en Cuenta',
      description: 'Aplicable a toda la cuenta',
      costPoints: 1000,
      type: 'discount_percent',
      value: 5,
      isActive: true,
    },
    {
      id: 'reward-10pct',
      name: '10% Descuento en Cuenta',
      description: 'Aplicable a toda la cuenta',
      costPoints: 2000,
      type: 'discount_percent',
      value: 10,
      requiredTier: 'gold',
      isActive: true,
    },
    {
      id: 'reward-15pct',
      name: '15% Descuento en Cuenta',
      description: 'Aplicable a toda la cuenta',
      costPoints: 4000,
      type: 'discount_percent',
      value: 15,
      requiredTier: 'platinum',
      isActive: true,
    },
    {
      id: 'reward-birthday',
      name: 'Regalo de Cumpleaños',
      description: 'Postre + copa de cava (mes de cumpleaños)',
      costPoints: 0,
      type: 'free_item',
      value: 0,
      isActive: true,
    },
    {
      id: 'reward-wine',
      name: 'Copa de Vino Gratis',
      description: 'Copa de vino tinto/blanco/rosado',
      costPoints: 600,
      type: 'free_item',
      value: 0,
      isActive: true,
    },
    {
      id: 'reward-cocktail',
      name: 'Cóctel de la Casa',
      description: '"Sabor Mediterráneo" gratis',
      costPoints: 1500,
      type: 'free_item',
      value: 0,
      requiredTier: 'silver',
      isActive: true,
    },
  ],
};

export function getTierById(tierId: string): LoyaltyTier | undefined {
  return loyaltyProgram.tiers.find(t => t.id === tierId);
}

export function getNextTier(currentTierId: string): LoyaltyTier | null {
  const currentIndex = loyaltyProgram.tiers.findIndex(t => t.id === currentTierId);
  if (currentIndex === -1 || currentIndex === loyaltyProgram.tiers.length - 1) return null;
  return loyaltyProgram.tiers[currentIndex + 1];
}

export function getPointsToNextTier(points: number): number {
  const currentTier = [...loyaltyProgram.tiers].reverse().find(t => points >= t.minPoints);
  if (!currentTier) return loyaltyProgram.tiers[0].minPoints;
  const nextTier = loyaltyProgram.tiers.find(t => t.minPoints > currentTier.minPoints);
  return nextTier ? nextTier.minPoints - points : 0;
}

export function getRewardsForTier(tierId: string): LoyaltyReward[] {
  const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
  const userTierIndex = tierOrder.indexOf(tierId);
  return loyaltyProgram.rewards.filter(r => {
    if (!r.isActive) return false;
    if (!r.requiredTier) return true;
    const requiredIndex = tierOrder.indexOf(r.requiredTier);
    return userTierIndex >= requiredIndex;
  });
}

export function calculatePointsEarned(amountEuros: number, tierId: string): number {
  const tier = getTierById(tierId);
  if (!tier) return Math.floor(amountEuros * loyaltyProgram.pointsPerEuro);
  return Math.floor(amountEuros * loyaltyProgram.pointsPerEuro * tier.multiplier);
}

export const defaultTiers = loyaltyProgram.tiers;
export const defaultRewards = loyaltyProgram.rewards;