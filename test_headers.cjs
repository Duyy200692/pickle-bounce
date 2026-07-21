async function test() {
  const url = 'https://shop-api-new.alobo.vn/api/v1/user-account/d0K5Ow*fHDKy8Vi4mEZg';
  
  const headerTestCases = [
    { name: 'Standard (No extra headers)', headers: {} },
    { name: 'With HTTP Date header', headers: { 'Date': new Date().toUTCString() } },
    { name: 'With x-time (millisecond timestamp)', headers: { 'x-time': Date.now().toString() } },
    { name: 'With x-time (second timestamp)', headers: { 'x-time': Math.floor(Date.now() / 1000).toString() } },
    { name: 'With x-timestamp', headers: { 'x-timestamp': Date.now().toString() } },
    { name: 'With timestamp', headers: { 'timestamp': Date.now().toString() } },
    { name: 'With time', headers: { 'time': Date.now().toString() } }
  ];

  for (const tc of headerTestCases) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          ...tc.headers
        }
      });
      const text = await res.text();
      console.log(`Test Case: ${tc.name}`);
      console.log(`Status: ${res.status}`);
      console.log(`Body: ${text}`);
      console.log('---');
    } catch (e) {
      console.log(`Error on ${tc.name}:`, e.message);
    }
  }
}

test();
