import { NextRequest, NextResponse } from 'next/server';
import { verifyLoyaltyQR } from '@/lib/wallet/googleWallet';
import { addPointsToUser, getUserLoyalty } from '@/lib/loyaltyStore';
import { getTierById } from '@/data/loyalty';

export async function POST(request: NextRequest) {
  try {
    const { qrData, staffId, amountEuros } = await request.json();
    
    if (!qrData) {
      return NextResponse.json({ success: false, error: 'QR data requerido' }, { status: 400 });
    }
    
    // Verify QR signature and timestamp
    const verification = verifyLoyaltyQR(qrData);
    if (!verification.valid || !verification.userId) {
      return NextResponse.json({ 
        success: false, 
        error: verification.error || 'QR inválido' 
      });
    }
    
    // Get user loyalty
    const loyalty = getUserLoyalty(verification.userId);
    if (!loyalty) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no encontrado en programa loyalty' 
      });
    }
    
    // Calculate points (use provided amount or default 25€)
    const euros = amountEuros || 25;
    const result = await addPointsToUser(verification.userId, euros, staffId);
    
    const updatedTier = getTierById(result.loyalty.tierId)!;
    
    return NextResponse.json({ 
      success: true,
      pointsEarned: result.pointsEarned,
      newTotalPoints: result.loyalty.points,
      newTier: result.loyalty.tierId,
      tierUpgraded: result.tierUpgraded,
      tierName: updatedTier.name,
      tierIcon: updatedTier.icon,
      userName: loyalty.name,
    });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error procesando escaneo' 
    }, { status: 500 });
  }
}