const express = require('express');
const router = express.Router();
const workingHoursController = require('../controllers/workingHoursController');

router.get('/', workingHoursController.getAll);
router.put('/', workingHoursController.updateAll);

module.exports = router;
