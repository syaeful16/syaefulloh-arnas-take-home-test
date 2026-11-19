'use client';

import dynamic from 'next/dynamic';

const EntityMap = dynamic(
  () => import('@/features/entities').then((mod) => mod.EntityMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center text-white">
        Memuat Peta...
      </div>
    ),
  },
);

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <EntityMap />

      {/*<div className="absolute top-4 left-4 z-1000 bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-lg font-bold text-gray-800">Geographic Entity Monitor</h1>
        <p className="text-xs text-gray-500">Klik di mana saja pada peta untuk menambah entitas baru</p>
      </div>*/}
    </main>
  );
}
