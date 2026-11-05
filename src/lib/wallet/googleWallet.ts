import { LoyaltyProgram, LoyaltyTier, UserLoyalty, LoyaltyQRPayload } from '@/types/loyalty';
import { loyaltyProgram, getTierById } from '@/data/loyalty';

// ============================================
// GOOGLE WALLET SERVICE (Mock + Ready for Production)
// ============================================

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000000000000';
const CLASS_ID = `${ISSUER_ID}.loyalty_class_la_casa`;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_WALLET_SERVICE_EMAIL || 'wallet@restaurant.iam.gserviceaccount.com';

// Mock storage for development (replace with Google Wallet API calls in production)
const walletPasses = new Map<string, any>();

// Generate signed QR payload for loyalty card
export function generateSignedQR(userId: string, secret?: string): string {
  const qrSecret = secret || loyaltyProgram.qrSecret;
  const timestamp = Date.now();
  const data = `${userId}.${timestamp}`;
  
  // HMAC-SHA256 signature (first 16 chars for QR compactness)
  let signature = 'mock-sig';
  try {
    const crypto = require('crypto');
    signature = crypto.createHmac('sha256', qrSecret).update(data).digest('hex').substring(0, 16);
  } catch {
    // Fallback for environments without crypto
    signature = Buffer.from(data).toString('base64').substring(0, 16);
  }
  
  const payload: LoyaltyQRPayload = {
    userId,
    timestamp,
    signature,
    version: 1,
  };
  
  return JSON.stringify(payload);
}

// Verify QR code scanned by staff
export function verifyLoyaltyQR(qrString: string, secret?: string): { valid: boolean; userId?: string; error?: string } {
  const qrSecret = secret || loyaltyProgram.qrSecret;
  
  try {
    const payload = JSON.parse(qrString) as LoyaltyQRPayload;
    
    // Verify version
    if (payload.version !== 1) {
      return { valid: false, error: 'Versión de QR no soportada' };
    }
    
    // Verify signature
    const data = `${payload.userId}.${payload.timestamp}`;
    let expectedSig = 'mock-sig';
    try {
      const crypto = require('crypto');
      expectedSig = crypto.createHmac('sha256', qrSecret).update(data).digest('hex').substring(0, 16);
    } catch {
      expectedSig = Buffer.from(data).toString('base64').substring(0, 16);
    }
    
    if (payload.signature !== expectedSig) {
      return { valid: false, error: 'Firma inválida - QR manipulado' };
    }
    
    // Verify timestamp (QR expires in 5 minutes for security)
    const age = Date.now() - payload.timestamp;
    if (age > 5 * 60 * 1000) {
      return { valid: false, error: 'QR expirado (máx 5 min). Cliente debe refrescar.' };
    }
    
    return { valid: true, userId: payload.userId };
  } catch (e) {
    return { valid: false, error: 'QR malformado o inválido' };
  }
}

// Generate Google Wallet "Save to Wallet" JWT
export function generateSaveToWalletJWT(
  userLoyalty: UserLoyalty,
  program: LoyaltyProgram,
  tier: LoyaltyTier
): string {
  const objectId = `${ISSUER_ID}.loyalty_${userLoyalty.userId}`;
  const qrValue = generateSignedQR(userLoyalty.userId);
  
  // In production, sign with RS256 using service account private key
  // For now, return a mock JWT that the frontend can use
  const payload = {
    iss: SERVICE_ACCOUNT_EMAIL,
    aud: 'google',
    origins: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
    typ: 'savetowallet',
    payload: {
      loyaltyObjects: [{
        id: objectId,
        classId: CLASS_ID,
        state: 'ACTIVE',
        accountId: userLoyalty.userId,
        accountName: 'Cliente La Casa del Sabor',
        loyaltyPoints: {
          label: 'Puntos',
          balance: { string: userLoyalty.points.toLocaleString('es-ES') },
          pointsType: 'POINTS',
        },
        tier: tier.name,
        tierLabel: 'Nivel',
        hexBackgroundColor: tier.color,
        barcode: {
          type: 'QR_CODE',
          value: qrValue,
          alternateText: userLoyalty.userId,
        },
        textModulesData: [
          { header: 'Tier Actual', body: `${tier.icon} ${tier.name}`, id: 'tier' },
          { header: 'Próximo nivel', body: `${getPointsToNextTier(userLoyalty.points)} pts`, id: 'next_tier' },
        ],
        linksModuleData: {
          uris: [
            { uri: `${process.env.NEXT_PUBLIC_APP_URL}/loyalty`, description: 'Ver recompensas', id: 'rewards' },
          ],
        },
      }],
    },
  };
  
  // Mock JWT - in production use jsonwebtoken with RS256
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = 'mock-signature-for-dev';
  
  return `${header}.${payloadB64}.${signature}`;
}

// Get points to next tier helper
function getPointsToNextTier(points: number): number {
  const currentTier = [...loyaltyProgram.tiers].reverse().find(t => points >= t.minPoints);
  if (!currentTier) return loyaltyProgram.tiers[0].minPoints;
  const nextTier = loyaltyProgram.tiers.find(t => t.minPoints > currentTier.minPoints);
  return nextTier ? nextTier.minPoints - points : 0;
}

// Mock: Create or update loyalty pass in Google Wallet
export async function createOrUpdateLoyaltyPass(
  userLoyalty: UserLoyalty,
  program: LoyaltyProgram,
  tier: LoyaltyTier
): Promise<string> {
  const objectId = `${ISSUER_ID}.loyalty_${userLoyalty.userId}`;
  const qrValue = generateSignedQR(userLoyalty.userId);
  
  const pass = {
    id: objectId,
    classId: CLASS_ID,
    state: 'ACTIVE',
    accountId: userLoyalty.userId,
    accountName: 'Cliente La Casa del Sabor',
    loyaltyPoints: {
      label: 'Puntos',
      balance: { string: userLoyalty.points.toLocaleString('es-ES') },
      pointsType: 'POINTS',
    },
    tier: tier.name,
    tierLabel: 'Nivel',
    hexBackgroundColor: tier.color,
    barcode: {
      type: 'QR_CODE',
      value: qrValue,
      alternateText: userLoyalty.userId,
    },
    textModulesData: [
      { header: 'Tier Actual', body: `${tier.icon} ${tier.name}`, id: 'tier' },
      { header: 'Próximo nivel', body: `${getPointsToNextTier(userLoyalty.points)} pts`, id: 'next_tier' },
    ],
    linksModuleData: {
      uris: [
        { uri: `${process.env.NEXT_PUBLIC_APP_URL}/loyalty`, description: 'Ver recompensas', id: 'rewards' },
      ],
    },
  };
  
  // Store in mock (replace with actual Google Wallet API call)
  walletPasses.set(objectId, pass);
  
  console.log(`[Google Wallet] Pass created/updated for ${userLoyalty.userId}:`, objectId);
  return objectId;
}

// Mock: Update pass when points/tier change
export async function updateLoyaltyPassPoints(
  userId: string,
  newPoints: number,
  tier: LoyaltyTier
): Promise<void> {
  const objectId = `${ISSUER_ID}.loyalty_${userId}`;
  const existing = walletPasses.get(objectId);
  
  if (existing) {
    existing.loyaltyPoints.balance.string = newPoints.toLocaleString('es-ES');
    existing.textModulesData[0].body = `${tier.icon} ${tier.name}`;
    existing.textModulesData[1].body = `${getPointsToNextTier(newPoints)} pts`;
    existing.barcode.value = generateSignedQR(userId);
    walletPasses.set(objectId, existing);
    console.log(`[Google Wallet] Points updated for ${userId}: ${newPoints}`);
  }
}

// Get pass for debugging
export function getWalletPass(userId: string): any {
  return walletPasses.get(`${ISSUER_ID}.loyalty_${userId}`);
}