'use client';

import { Suspense } from 'react';
import SearchPage from '@/src/pages/SearchPage';

function SearchLoading() {
  return (
    <div className="min-h-screen bg-subtleGray flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newsRed"></div>
    </div>
  );
}

export default function SearchRoute() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchPage />
    </Suspense>
  );
}

