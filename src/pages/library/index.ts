import{ createCard } from'@/features/card/card';
import{ createCategories } from'@/features/categories/categories';
import{ createDescription } from'@/features/description/description';
import{ createGameDialog } from'@/features/game-dialog/game-dialog';
import{ createButton } from'@/shared/components/button/button';

import i1 from'@/assets/vacation-cafe-simulator-card.jpg';
import i2 from'@/assets/winter-burrow-card.jpg';
import i3 from'@/assets/shelve-the-potions-card.jpg';
import i4 from'@/assets/heartopia-card.jpg';
import i5 from'@/assets/palia-card.jpg';
import i6 from'@/assets/cat-mail-co-card.jpg';

const CATEGORY_LABELS = ['All Games', 'Puzzle', 'Card', 'Match', 'Farm', 'Strategy', 'Arcade'];

const GAME_CARD_DATA: {
    imgSrc: string;
    name: string;
    description: string;
    category: string;
    detailsLink: string;
    cost: string;
    stars: number;
    likes: number;
}[] = [
    {
        imgSrc: i1,
        name: 'Vacation Cafe Simulator',
        description:
            'Cozy Italian Vacation Cafe ☕ No timers, No stress 😊 cook traditional dishes 🍝 upgrade and customize 🏠 just drink Prosecco 🥂 relax and grow your dream cafe ✨',
        category: 'Strategy',
        detailsLink: '#',
        cost: 'Free',
        stars: 4.8,
        likes: 28_700,
    },
    {
        imgSrc: i2,
        name: 'Winter Burrow',
        description:
            'A cozy woodland survival game about a mouse restoring their childhood burrow. Explore, gather resources, craft, knit warm sweaters, bake pies and meet the locals.',
        category: 'Farm',
        detailsLink: '#',
        cost: 'Free',
        stars: 4.9,
        likes: 32_400,
    },
    {
        imgSrc: i3,
        name: 'Shelve the Potions!',
        description:
            "Organize 2000+ potions on shelves after the witch's cats have knocked them over, using clues around an enchanted cellar. Learn strange symbols and decipher cryptic notes.",
        category: 'Puzzle',
        detailsLink: '#',
        cost: 'Free',
        stars: 4.7,
        likes: 21_300,
    },
    {
        imgSrc: i4,
        name: 'Heartopia',
        description:
            'A multiplayer life simulation game crafted for creativity, freedom, and peace. Build your dream home, explore hobbies, and forge warm connections with friends in a cozy town.',
        category: 'Strategy',
        detailsLink: '#',
        cost: '$ 4.9',
        stars: 4.6,
        likes: 46_800,
    },
    {
        imgSrc: i5,
        name: 'Palia',
        description:
            'A free-to-play fantasy life sim adventure where you can craft, explore, and create the life and home of your dreams in a vib...',
        category: 'Strategy',
        detailsLink: '#',
        cost: 'Free',
        stars: 4.8,
        likes: 89_500,
    },
    {
        imgSrc: i6,
        name: 'Cat Mail Co.',
        description:
            'Run a cozy cat post office. Sort and deliver parcels from the daily boat. At night, the moon reveals hidden truths about packages. Clear a strange backlog and unlock new destinati...',
        category: 'Puzzle',
        detailsLink: '#',
        cost: 'Free',
        stars: 4.9,
        likes: 38_200,
    },
];
export function createLibraryPage(){
    const main = document.createElement('main');

    const description = createDescription(
        'Game Library',
        'Browse our collection of casual mini-games',
    );
    main.append(description);

    const categories = createCategories(CATEGORY_LABELS);
    main.append(categories);

    const gameCards = document.createElement('section');
    gameCards.classList.add('gameCardsSection');
    for(const gameCardData of GAME_CARD_DATA){
        const gameCard = createCard(gameCardData);
        gameCards.append(gameCard);
    }

    const previewDialog = createGameDialog({
        image: i1,
        title: 'Vacation Cafe Simulator',
        category: 'Strategy',
        price: 'Free',
        rating: 4.8,
        likes: 28_700,
        description:
            'Craft cozy dishes, decorate your dream café, and unwind with relaxing daily routines in a warm, low-stress world full of charming characters.',
        tags: ['Cozy', 'Management', 'Relaxing', 'Casual'],
        players: 'Single-player',
        duration: '2–4 hours',
        mode: 'Desktop & Mobile',
    });

    const previewButton = createButton({
        label: 'Preview game dialog',
        variant: 'primary',
    });
    previewButton.addEventListener('click', () => previewDialog.open());

    main.append(gameCards, previewButton, previewDialog.dialog);

    return main;
}
