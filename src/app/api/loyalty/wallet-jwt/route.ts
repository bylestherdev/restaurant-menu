import { NextRequest, NextResponse } from 'next/server';
import { getUserLoyalty, initUserLoyalty } from '@/lib/loyaltyStore';
import { generateSaveToWalletJWT, createOrUpdateLoyaltyPass } from '@/lib/wallet/googleWallet';
import { loyaltyProgram, getTierById } from '@/data/loyalty';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
    }
    
    // Get or create loyalty profile
    let loyalty = getUserLoyalty(userId);
    if (!loyalty) {
      // In production, get name/email from auth/user profile
      loyalty = initUserLoyalty(userId, 'Cliente', `${userId}@email.com`);
    }
    
    const tier = getTierById(loyalty.tierId)!;
    
    // Create/update Google Wallet pass
    const objectId = await createOrUpdateLoyaltyPass(loyalty, loyaltyProgram, tier);
    
    // Generate JWT for "Add to Google Wallet" button
    const jwt = generateSaveToWalletJWT(loyalty, loyaltyProgram, tier);
    
    return NextResponse.json({ 
      jwt, 
      objectId,
      loyalty: {
        points: loyalty.points,
        tier: loyalty.tierId,
        tierName: tier.name,
      }
    });
  } catch (error) {
    console.error('Wallet JWT error:', error);
    return NextResponse.json({ error: 'Error generando pass' }, { status: 500 });
  }
}