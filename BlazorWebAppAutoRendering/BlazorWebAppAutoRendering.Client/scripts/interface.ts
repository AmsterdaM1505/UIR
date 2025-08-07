interface Shape {
    dialect: string;

    id: string;
    type: string;
    rotation?: number;
    info?: string;

    linkedObjects?: string[];
    outgoingLinks?: string[];
    incomingLinks?: string[];
    lineConnectionStart?: { id_con: string, id_shape: string }[];
    lineConnectionEnd?: { id_con: string, id_shape: string }[];

    color: string;
    image?: HTMLImageElement;
    imageSrc?: string;
    x_C: number;
    y_C: number;
    borderPoints_X1: number;
    borderPoints_Y1: number;
    borderPoints_X2: number;
    borderPoints_Y2: number;
    connectors?: {id: string, x: number, y: number, type: string }[];
    selectionMarker?: boolean;

    colorAlpha?: number;
    border?: boolean;

    isHighlighted?: boolean;
}

interface Rectangle extends Shape {
    width: number;
    height: number;
}

interface Circle extends Shape {
    radius: number;
}

interface Line extends Shape {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    arrowDirection?: string; // none, mid
    punctuation?: string;
    lineWidth?: number;

    startArrowType?: '-|->' | '-0->' | '-*->' | '>' | 'none'; // 
    endArrowType?: '-|->' | '-0->' | '-*->' | '>' | 'none';
}

interface Star extends Shape {
    rad: number;
    amount_points: number;
    m: number;
}

interface Cloud extends Rectangle {

}

interface ComplexShape extends Rectangle {
    parts: Shape[];
    cols: number;
    rows: number;
}

interface Item {
    id: number;
    name: string;
}

type ShapeType = 'rectangle' | 'circle' | 'line' | 'star' | 'cloud' | 'table';
const shapeLabels: Record<ShapeType, string> = {
    rectangle: 'прямоугольник',
    circle: 'круг',
    line: 'линия',
    star: 'звезда',
    cloud: 'облако',
    table: 'таблица'    
};

type ShapeProperty = keyof Shape | keyof Rectangle | keyof Circle | keyof Line | keyof Star | keyof ComplexShape;

const propertyLabels: Record<ShapeProperty, string> = {
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

function logDebug(message: string) {
    const debugOutput = document.getElementById('debugOutput') as HTMLTextAreaElement;
    if (debugOutput) {
        debugOutput.value += message + '\n';
        debugOutput.scrollTop = debugOutput.scrollHeight;
    }
}

function generateUniqueId(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < 20; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function hexToRgba(hex: string, alpha: number = 1): string {
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

function measureTextWidth(text: string, font: string): number {
    const span = document.createElement('span');

    const help = document.getElementById("addRectBtn")
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

function showPrompt(userInput: any, message: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        userInput = prompt(message);

        if (userInput !== null) {
            resolve(userInput);
        } else {
            reject("User cancelled the prompt");
        }
    });
}
