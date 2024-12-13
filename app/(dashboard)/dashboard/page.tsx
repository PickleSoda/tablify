import { redirect } from 'next/navigation';
import { Home } from './home';
import { getTeamForUser, getUser, getInvitationsForUser, getTeamsForUser } from '@/lib/db/queries';

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const teamData = await getTeamForUser(user.id);

  const invitations = await getInvitationsForUser(user.email);

  const teams = await getTeamsForUser(user.id);

  if (!teamData) {
    throw new Error('Team not found');
  }

  return <Home teamData={teamData} invitations={invitations}/>;
}
