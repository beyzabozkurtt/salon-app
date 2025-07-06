const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const authMiddleware = require("../middleware/authMiddleware");

// GET
router.get("/", authMiddleware, expenseController.getAll);

// POST ✔
router.post("/", authMiddleware, expenseController.create);

// (isteğe bağlı) Güncelleme ve silme:
router.put("/:id", authMiddleware, expenseController.update);
router.delete("/:id", authMiddleware, expenseController.delete);

module.exports = router;
