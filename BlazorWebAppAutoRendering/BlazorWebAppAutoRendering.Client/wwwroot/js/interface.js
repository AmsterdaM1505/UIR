function logDebug(message) {
    const debugOutput = document.getElementById('debugOutput');
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
function generateUniqueId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < 20; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
