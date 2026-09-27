import heart from'@/assets/heart.svg';
import star from'@/assets/start.svg';
import'./card.scss';
import{ createButton } from'@/shared/components/button/button';

export function createCard(
    {
        imgSrc,
        name,
        description,
        category,
        detailsLink,
        cost,
        stars,
        likes,
    }: {
        imgSrc: string;
        name: string;
        description: string;
        category: string;
        detailsLink: string;
        cost: string;
        stars: number;
        likes: number;
    },
    onDetailsClick?: () => void,
){
    const card = document.createElement('div');
    card.classList.add('card');

    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = name;
    card.append(img);

    const div = document.createElement('div');
    const header = document.createElement('div');
    header.classList.add('cardHeader');

    const headerDiv = document.createElement('div');

    const h3 = document.createElement('h3');
    h3.textContent = name;
    headerDiv.append(h3);

    const categoryElement = document.createElement('p');
    categoryElement.classList.add('category');
    categoryElement.textContent = category;
    headerDiv.append(categoryElement);

    header.append(headerDiv);

    const costElement = document.createElement('p');
    costElement.textContent = cost;
    costElement.classList.add(cost === 'Free' ? 'free' : 'costly');
    header.append(costElement);

    div.append(header);

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = description;
    div.append(descriptionElement);

    const footer = document.createElement('div');
    footer.classList.add('cardFooter');

    const cardElement = document.createElement('div');

    const starsElement = document.createElement('div');
    const starsImage = document.createElement('img');
    starsImage.src = star;
    const starsNumber = document.createElement('p');
    starsNumber.textContent = formatLikes(stars);
    starsElement.append(starsImage, starsNumber);
    starsElement.classList.add('cardElem');

    cardElement.append(starsElement);

    const likesElement = document.createElement('div');
    const likesImage = document.createElement('img');
    likesImage.src = heart;
    const likesNumber = document.createElement('p');
    likesNumber.textContent = formatLikes(likes);
    likesElement.append(likesImage, likesNumber);
    likesElement.classList.add('cardElem');

    cardElement.append(likesElement);

    footer.append(cardElement);

    const detailsButton = createButton({ label: 'Details', variant: 'primary' });
    detailsButton.addEventListener('click', () => {
        if (onDetailsClick) {
            onDetailsClick();
            return;
        }
        console.log(detailsLink);
    });
    footer.append(detailsButton);
    div.append(footer);
    card.append(div);
    return card;
}

function formatLikes(likes: number): string{
    if(likes >= 1_000_000){
        return(likes / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    return likes >= 1000 ? (likes / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : likes.toString();
}
