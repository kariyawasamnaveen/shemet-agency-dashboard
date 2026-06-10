import { NextResponse } from 'next/server';
import { createPolarCheckout } from '../../../lib/polar';

export async function POST(request) {
    try {
        const { productId, userId } = await request.json();

        if (!productId || !userId) {
            return NextResponse.json({ error: 'Missing productId or userId' }, { status: 400 });
        }

        const checkoutUrl = await createPolarCheckout(productId, userId);

        return NextResponse.json({ url: checkoutUrl });
    } catch (error) {
        console.error('Checkout API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
