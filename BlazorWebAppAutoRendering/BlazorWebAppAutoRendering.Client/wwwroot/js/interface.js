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
