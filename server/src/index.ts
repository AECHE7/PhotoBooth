import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest, requireAuth } from './auth';
import aiRoutes from './routes/ai';

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET || 'secret-key-change-me';

// Configure Cloudinary if credentials exist
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
if (useCloudinary) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log("Cloudinary configured.");
}

const app = express();
const prisma = new PrismaClient();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support JSON payloads, increase limit for images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Serve static frontend files
app.use(express.static(path.join(__dirname, '../../dist')));

app.use(authenticateToken); // Global auth middleware (populates req.user if token exists)

// AI Routes (Protected?)
app.use('/api/ai', aiRoutes);

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name }
        });

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/photos', async (req: AuthRequest, res) => {
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
    let photoUrl = '';

    if (useCloudinary) {
        // Upload to Cloudinary
        try {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'photo-booth' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(imageBuffer);
            });
            // @ts-ignore
            photoUrl = result.secure_url;
        } catch (err) {
            console.error("Cloudinary upload failed:", err);
            return res.status(500).json({ error: 'Cloud upload failed' });
        }
    } else {
        // Fallback to Local Storage
        const filepath = path.join(__dirname, '../uploads', filename);
        fs.writeFileSync(filepath, imageBuffer);
        photoUrl = `/uploads/${filename}`;
    }

    // Save to DB
    const photo = await prisma.photo.create({
      data: {
        url: photoUrl,
        userId: req.user ? req.user.id : null // Link to user if logged in
      },
    });

    res.json(photo);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to save photo' });
  }
});

app.get('/api/photos', async (req: AuthRequest, res) => {
  try {
    const where = req.user ? { userId: req.user.id } : { userId: null }; // Show only user photos if logged in, or public (null) if guest
    // Ideally we want a Public Gallery + Private Gallery.
    // For now, if logged in, show OWN photos. If not logged in, show ALL PUBLIC (userId=null) photos.

    // Better logic: Show ALL photos if no user param, or specific user photos?
    // Let's make it:
    // 1. If logged in: Show MY photos.
    // 2. If guest: Show public (anonymous) photos.

    const photos = await prisma.photo.findMany({
      where,
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

// Catch-all route for SPA
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
