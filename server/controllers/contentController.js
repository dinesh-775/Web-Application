import Event from "../models/Event.js";
import Gallery from "../models/Gallery.js";
import CommitteeMember from "../models/CommitteeMember.js";
import CommunitySettings from "../models/CommunitySettings.js";
import AuditLog from "../models/AuditLog.js";

export const events = async (req, res) => {
  try {
    res.json(await Event.find().sort({ date: 1 }));
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
};

export const createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    await AuditLog.create({
      userId: req.user._id,
      action: "CREATE_EVENT",
      entity: "Event",
      entityId: event._id.toString(),
      newValue: `Title: ${event.title}, Date: ${event.date}`
    });
    res.status(201).json(event);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: "Event not found" });

    await AuditLog.create({
      userId: req.user._id,
      action: "UPDATE_EVENT",
      entity: "Event",
      entityId: event._id.toString(),
      newValue: `Updated: ${event.title}`
    });
    res.json(event);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (event) {
      await AuditLog.create({
        userId: req.user._id,
        action: "DELETE_EVENT",
        entity: "Event",
        entityId: req.params.id,
        oldValue: `Deleted: ${event.title}`
      });
    }
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
};

export const gallery = async (req, res) => {
  try {
    res.json(await Gallery.find().sort({ displayOrder: 1, createdAt: -1 }));
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
};

export const createGallery = async (req, res) => {
  try {
    const item = await Gallery.create(req.body);
    await AuditLog.create({
      userId: req.user._id,
      action: "ADD_GALLERY_IMAGE",
      entity: "Gallery",
      entityId: item._id.toString(),
      newValue: `Title: ${item.title}`
    });
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
};

export const deleteGallery = async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (item) {
      await AuditLog.create({
        userId: req.user._id,
        action: "DELETE_GALLERY_IMAGE",
        entity: "Gallery",
        entityId: req.params.id,
        oldValue: `Deleted title: ${item.title}`
      });
    }
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
};

export const committee = async (req, res) => {
  try {
    res.json(await CommitteeMember.find({ active: true }).sort({ displayOrder: 1 }));
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
};

export const createCommittee = async (req, res) => {
  try {
    const member = await CommitteeMember.create(req.body);
    await AuditLog.create({
      userId: req.user._id,
      action: "ADD_COMMITTEE_MEMBER",
      entity: "CommitteeMember",
      entityId: member._id.toString(),
      newValue: `Name: ${member.name}, Position: ${member.position}`
    });
    res.status(201).json(member);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = await CommunitySettings.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    });
    await AuditLog.create({
      userId: req.user._id,
      action: "UPDATE_SETTINGS",
      entity: "CommunitySettings",
      entityId: settings._id.toString(),
      newValue: `Updated settings for ${settings.communityName}`
    });
    res.json(settings);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
};

export const getSettings = async (req, res) => {
  try {
    const s = await CommunitySettings.findOne() || await CommunitySettings.findOneAndUpdate({}, {}, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    });
    res.json(s);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
};