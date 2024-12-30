const express = require('express');
const { createWord, getWords, updateWord, deleteWord } = require('../controllers/wordController');
const router = express.Router();

router.post('/word', createWord);  // Create Word
router.get('/words', getWords);    // Get All Words

// Add the edit and delete routes
router.put('/word/:id', updateWord);  // For editing a word
router.delete('/word/:id', deleteWord);  // For deleting a word

module.exports = router;
