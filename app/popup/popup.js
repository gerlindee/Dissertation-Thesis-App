// Global Variables declaration
let isPermanentModeEnabled = false
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

window.onload = function () {
    initialiseEventHandlers()
    initialiseSettings()
}

function initialiseEventHandlers() {
    document
        .getElementById("check_permanent_mode")
        .addEventListener("click", (event) => {
            chrome.storage.sync.set({isPermanentModeEnabled: event.target.checked})
         })

    document
        .getElementById("colour_theme_pos")
        .addEventListener("change", (event) => {
            chrome.storage.sync.set({ positiveToneColour: event.target.value })
        })

    document
        .getElementById("colour_theme_neg")
        .addEventListener("change", (event) => {
            chrome.storage.sync.set({ negativeToneColour: event.target.value })
        })

    document
        .getElementById("colour_theme_gen")
        .addEventListener("change", (event) => {
            chrome.storage.sync.set({ neutralToneColour: event.target.value })
        })

    document
        .getElementById("reset_colours")
        .addEventListener("click", () => {
            handleColourReset(false)
        })

    document
        .getElementById("switch_acc_colours")
        .addEventListener("click", () => {
            handleColourReset(true)
        })
}

function initialiseSettings() {
    initialisePermanentMode()
    initialisePositiveToneColour()
    initialiseNegativeToneColour()
    initialiseNeutralToneColour()
}

function initialisePermanentMode() {
    chrome.storage.sync.get(["isPermanentModeEnabled"], (res) => {
        handlePermanentModeChangeEvent(res.isPermanentModeEnabled)
    })
}

function initialisePositiveToneColour() {
    chrome.storage.sync.get(["positiveToneColour"], (res) => {
        if (res.positiveToneColour !== undefined) {
            handlePositiveToneColourChange(res.positiveToneColour)
        } else {
            handlePositiveToneColourChange(defaults.positiveTone)
        }
    })
}

function initialiseNegativeToneColour() {
    chrome.storage.sync.get(["negativeToneColour"], (res) => {
        if (res.negativeToneColour !== undefined) {
            handleNegativeToneColourChange(res.negativeToneColour)
        } else {
            handleNegativeToneColourChange(defaults.negativeTone) // default negative colour
        }
    })
}

function initialiseNeutralToneColour() {
    chrome.storage.sync.get(["neutralToneColour"], (res) => {
        if (res.neutralToneColour !== undefined) {
            handleNeutralToneColourChange(res.neutralToneColour)
        } else {
            handleNeutralToneColourChange(defaults.neutralTone)
        }
    })
}

function handlePermanentModeChangeEvent(value) {
    isPermanentModeEnabled = value;
    document.getElementById("check_permanent_mode").checked = value;
}

function handlePositiveToneColourChange(value) {
    toneColours.positiveTone = value
    document.getElementById("colour_theme_pos").value = value
}

function handleNegativeToneColourChange(value) {
    toneColours.negativeTone = value
    document.getElementById("colour_theme_neg").value = value
}

function handleNeutralToneColourChange(value) {
    toneColours.neutralTone = value
    document.getElementById("colour_theme_gen").value = value
}

function handleColourReset(accMode) {
    if (accMode === true) {
        toneColours.positiveTone = defaults.accPositiveTone
        toneColours.negativeTone = defaults.accNegativeTone
        toneColours.neutralTone  = defaults.accNeutralTone
    } else {
        toneColours.positiveTone = defaults.positiveTone
        toneColours.negativeTone = defaults.negativeTone
        toneColours.neutralTone  = defaults.neutralTone
    }

    handlePositiveToneColourChange(toneColours.positiveTone)
    chrome.storage.sync.set({ positiveToneColour: toneColours.positiveTone })

    handleNegativeToneColourChange(toneColours.negativeTone)
    chrome.storage.sync.set({ negativeToneColour: toneColours.negativeTone })

    handleNeutralToneColourChange(toneColours.neutralTone)
    chrome.storage.sync.set({ neutralToneColour: toneColours.neutralTone })
}
