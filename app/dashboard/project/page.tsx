import { redirect } from "next/navigation";
import {
  getProjectDetails,
  getUser,
  getTablesByProjectId,
} from "@/lib/db/queries";
import { DataTable } from "@/components/table/data-table";
import { columns } from "@/components/table/columns";

import { taskSchema } from "@/components/table/data/schema"
import mockTasks from '@/components/table/data/mockdata'
import { z } from "zod"

// Simulate a database read for tasks.
function getTasks() {
//   const tasks = JSON.parse(mockTasks.toString())

  return z.array(taskSchema).parse(mockTasks)
}


export default async function ProjectsPage() {
 const user = await getUser();

  if (!user) {
    redirect("/sign-in"); // Redirect if user is not authenticated
  }

  const tasks = getTasks()

  return (
    <section>
      <h2>Tables</h2>
      <DataTable data={tasks} columns={columns} />
    </section>
  );
}
