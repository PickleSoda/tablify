import { redirect } from 'next/navigation';
import { Settings } from '../components/settings';
import { getTeamForUserByTeamId, getUser } from '@/lib/db/queries';

interface SettingsPageProps {
  params: { teamId: string }; // Dynamic route parameter
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const user = await getUser();
  const { teamId } = await params
  if (!user) {
    redirect('/sign-in'); // Redirect if user is not authenticated
  }

  const id = parseInt(teamId, 10); // Extract and parse the teamId

  if (isNaN(id)) {
    throw new Error('Invalid Team ID'); // Handle invalid teamId
  }

  const teamData = await getTeamForUserByTeamId(user.id, id);

  if (!teamData) {
    throw new Error('Team not found');
  }

  return <Settings teamData={teamData} />;
}
