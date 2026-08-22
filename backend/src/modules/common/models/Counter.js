import mongoose from "mongoose";

// Backs atomic, gap-free sequence numbers (e.g. warehouse codes) via
// findOneAndUpdate $inc, since Mongo has no native SEQUENCE like Postgres.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model("Counter", counterSchema);

export async function nextSequence(name) {
  const counter = await Counter.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return counter.seq;
}
