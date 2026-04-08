export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'GET' && path === '/level2') {
      
      console.log('🚀 /level2 вызван');

      const level2pollyData = await level2();

      // === Сохранение в KV (myVar) ===
      try {
        await env.myVar.put("btc_level2", JSON.stringify(level2pollyData, null, 2));
        console.log('💾 Данные успешно сохранены в KV (myVar)');
      } catch (e) {
        console.error('❌ Ошибка сохранения в KV:', e);
      }

      const responseData = {
        message: "Привет! level2 работает! ✅",
        timestamp: new Date().toISOString(),
        level2: level2pollyData,
        savedToKV: true
      };

      return new Response(JSON.stringify(responseData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response('Not Found. Используй /level2', { status: 404 });
  },
};

// ====================== ПОЛУЧЕНИЕ ДАННЫХ ======================
async function level2() {
  try {
    const response = await fetch('https://cryptottlivewebapi.free2ex.net:8443/api/v2/public/level2/BTCUSDT?depth=1', {
      headers: {
        'User-Agent': 'Cloudflare-Worker-level2',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const text = await response.text();
    if (!text?.trim()) throw new Error('Пустой ответ от API');
    
    const data = JSON.parse(text);
    const info = data[0];

    return {
      success: true,
      symbol: info.Symbol,
      bestBid: info.BestBid?.Price,
      bestAsk: info.BestAsk?.Price,
      spread: (info.BestAsk?.Price - info.BestBid?.Price || 0).toFixed(2),
      midPrice: ((info.BestBid?.Price + info.BestAsk?.Price) / 2 || 0).toFixed(2),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ level2 error:', error.message);
    return { success: false, error: error.message };
  }
}
