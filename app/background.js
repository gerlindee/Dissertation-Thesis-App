const settings = {
    isPermanentModeEnabled: false,
    positiveToneColour: "#FFFFFF",
    negativeToneColour: "#FFFFFF",
    neutralToneColour: "#FFFFFF",

    defaultPosTone: "#A7C957",
    defaultNegTone: "#BC4749",
    defaultNeutralTone: "#F2E8CF",

    defaultAccPos: "#F7B801",
    defaultAccNeg: "#7678ed",
    defaultAccNeutral: "#F2E8CF",
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
        console.log(info.frameId)

        chrome.storage.sync.get(["positiveToneColour"], (res) => {
            if (res.positiveToneColour !== undefined) {
                settings.positiveToneColour = res.positiveToneColour
            } else {
                settings.positiveToneColour = settings.defaultPosTone
            }

            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                files: ['content.js'],
            }, function () {
                chrome.tabs.sendMessage(tab.id, {
                    action: "highlight_selection",
                    colour: settings.positiveToneColour
                })
            })
        })
    }

    if (info.menuItemId === "image_select") {
        console.log(info.srcUrl)
    }
})