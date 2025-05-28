const express = require("express");
const router = express.Router();
const controller = require("../controllers/saleSingleServiceController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/", verifyToken, controller.create);
router.get("/", verifyToken, controller.getAll);

module.exports = router;
