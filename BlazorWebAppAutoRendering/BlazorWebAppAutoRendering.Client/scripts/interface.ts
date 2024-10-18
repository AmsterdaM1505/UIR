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
    connectors?: number[];
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
type GraphObject = Rectangle | Circle | Line | Star | Cloud;

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
