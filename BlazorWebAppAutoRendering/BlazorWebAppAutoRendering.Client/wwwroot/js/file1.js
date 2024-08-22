let userInput = null;
function showPrompt(message) {
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
