import { desc, and, eq, isNull } from "drizzle-orm";
import { db } from "./drizzle";
import {
  activityLogs,
  teamMembers,
  teams,
  users,
  invitations,
  Invitation,
  InvitationWithTeam,
  projects,
  Team,
} from "./schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/session";

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "number"
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser(userId: number) {
  const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      teamMembers: {
        with: {
          team: {
            with: {
              teamMembers: {
                with: {
                  user: {
                    columns: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return result?.teamMembers[0]?.team || null;
}


export async function getTeamForUserByTeamId(userId: number, teamId?: number) {
  const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      teamMembers: {
        where: teamId ? eq(teamMembers.teamId, teamId) : undefined,
        with: {
          team: {
            with: {
              teamMembers: {
                with: {
                  user: {
                    columns: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // If teamId is provided, return the matched team or null if not found.
  // If teamId is not provided, return the first team or null.
  return result?.teamMembers.length ? result.teamMembers[0].team : null;
}


export async function getTeamsForUser(userId: number) : Promise<Team[]> {
  const result = await db
    .select({
      id: teams.id,
      teamId: teams.id,
      name: teams.name,
      planName: teams.planName,
      subscriptionStatus: teams.subscriptionStatus,
      createdAt: teams.createdAt,
      stripeCustomerId: teams.stripeCustomerId,
      stripeSubscriptionId: teams.stripeSubscriptionId,
      stripeProductId: teams.stripeProductId,
      updatedAt: teams.updatedAt,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, userId));

  return result;
}

export async function getTeamMembers(teamId: number) {
  const result = await db
    .select({
      id: teamMembers.id,
      userId: teamMembers.userId,
      name: users.name,
      email: users.email,
      role: teamMembers.role,
      joinedAt: teamMembers.joinedAt,
    })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, teamId));

  return result;
}

export async function getInvitationsForUser(
  userEmail: string
): Promise<InvitationWithTeam[]> {
  const result = await db
    .select({
      id: invitations.id,
      email: invitations.email,
      role: invitations.role,
      invitedAt: invitations.invitedAt,
      status: invitations.status,
      teamId: teams.id,
      team: {
        id: teams.id,
        name: teams.name,
        createdAt: teams.createdAt,
      },
      invitedBy: invitations.invitedBy,
      invitedByUser: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(invitations)
    .innerJoin(teams, eq(invitations.teamId, teams.id)) // Join with teams to get team details
    .innerJoin(users, eq(invitations.invitedBy, users.id)) // Join with users to get inviter details
    .where(eq(invitations.email, userEmail)); // Filter for invitations sent to the user

  return result.map((row) => ({
    ...row,
    team: {
      id: row.team.id,
      name: row.team.name,
      createdAt: row.team.createdAt,
    },
    invitedByUser: {
      id: row.invitedByUser.id,
      name: row.invitedByUser.name,
      email: row.invitedByUser.email,
    },
  }));
}

export async function getProjectsByTeamId(id:number) {
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.teamId, id));

  return result;
}