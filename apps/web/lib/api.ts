import { CreateExperimentPayload, Experiment } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3010';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'API error');
  }

  const responseText = await response.text();

  if (!responseText) {
    return undefined as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch (error) {
    console.error('Invalid JSON response from API', error);
    throw new Error('Invalid JSON response');
  }
}

export const api = {
  listExperiments: (): Promise<Experiment[]> => request('/experiments'),
  createExperiment: (payload: CreateExperimentPayload): Promise<Experiment> =>
    request('/experiments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteExperiment: (id: string): Promise<void> =>
    request(`/experiments/${id}`, {
      method: 'DELETE',
    }),
};
