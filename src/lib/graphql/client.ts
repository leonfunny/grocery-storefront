import { createClient, cacheExchange, fetchExchange } from 'urql';
import Cookies from 'js-cookie';

function getGraphqlUrl(): string {
  return process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3003/graphql/storefront';
}

let clientInstance: ReturnType<typeof createClient> | null = null;

export function getUrqlClient() {
  if (clientInstance) return clientInstance;

  clientInstance = createClient({
    url: getGraphqlUrl(),
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: () => {
      const token = Cookies.get('grocery_token');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      return { headers };
    },
  });

  return clientInstance;
}
