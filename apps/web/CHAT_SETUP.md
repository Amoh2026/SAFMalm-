# SAFiMalmo Chat — Setup Guide

## 1. Firestore TTL (6-month auto-delete)

Firebase Console → Firestore → **TTL** tab → **Create Policy**:

- Collection group: `messages`
- Timestamp field: `expiresAt`

Messages are written with `expiresAt = now + ~6 months`. Firebase deletes them automatically (within 24h of expiry).

## 2. LiveKit (video)

1. Sign up at https://cloud.livekit.io (free tier: 5,000 min/mo)
2. Create a project
3. Copy `API Key` and `API Secret`
4. Add to `.env.local`:

```env
LIVEKIT_API_KEY=APIxxxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud