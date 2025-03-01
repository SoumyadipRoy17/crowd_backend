const db = require("../models");

const create = async (req, res) => {
  const query = { ...req.body };

  if (!query.email) {
    return res
      .status(400)
      .json({ message: "Please enter an email that we can respond to." });
  }

  if (!query.message) {
    return res.status(400).json({ message: "Please enter your message." });
  }

  try {
    const newQuery = await db.Query.create(query);
    return res.status(200).json(newQuery);
  } catch (err) {
    return res
      .status(500)
      .json({
        message:
          "Something went wrong while sending the query. Please try again!",
      });
  }
};

const showAll = async (req, res) => {
  try {
    const allQuery = await db.Query.find({}).sort({ createdAt: -1 });
    return res.status(200).json(allQuery);
  } catch (err) {
    return res
      .status(500)
      .json({
        message: "Something went wrong when trying to get all the queries",
      });
  }
};

const showById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: "Invalid Query ID format" });
    }

    const query = await db.Query.findById(id);
    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }

    return res.status(200).json(query);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong when trying to get the query" });
  }
};

const updateQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedQuery = await db.Query.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedQuery) {
      return res.status(404).json({ message: "Query not found" });
    }

    return res.status(200).json(updatedQuery);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong while updating the query" });
  }
};

const deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: "No query exists." });
    }

    const deletedQuery = await db.Query.findByIdAndDelete(id);
    if (!deletedQuery) {
      return res.status(404).json({ message: "Query not found" });
    }

    return res.status(200).json({ message: "Successfully deleted the query." });
  } catch (err) {
    return res
      .status(500)
      .json({
        message: "Something went wrong while deleting this query. Try again.",
      });
  }
};

module.exports = {
  create,
  showAll,
  showById,
  updateQuery,
  deleteQuery,
};
