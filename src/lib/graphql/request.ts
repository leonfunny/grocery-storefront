'use client';

import { getAuthToken } from '@/lib/auth';

export interface GraphQLErrorPayload {
  message: string;
  path?: string[];
  extensions?: {
    code?: string;
    originalError?: {
      message?: string | string[];
      error?: string;
      statusCode?: number;
    };
  };
}

export interface GraphQLResponse<T> {
  data: T | null;
  errors: GraphQLErrorPayload[];
  status: number;
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { token?: string | null }
): Promise<GraphQLResponse<T>> {
  const token = options?.token ?? getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers,
    cache: 'no-store',
    body: JSON.stringify({ query, variables }),
  });

  let payload: { data?: T; errors?: GraphQLErrorPayload[] } | null = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return {
    data: payload?.data ?? null,
    errors: payload?.errors ?? [],
    status: response.status,
  };
}

export function getGraphqlErrorMessage(errors: GraphQLErrorPayload[]): string | null {
  for (const error of errors) {
    const originalMessage = error.extensions?.originalError?.message;

    if (Array.isArray(originalMessage) && originalMessage.length > 0) {
      return String(originalMessage[0]);
    }

    if (typeof originalMessage === 'string' && originalMessage.trim()) {
      return originalMessage;
    }

    if (error.message?.trim()) {
      return error.message;
    }
  }

  return null;
}
