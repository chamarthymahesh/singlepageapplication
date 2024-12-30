const express = require('express');
const {
  createScrollingInfo,
  getScrollingInfo,
  updateScrollingInfo,
  deleteScrollingInfo,
} = require('../controllers/scrollingInfoController');
const router = express.Router();

// Routes for creating, getting, updating, and deleting scrolling info
router.post('/scrolling-info', createScrollingInfo);  // Create a new scrolling info
router.get('/scrolling-info', getScrollingInfo);  // Get all scrolling info

// Edit and delete routes for scrolling info
router.put('/scrolling-info/:id', updateScrollingInfo);  // Update an existing scrolling info
router.delete('/scrolling-info/:id', deleteScrollingInfo);  // Delete a scrolling info

module.exports = router;
