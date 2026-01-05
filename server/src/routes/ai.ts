import express from 'express';
import { generateAiStyle, STYLES } from '../services/aiService';

const router = express.Router();

router.post('/transform', async (req, res) => {
    try {
        const { image, style } = req.body;

        if (!image || !style) {
            return res.status(400).json({ error: 'Image and style are required' });
        }

        if (!Object.keys(STYLES).includes(style)) {
            return res.status(400).json({ error: 'Invalid style' });
        }

        // Parse base64
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ error: 'Invalid base64 string' });
        }
        const imageBuffer = Buffer.from(matches[2], 'base64');

        // Generate
        const newImageBuffer = await generateAiStyle(imageBuffer, style as keyof typeof STYLES);

        // Convert back to base64
        const newBase64 = `data:image/png;base64,${newImageBuffer.toString('base64')}`;

        res.json({ image: newBase64 });

    } catch (error) {
        console.error("AI Route Error:", error);
        res.status(500).json({ error: 'Failed to generate AI image' });
    }
});

export default router;
