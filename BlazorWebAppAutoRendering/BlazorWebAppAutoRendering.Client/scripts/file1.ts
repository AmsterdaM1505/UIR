let userInput = null;
function showPrompt(message: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        userInput = prompt(message);

        if (userInput !== null) {
            resolve(userInput);
        } else {
            reject("User cancelled the prompt");
        }
    });
}