const settings = {
    isPermanentModeEnabled: false,
    positiveToneColour: "#FFFFFF",
    negativeToneColour: "#FFFFFF",
    neutralToneColour: "#FFFFFF",

    defaultPosTone: "#A7C957",
    defaultNegTone: "#BC4749",
    defaultNeutralTone: "#F2E8CF",
}

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
        if (settings.positiveToneColour === "#FFFFFF" &&
            settings.negativeToneColour === "#FFFFFF" &&
            settings.neutralToneColour === "#FFFFFF") {

            chrome.storage.sync.get(["positiveToneColour"], (res) => {
                if (res.positiveToneColour !== undefined) {
                    settings.positiveToneColour = res.positiveToneColour
                } else {
                    settings.positiveToneColour = settings.defaultPosTone
                }

                callHighlightingScript(tab, settings.positiveToneColour)
            })
        } else {
            callHighlightingScript(tab, settings.negativeToneColour)
        }

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
            colour: colour
        })
    })
}