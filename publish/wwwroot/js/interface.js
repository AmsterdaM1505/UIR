const shapeLabels = {
    rectangle: 'прямоугольник',
    circle: 'круг',
    line: 'линия',
    star: 'звезда',
    cloud: 'облако',
    table: 'таблица'
};
const propertyLabels = {
    dialect: 'Диалект',
    id: 'Идентификатор',
    type: 'Тип',
    rotation: 'Поворот',
    info: 'Информация',
    linkedObjects: 'Связанные объекты',
    outgoingLinks: 'Исходящие ссылки',
    incomingLinks: 'Входящие ссылки',
    lineConnectionStart: 'Начало соединения линий',
    lineConnectionEnd: 'Конец соединения линий',
    color: 'Цвет',
    image: 'Изображение',
    imageSrc: 'Код изображения',
    x_C: 'Центр X',
    y_C: 'Центр Y',
    borderPoints_X1: 'Граница X1',
    borderPoints_Y1: 'Граница Y1',
    borderPoints_X2: 'Граница X2',
    borderPoints_Y2: 'Граница Y2',
    connectors: 'Коннекторы',
    selectionMarker: 'Индикатор выделения',
    colorAlpha: 'Прозрачность',
    border: 'Граница',
    isHighlighted: 'Подсветка',
    width: 'Ширина',
    height: 'Высота',
    radius: 'Радиус',
    startX: 'Начало X',
    startY: 'Начало Y',
    endX: 'Конец X',
    endY: 'Конец Y',
    arrowDirection: 'Направление стрелки',
    punctuation: 'Пунктуация',
    lineWidth: 'Ширина линии',
    startArrowType: 'Тип стрелки в начале',
    endArrowType: 'Тип стрелки в конце',
    rad: 'Радиус звезды',
    amount_points: 'Количество точек',
    m: 'Параметр m',
    parts: 'Части',
    cols: 'Столбцы',
    rows: 'Строки',
};
function logDebug(message) {
    const debugOutput = document.getElementById('debugOutput');
    if (debugOutput) {
        debugOutput.value += message + '\n';
        debugOutput.scrollTop = debugOutput.scrollHeight;
    }
}
function generateUniqueId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < 20; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function measureTextWidth(text, font) {
    const span = document.createElement('span');
    const help = document.getElementById("addRectBtn");
    //console.log("мой текст", help.style)
    span.style.visibility = 'hidden';
    span.style.whiteSpace = 'nowrap';
    span.style.font = font;
    span.textContent = text;
    document.body.appendChild(span);
    const width = span.getBoundingClientRect().width;
    document.body.removeChild(span);
    return width;
}
function showPrompt(userInput, message) {
    return new Promise((resolve, reject) => {
        userInput = prompt(message);
        if (userInput !== null) {
            resolve(userInput);
        }
        else {
            reject("User cancelled the prompt");
        }
    });
}
