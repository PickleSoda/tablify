import { redirect } from "next/navigation";
import {
  getProjectDetails,
  getUser,
  getTablesByProjectId,
} from "@/lib/db/queries";
import TableComponent from "../components/table-component";

interface SettingsPageProps {
  params: { projectId: string }; // Dynamic route parameter
}

export default async function ProjectsPage({ params }: SettingsPageProps) {
  const { projectId } = await params;
  const user = await getUser();

  if (!user) {
    redirect("/sign-in"); // Redirect if user is not authenticated
  }

  const id = parseInt(projectId, 10); // Extract and parse the projectId

  if (isNaN(id)) {
    throw new Error("Invalid Project ID"); // Handle invalid projectId
  }

  const project = await getProjectDetails(id);
  const tables = await getTablesByProjectId(id);

  if (!project) {
    throw new Error("Project not found");
  }

  return (
    <section>
      <h1>{project.name}</h1>
      <p>{project.description}</p>

      <h2>Tables</h2>
      {tables.length > 0 ? (
        <ul>
          {tables.map((table) => (
            <li key={table.id}>{table.name}
            <TableComponent tableId={table.id} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No tables found for this project.</p>
      )}
    </section>
  );
}
