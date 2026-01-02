import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support JSON payloads, increase limit for images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configure Multer for Base64 or standard uploads.
// Since we are sending base64 strings from the client (canvas.toDataURL),
// we might not need Multer for multipart/form-data if we send JSON.
// But let's support a simple JSON endpoint that saves the file.

app.post('/api/photos', async (req, res) => {
  try {
    const { image } = req.body; // Expecting base64 string: "data:image/png;base64,..."

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Strip the prefix
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid base64 string' });
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    const filename = `photo-${Date.now()}.png`;
    const filepath = path.join(__dirname, '../uploads', filename);

    fs.writeFileSync(filepath, imageBuffer);

    // Save to DB
    const photo = await prisma.photo.create({
      data: {
        url: `/uploads/${filename}`,
      },
    });

    res.json(photo);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to save photo' });
  }
});

app.get('/api/photos', async (req, res) => {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(photos);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
