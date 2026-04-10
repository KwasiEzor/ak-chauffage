const { db } = require('./connection.cjs');

/**
 * Visitor Analytics Service
 * Handles all database operations for visitor tracking
 */

class VisitorAnalyticsService {
  /**
   * Track a page view
   */
  static async track({ sessionId, pagePath, referrer, ipAddress, userAgent }) {
    const deviceType = this.detectDeviceType(userAgent);

    const stmt = db.prepare(`
      INSERT INTO visitor_analytics (session_id, page_path, referrer, ip_address, user_agent, device_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.run(sessionId, pagePath, referrer || null, ipAddress, userAgent, deviceType);

    return {
      id: result.lastInsertRowid,
      sessionId,
      pagePath,
      deviceType,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Detect device type from user agent string
   */
  static detectDeviceType(userAgent) {
    if (!userAgent) return 'desktop';

    const ua = userAgent.toLowerCase();

    // Check for mobile devices
    if (
      /mobile|android|iphone|ipod|blackberry|opera mini|iemobile|windows phone/i.test(ua)
    ) {
      return 'mobile';
    }

    // Check for tablets
    if (/tablet|ipad|playbook|silk|kindle/i.test(ua)) {
      return 'tablet';
    }

    return 'desktop';
  }

  /**
   * Get analytics statistics for a given time range
   */
  static async getStats(days = 7) {
    const stats = {
      totalPageViews: 0,
      uniqueVisitors: 0,
      dailyViews: [],
      popularPages: [],
      trafficSources: [],
      deviceBreakdown: [],
    };

    const dateFilter = `created_at >= datetime('now', '-${days} days')`;

    // Total page views
    const totalStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM visitor_analytics
      WHERE ${dateFilter}
    `);
    const totalResult = await totalStmt.get();
    stats.totalPageViews = totalResult.count;

    // Unique visitors (by session_id)
    const uniqueStmt = db.prepare(`
      SELECT COUNT(DISTINCT session_id) as count
      FROM visitor_analytics
      WHERE ${dateFilter}
    `);
    const uniqueResult = await uniqueStmt.get();
    stats.uniqueVisitors = uniqueResult.count;

    // Daily views for time-series chart
    const dailyStmt = db.prepare(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as views
      FROM visitor_analytics
      WHERE ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    stats.dailyViews = await dailyStmt.all();

    // Popular pages (top 10)
    const pagesStmt = db.prepare(`
      SELECT
        page_path,
        COUNT(*) as views
      FROM visitor_analytics
      WHERE ${dateFilter}
      GROUP BY page_path
      ORDER BY views DESC
      LIMIT 10
    `);
    stats.popularPages = await pagesStmt.all();

    // Traffic sources categorization
    const sourcesStmt = db.prepare(`
      SELECT referrer
      FROM visitor_analytics
      WHERE ${dateFilter}
    `);
    const allReferrers = await sourcesStmt.all();

    const sourceCategories = {
      Direct: 0,
      Google: 0,
      Facebook: 0,
      Instagram: 0,
      Other: 0,
    };

    allReferrers.forEach(({ referrer }) => {
      if (!referrer || referrer === '') {
        sourceCategories.Direct++;
      } else if (referrer.includes('google')) {
        sourceCategories.Google++;
      } else if (referrer.includes('facebook')) {
        sourceCategories.Facebook++;
      } else if (referrer.includes('instagram')) {
        sourceCategories.Instagram++;
      } else {
        sourceCategories.Other++;
      }
    });

    stats.trafficSources = Object.entries(sourceCategories).map(([name, value]) => ({
      name,
      value,
    }));

    // Device breakdown
    const devicesStmt = db.prepare(`
      SELECT
        device_type,
        COUNT(*) as count
      FROM visitor_analytics
      WHERE ${dateFilter}
      GROUP BY device_type
      ORDER BY count DESC
    `);
    const deviceResults = await devicesStmt.all();
    stats.deviceBreakdown = deviceResults.map(({ device_type, count }) => ({
      name: device_type.charAt(0).toUpperCase() + device_type.slice(1),
      value: count,
    }));

    return stats;
  }
}

module.exports = VisitorAnalyticsService;
