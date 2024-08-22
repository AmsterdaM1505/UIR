interface Shape {
    id: string;
    type: string;
    rotation?: number;
    info?: string;
    linkedObjects?: string[];
    outgoingLinks?: string[];
    incomingLinks?: string[];
    color: string;
}

interface Rectangle extends Shape {
    x: number;
    y: number;
    width: number;
    height: number;

}

interface Circle extends Shape {
    x: number;
    y: number;
    radius: number;

}

interface Line extends Shape {
    startX: number;
    startY: number;
    endX: number;
    endY: number;

}

interface Star extends Shape {
    x_C: number;
    y_C: number;
    rad: number;
    amount_points: number;
    m: number;

}

interface Cloud extends Shape {
    x_C: number;
    y_C: number;
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

//function logProperties(message: string) {
//    const propertiesOutput = document.getElementById('debugOutput') as HTMLTextAreaElement;
//    if (propertiesOutput) {
//        propertiesOutput.value += message + '\n';
//        propertiesOutput.scrollTop = propertiesOutput.scrollHeight;
//    }
//}

function generateUniqueId(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < 20; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
