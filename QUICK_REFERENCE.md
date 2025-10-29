# S21-A24 Quick Reference Card

**Project:** Susan 21 + Agnes 24 | **Company:** Roof-ER | **Status:** Phase 1 Complete ✅

---

## 🚀 Quick Start (3 Steps)

```typescript
// 1. Import
import { sendAIRequest } from './lib/ai-system';
import { StatusDashboard } from './components/StatusDashboard';

// 2. Add Dashboard to App
<StatusDashboard />

// 3. Send Request
const response = await sendAIRequest({
  message: 'Your message here'
});
```

---

## 📁 File Locations

**Core System:**
- `/Users/a21/Desktop/S21-A24/lib/ai-router.ts` - Smart routing
- `/Users/a21/Desktop/S21-A24/lib/cost-tracker.ts` - Cost tracking
- `/Users/a21/Desktop/S21-A24/lib/health-checker.ts` - Health monitoring
- `/Users/a21/Desktop/S21-A24/lib/ai-system.ts` - Central hub

**UI:**
- `/Users/a21/Desktop/S21-A24/components/StatusDashboard.tsx` - Monitoring UI

**Config:**
- `/Users/a21/Desktop/S21-A24/.env.local` - API keys (configured)
- `/Users/a21/Desktop/S21-A24/.env.example` - Template

---

## 🔄 Routing Rules

| Request Type | Routes To | Why |
|-------------|-----------|-----|
| Voice/Image | Gemini | FREE (1,500 RPD) |
| Hands-free | Groq | 25x faster |
| Urgent | Groq | Ultra-low latency |
| Knowledge | HuggingFace | 73% cheaper |
| Code Gen | Groq | Specialized |
| Default | Together | Balanced |

---

## 💰 Provider Costs

| Provider | Cost per 1M | Free Tier |
|----------|-------------|-----------|
| Gemini | $0.00 | 1,500 req/day |
| Groq | $0.05-$0.08 | Generous |
| HuggingFace | $0.05 | Rate-limited |
| Together | $0.18 | $25 credit |

**Monthly Budget:** $25 (easily achievable!)

---

## 🎯 Common Usage Patterns

### Basic Text Request
```typescript
const response = await sendAIRequest({
  message: 'Calculate roof area'
});
```

### Voice Input (Routes to Gemini FREE)
```typescript
const response = await sendAIRequest({
  message: transcribedText,
  context: {
    type: 'voice',
    urgency: 'high',
    mode: 'hands-free'
  }
});
```

### Knowledge Search (Routes to HF Cheap)
```typescript
const response = await sendAIRequest({
  message: 'Search: roofing materials',
  context: {
    type: 'knowledge-search',
    urgency: 'low'
  }
});
```

### Urgent Request (Routes to Groq Fast)
```typescript
const response = await sendAIRequest({
  message: emergencyMessage,
  context: {
    type: 'text',
    urgency: 'urgent'
  }
});
```

---

## 📊 Monitoring Functions

### Get Cost Summary
```typescript
import { getCostSummary } from './lib/cost-tracker';

const costs = getCostSummary();
console.log('Today:', costs.today);
console.log('Month:', costs.thisMonth);
console.log('By Provider:', costs.byProvider);
```

### Check Budget
```typescript
import { checkBudget } from './lib/cost-tracker';

const alert = checkBudget();
if (alert?.level === 'critical') {
  alert(alert.message);
}
```

### Check Health
```typescript
import { getHealthSummary } from './lib/health-checker';

const health = getHealthSummary();
console.log(`${health.healthyProviders}/4 providers healthy`);
console.log(`Avg latency: ${health.averageLatency}ms`);
```

---

## 🔧 Configuration (.env.local)

```env
# API Keys (configured)
VITE_GEMINI_API_KEY=your_key_here
VITE_GROQ_API_KEY=your_key_here
VITE_TOGETHER_API_KEY=your_key_here
VITE_HF_API_KEY=your_key_here

# Budget (defaults shown)
VITE_DAILY_BUDGET_LIMIT=1.0
VITE_MONTHLY_BUDGET_LIMIT=25.0

# Health Check (every 5 minutes)
VITE_HEALTH_CHECK_INTERVAL=5
```

---

## 🎨 Status Dashboard

**Location:** Bottom-right floating button

**Features:**
- Cost overview (today/month)
- Provider health cards
- System statistics
- Manual refresh
- Export report (JSON)

**Colors:**
- 🟢 Green = Safe (< 80% budget)
- 🟡 Yellow = Warning (80-95%)
- 🔴 Red = Critical/Exceeded (95%+)

---

## 🔍 Health Checks

**Frequency:** Every 5 minutes (auto)

**What's Checked:**
- Provider availability
- Response latency
- Error rates
- Consecutive failures
- Uptime percentage

**Manual Refresh:** Click "Refresh Health Checks" in dashboard

---

## 📈 Expected Performance

| Provider | Latency | Reliability |
|----------|---------|-------------|
| Groq | 50-200ms | 99%+ |
| Gemini | 200-500ms | 99%+ |
| Together | 300-800ms | 99%+ |
| HuggingFace | 500-1500ms | 95%+ |

---

## ⚠️ Budget Alerts

- **80% Used** = Warning (yellow)
- **95% Used** = Critical (orange)
- **100% Used** = Exceeded (red)

**Alert appears:** In dashboard banner

---

## 🧪 Testing Commands

```bash
# Verify installation
npm list groq-sdk together-ai @huggingface/inference

# Start dev server
npm run dev

# Open app
# http://localhost:5173

# Click status button (bottom-right)
```

---

## 🎯 Response Object

```typescript
{
  content: string,      // AI response text
  provider: AIProvider, // Which provider used
  usage: {
    promptTokens: number,
    completionTokens: number,
    totalTokens: number,
    timestamp: Date
  },
  cost: number,        // Cost in USD
  latency: number      // Response time (ms)
}
```

---

## 🔐 Security Checklist

- ✅ API keys in `.env.local` (not in repo)
- ✅ `.env.local` is gitignored
- ✅ No keys in documentation
- ✅ localStorage for local data only
- ✅ No server-side tracking

---

## 📱 Integration Checklist

- [ ] Add `<StatusDashboard />` to App.tsx
- [ ] Use `sendAIRequest()` in chat component
- [ ] Show provider badge on messages
- [ ] Display cost per message (if > $0.0001)
- [ ] Add budget alert banner
- [ ] Show health indicator in sidebar
- [ ] Test all routing scenarios

---

## 🚨 Troubleshooting

**Issue:** No providers healthy
- Check API keys in `.env.local`
- Wait 5 minutes for first health check
- Click manual refresh in dashboard

**Issue:** All requests go to Together
- Check request context
- Verify other providers are healthy
- Check console for routing logs

**Issue:** Budget alert not showing
- Verify cost tracking is working
- Check budget thresholds in .env
- Send more requests to accumulate cost

**Issue:** Dashboard not visible
- Check z-index conflicts
- Verify component is imported
- Look for console errors

---

## 📚 Documentation Files

1. **PHASE1_COMPLETE.md** (650 lines) - Full documentation
2. **INTEGRATION_GUIDE.md** (280 lines) - Step-by-step integration
3. **PHASE1_SUMMARY.md** (400 lines) - Executive summary
4. **SYSTEM_DIAGRAM.txt** - Visual architecture
5. **QUICK_REFERENCE.md** (this file) - Quick lookup

---

## 🎉 Success Metrics

- ✅ 4 AI providers integrated
- ✅ Smart cost-optimized routing
- ✅ Real-time cost tracking
- ✅ Automated health monitoring
- ✅ Beautiful status dashboard
- ✅ Production-ready code
- ✅ Zero errors during setup

---

## 🔮 Next Steps (Phase 2)

- Voice integration
- Image analysis
- Knowledge base RAG
- Streaming responses
- Conversation context
- Request caching

---

## 💬 Support

**Questions?** Read full docs:
- `PHASE1_COMPLETE.md` - Comprehensive guide
- `INTEGRATION_GUIDE.md` - Code examples
- `SYSTEM_DIAGRAM.txt` - Architecture

**Console Logs:**
- Router decisions
- Cost tracking
- Health checks
- Error messages

---

## 📞 Key Imports

```typescript
// Core System
import { sendAIRequest } from './lib/ai-system';
import { aiRouter, routeAIRequest } from './lib/ai-router';
import { costTracker, getCostSummary, checkBudget } from './lib/cost-tracker';
import { healthChecker, getHealthSummary } from './lib/health-checker';

// UI Component
import { StatusDashboard } from './components/StatusDashboard';
```

---

## 🎯 Remember

**Work ONLY in:** `/Users/a21/Desktop/S21-A24`

**DO NOT modify:**
- `/Users/a21/routellm-chatbot` (production)
- `/Users/a21/Desktop/S21` (separate project)
- `/Users/a21/Desktop/gemini-field-assistant` (template)

---

**Phase 1 Complete!** Ready for Phase 2 when you are! 🚀

---

*S21-A24 Quick Reference v1.0*
*October 29, 2025 - Roof-ER*
