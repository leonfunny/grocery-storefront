#!/usr/bin/env node
/**
 * Auth Probe — tests whether a customerLogin token is accepted by
 * protected storefront operations (me, wishlist, wishlistSync).
 *
 * Usage:
 *   npx tsx scripts/auth-probe.ts --email you@example.com --password secret
 *   node scripts/auth-probe.mjs --email you@example.com --password secret
 */

const LIVE_ENDPOINT = 'https://zira-ai.com/graphql/storefront';
const PROXY_ENDPOINT = 'http://localhost:3008/api/graphql';

// ── CLI args ────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const map = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    const val = args[i + 1];
    if (key && val) map[key] = val;
  }
  if (!map.email || !map.password) {
    console.error('Usage: node scripts/auth-probe.mjs --email <email> --password <password>');
    process.exit(1);
  }
  return map;
}

// ── GraphQL helper ──────────────────────────────────────────────────
async function gql(endpoint, query, variables, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  // Capture response headers we care about
  const interestingHeaders = {};
  for (const name of ['www-authenticate', 'x-request-id', 'x-error', 'set-cookie']) {
    const val = res.headers.get(name);
    if (val) interestingHeaders[name] = val;
  }
  // Also grab any x-* headers
  res.headers.forEach((val, name) => {
    if (name.startsWith('x-')) interestingHeaders[name] = val;
  });

  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  return { status: res.status, headers: interestingHeaders, body };
}

// ── Operations ──────────────────────────────────────────────────────
const LOGIN_MUTATION = `
  mutation CustomerLogin($input: LoginInput!) {
    customerLogin(input: $input) {
      accessToken
      refreshToken
      success
      message
      customer { id email fullName }
      errors { field message code }
    }
  }
`;

const ME_QUERY = `
  query Me {
    me { id email fullName phone createdAt }
  }
`;

const WISHLIST_QUERY = `
  query Wishlist {
    wishlist {
      items { productId variantId addedAt name price }
    }
  }
`;

const WISHLIST_SYNC_MUTATION = `
  mutation WishlistSync($productIds: [ID!]!) {
    wishlistSync(productIds: $productIds) {
      success
      message
      items { productId variantId addedAt name price }
    }
  }
`;

// ── Classification ──────────────────────────────────────────────────
function classify(label, result) {
  const { status, headers: hdrs, body } = result;
  const errors = body?.errors ?? [];
  const hasAuthError = errors.some(e => {
    const msg = (e.message || '').toLowerCase();
    return msg.includes('auth') || msg.includes('unauthorized') || msg.includes('forbidden')
      || msg.includes('not authenticated') || msg.includes('access denied');
  });

  const hasData = body?.data != null && Object.values(body.data).some(v => v != null);
  let verdict;
  if (hasData && !hasAuthError) {
    verdict = '✅ PASS';
  } else if (hasAuthError || status === 401 || status === 403) {
    verdict = '❌ FAIL (auth)';
  } else {
    verdict = '❌ FAIL (other)';
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${label}`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  Verdict:  ${verdict}`);
  console.log(`  HTTP:     ${status}`);
  if (Object.keys(hdrs).length > 0) {
    console.log(`  Headers:  ${JSON.stringify(hdrs, null, 2)}`);
  }
  console.log(`  Body:`);
  console.log(JSON.stringify(body, null, 2));

  return verdict;
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  const { email, password } = parseArgs();

  console.log(`\n🔑 Logging in as ${email} against LIVE endpoint...\n`);

  const loginResult = await gql(LIVE_ENDPOINT, LOGIN_MUTATION, {
    input: { email, password },
  });

  const payload = loginResult.body?.data?.customerLogin;
  if (!payload?.success || !payload?.accessToken) {
    console.error('❌ Login failed. Cannot proceed with probe.');
    console.error('Response:', JSON.stringify(loginResult.body, null, 2));
    process.exit(1);
  }

  const token = payload.accessToken;
  console.log(`✅ Login successful. Token: ${token.slice(0, 20)}...`);
  console.log(`   Customer: ${payload.customer?.email} (${payload.customer?.fullName})`);

  // Probe operations
  const operations = [
    { label: 'Me', query: ME_QUERY, variables: undefined },
    { label: 'Wishlist', query: WISHLIST_QUERY, variables: undefined },
    { label: 'WishlistSync', query: WISHLIST_SYNC_MUTATION, variables: { productIds: [] } },
  ];

  const results = {};

  for (const op of operations) {
    // Direct
    const directResult = await gql(LIVE_ENDPOINT, op.query, op.variables, token);
    const directVerdict = classify(`${op.label} → DIRECT (${LIVE_ENDPOINT})`, directResult);

    // Proxy
    let proxyVerdict;
    try {
      const proxyResult = await gql(PROXY_ENDPOINT, op.query, op.variables, token);
      proxyVerdict = classify(`${op.label} → PROXY (${PROXY_ENDPOINT})`, proxyResult);
    } catch (err) {
      proxyVerdict = '⚠️ PROXY UNREACHABLE';
      console.log(`\n${'═'.repeat(60)}`);
      console.log(`  ${op.label} → PROXY (${PROXY_ENDPOINT})`);
      console.log(`${'═'.repeat(60)}`);
      console.log(`  ⚠️  Could not reach proxy: ${err.message}`);
      console.log(`  (Is \`npm run dev\` running on localhost:3000?)`);
    }

    results[op.label] = { direct: directVerdict, proxy: proxyVerdict };
  }

  // Summary table
  console.log(`\n\n${'═'.repeat(60)}`);
  console.log('  SUMMARY');
  console.log(`${'═'.repeat(60)}`);
  console.log(`  ${'Operation'.padEnd(20)} ${'Direct'.padEnd(20)} Proxy`);
  console.log(`  ${'─'.repeat(56)}`);
  for (const [op, { direct, proxy }] of Object.entries(results)) {
    console.log(`  ${op.padEnd(20)} ${direct.padEnd(20)} ${proxy}`);
  }
  console.log();

  // Classification
  const allDirectFail = Object.values(results).every(r => r.direct.includes('FAIL'));
  const allDirectPass = Object.values(results).every(r => r.direct.includes('PASS'));
  const allProxyFail = Object.values(results).every(r => r.proxy.includes('FAIL') || r.proxy.includes('UNREACHABLE'));

  if (allDirectFail) {
    console.log('📋 DIAGNOSIS: Backend auth — the login token is not accepted by protected resolvers.');
    console.log('   Action: Escalate to backend team with the payloads above.');
  } else if (allDirectPass && allProxyFail) {
    console.log('📋 DIAGNOSIS: Proxy bug — direct calls work but proxy calls fail.');
    console.log('   Action: Fix /api/graphql route.ts to forward missing headers/context.');
  } else if (allDirectPass) {
    console.log('📋 DIAGNOSIS: Protected operations work! Check frontend integration.');
  } else {
    console.log('📋 DIAGNOSIS: Mixed results. Review each operation above for details.');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
