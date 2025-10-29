# S21-A24 Integration Guide

Quick guide to integrate the new AI system into your existing app.

---

## Step 1: Add Status Dashboard to App

Edit `/Users/a21/Desktop/S21-A24/App.tsx`:

```typescript
import { StatusDashboard } from './components/StatusDashboard';

function App() {
  return (
    <div className="app">
      {/* Your existing UI */}

      {/* Add Status Dashboard (floating button) */}
      <StatusDashboard />
    </div>
  );
}
```

---

## Step 2: Use AI System in Chat

Edit your chat component (e.g., `ChatPanel.tsx`):

```typescript
import { sendAIRequest } from '../lib/ai-system';

async function handleSendMessage(message: string) {
  try {
    const response = await sendAIRequest({
      message,
      context: {
        type: 'text',
        urgency: 'medium',
        estimatedTokens: 1000,
      }
    });

    // Display response
    console.log('AI Response:', response.content);
    console.log('Provider:', response.provider);
    console.log('Cost:', response.cost);
    console.log('Latency:', response.latency);

    // Add to chat history
    addMessage({
      role: 'assistant',
      content: response.content,
      provider: response.provider,
      cost: response.cost,
    });

  } catch (error) {
    console.error('AI request failed:', error);
  }
}
```

---

## Step 3: Add Provider Badge to Messages

```typescript
function MessageBubble({ message }) {
  return (
    <div className="message">
      <p>{message.content}</p>

      {/* Show which provider handled this message */}
      {message.provider && (
        <span className="provider-badge">
          {message.provider}
        </span>
      )}

      {/* Show cost if > $0.0001 */}
      {message.cost > 0.0001 && (
        <span className="cost-badge">
          ${message.cost.toFixed(4)}
        </span>
      )}
    </div>
  );
}
```

---

## Step 4: Context-Aware Routing

### For Voice Input
```typescript
const response = await sendAIRequest({
  message: transcribedText,
  context: {
    type: 'voice',
    urgency: 'high',
    mode: 'hands-free',
  }
});
// Routes to Gemini (FREE) or Groq (FAST)
```

### For Image Analysis
```typescript
const response = await sendAIRequest({
  message: `Analyze this roof image: ${imageUrl}`,
  context: {
    type: 'image',
    urgency: 'medium',
  }
});
// Routes to Gemini (FREE tier)
```

### For Knowledge Search
```typescript
const response = await sendAIRequest({
  message: `Search for: ${query}`,
  context: {
    type: 'knowledge-search',
    urgency: 'low',
    estimatedTokens: 2000,
  }
});
// Routes to HuggingFace (73% cheaper)
```

### For Urgent Requests
```typescript
const response = await sendAIRequest({
  message: emergencyMessage,
  context: {
    type: 'text',
    urgency: 'urgent',
  }
});
// Routes to Groq (25x faster)
```

---

## Step 5: Budget Monitoring

### Show Budget Alert in UI

```typescript
import { checkBudget } from '../lib/cost-tracker';

function BudgetAlert() {
  const [alert, setAlert] = useState(checkBudget());

  useEffect(() => {
    const interval = setInterval(() => {
      setAlert(checkBudget());
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!alert || alert.level === 'safe') return null;

  return (
    <div className={`alert alert-${alert.level}`}>
      {alert.message}
    </div>
  );
}
```

---

## Step 6: Health Status Indicator

### Show Provider Health in Sidebar

```typescript
import { getHealthyProviders } from '../lib/health-checker';

function Sidebar() {
  const [healthyProviders, setHealthyProviders] = useState([]);

  useEffect(() => {
    const updateHealth = () => {
      setHealthyProviders(getHealthyProviders());
    };

    updateHealth();
    const interval = setInterval(updateHealth, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sidebar">
      <div className="health-indicator">
        {healthyProviders.length}/4 Providers Online
      </div>
    </div>
  );
}
```

---

## Complete Example: Enhanced Chat Component

```typescript
import { useState, useEffect } from 'react';
import { sendAIRequest } from '../lib/ai-system';
import { getCostSummary, checkBudget } from '../lib/cost-tracker';

export function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [costSummary, setCostSummary] = useState(getCostSummary());
  const [budgetAlert, setBudgetAlert] = useState(checkBudget());

  // Update costs every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCostSummary(getCostSummary());
      setBudgetAlert(checkBudget());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send to AI with context
      const response = await sendAIRequest({
        message: input,
        context: {
          type: 'text',
          urgency: 'medium',
          estimatedTokens: 1000,
        }
      });

      // Add AI response
      const aiMessage = {
        role: 'assistant',
        content: response.content,
        provider: response.provider,
        cost: response.cost,
        latency: response.latency,
      };
      setMessages([...messages, userMessage, aiMessage]);

    } catch (error) {
      console.error('AI request failed:', error);
      // Show error message
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true,
      };
      setMessages([...messages, userMessage, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-panel">
      {/* Budget Alert */}
      {budgetAlert && budgetAlert.level !== 'safe' && (
        <div className={`alert alert-${budgetAlert.level}`}>
          {budgetAlert.message}
        </div>
      )}

      {/* Cost Summary */}
      <div className="cost-summary">
        Today: ${costSummary.today.toFixed(4)} |
        Month: ${costSummary.thisMonth.toFixed(2)}
      </div>

      {/* Messages */}
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.role}`}>
            <p>{msg.content}</p>
            {msg.provider && (
              <div className="message-meta">
                <span className="provider">{msg.provider}</span>
                {msg.cost > 0 && (
                  <span className="cost">${msg.cost.toFixed(4)}</span>
                )}
                {msg.latency && (
                  <span className="latency">{msg.latency}ms</span>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="loading">Thinking...</div>}
      </div>

      {/* Input */}
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
```

---

## Styling Example

```css
/* Provider Badge */
.provider-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: bold;
  border-radius: 4px;
  text-transform: uppercase;
}

.provider-badge.gemini { background: #4285F4; color: white; }
.provider-badge.groq { background: #FF6B35; color: white; }
.provider-badge.together { background: #8B5CF6; color: white; }
.provider-badge.huggingface { background: #FFD21E; color: black; }

/* Budget Alert */
.alert {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.alert-warning {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FCD34D;
}

.alert-critical {
  background: #FEE2E2;
  color: #991B1B;
  border: 1px solid #FCA5A5;
}

.alert-exceeded {
  background: #DC2626;
  color: white;
  border: 1px solid #B91C1C;
}

/* Cost Summary */
.cost-summary {
  padding: 8px 16px;
  background: #F3F4F6;
  border-radius: 8px;
  font-size: 12px;
  color: #6B7280;
}
```

---

## Testing Checklist

- [ ] Status Dashboard appears (bottom-right button)
- [ ] Messages show provider badge
- [ ] Cost accumulates with each message
- [ ] Budget alert appears at 80% threshold
- [ ] Provider health updates every 5 minutes
- [ ] Fastest provider shown in dashboard
- [ ] Export report downloads JSON
- [ ] Different request types route correctly:
  - [ ] Voice → Gemini or Groq
  - [ ] Image → Gemini
  - [ ] Knowledge search → HuggingFace
  - [ ] Urgent → Groq
  - [ ] Default → Together

---

## Troubleshooting

### Issue: No providers showing as healthy
**Solution:** Check API keys in `.env.local`, wait for first health check (5 min)

### Issue: All requests going to Together
**Solution:** Check routing context, verify other providers are healthy

### Issue: Budget alert not appearing
**Solution:** Check that costs are being tracked, verify budget thresholds

### Issue: StatusDashboard not visible
**Solution:** Make sure z-index is high enough, check if it's outside viewport

---

## Next: Advanced Features

Once basic integration is working, consider adding:

1. **Conversation Context**: Pass previous messages for better responses
2. **Token Estimation**: Estimate tokens before sending to optimize routing
3. **Caching**: Cache frequent requests to reduce costs
4. **Batch Processing**: Queue and batch similar requests
5. **Analytics**: Track which providers work best for your use case

---

That's it! Your S21-A24 system is now fully integrated and operational.

For more details, see `PHASE1_COMPLETE.md`.
