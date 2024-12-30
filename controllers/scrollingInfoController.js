const ScrollingInfo = require('../models/ScrollingInfo'); // Import the new model

// Create a new scrolling info entry
exports.createScrollingInfo = async (req, res) => {
  try {
    const newInfo = new ScrollingInfo(req.body);
    await newInfo.save();
    res.status(201).json(newInfo);  // Return the created info object as response
  } catch (error) {
    res.status(500).json({ message: 'Error creating scrolling info', error });
  }
};

// Get all scrolling info
exports.getScrollingInfo = async (req, res) => {
  try {
    const infos = await ScrollingInfo.find();
    res.status(200).json(infos);  // Return all scrolling info objects as an array
  } catch (error) {
    res.status(500).json({ message: 'Error fetching scrolling info', error });
  }
};

// Update an existing scrolling info entry
exports.updateScrollingInfo = async (req, res) => {
  try {
    const infoId = req.params.id;
    const updatedInfo = await ScrollingInfo.findByIdAndUpdate(infoId, req.body, { new: true });

    if (!updatedInfo) {
      return res.status(404).json({ message: 'Scrolling info not found' });
    }

    res.status(200).json(updatedInfo);  // Return the updated info object
  } catch (error) {
    res.status(500).json({ message: 'Error updating scrolling info', error });
  }
};

// Delete a scrolling info entry
exports.deleteScrollingInfo = async (req, res) => {
  try {
    const infoId = req.params.id;
    const deletedInfo = await ScrollingInfo.findByIdAndDelete(infoId);

    if (!deletedInfo) {
      return res.status(404).json({ message: 'Scrolling info not found' });
    }

    res.status(200).json({ message: 'Scrolling info deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting scrolling info', error });
  }
};
