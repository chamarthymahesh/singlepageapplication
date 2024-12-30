const YouTubeLink = require('../models/YouTubeLink.');

// Create YouTube Link
exports.createYouTubeLink = async (req, res) => {
  try {
    const { link, title } = req.body;  // Destructure title from the request body
    const newLink = new YouTubeLink({ link, title });
    await newLink.save();
    res.status(201).json(newLink);
  } catch (error) {
    res.status(500).json({ message: 'Error creating YouTube link', error });
  }
};

// Update YouTube Link
exports.updateYouTubeLink = async (req, res) => {
  try {
    const linkId = req.params.id;
    const updatedLink = await YouTubeLink.findByIdAndUpdate(linkId, req.body, { new: true });
    
    if (!updatedLink) {
      return res.status(404).json({ message: 'YouTube link not found' });
    }

    res.status(200).json(updatedLink);
  } catch (error) {
    res.status(500).json({ message: 'Error updating YouTube link', error });
  }
};

// Get All YouTube Links
exports.getYouTubeLinks = async (req, res) => {
  try {
    const links = await YouTubeLink.find();
    res.status(200).json(links);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching YouTube links', error });
  }
};


// Delete YouTube Link
exports.deleteYouTubeLink = async (req, res) => {
  try {
    const linkId = req.params.id;
    const deletedLink = await YouTubeLink.findByIdAndDelete(linkId);
    
    if (!deletedLink) {
      return res.status(404).json({ message: 'YouTube link not found' });
    }

    res.status(200).json({ message: 'YouTube link deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting YouTube link', error });
  }
};
