import { redirect } from 'next/navigation';
import { Settings } from '../components/settings';
import { getTeamForUserByTeamId, getUser } from '@/lib/db/queries';

interface SettingsPageProps {
  params: { teamId: string }; // Dynamic route parameter
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in'); // Redirect if user is not authenticated
  }

  const teamId = parseInt(params.teamId, 10); // Extract and parse the teamId

  if (isNaN(teamId)) {
    throw new Error('Invalid Team ID'); // Handle invalid teamId
  }

  const teamData = await getTeamForUserByTeamId(user.id, teamId);

  if (!teamData) {
    throw new Error('Team not found');
  }

  return <Settings teamData={teamData} />;
}
