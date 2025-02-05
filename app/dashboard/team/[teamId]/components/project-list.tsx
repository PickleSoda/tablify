"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useActionState } from "react";
import { Project, User } from "@/lib/db/schema";
import { removeProject } from "../actions";
import Link from "next/link";

type ActionState = {
  error?: string;
  success?: string;
};

export function ProjectList({ projects }: { projects: Project[] | [] }) {
  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(removeProject, { error: "", success: "" });

  return (
    <ul className="space-y-4">
      {projects.map((project, index) => (
        <li key={project.id} className="flex items-center justify-between">
          <Link href={`/dashboard/project/${project.id}`}>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>
                  {project.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{project.name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {project.description}
                </p>
              </div>
            </div>
          </Link>
          <form action={removeAction}>
            <input type="hidden" name="projectId" value={project.id} />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isRemovePending}
            >
              {isRemovePending ? "Removing..." : "Remove"}
            </Button>
          </form>
        </li>
      ))}
      {removeState?.error && (
        <p className="text-red-500 mt-4">{removeState.error}</p>
      )}
    </ul>
  );
}
