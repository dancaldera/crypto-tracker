# Week Evaluation - Feb 13-20, 2026

## Purpose
Evaluate crypto tracker performance in TEST mode for 7 days before considering real trading.

## Configuration

### Mode
- **Mode:** TEST (simulated portfolio)
- **Portfolio:** ~$3,006 MXN
- **Cron schedule:** Every 2 hours (0 */2 * * *)
- **Trading:** DISABLED (ENABLE_TRADING not set)
- **Portfolio file:** `data/portfolio_test.json`

### Allocations
| Asset | Target | Current Amount | Value (MXN) |
|-------|--------|----------------|-------------|
| BTC | 40% | 0.001014 | ~$1,200 |
| ETH | 25% | 0.0213 | ~$750 |
| SOL | 15% | 0.308 | ~$450 |
| USDC | 20% | 34.9 | ~$600 |
| **Total** | **100%** | | **~$3,006** |

### Rebalance Settings
- **Threshold:** 10%
- **Min trade:** $50 USD
- **Max trade:** $1,000 USD

## Baseline Data (Feb 13, 2026 @ 10:00 PM)

### Prices
- BTC: $1,186,080 MXN
- ETH: $35,349 MXN
- SOL: $1,462.31 MXN
- USDC: $17.20 MXN (USD_MXN rate)

### Portfolio Value
- Total: $3,006.29 MXN
- P&L (30 days): +$3.08 MXN (+0.10%)

## Metrics to Track

### Daily Metrics
1. **Portfolio Value:** Start vs End of day
2. **Asset Performance:** Daily % change
3. **Rebalance Signals:** How many times diff > 10%
4. **Volatility:** High/Low values

### Weekly Metrics
1. **Total P&L:** Overall % gain/loss
2. **Rebalance Count:** How many trades would have happened
3. **Best Performer:** Which asset gained most
4. **Worst Performer:** Which asset lost most
5. **Volatility Index:** How much portfolio fluctuated

### Specific Analysis
1. **Correlation:** Do BTC and ETH move together?
2. **SOL Behavior:** Does SOL act differently from BTC/ETH?
3. **USDC Stability:** Is the MXN rate stable?
4. **Threshold Efficiency:** Is 10% too high/low?

## Evaluation Timeline

| Date | Expected Runs | Cumulative Runs |
|------|---------------|------------------|
| Feb 13 | 4 | 4 |
| Feb 14 | 12 | 16 |
| Feb 15 | 12 | 28 |
| Feb 16 | 12 | 40 |
| Feb 17 | 12 | 52 |
| Feb 18 | 12 | 64 |
| Feb 19 | 12 | 76 |
| Feb 20 | 12 | 88 |

**Total expected runs:** ~88 executions

## Commands for Evaluation

### Check Status
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
./status.sh
```

### Verify All Metrics (Recommended before Friday)
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
./verify_metrics.sh
```

### Daily Summary (runs automatically at 23:00)
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
node daily_summary.js
```

### View Last Daily Summary
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
cat logs/summary_*.json | tail -50
```

### Weekly Evaluation (for Friday)
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
node weekly_evaluation.js
```

### Manual Performance Analysis
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
node analyze_performance.js 1  # Today
node analyze_performance.js 7  # This week
```

### Check Rebalance Signals
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
grep "anyNeedsRebalance.*true" logs/cron_test.log | wc -l
```

### View Price History
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
tail logs/prices/BTC_*.csv
tail logs/prices/ETH_*.csv
tail logs/prices/SOL_*.csv
```

### Daily Log Review
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
grep "Total Value" logs/cron_test.log | tail 6
```

## Success Criteria

Before activating real trading, we should see:

1. ✅ **Consistent Data Collection** - No errors or missing runs
2. ✅ **Reasonable Volatility** - Portfolio fluctuates within expected ranges
3. ✅ **Correct Rebalance Signals** - Logic makes sense (e.g., if BTC rallies, we see sell signal)
4. ✅ **Price Accuracy** - Bitso API data is reliable
5. ✅ **No Edge Cases** - System handles all market conditions

## Decision Framework

### Activate Real Trading If:
- ✅ All 88 runs completed successfully
- ✅ Rebalance logic makes sense
- ✅ Total P&L is within +/-5%
- ✅ No critical bugs found
- ✅ We understand the volatility pattern

### Keep Testing If:
- ❌ Frequent API errors
- ❌ Unusual volatility (>10% daily)
- ❌ Rebalance logic seems wrong
- ❌ Missing data points
- ❌ Critical bugs discovered

## Notes

- **Started:** Feb 13, 2026 @ 10:00 PM
- **Ends:** Feb 20, 2026 @ 10:00 PM
- **Status:** ✅ Active
- **Last check:** ✅ All systems go

## Automation

### Daily Summary Cron
- **Schedule:** Every day at 23:00
- **Executes:** `daily_summary_simple.sh` → `daily_summary.js`
- **Generates:**
  - `logs/summary_YYYY-MM-DD.json` - Datos completos en JSON
  - `logs/daily_message.txt` - Mensaje formateado para Telegram
- **Logs:** `logs/cron_daily.log`

### Monitor Cron
- **Schedule:** Every 2 hours (0, 2, 4, ..., 22)
- **Executes:** `monitor_test.sh` → `monitor.js`
- **Generates:** Portfolio logs, price CSVs, main log

### Data Collected Automatically
1. ✅ Portfolio value over time (every 2 hours)
2. ✅ Asset performance (daily)
3. ✅ Price ranges (daily)
4. ✅ Run count and errors (daily)
5. ✅ Rebalance signals (daily)
6. ✅ Allocation tracking (daily)

### Friday Evaluation Commands
```bash
# 1. Verify all data is complete
./verify_metrics.sh

# 2. Run weekly evaluation
node weekly_evaluation.js

# 3. Review full report
cat logs/weekly_evaluation_full.json
```

All metrics are ready for Friday evaluation! 🚀
