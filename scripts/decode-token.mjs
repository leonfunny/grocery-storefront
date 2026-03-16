// Decode the JWT token from a fresh login
async function run() {
  const res = await fetch('https://zira-ai.com/graphql/storefront', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation { customerLogin(input: { email: "giaminh.cic@gmail.com", password: "SQFJijBMsiGP4ts" }) { accessToken success } }`,
    }),
  });

  const json = await res.json();
  const token = json.data.customerLogin.accessToken;
  console.log('TOKEN (first 40 chars):', token.substring(0, 40) + '...');

  const parts = token.split('.');
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

  console.log('\nJWT HEADER:', JSON.stringify(header, null, 2));
  console.log('\nJWT PAYLOAD:', JSON.stringify(payload, null, 2));
}

run().catch(console.error);
