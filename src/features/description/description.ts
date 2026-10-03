import './description.scss';
export function createDescription(h2Label: string, pLabel: string) {
    const div = document.createElement('div');
    div.classList.add('description');

    const h2 = document.createElement('h2');
    h2.textContent = h2Label;
    div.append(h2);

    const p = document.createElement('p');
    p.textContent = pLabel;
    div.append(p);
    return div;
}
