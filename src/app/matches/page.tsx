import { getGroups, GroupData } from '@/lib/footballData';
import MatchesClient from './MatchesClient';

export const revalidate = 60;

export default async function MatchesPage() {
  const groups = await getGroups().catch(() => null);
  return <MatchesClient liveGroups={groups} />;
}
