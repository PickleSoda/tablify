"use client";

import { TeamSubscription } from "./team-subscription";
import { TeamMembers } from "./team-members";
import { InviteTeamMember } from "./invite-team";
import { TeamDataWithMembers } from "@/lib/db/schema";

export function Settings({ teamData }: { teamData: TeamDataWithMembers }) {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Team Settings</h1>
      <TeamSubscription teamData={teamData} />
      <TeamMembers teamData={teamData} />
      <InviteTeamMember />
    </section>
  );
}
