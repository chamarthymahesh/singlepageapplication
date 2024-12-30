const express = require("express");
const mongodb = require("mongodb");
const fs = require("fs");
const path = require("path");
const expressFormidable = require("express-formidable");

// MongoDB connection setup (assuming a separate connection file for DB)
const { connectToDatabase } = require("../config/Connect_db");
const mongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;
const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

// Router for image-related routes
const router = express.Router();

module.exports = function (dbName, commonRoute, maxImageSize, chunk_Value) {
    const chunkValue = chunk_Value || 1048576;
    const imagePrefix = commonRoute || "/image";
    const db_Name = dbName || "image";
    const maxSize = maxImageSize || "5MB";

// MongoDB connection and GridFS setup
let db, bucket;
const initDb = async () => {
    try {
        db = await connectToDatabase(db_Name); // Connect to GridFS database
        bucket = new mongodb.GridFSBucket(db);
        console.log("MongoDB connected.");
    } catch (err) {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    }
};

initDb();

// Utility to convert human-readable size strings into bytes
const parseFileSize = (sizeString) => {
    const sizeRegex = /^(\d+)(KB|MB|GB|TB|B)$/i;
    const match = sizeString.match(sizeRegex);

    if (!match) {
        throw new Error("Invalid size format. Use KB, MB, GB, or TB.");
    }

    const size = parseInt(match[1], 10);
    const unit = match[2].toUpperCase();

    switch (unit) {
        case 'B':
            return size;  // Bytes
        case 'KB':
            return size * 1024;  // Kilobytes
        case 'MB':
            return size * 1024 * 1024;  // Megabytes
        case 'GB':
            return size * 1024 * 1024 * 1024;  // Gigabytes
        case 'TB':
            return size * 1024 * 1024 * 1024 * 1024;  // Terabytes
        default:
            throw new Error("Unsupported size unit.");
    }
};


// Utility to handle file validation
const validateFile = (file) => {
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!allowedImageExtensions.includes(fileExtension)) {
        return { isValid: false, message: "Only image files (jpg, jpeg, png, gif, bmp, webp) are allowed." };
    }

    const maxSizeInBytes = parseFileSize(maxSize);  // 5MB size limit

        if (file.size > maxSizeInBytes) {
            return { isValid: false, message: `Image size exceeds the ${maxSize} limit.` };
        }
    return { isValid: true };
};

// Image Upload Route
router.post(`${imagePrefix}`, async (req, res) => {
    const { file } = req.files;
    const { label = '' } = req.fields;  // Ensure label is passed from frontend

    // Validate file extension
    const validation = validateFile(file);
    if (!validation.isValid) {
        return res.status(400).json({ error: "Invalid file type", message: validation.message });
    }

    // Validate label length
    if (label.length > 50000) {
        return res.status(400).json({ error: "Invalid label", message: "Label cannot be longer than 100 characters." });
    }

    const filePath = `${Date.now()}-${file.name}`;  // Unique file name

    try {
        // Create an upload stream to store the file in GridFS
        const uploadStream = bucket.openUploadStream(filePath, {
            chunkSizeBytes: chunkValue, // 1MB chunks
            metadata: {
                name: file.name,
                size: file.size,
                type: file.type,
                label: label,
                url: `http://${req.headers.host}${imagePrefix}/${filePath}`  // URL to retrieve the image
            }
        });

        // Pipe the file data from the local filesystem to GridFS
        fs.createReadStream(file.path)
            .pipe(uploadStream)
            .on("finish", async () => {
                // After the file is uploaded, insert metadata into the imageAPI collection
                const imageMetadata = {
                    fileId: uploadStream.id,
                    url: `http://${req.headers.host}${imagePrefix}/${filePath}`,
                    label: label
                };

                try {
                    // Insert into the imageAPI collection
                    await db.collection('imageAPI').insertOne(imageMetadata);
                    res.json({ message: "File uploaded successfully", filePath });
                } catch (err) {
                    console.error("Error inserting into imageAPI", err);
                    res.status(500).json({ error: "Error storing image metadata", details: err.message });
                }
            })
            .on("error", (err) => {
                console.error("Error uploading file", err);
                res.status(500).json({ error: "Error uploading file", details: err.message });
            });

    } catch (err) {
        console.error("Upload failed", err);
        res.status(500).json({ error: "Error uploading file", details: err.message });
    }
});

// Get image by filename (for serving the image)
router.get(`${imagePrefix}/:filename`, async (req, res) => {
    const { filename } = req.params;

    try {
        const downloadStream = bucket.openDownloadStreamByName(filename);
        downloadStream.on("data", (chunk) => res.write(chunk));
        downloadStream.on("end", () => res.end());
        downloadStream.on("error", (err) => {
            res.status(404).json({ error: "Image not found", details: err.message });
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching file", details: err.message });
    }
});

// Get all uploaded files (for displaying them in the frontend)
router.get(`${imagePrefix}`, async (req, res) => {
    try {
        const files = await bucket.find({}).sort({ uploadDate: -1 }).toArray();
        res.json({ files });
    } catch (err) {
        res.status(500).json({ error: "Error fetching files", details: err.message });
    }
});

// Update image by ID (replace existing file without updating label)
router.post(`${imagePrefix}/update/:_id`, expressFormidable(), async (req, res) => {
    const { _id } = req.params;
    const { file } = req.files;
    const { label = '' } = req.fields;  // Ensure label is passed from frontend (fallback to empty string)

    // Validate file extension
    const validation = validateFile(file);
    if (!validation.isValid) {
        return res.status(400).json({ error: "Invalid file type", message: validation.message });
    }

    // Validate label length
    if (label.length > 50000) {
        return res.status(400).json({ error: "Invalid label", message: "Label cannot be longer than 500 characters." });
    }

    try {
        const fileId = new ObjectId(_id);

        // Check if the file exists in GridFS
        const existingFile = await bucket.find({ _id: fileId }).toArray();
        if (existingFile.length === 0) {
            return res.status(404).json({ error: "File not found" });
        }

        // Get the current label and other metadata from the existing file
        const currentFileMetadata = existingFile[0].metadata;

        // Delete the existing file from GridFS
        await bucket.delete(fileId);

        // Create a unique file name for the new image
        const filePath = `${Date.now()}-${file.name}`;

        // Upload the new image with the old label and other metadata
        const uploadStream = bucket.openUploadStream(filePath, {
            chunkSizeBytes: chunkValue, // 1MB chunks
            metadata: {
                name: file.name,
                size: file.size,
                type: file.type,
                label: currentFileMetadata.label, // Keep the existing label
                url: `http://${req.headers.host}${imagePrefix}/${filePath}`  // URL to retrieve the image
            }
        });

        // Pipe the file data from the local filesystem to GridFS
        fs.createReadStream(file.path)
            .pipe(uploadStream)
            .on("finish", async () => {
                // After the file is uploaded, update metadata in imageAPI collection
                await db.collection('imageAPI').updateOne(
                    { fileId: fileId },
                    {
                        $set: {
                            fileId: uploadStream.id,
                            url: `http://${req.headers.host}${imagePrefix}/${filePath}`,
                            label: currentFileMetadata.label // Keep the old label
                        }
                    }
                );
                res.json({ message: "File updated successfully", filePath });
            })
            .on("error", (err) => {
                console.error("Error uploading file", err);
                res.status(500).json({ error: "Error uploading file", details: err.message });
            });

    } catch (err) {
        console.error("Error replacing file", err);
        res.status(500).json({ error: "Error replacing file", details: err.message });
    }
});


// Update image label by ID (without replacing the file)
router.post(`${imagePrefix}/update-label/:_id`, expressFormidable(), async (req, res) => {
    const { _id } = req.params;  // Extract the file ID from the URL parameters
    const { label } = req.fields;  // Extract the new label from the form fields

    try {
        const fileId = new ObjectId(_id);  // Convert the file ID to ObjectId

        // Check if the file exists in GridFS by querying the fs.files collection
        const existingFile = await db.collection('fs.files').findOne({ _id: fileId });
        if (!existingFile) {
            return res.status(404).json({ error: "File not found" });
        }

        // Validate the label length
        if (label && label.length > 50000) {
            return res.status(400).json({ error: "Invalid label", message: "Label cannot be longer than 100 characters." });
        }

        // Update the label in the existing metadata (if a new label is provided)
        const updatedMetadata = {
            ...existingFile.metadata,
            label: label || existingFile.metadata.label  // Only update label if it's provided
        };

        // Update the metadata in the fs.files collection
        await db.collection('fs.files').updateOne(
            { _id: fileId },
            { $set: { metadata: updatedMetadata } }
        );

        // Also update the label in the imageAPI collection
        await db.collection('imageAPI').updateOne(
            { fileId: fileId },
            { $set: { label: label || existingFile.metadata.label } }
        );

        res.json({ message: 'Label updated successfully' });
    } catch (err) {
        console.error('Error updating label', err);
        res.status(500).json({ error: 'Error updating label', details: err.message });
    }
});

// Delete file from GridFS by ID and remove corresponding metadata
router.post(`${imagePrefix}/del/:_id`, async (req, res) => {
    const { _id } = req.params;

    try {
        const fileId = new ObjectId(_id);

        // Check if the file exists
        const file = await bucket.find({ _id: fileId }).toArray();
        if (!file || file.length === 0) {
            return res.status(404).json({ error: "File not found" });
        }

        // Delete the file from GridFS
        await bucket.delete(fileId);

        // Delete the metadata from imageAPI collection
        await db.collection('imageAPI').deleteOne({ fileId: fileId });

        res.json({ message: "File and metadata deleted successfully", file: file[0] });
    } catch (err) {
        res.status(500).json({ error: "An error occurred while deleting the file", details: err.message });
    }
});

// Metadata retrieval route
router.get(`${imagePrefix}_api/metadata`, async (req, res) => {
    try {
        const metadata = await db.collection('imageAPI').find({}).toArray();
        res.json({ metadata });
    } catch (err) {
        console.error("Error fetching image metadata", err);
        res.status(500).json({ error: "Error fetching image metadata", details: err.message });
    }
});

return router;
};