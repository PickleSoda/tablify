"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { customerPortalAction } from "@/lib/payments/actions";
import { startTransition, useActionState } from "react";
import {
  InvitationWithTeam,
  Team,
  TeamDataWithMembers,
  User,
} from "@/lib/db/schema";
import { removeTeamMember } from "./team/actions";
import { acceptInvitation, declineInvitation } from "./team/actions"; // Define these actions
import { useQuery } from "@tanstack/react-query";

type ActionState = {
  error?: string;
  success?: string;
};

interface HomeProps {
  teamData: TeamDataWithMembers;
  invitations: InvitationWithTeam[];
}

export function Home({ teamData, invitations }: HomeProps) {
  const {
    data: teams,
    isLoading,
  }: { data: Team[] | undefined; isLoading: boolean } = useQuery({
    queryKey: ["teamsForUser"], // Cache key
    staleTime: 1000 * 60,
  });

  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(removeTeamMember, { error: "", success: "" });

  const [acceptState, acceptAction, isAcceptPending] = useActionState<
    ActionState,
    FormData
  >(acceptInvitation, { error: "", success: "" });

  const handleAcceptSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    startTransition(() => {
      acceptAction(new FormData(event.currentTarget));
    });
  };
  const [declineState, declineAction, isDeclinePending] = useActionState<
    ActionState,
    FormData
  >(declineInvitation, { error: "", success: "" });

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Home</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <p className="font-medium">
                  Current Plan: {teamData.planName || "Free"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {teamData.subscriptionStatus === "active"
                    ? "Billed monthly"
                    : teamData.subscriptionStatus === "trialing"
                    ? "Trial period"
                    : "No active subscription"}
                </p>
              </div>
              <form action={customerPortalAction}>
                <Button type="submit" variant="outline">
                  Manage Subscription
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              teams?.map((team, index) => (
                <li key={team.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={`/placeholder.svg?height=32&width=32`}
                        alt={team.name}
                      />
                      <AvatarFallback>
                        {team.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{team.name}</p>
                      </div>
                    <div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {team.planName|| "free"} plan
                      </p>
                    </div>
                  </div>
                  {index > 0 ? (
                    <form action={removeAction}>
                      <input type="hidden" name="memberId" value={team.id} />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        disabled={isRemovePending}
                      >
                        {isRemovePending ? "Leave..." : "Leave"}
                      </Button>
                    </form>
                  ) : null}
                </li>
              ))
            )}
          </ul>
          {removeState?.error && (
            <p className="text-red-500 mt-4">{removeState.error}</p>
          )}
        </CardContent>
      </Card>

      {/* Invitations Card */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {invitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{invitation.team.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Invited by {invitation.invitedByUser.name} (
                    {invitation.invitedByUser.email})
                  </p>
                </div>
                {invitation.status == "pending" ? (
                  <div className="flex space-x-2">
                    <form onSubmit={handleAcceptSubmit}>
                      <input
                        type="hidden"
                        name="inviteId"
                        value={invitation.id}
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        disabled={isAcceptPending}
                      >
                        {isAcceptPending ? "Accepting..." : "Accept"}
                      </Button>
                    </form>
                    <form action={declineAction}>
                      <input
                        type="hidden"
                        name="inviteId"
                        value={invitation.id}
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        disabled={isDeclinePending}
                      >
                        {isDeclinePending ? "Declining..." : "Decline"}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground p-6">
                      {invitation.status}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {acceptState?.error && (
            <p className="text-red-500 mt-4">{acceptState.error}</p>
          )}
          {declineState?.error && (
            <p className="text-red-500 mt-4">{declineState.error}</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
