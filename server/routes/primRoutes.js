// routes/primRoutes.js

const express = require("express");
const router = express.Router();
const primController = require("../controllers/primController");
const authMiddleware = require("../middleware/authMiddleware");

// Prim oluştur
router.post("/", authMiddleware, primController.create);

// Primleri listele
router.get("/", authMiddleware, primController.getAll);

router.get('/summary', authMiddleware, primController.getPrimSummary);

router.get("/details", authMiddleware, primController.getDetails);

router.delete("/:id", authMiddleware, primController.delete);


module.exports = router;
