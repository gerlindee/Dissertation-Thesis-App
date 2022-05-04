function highlightSelection(colour) {
    let range, sel = window.getSelection();
    if (sel.rangeCount && sel.getRangeAt) {
        range = sel.getRangeAt(0)
    }

    document.designMode = "on"
    if (range) {
        sel.removeAllRanges()
        sel.addRange(range)
    }

    if (!document.execCommand("HiliteColor", false, colour)) {
        document.execCommand("BackColor", false, colour)
    }

    document.designMode = "off";
}

function main() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "highlight_selection") {
            highlightSelection(message.colour)
        }
        sendResponse({ status: 'OK' });
    });
}

main()

