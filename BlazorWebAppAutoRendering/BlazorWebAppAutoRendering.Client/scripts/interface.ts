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
    lineWidth?: number;
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

interface Column {
    name: string;
    dataType: string;
    isPrimaryKey: boolean;
    isForeignKey?: boolean;
    isNullable?: boolean;
    defaultValue?: any;
}

interface Table extends Rectangle {
    tableName: string;
    columns: Column[];
    schema?: string;      // Например, "dbo"
    description?: string; // Описание таблицы
}

interface RelationshipLine extends Line {
    relationshipType: string; // Например, "one-to-one", "one-to-many", "many-to-many"
    label?: string;           // Метка для связи (например, имя внешнего ключа)
    sourceTableId: string;    // Идентификатор таблицы-источника
    targetTableId: string;    // Идентификатор таблицы-приемника
}

interface Decision extends Shape {
    ruleName: string;        // Название правила/решения
    condition: string;       // Условие (логическая формула)
    trueBranchLabel?: string;  // Метка ветки «Да»
    falseBranchLabel?: string; // Метка ветки «Нет»
}

interface ProcessShape extends Shape {
    processName: string;  // Название процесса
    description?: string; // Описание процесса
    duration?: number;    // Продолжительность процесса (например, в секундах)
}







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
    console.log("мой текст", help.style)

    span.style.visibility = 'hidden';
    span.style.whiteSpace = 'nowrap';

    span.style.font = font;
    span.textContent = text;

    document.body.appendChild(span);

    const width = span.getBoundingClientRect().width;

    document.body.removeChild(span);
    return width;
}