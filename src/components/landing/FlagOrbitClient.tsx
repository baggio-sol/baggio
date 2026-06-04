'use client';
import dynamic from 'next/dynamic';

const FlagOrbit = dynamic(() => import('./FlagOrbit'), { ssr: false });

export default function FlagOrbitClient() {
  return <FlagOrbit />;
}
