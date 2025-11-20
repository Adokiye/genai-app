import { dehydrate, QueryClient } from '@tanstack/react-query';
import { ExperimentConsole } from '@/components/lab/ExperimentConsole';
import { HydrateClient } from '@/components/HydrateClient';
import { api } from '@/lib/api';

export default async function HomePage() {
  const queryClient = new QueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: ['experiments'],
      queryFn: api.listExperiments,
    });
  } catch (error) {
    console.error('Experiment prefetch failed', error);
  }

  return (
    <HydrateClient state={dehydrate(queryClient)}>
      <ExperimentConsole />
    </HydrateClient>
  );
}
