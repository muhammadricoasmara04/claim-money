import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { plan, country, paymentMethod, cookies } = body;

    if (!cookies || !cookies.accessToken) {
      return NextResponse.json(
        { error: 'Invalid cookies: accessToken is required' },
        { status: 400 }
      );
    }

    const planMapping = {
      'plus-personal': 'chatgptplusplan',
      'business': 'chatgptbusinessplan'
    };

    const currencyMapping = {
      'KR': 'KRW',
      'ID': 'IDR',
      'US': 'USD',
      'JP': 'JPY',
      'SG': 'SGD',
      'MY': 'MYR',
      'GB': 'GBP',
      'TH': 'THB',
      'VN': 'VND',
      'PH': 'PHP'
    };

    const planName = planMapping[plan] || 'chatgptplusplan';
    const currency = currencyMapping[country] || 'USD';

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cookies.accessToken}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Origin': 'https://chatgpt.com',
      'Referer': 'https://chatgpt.com/',
      'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin'
    };

    if (cookies.sessionToken) {
      headers['Cookie'] = `__Secure-next-auth.session-token=${cookies.sessionToken}`;
    }

    const requestBody = {
      entry_point: 'all_plans_pricing_modal',
      plan_name: planName,
      billing_details: {
        country: country,
        currency: currency
      },
      checkout_ui_mode: 'custom',
      promo_campaign: {
        promo_campaign_id: 'plus-1-month-free',
        is_coupon_from_query_param: false
      }
    };

    console.log('Request to ChatGPT API:', {
      url: 'https://chatgpt.com/backend-api/payments/checkout',
      headers: { ...headers, Authorization: 'Bearer [REDACTED]' },
      body: requestBody
    });

    const checkoutResponse = await fetch('https://chatgpt.com/backend-api/payments/checkout', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    const responseText = await checkoutResponse.text();
    console.log('ChatGPT API response:', {
      status: checkoutResponse.status,
      statusText: checkoutResponse.statusText,
      body: responseText
    });

    if (!checkoutResponse.ok) {
      return NextResponse.json(
        {
          error: `Failed to create checkout session: ${checkoutResponse.status} ${checkoutResponse.statusText}`,
          details: responseText
        },
        { status: checkoutResponse.status }
      );
    }

    const checkoutData = JSON.parse(responseText);

    if (checkoutData.checkout_session_id) {
      // Generate proper ChatGPT checkout URL
      const processorEntity = checkoutData.processor_entity || 'openai_llc';
      const checkoutUrl = `https://chatgpt.com/checkout/${processorEntity}/${checkoutData.checkout_session_id}`;

      return NextResponse.json({
        ...checkoutData,
        checkoutUrl
      }, { status: 200 });
    }

    return NextResponse.json(checkoutData, { status: 200 });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Invalid request' },
      { status: 400 }
    );
  }
}
