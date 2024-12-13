'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { UserProvider } from '@/lib/auth';
import { User } from '@/lib/db/schema';

export default function Providers({
  children,
  userPromise,
}: {
  children: ReactNode;
  userPromise: Promise<User | null>;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider userPromise={userPromise}>{children}</UserProvider>
    </QueryClientProvider>
  );
}
