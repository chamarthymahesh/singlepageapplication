const express = require('express');
const { createYouTubeLink, getYouTubeLinks, updateYouTubeLink, deleteYouTubeLink } = require('../controllers/youTubeLinkController');
const router = express.Router();

router.post('/youtube-link', createYouTubeLink);  // Create a new YouTube link
router.get('/youtube-links', getYouTubeLinks);  // Get all YouTube links

// Edit and delete routes for YouTube link
router.put('/youtube-link/:id', updateYouTubeLink);  // Update an existing YouTube link
router.delete('/youtube-link/:id', deleteYouTubeLink);  // Delete a YouTube link

module.exports = router;
