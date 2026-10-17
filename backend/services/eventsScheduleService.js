import EventsSchedule from "../models/EventsSchedule.js";

const createeventsSchedule = async (data) => {
  const { districtName, date, time, location, path, googleMapsUrl } =
    data;

  if (!districtName || !date || !time || !location || !path || !googleMapsUrl) {
    throw new Error(
      "All fields are required: districtName, date, time, location, path, googleMapsUrl"
    );
  }

  const eventsSchedule = await EventsSchedule.create({
    districtName: String(districtName).trim(),
    date: String(date).trim(),
    time: String(time).trim(),
    location: String(location).trim(),
    path: String(path).trim(),
    googleMapsUrl: String(googleMapsUrl).trim(),
    title: data.title ? String(data.title).trim() : "",
    timeText: data.timeText ? String(data.timeText).trim() : "",
    contacts: data.contacts || [],
    type: data.type === "amber" ? "amber" : "green",
    image: data.image ? String(data.image).trim() : "",
  });

  return eventsSchedule;
};

const geteventsScheduleById = async (id) => {
  const eventsSchedule = await EventsSchedule.findById(id);
  if (!eventsSchedule) {
    throw new Error("events schedule not found");
  }
  return eventsSchedule;
};

const getAlleventsSchedules = async () => {
  const eventsSchedules = await EventsSchedule.find().sort({ createdAt: -1 });
  return eventsSchedules;
};

const updateeventsSchedule = async (id, data) => {
  const { districtName, date, time, location, path, googleMapsUrl } =
    data;

  const updates = {};
  if (districtName !== undefined) updates.districtName = String(districtName).trim();
  if (date !== undefined) updates.date = String(date).trim();
  if (time !== undefined) updates.time = String(time).trim();
  if (location !== undefined) updates.location = String(location).trim();
  if (path !== undefined) updates.path = String(path).trim();
  if (googleMapsUrl !== undefined) updates.googleMapsUrl = String(googleMapsUrl).trim();
  if (data.title !== undefined) updates.title = String(data.title).trim();
  if (data.timeText !== undefined) updates.timeText = String(data.timeText).trim();
  if (data.contacts !== undefined) updates.contacts = data.contacts;
  if (data.type !== undefined) updates.type = data.type === "amber" ? "amber" : "green";
  if (data.image !== undefined) updates.image = String(data.image).trim();

  if (!Object.keys(updates).length) {
    throw new Error("Provide at least one field to update");
  }

  const eventsSchedule = await EventsSchedule.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!eventsSchedule) {
    throw new Error("events schedule not found");
  }

  return eventsSchedule;
};

const deleteeventsScheduleById = async (id) => {
  const eventsSchedule = await EventsSchedule.findByIdAndDelete(id);
  if (!eventsSchedule) {
    throw new Error("events schedule not found");
  }
  return eventsSchedule;
};

export {
  createeventsSchedule,
  geteventsScheduleById,
  getAlleventsSchedules,
  updateeventsSchedule,
  deleteeventsScheduleById,
};
