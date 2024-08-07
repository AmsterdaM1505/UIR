function logDebug(message) {
    const debugOutput = document.getElementById('debugOutput');
    if (debugOutput) {
        debugOutput.value += message + '\n';
        debugOutput.scrollTop = debugOutput.scrollHeight;
    }
}
