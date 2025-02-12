interface Shape {
    id: string;
    type: string;
    rotation?: number;
    info?: string;
    linkedObjects?: string[];
    outgoingLinks?: string[];
    incomingLinks?: string[];
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
    lineConnectionStart?: { id_con: string, id_line: string }[];
    lineConnectionEnd?: { id_con: string, id_line: string }[];
    colorAlpha?: number;
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
    arrowDirection?: string; //start, end, both, none
    punctuation?: string;
}

interface Star extends Shape {
    rad: number;
    amount_points: number;
    m: number;
}

interface Cloud extends Shape {
    width: number;
    height: number;
}

//interface ComplexShape {
//    id: number;
//    elements: Shape[];
//    type: string;


//}
interface ComplexShape extends Shape, Rectangle {
    children: Shape[];
    text: string[];
    type: string;
    layout?: "vertical" | "horizontal"; // Описание размещения
    //startSize?: number; // Размер заголовка
    //width: number;
    //height: number;
}

//type GraphObject = Rectangle | Circle | Line | Star | Cloud;

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

function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
