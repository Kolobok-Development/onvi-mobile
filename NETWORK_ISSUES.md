# Network Connectivity Issues: Russia → AWS

## Problem Analysis

The `NJS-040: connection request timeout` errors and 100% CPU usage are likely caused by **network connectivity issues between Russia and AWS**.

### Root Causes:
1. **ISP Blocking/Throttling**: Russian ISPs may block or throttle connections to AWS (US-based cloud provider)
2. **Geographic Latency**: High latency between Russia and AWS EU region (eu-central-1)
3. **Connection Drops**: Intermittent connection drops causing connection pool exhaustion
4. **Queue Backlog**: Failed connections create a backlog, consuming CPU while waiting

### Evidence:
- Database: `db12.cr7z8fn85oko.eu-central-1.rds.amazonaws.com` (AWS EU)
- Server Location: Russia
- Error: `NJS-040: connection request timeout` (queue timeout after 60s)
- CPU: 100% (likely from queued requests waiting for connections)

## Solutions Implemented

### 1. Enhanced Connection Pool Configuration
- **Increased `queueTimeout`**: 60s → 180s (more time for slow connections)
- **Increased `poolTimeout`**: 60s → 300s (keep connections alive longer)
- **Added `connectTimeout`**: 30s (time to establish connection)
- **Maintained minimum pool**: 5 connections always ready

### 2. Network Error Detection
- Added `database_network` error source detection
- Identifies network-specific errors (NJS-*, ECONNREFUSED, ETIMEDOUT)
- Enhanced logging with network diagnostics

### 3. Environment Variables for Tuning
Add these to your production environment:
```bash
DB_POOL_MAX=20              # Maximum connections
DB_POOL_MIN=5               # Minimum connections (keep alive)
DB_POOL_INCREMENT=2         # Connections to add when growing
DB_QUEUE_TIMEOUT=180000     # 180 seconds queue timeout
DB_POOL_TIMEOUT=300         # 5 minutes before closing idle connections
DB_CONNECT_TIMEOUT=30000    # 30 seconds to establish connection
DB_RETRY_COUNT=3            # Retry attempts on failure
DB_RETRY_DELAY=1000        # 1 second between retries
```

## Recommended Infrastructure Solutions

### Option 1: AWS Direct Connect (Best Performance)
- **Cost**: High (~$300-500/month)
- **Benefit**: Dedicated, low-latency connection
- **Setup**: Requires AWS Direct Connect partner in Russia

### Option 2: VPN/Proxy Server (Cost-Effective)
- **Cost**: Low (~$10-50/month)
- **Benefit**: Routes traffic through stable connection
- **Setup**: 
  - Deploy VPN server in EU (closer to AWS)
  - Route database connections through VPN
  - Or use SOCKS5 proxy

### Option 3: Database Proxy/Connection Pooler (Recommended)
- **Cost**: Medium
- **Benefit**: 
  - PgBouncer or similar for connection pooling
  - Deploy proxy closer to database (EU region)
  - Server connects to proxy (shorter distance)
  - Proxy maintains persistent connections to DB

### Option 4: Move Database Closer
- **Cost**: Migration effort
- **Benefit**: Lower latency
- **Options**:
  - Use AWS in a region closer to Russia (if available)
  - Use Russian cloud provider (Yandex Cloud, VK Cloud) with database replication

### Option 5: Connection Retry with Exponential Backoff
- Already implemented in code
- Automatically retries failed connections
- Reduces impact of temporary network issues

## Monitoring Recommendations

1. **Monitor Connection Pool Metrics**:
   - Active connections
   - Queued requests
   - Connection failures
   - Average connection time

2. **Network Diagnostics**:
   - Ping AWS from server: `ping db12.cr7z8fn85oko.eu-central-1.rds.amazonaws.com`
   - Test connection: `telnet db12.cr7z8fn85oko.eu-central-1.rds.amazonaws.com 1521`
   - Check routing: `traceroute db12.cr7z8fn85oko.eu-central-1.rds.amazonaws.com`

3. **Log Analysis**:
   - Filter logs for `database_network` errors
   - Monitor frequency of timeouts
   - Track connection success rate

## Quick Wins (Immediate Actions)

1. ✅ **Deploy current fixes** (already done)
   - Enhanced connection pool settings
   - Network error detection
   - Better logging

2. **Test Connection Stability**:
   ```bash
   # From your server, test connectivity
   nc -zv db12.cr7z8fn85oko.eu-central-1.rds.amazonaws.com 1521
   ```

3. **Monitor Logs**:
   - Watch for `database_network` errors in Logtail
   - Check if errors correlate with specific times/ISPs

4. **Consider Temporary Workaround**:
   - If specific ISPs are blocking, consider using a VPN for database connections only
   - Use connection pooling service (like PgBouncer equivalent for Oracle)

## Long-term Solution

**Recommended**: Deploy a database connection proxy in EU region (close to AWS):
- Server (Russia) → Proxy (EU) → Database (AWS EU)
- Proxy maintains persistent connections
- Reduces connection overhead
- Better resilience to network issues

