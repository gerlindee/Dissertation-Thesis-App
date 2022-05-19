let toneColours = {
    positiveTone: "#FFFFFF",
    negativeTone: "#FFFFFF",
    neutralTone:  "#FFFFFF"
}

const defaults = {
    positiveTone: "#A7C957",
    negativeTone: "#BC4749",
    neutralTone:  "#F2E8CF",

    accPositiveTone: "#F7B801",
    accNegativeTone: "#7678ED",
    accNeutralTone:  "#F2E8CF"
}

let highlightIndex = 1;

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        title: "Analyse the tone of the selected text",
        contexts: ["selection"],
        id: "text_select"
    });

    chrome.contextMenus.create({
        title: "Analyse the tone of the text in the selected image",
        contexts: ["image"],
        id: "image_select"
    })
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "text_select") {
        chrome.storage.sync.get(["positiveToneColour"], (res) => {
            if (res.positiveToneColour !== undefined) {
                toneColours.positiveTone = res.positiveToneColour
            } else {
                toneColours.positiveTone = defaults.positiveTone
            }

            chrome.storage.sync.get(["negativeToneColour"], (res) => {
                if (res.negativeToneColour !== undefined) {
                    toneColours.negativeTone = res.negativeToneColour
                } else {
                    toneColours.negativeTone = defaults.negativeTone
                }

                chrome.storage.sync.get(["neutralToneColour"], (res) => {
                    if (res.neutralToneColour !== undefined) {
                        toneColours.neutralTone = res.neutralToneColour
                    } else {
                        toneColours.neutralTone = defaults.neutralTone
                    }

                    console.log(info.selectionText);

                    (async () => {
                        const rawResponse = await fetch('http://127.0.0.1:5000/api/get_text_polarity', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({text: info.selectionText})
                        });
                        const content = await rawResponse.json();
                        const textPolarity = content['polarity'];

                        let highlightColour;
                        switch (textPolarity) {
                            case 'POSITIVE':
                                highlightColour = toneColours.positiveTone;
                                break;
                            case 'NEUTRAL':
                                highlightColour = toneColours.neutralTone;
                                break;
                            case 'NEGATIVE':
                                highlightColour = toneColours.negativeTone;
                                break;
                            default:
                                highlightColour = toneColours.neutralTone;
                        }

                        callHighlightingScript(tab, highlightColour)

                    })();
                });
            });
        });
    }

    if (info.menuItemId === "image_select") {
        console.log(info.srcUrl)
    }
})

function callHighlightingScript(tab, colour) {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['content.js'],
    }, function () {
        chrome.tabs.sendMessage(tab.id, {
            action: "highlight_selection",
            colour: colour,
            highlightIndex: highlightIndex
        })

        highlightIndex++
    })
}