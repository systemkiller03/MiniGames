const CARD_IMAGES = import.meta.glob<string>('/src/assets/*-card.jpg', {
    eager: true,
    import: 'default',
});
const HERO_IMAGES = import.meta.glob<string>('/src/assets/*-hero.jpg', {
    eager: true,
    import: 'default',
});

export function getCardImage(cardImagePath: string): string | undefined {
    const filename = cardImagePath.split('/').at(-1);
    return filename ? CARD_IMAGES[`/src/assets/${filename}`] : undefined;
}

export function getHeroImage(slug: string, fallback: string): string {
    return HERO_IMAGES[`/src/assets/${slug}-hero.jpg`] ?? fallback;
}
