/**
 * Polar.sh Integration Utility
 * Documentation: https://docs.polar.sh/api-reference
 */

const POLAR_API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api.polar.sh/v1' 
    : 'https://sandbox-api.polar.sh/v1';

const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN;

/**
 * Create a Checkout Session
 * @param {string} productId - Polar Product ID
 * @param {string} userId - User UID to credit after payment
 * @returns {Promise<string>} - Checkout URL
 */
export async function createPolarCheckout(productId, userId) {
    if (!POLAR_ACCESS_TOKEN) {
        throw new Error('POLAR_ACCESS_TOKEN is not configured in environment variables.');
    }

    const response = await fetch(`${POLAR_API_URL}/checkouts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${POLAR_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            product_id: productId,
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet?success=true`,
            metadata: {
                userId: userId, // CRITICAL: Store userId to identify who paid
            }
        }),
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error('Polar API Error:', data);
        throw new Error(data.detail || 'Failed to create Polar checkout session');
    }

    return data.url;
}
