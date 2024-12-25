import { stripe } from "../payments/stripe";
import { db } from "./drizzle";
import { eq } from "drizzle-orm";
import {
  users,
  teams,
  teamMembers,
  projects,
  tables,
  columns,
  rows,
  cellValues,
  cellReferences,
} from "./schema";
import { hashPassword } from "@/lib/auth/session";

async function createStripeProducts() {
  console.log("Creating Stripe products and prices...");

  const baseProduct = await stripe.products.create({
    name: "Base",
    description: "Base subscription plan",
  });

  await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800, // $8 in cents
    currency: "usd",
    recurring: {
      interval: "month",
      trial_period_days: 7,
    },
  });

  const plusProduct = await stripe.products.create({
    name: "Plus",
    description: "Plus subscription plan",
  });

  await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200, // $12 in cents
    currency: "usd",
    recurring: {
      interval: "month",
      trial_period_days: 7,
    },
  });

  console.log("Stripe products and prices created successfully.");
}

async function seed() {
  const email = "test@test.com";
  const password = "admin123";
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values([
      {
        email: email,
        passwordHash: passwordHash,
        role: "owner",
      },
    ])
    .returning();

  console.log("Initial user created.");

  const [team] = await db
    .insert(teams)
    .values({
      name: "Test Team",
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: user.id,
    role: "owner",
  });

  console.log("Team and team member created.");

  // Create a project
  const [project] = await db
    .insert(projects)
    .values({
      name: "Sample Project",
      description: "A project for testing purposes",
      teamId: team.id,
    })
    .returning();

  console.log("Project created.");

  // Create two tables
  const [customersTable, ordersTable] = await db
    .insert(tables)
    .values([
      { name: "Customers", projectId: project.id },
      { name: "Orders", projectId: project.id },
    ])
    .returning();

  console.log("Tables created.");

  // Create columns for Customers table
  const customerColumns = await db
    .insert(columns)
    .values([
      {
        name: "Name",
        tableId: customersTable.id,
        dataType: "text",
        orderIndex: 0,
      },
      {
        name: "Email",
        tableId: customersTable.id,
        dataType: "text",
        orderIndex: 1,
      },
      {
        name: "Age",
        tableId: customersTable.id,
        dataType: "number",
        orderIndex: 2,
      },
    ])
    .returning();

  // Create columns for Orders table
  const orderColumns = await db
    .insert(columns)
    .values([
      {
        name: "OrderID",
        tableId: ordersTable.id,
        dataType: "text",
        orderIndex: 0,
      },
      {
        name: "CustomerID",
        tableId: ordersTable.id,
        dataType: "number",
        orderIndex: 1,
      },
      {
        name: "OrderDate",
        tableId: ordersTable.id,
        dataType: "date",
        orderIndex: 2,
      },
      {
        name: "TotalAmount",
        tableId: ordersTable.id,
        dataType: "number",
        orderIndex: 3,
      },
    ])
    .returning();

  console.log("Columns created.");

  // Create rows and cell values for Customers table
  const customerData = [
    { name: "John Doe", email: "john@example.com", age: 30 },
    { name: "Jane Smith", email: "jane@example.com", age: 28 },
    { name: "Bob Johnson", email: "bob@example.com", age: 35 },
  ];

  for (const customer of customerData) {
    const [row] = await db
      .insert(rows)
      .values({ tableId: customersTable.id })
      .returning();

    await db.insert(cellValues).values(
      customerColumns.map((column, index) => ({
        rowId: row.id,
        columnId: column.id,
        value: String(Object.values(customer)[index]),
      }))
    );
  }

  // Create rows and cell values for Orders table
  const orderData = [
    {
      orderId: "ORD001",
      customerId: 1,
      orderDate: "2023-01-15",
      totalAmount: 100.5,
    },
    {
      orderId: "ORD002",
      customerId: 2,
      orderDate: "2023-02-20",
      totalAmount: 75.25,
    },
    {
      orderId: "ORD003",
      customerId: 1,
      orderDate: "2023-03-10",
      totalAmount: 200.0,
    },
  ];

  for (const order of orderData) {
    const [row] = await db
      .insert(rows)
      .values({ tableId: ordersTable.id })
      .returning();

    await db.insert(cellValues).values(
      orderColumns.map((column, index) => ({
        rowId: row.id,
        columnId: column.id,
        value: String(Object.values(order)[index]),
      }))
    );
  }

  console.log("Rows and cell values created.");

  // Create a cell reference (example: linking CustomerID in Orders to a Customer)
  const [sourceCell] = await db
    .select()
    .from(cellValues)
    .where(eq(cellValues.value, "1"))
    .limit(1);

  const [targetCell] = await db
    .select()
    .from(cellValues)
    .where(eq(cellValues.value, "John Doe"))
    .limit(1);

  if (sourceCell && targetCell) {
    await db.insert(cellReferences).values({
      sourceCellId: sourceCell.id,
      targetCellId: targetCell.id,
      referenceType: "lookup",
    });

    console.log("Cell reference created.");
  }

  // await createStripeProducts();
}

seed()
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seed process finished. Exiting...");
    process.exit(0);
  });
