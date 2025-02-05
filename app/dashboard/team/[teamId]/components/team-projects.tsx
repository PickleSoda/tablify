"use client";

import { Project } from "@/lib/db/schema";
import { ProjectList } from "./project-list";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function Projects({
  projects,
  teamId,
}: {
  projects: Project[] | [];
  teamId: number;
}) {
  const createAction = `/dashboard/team/${teamId}/create-project`;
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Team Projects</h1>
      <Card>
        <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectList projects={projects} />

          <Link
            rel="stylesheet"
            href={`/dashboard/team/${teamId}/create-project`}
          >
            <Button
              type="submit"
              className="bg-purple-500 hover:bg-purple-600 text-white mt-6"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
