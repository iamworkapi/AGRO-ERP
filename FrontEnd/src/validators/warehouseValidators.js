import { z } from "zod";

// Client-side mirror of backend/src/validators/warehouse.validator.js's
// createWarehouseSchema (the fields the Create Warehouse form actually
// collects - adminId/supervisorId here are profile ids, not full objects).
export const createWarehouseSchema = z.object({
  name: z.string().trim().min(2, "Warehouse name is required."),
  commodity: z.string().min(1, "Select a commodity."),
  adminId: z.string().min(1, "Select a Warehouse Admin."),
  supervisorId: z.string().min(1, "Select a Warehouse Supervisor."),
  address: z.string().optional(),
});
