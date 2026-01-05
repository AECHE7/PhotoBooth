// Simple emojis as stickers
export const stickers = ['😎', '🎉', '❤️', '⭐', '🔥', '👑', '🐶', '🍕', '🌈', '📸'];

export interface StickerInstance {
    id: number;
    type: 'emoji' | 'image';
    content: string; // Emoji char or Image URL
    x: number;
    y: number;
    scale: number;
}

export const drawStickers = (ctx: CanvasRenderingContext2D, stickers: StickerInstance[], imageMap?: Map<number, HTMLImageElement>) => {
    stickers.forEach(sticker => {
        ctx.save();
        if (sticker.type === 'emoji') {
            ctx.font = `${50 * sticker.scale}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sticker.content, sticker.x, sticker.y);
        } else if (sticker.type === 'image' && imageMap && imageMap.has(sticker.id)) {
            const img = imageMap.get(sticker.id);
            if (img) {
                const w = 100 * sticker.scale;
                const h = 100 * sticker.scale * (img.height / img.width);
                ctx.drawImage(img, sticker.x - w/2, sticker.y - h/2, w, h);
            }
        }
        ctx.restore();
    });
};

export const loadStickerImages = async (stickers: StickerInstance[]): Promise<Map<number, HTMLImageElement>> => {
    const imageMap = new Map<number, HTMLImageElement>();
    const imageStickers = stickers.filter(s => s.type === 'image');

    await Promise.all(imageStickers.map(s => new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            imageMap.set(s.id, img);
            resolve();
        };
        img.onerror = () => resolve(); // Ignore errors
        img.src = s.content;
    })));

    return imageMap;
};
