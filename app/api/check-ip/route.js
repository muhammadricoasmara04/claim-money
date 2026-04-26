import { NextResponse } from 'next/server';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';

export async function GET() {
  try {
    const KOREA_PROXY = process.env.KOREA_PROXY_URL;

    // Kita coba jalur HTTP biasa (tanpa SSL) agar proxy gratisan lebih gampang tembus
    let config = {
      method: 'get',
      url: 'http://ip-api.com/json', // Pakai HTTP biasa
      timeout: 15000,
    };

    if (KOREA_PROXY) {
      // Jika targetnya http, gunakan HttpProxyAgent (bukan Https)
      const agent = new HttpProxyAgent(KOREA_PROXY);
      config.httpAgent = agent;
      config.proxy = false;
    }

    const response = await axios(config);

    return NextResponse.json({
      detected_ip: response.data.query,
      country: response.data.country,
      city: response.data.city,
      is_korea: response.data.countryCode === 'KR' ? '✅ YES' : '❌ NO',
      proxy_used: KOREA_PROXY,
      note: 'Berhasil! Proxy ini bekerja untuk jalur HTTP biasa.'
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Proxy masih menolak (400/Timeout)',
      message: error.message,
      detail: 'Proxy gratisan sangat tidak stabil. Coba restart server atau ganti IP lagi.'
    }, { status: 500 });
  }
}
