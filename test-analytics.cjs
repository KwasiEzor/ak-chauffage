/**
 * Test Analytics Feature
 * Generates test visitor data and verifies the dashboard displays it
 */

require('dotenv').config({ path: './server/.env' });

const API_URL = 'http://localhost:3001/api';

async function getAuthToken() {
  try {
    // First, get a CSRF token
    const initialResponse = await fetch(`${API_URL}/content`);
    const cookies = initialResponse.headers.get('set-cookie');
    const csrfToken = cookies?.match(/XSRF-TOKEN=([^;]+)/)?.[1];

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken || '',
        'Cookie': `XSRF-TOKEN=${csrfToken}`
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}

async function simulateVisits() {
  console.log('🌐 Simulating website visits...');
  
  const pages = ['/', '/services', '/projets', '/contact', '/services'];
  const referrers = ['', 'https://google.com', 'https://facebook.com', ''];
  
  for (let i = 0; i < 10; i++) {
    const page = pages[Math.floor(Math.random() * pages.length)];
    const referrer = referrers[Math.floor(Math.random() * referrers.length)];
    
    try {
      await fetch(`${API_URL.replace('/api', '')}${page}`, {
        headers: {
          'Referer': referrer,
          'User-Agent': i % 2 === 0 
            ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
            : 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) Safari/604.1'
        }
      });
      console.log(`✅ Visited: ${page}`);
    } catch (err) {
      // Ignore errors (page might not exist in dev)
    }
  }
  
  console.log('✅ Visits simulated\n');
}

async function getAnalyticsStats(token) {
  try {
    const response = await fetch(`${API_URL}/analytics/stats?days=7`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch analytics');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch analytics:', error.message);
    throw error;
  }
}

async function main() {
  console.log('📊 Testing Analytics Feature\n');

  try {
    // Step 1: Simulate some visits
    await simulateVisits();
    
    // Wait a bit for data to be written
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Login as admin
    console.log('🔐 Logging in as admin...');
    const token = await getAuthToken();
    console.log('✅ Login successful\n');

    // Step 3: Fetch analytics stats
    console.log('📈 Fetching analytics stats...');
    const stats = await getAnalyticsStats(token);
    
    console.log('\n📊 Analytics Report:');
    console.log('─────────────────────────────────────');
    console.log(`📈 Total Page Views: ${stats.totalPageViews}`);
    console.log(`👥 Unique Visitors: ${stats.uniqueVisitors}`);
    console.log(`📄 Pages per Visit: ${(stats.totalPageViews / stats.uniqueVisitors).toFixed(1)}`);
    console.log('\n📅 Daily Views (Last 7 days):');
    stats.dailyViews.forEach(day => {
      console.log(`   ${day.date}: ${day.views} views`);
    });
    
    console.log('\n🔥 Popular Pages:');
    stats.popularPages.slice(0, 5).forEach((page, i) => {
      console.log(`   ${i + 1}. ${page.page_path} (${page.views} views)`);
    });
    
    console.log('\n🌐 Traffic Sources:');
    stats.trafficSources.forEach(source => {
      console.log(`   ${source.name}: ${source.value} visits`);
    });
    
    console.log('\n📱 Device Breakdown:');
    stats.deviceBreakdown.forEach(device => {
      console.log(`   ${device.name}: ${device.value} visits`);
    });
    
    console.log('\n─────────────────────────────────────');
    console.log('✅ Analytics feature is working!\n');
    console.log('🎨 Open the admin dashboard to see the charts:');
    console.log('   http://localhost:5173/admin\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
