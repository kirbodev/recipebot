const mongoose = require("mongoose");
require("dotenv").config();

mongoose.createConnection(`${process.env.MONGO_URI}`, {
  keepAlive: true,
});
const dataSchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true },
  key: { type: String, required: true },
  date: { type: Date, default: Date.now() },
});
const datas = mongoose.model("Data", dataSchema);
async function get(key, raw) {
  if (typeof raw !== "boolean" && raw)
    throw new Error("Second value in get() is raw?, must be a boolean!");
  if (!key) throw new Error("No key is specified in get().");
  const data = await datas.find({ key: key });
  if (data.length === 0) return undefined;
  if (raw === true) {
    return data[0];
  } else {
    return data[0].value;
  }
}
async function set(key, value) {
  if (!key) throw new Error("No key is specified in set().");
  if (!value) throw new Error("No value is specified in set().");
  const entry = await new datas({ key: key, value: value });
  await entry.save();
}
async function del(key) {
  if (!key) throw new Error("No key is specified in del().");
  await datas.deleteOne({ key: key });
  return;
}
const db = {
  get: get,
  set: set,
  delete: del,
};
module.exports = db;
