const express = require("express");

const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();




// GET TASKS
router.get("/", authMiddleware, async (req, res) => {
  try {

    const tasks = await Task.find({
      userId: req.user.id,
    });

    res.json(tasks);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


// CREATE TASK
router.post(
  "/",
  authMiddleware,
  async (req, res) => {

    try {

      const {
        title,
        description,
        stage,
        category,
        deadline,
      } = req.body;

      let deadlineDate = null;

if (deadline) {
  deadlineDate = new Date(deadline + ":00+05:30");
}

const task = await Task.create({
  title,
  description,
  stage,
  category,
  deadline: deadlineDate,
  userId: req.user.id,
});

      res.status(201).json(task);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: "Server Error",
      });

    }

  }
);


// UPDATE TASK
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
const updateData = { ...req.body };

if (updateData.deadline) {
  updateData.deadline = new Date(updateData.deadline + ":00+05:30");
}

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedTask);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


// DELETE TASK
router.delete("/:id", authMiddleware, async (req, res) => {
  try {

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      message: "Task deleted",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});



module.exports = router;