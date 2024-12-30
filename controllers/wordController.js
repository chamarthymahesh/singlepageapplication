const Word = require('../models/Word');

// Create Word
exports.createWord = async (req, res) => {
  try {
    const newWord = new Word(req.body);
    await newWord.save();
    res.status(201).json(newWord);
  } catch (error) {
    res.status(500).json({ message: 'Error creating word', error });
  }
};

// Get All Words
exports.getWords = async (req, res) => {
  try {
    const words = await Word.find();
    res.status(200).json(words);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching words', error });
  }
};

// Update Word
exports.updateWord = async (req, res) => {
  try {
    const wordId = req.params.id;
    const updatedWord = await Word.findByIdAndUpdate(wordId, req.body, { new: true });

    if (!updatedWord) {
      return res.status(404).json({ message: 'Word not found' });
    }

    res.status(200).json(updatedWord);
  } catch (error) {
    res.status(500).json({ message: 'Error updating word', error });
  }
};

// Delete Word
exports.deleteWord = async (req, res) => {
  try {
    const wordId = req.params.id;
    const deletedWord = await Word.findByIdAndDelete(wordId);

    if (!deletedWord) {
      return res.status(404).json({ message: 'Word not found' });
    }

    res.status(200).json({ message: 'Word deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting word', error });
  }
};
