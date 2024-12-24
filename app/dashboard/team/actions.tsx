'use server';

import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  teams,
  teamMembers,
  activityLogs,
  type NewActivityLog,
  ActivityType,
  invitations,
  Team,
} from '@/lib/db/schema';
import { getUserWithTeam } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser,
} from '@/lib/auth/middleware';

async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || '',
  };
  await db.insert(activityLogs).values(newActivity);
}



const removeTeamMemberSchema = z.object({
  memberId: z.number(),
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.id, memberId),
          eq(teamMembers.teamId, userWithTeam.teamId)
        )
      );

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER
    );

    return { success: 'Team member removed successfully' };
  }
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner']),
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const existingMember = await db
      .select()
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(
        and(eq(users.email, email), eq(teamMembers.teamId, userWithTeam.teamId))
      )
      .limit(1);

    if (existingMember.length > 0) {
      return { error: 'User is already a member of this team' };
    }

    // Check if there's an existing invitation
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, userWithTeam.teamId),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: 'An invitation has already been sent to this email' };
    }

    // Create a new invitation
    await db.insert(invitations).values({
      teamId: userWithTeam.teamId,
      email,
      role,
      invitedBy: user.id,
      status: 'pending',
    });

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER
    );

    // TODO: Send invitation email and include ?inviteId={id} to sign-up URL
    // await sendInvitationEmail(email, userWithTeam.team.name, role)

    return { success: 'Invitation sent successfully' };
  }
);

const acceptInvitationSchema = z.object({
  inviteId: z.string(),
});

export const acceptInvitation = validatedActionWithUser(
  acceptInvitationSchema,
  async (data, _, user) => {
    const inviteId = parseInt(data.inviteId);
    const invitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, inviteId),
          eq(invitations.email, user.email),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (invitation.length === 0) {
      return { error: 'Invalid invitation' };
    }

    const { teamId, role } = invitation[0];
    await db.insert(teamMembers).values({
      teamId,
      userId: user.id,
      role,
    });

    await db
      .update(invitations)
      .set({ status: 'accepted' })
      .where(eq(invitations.id, inviteId));

    await logActivity(teamId, user.id, ActivityType.ACCEPT_INVITATION);

    return { success: 'Invitation accepted successfully' };
  }
);

const declineInvitationSchema = z.object({
  inviteId: z.string(),
});

export const declineInvitation = validatedActionWithUser(
  declineInvitationSchema,
  async (data, _, user) => {
    const inviteId = parseInt(data.inviteId);
    const invitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, inviteId),
          eq(invitations.email, user.email),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (invitation.length === 0) {
      return { error: 'Invalid invitation' };
    }

    await db
      .update(invitations)
      .set({ status: 'declined' })
      .where(eq(invitations.id, inviteId));

    await logActivity(invitation[0].teamId, user.id, ActivityType.DECLINE_INVITATION);

    return { success: 'Invitation declined successfully' };
  }
);

const cancelInvitationSchema = z.object({
  inviteId: z.string(),
});

export const cancelInvitation = validatedActionWithUser(
  cancelInvitationSchema,
  async (data, _, user) => {
    const inviteId = parseInt(data.inviteId);
    const invitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, inviteId),
          eq(invitations.invitedBy, user.id),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (invitation.length === 0) {
      return { error: 'Invalid invitation' };
    }

    await db
      .update(invitations)
      .set({ status: 'cancelled' })
      .where(eq(invitations.id, inviteId));

    await logActivity(invitation[0].teamId, user.id, ActivityType.CANCEL_INVITATION);

    return { success: 'Invitation cancelled successfully' };
  }
);

const leaveTeamSchema = z.object({});

export const leaveTeam = validatedActionWithUser(
  leaveTeamSchema,
  async (_, __, user) => {
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.userId, user.id),
          eq(teamMembers.teamId, userWithTeam.teamId)
        )
      );

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.LEAVE_TEAM
    );

    return { success: 'Left team successfully' };
  }
);