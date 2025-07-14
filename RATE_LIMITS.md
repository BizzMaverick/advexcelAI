# ⚡ Gemini Rate Limits & Usage

## 🚨 **Error After 5-6 Prompts?**
This is normal! You've hit Gemini's free tier rate limit.

## 📊 **Gemini Free Tier Limits:**
- **15 requests per minute**
- **1 million tokens per month**
- **Rate limit resets every minute**

## ⏰ **What to Do:**
1. **Wait 1 minute** between batches of requests
2. **Pace your testing** - don't rapid-fire prompts
3. **Use fewer prompts** for testing

## 💡 **Best Practices:**
- **Test 3-4 prompts**, then wait 1 minute
- **Plan your prompts** before testing
- **Use simpler prompts** when possible
- **Batch similar operations** together

## 🔄 **If You Hit Monthly Limit:**
- **Wait until next month** (free tier resets)
- **Upgrade to paid tier** for higher limits
- **Switch to OpenAI** temporarily (`npm run start:openai`)

## ✅ **Error Handling Added:**
- Better error messages for rate limits
- Clear instructions when limits are hit
- Automatic retry suggestions

This is expected behavior for free AI services - just pace your usage!