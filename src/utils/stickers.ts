// Simple emojis as stickers
export const stickers = ['😎', '🎉', '❤️', '⭐', '🔥', '👑', '🐶', '🍕', '🌈', '📸'];

export interface StickerInstance {
    id: number;
    emoji: string;
    x: number;
    y: number;
    scale: number;
}

export const drawStickers = (ctx: CanvasRenderingContext2D, stickers: StickerInstance[]) => {
    stickers.forEach(sticker => {
        ctx.save();
        ctx.font = `${50 * sticker.scale}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sticker.emoji, sticker.x, sticker.y);
        ctx.restore();
    });
};
