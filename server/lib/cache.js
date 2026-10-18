// In-memory cache for expensive reads such as the public site content. Admin changes clear it
// (see server/routes/admin.js). Each serverless instance has its own copy, so entries also
// expire on their own after a short time.
const store = new Map();

async function remember(key, ttlMs, load) {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = await load();
  store.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

function clear() {
  store.clear();
}

module.exports = { remember, clear };
