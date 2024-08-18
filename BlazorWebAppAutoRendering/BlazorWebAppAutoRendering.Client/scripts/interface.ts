interface Shape {
    type: string;
    rotation?: number;
    info?: string;
}

interface Rectangle extends Shape {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

interface Circle extends Shape {
    x: number;
    y: number;
    radius: number;
    color: string;
}

interface Line extends Shape {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    color: string;
}
type GraphObject = Rectangle | Circle | Line;

function logDebug(message: string) {
    const debugOutput = document.getElementById('debugOutput') as HTMLTextAreaElement;
    if (debugOutput) {
        debugOutput.value += message + '\n';
        debugOutput.scrollTop = debugOutput.scrollHeight;
    }
}
