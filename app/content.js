main()

function main() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        let result = true
        if (message.action === "highlight_selection") {
            result = highlightSelectedElement(message.colour, message.highlightIndex)
            if (result === true) {
                sendResponse({status: 'OK'});
            } else {
                alert("Could not highlight the text in the selected area! Please refresh the page and try again!")
                sendResponse({status: "NOK"})
            }
        } else {
            let formattedPolarity = ""
            if (message.polarity === "POSITIVE") {
                formattedPolarity = "Positive :)";
            }

            if (message.polarity === "NEGATIVE") {
                formattedPolarity = "Negative :(";
            }

            if (message.polarity === "NEUTRAL") {
                formattedPolarity = "Neutral :|";
            }

            window.alert("The sentiment behind the selected text is: " + formattedPolarity);
            sendResponse({status: 'OK'});
        }
    });
}

