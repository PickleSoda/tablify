import { z } from "zod"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { rowSchema } from "./data/schema"
import mockTasks from './data/mockdata'


// Simulate a database read for tasks.
function getTasks() {
//   const tasks = JSON.parse(mockTasks.toString())

  return z.array(rowSchema).parse(mockTasks)
}

export default function TaskPage() {
  const tasks = getTasks()

  return (
    <>
      <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <DataTable data={tasks} columns={columns} />
      </div>
    </>
  )
}