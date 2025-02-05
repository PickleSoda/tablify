"use server";

import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
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
  Project,
  projects,
} from "@/lib/db/schema";
import { getUserWithTeam } from "@/lib/db/queries";
import {
  validatedAction,
  validatedActionWithUser,
} from "@/lib/auth/middleware";

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
    ipAddress: ipAddress || "",
  };
  await db.insert(activityLogs).values(newActivity);
}

const removeTeamMemberSchema = z.object({
  memberId: z.number(),
});

const removeProjectSchema = z.object({
  projectId: z.number(),
});

const createProjectSchema = z.object({
  teamId: z.string().email(),
});

export const removeProject = validatedActionWithUser(
  removeProjectSchema,
  async (data, _, user) => {
    const { projectId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: "User is not part of a team" };
    }

    await db
      .delete(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.teamId, userWithTeam.teamId)
        )
      );

    // await logActivity(
    //   userWithTeam.teamId,
    //   user.id,
    //   ActivityType.REMOVE_TEAM_MEMBER
    // );

    return { success: "Team member removed successfully" };
  }
);

export const createProject = validatedActionWithUser(
  createProjectSchema,
  async (data, _, user) => {
    const { teamId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: "User is not part of a team" };
    }

    // Create a new invitation
    await db.insert(projects).values({
      name: "name",
      description: "description",
      teamId: userWithTeam.teamId,
    });

    return { success: "project created successfully" };
  }
);
