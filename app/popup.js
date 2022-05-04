window.onload = function () {
    initialiseEventHandlers()
    initialiseSettings()
}

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
            handlePositiveToneColourChange(settings.defaultPosTone) // default positive colour
        }
    })
}

function initialiseNegativeToneColour() {
    chrome.storage.sync.get(["negativeToneColour"], (res) => {
        if (res.negativeToneColour !== undefined) {
            handleNegativeToneColourChange(res.negativeToneColour)
        } else {
            handleNegativeToneColourChange(settings.defaultNegTone) // default negative colour
        }
    })
}

function initialiseNeutralToneColour() {
    chrome.storage.sync.get(["neutralToneColour"], (res) => {
        if (res.neutralToneColour !== undefined) {
            handleNeutralToneColourChange(res.neutralToneColour)
        } else {
            handleNeutralToneColourChange(settings.defaultNeutralTone)
        }
    })
}

function handlePermanentModeChangeEvent(value) {
    settings.isPermanentModeEnabled = value;
    document.getElementById("check_permanent_mode").checked = value;
}

function handlePositiveToneColourChange(value) {
    settings.positiveToneColour = value
    document.getElementById("colour_theme_pos").value = value
}

function handleNegativeToneColourChange(value) {
    settings.negativeToneColour = value
    document.getElementById("colour_theme_neg").value = value
}

function handleNeutralToneColourChange(value) {
    settings.neutralToneColour = value
    document.getElementById("colour_theme_gen").value = value
}

function handleColourReset(acc_mode) {
    if (acc_mode === true) {
        settings.positiveToneColour = settings.defaultAccPos
        settings.negativeToneColour = settings.defaultAccNeg
        settings.neutralToneColour = settings.defaultAccNeutral
    } else {
        settings.positiveToneColour = settings.defaultPosTone
        settings.negativeToneColour = settings.defaultNegTone
        settings.neutralToneColour = settings.defaultNeutralTone
    }

    handlePositiveToneColourChange(settings.positiveToneColour)
    chrome.storage.sync.set({ positiveToneColour: settings.positiveToneColour })

    handleNegativeToneColourChange(settings.negativeToneColour)
    chrome.storage.sync.set({ negativeToneColour: settings.negativeToneColour })

    handleNeutralToneColourChange(settings.neutralToneColour)
    chrome.storage.sync.set({ neutralToneColour: settings.neutralToneColour })
}
