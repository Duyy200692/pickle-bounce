async function test() {
  const endpoints = [
    'https://shop-api-new.alobo.vn/api/v1/schedule/get_schedule',
    'https://shop-api-new.alobo.vn/api/v1/court/list',
    'https://shop-api-new.alobo.vn/api/v1/branch/list',
    'https://shop-api-new.alobo.vn/api/v1/user-account/d0K5Ow*fHDKy8Vi4mEZg',
    'https://shop-api-new.alobo.vn/api/v1/shop-branch/d0K5Ow*fHDKy8Vi4mEZg',
    'https://shop-api-new.alobo.vn/api/v1/schedule/list'
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const text = await res.text();
      console.log(`URL: ${url}`);
      console.log(`Status: ${res.status}`);
      console.log(`Body: ${text.substring(0, 500)}`);
      console.log('---');
    } catch (e) {
      console.log(`Error fetching ${url}:`, e.message);
    }
  }
}

test();
