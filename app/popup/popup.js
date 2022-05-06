// Global Variables declaration
let isAccessibilityModeEnabled = false;

let toneColours = {
    positiveTone: "#FFFFFF",
    negativeTone: "#FFFFFF",
    neutralTone: "#FFFFFF",
};

const defaults = {
    positiveTone: "#A7C957",
    negativeTone: "#BC4749",
    neutralTone: "#F2E8CF",

    accPositiveTone: "#F7B801",
    accNegativeTone: "#7678ED",
    accNeutralTone: "#F2E8CF"
};

const themeColours = {
    background: "#EBC2C1",
    primary: "#CD5D51",
    accent: "#904139",

    background_acc: "#d6d7fa",
    primary_acc: "#7678ed",
    accent_acc: "#5e60be"
};

window.onload = function () {
    createEventHandlers()
    loadSettings()
};

/**
 * @name createEventHandlers
 * @description Add event handlers for the two buttons in the popup, as well as for the three colour picker inputs
 */
function createEventHandlers() {
    // Event handler for when the positive tone colour is changed
    document
        .getElementById("colour_theme_pos")
        .addEventListener("change", (event) => {
            cachePositiveToneColour(event.target.value);
        });

    // Event handler for when the negative tone colour is changed
    document
        .getElementById("colour_theme_neg")
        .addEventListener("change", (event) => {
            cacheNegativeToneColour(event.target.value);
        });

    // Event handler for when the neutral tone colour is changed
    document
        .getElementById("colour_theme_gen")
        .addEventListener("change", (event) => {
            cacheNeutralToneColour(event.target.value);
        });

    document
        .getElementById("reset_colours")
        .addEventListener("click", () => {
           setDefaultColours(isAccessibilityModeEnabled)
        });

    // Event handler for when accessibility mode is enabled or disabled
    document
        .getElementById("set_accessibility_colours")
        .addEventListener("click", () => {
            chrome.storage.sync.set({isAccessibilityModeEnabled: !(isAccessibilityModeEnabled)})
                .then(() => {
                    isAccessibilityModeEnabled = !(isAccessibilityModeEnabled);
                    setDefaultColours(isAccessibilityModeEnabled);
                    setColourTheme(isAccessibilityModeEnabled);
                });
        });
}

/**
 * @name getSettings
 * @description Load the settings from the local cache of the extension into the popup screen
 */
function loadSettings() {
    chrome.storage.sync.get(["isAccessibilityModeEnabled"], (res) => {
        if (res.isAccessibilityModeEnabled === undefined) {
            isAccessibilityModeEnabled = false;
        } else {
            isAccessibilityModeEnabled = res.isAccessibilityModeEnabled;
        }
        setColourTheme(isAccessibilityModeEnabled);
        loadPositiveToneColour();
        loadNegativeToneColour();
        loadNeutralToneColour();
    })
}

/**
 * @name setPositiveToneColour
 * @description Set the hex code for the Positive Tone Colour
 */
function setPositiveToneColour(value) {
    toneColours.positiveTone = value;
    document.getElementById("colour_theme_pos").value = value;
}

/**
 * @name loadPositiveToneColour
 * @description Load the positive tone colour into the colour picker; If no value is stored, set the default value
 */
function loadPositiveToneColour() {
    chrome.storage.sync.get(["positiveToneColour"], (res) => {
        if (res.positiveToneColour !== undefined) {
            setPositiveToneColour(res.positiveToneColour);
        } else {
            if (isAccessibilityModeEnabled === true) {
                setPositiveToneColour(defaults.accPositiveTone);
            } else {
                setPositiveToneColour(defaults.positiveTone);
            }
        }
    })
}

/**
 * @name cachePositiveToneColour
 * @description Store the selected positive tone colour into the cache
 * @param {string} colour
 */
function cachePositiveToneColour(colour) {
    chrome.storage.sync.set({positiveToneColour: colour})
        .then(() => {
            setPositiveToneColour(colour);
        })
}

/**
 * @name setNegativeToneColour
 * @description Set the hex code for the negative tone colour
 */
function setNegativeToneColour(value) {
    toneColours.negativeTone = value;
    document.getElementById("colour_theme_neg").value = value;
}

/**
 * @name loadNegativeToneColour
 * @description Load the negative tone colour into the colour picker; If no value is stored, set the default value
 */
function loadNegativeToneColour() {
    chrome.storage.sync.get(["negativeToneColour"], (res) => {
        if (res.negativeToneColour !== undefined) {
            setNegativeToneColour(res.negativeToneColour);
        } else {
            if (isAccessibilityModeEnabled === true) {
                setNegativeToneColour(defaults.accNegativeTone);
            } else {
                setNegativeToneColour(defaults.negativeTone);
            }
        }
    });
}

/**
 * @name cacheNegativeToneColour
 * @description Store the selected negative tone colour into the cache
 * @param {string} colour
 */
function cacheNegativeToneColour(colour) {
    chrome.storage.sync.set({negativeToneColour: colour})
        .then(() => {
            setNegativeToneColour(colour);
        })
}

/**
 * @name setNeutralToneColour
 * @description Set the hex code for the neutral tone colour
 */
function setNeutralToneColour(value) {
    toneColours.neutralTone = value;
    document.getElementById("colour_theme_gen").value = value;
}

/**
 * @name loadNeutralToneColour
 * @description Load the neutral tone colour into the colour picker; If no value is stored, set the default value
 */
function loadNeutralToneColour() {
    chrome.storage.sync.get(["neutralToneColour"], (res) => {
        if (res.neutralToneColour !== undefined) {
            setNeutralToneColour(res.neutralToneColour);
        } else {
            if (isAccessibilityModeEnabled === true) {
                setNeutralToneColour(defaults.accNeutralTone);
            } else {
                setNeutralToneColour(defaults.neutralTone);
            }
        }
    });
}

/**
 * @name cacheNeutralToneColour
 * @description Store the selected neutral tone colour into the cache
 * @param {string} colour
 */
function cacheNeutralToneColour(colour) {
    chrome.storage.sync.set({neutralToneColour: colour})
        .then(() => {
            setNeutralToneColour(colour);
        })
}

/**
 * @name setDefaultColours
 * @description Load the default colours into the colour picker inputs
 * @param {boolean} accMode
 */
function setDefaultColours(accMode) {
    if (accMode === true) {
        cachePositiveToneColour(defaults.accPositiveTone);
        setPositiveToneColour(defaults.accPositiveTone);

        cacheNegativeToneColour(defaults.accNegativeTone);
        setNegativeToneColour(defaults.accNegativeTone);

        cacheNeutralToneColour(defaults.accNeutralTone);
        setNeutralToneColour(defaults.accNeutralTone);
    } else {
        cachePositiveToneColour(defaults.positiveTone);
        setPositiveToneColour(defaults.positiveTone);

        cacheNegativeToneColour(defaults.negativeTone);
        setNegativeToneColour(defaults.negativeTone);

        cacheNeutralToneColour(defaults.neutralTone);
        setNeutralToneColour(defaults.neutralTone);
    }
}

/**
 * @name setColourTheme
 * @description Set the popup colour theme, based on whether accessibility mode is selected or not
 * @param accMode
 */
function setColourTheme(accMode) {
    if (accMode === true) {
        document.getElementById("set_accessibility_colours").innerText = "Disable Colour Blind Friendly Mode";

        document.body.style.background = themeColours.background_acc;
        document.body.style.borderColor = themeColours.primary_acc;
        document.getElementById("app_icon_text").src = "../images/gen_text_acc.png";

        let elements = document.getElementsByTagName("h1");
        for (let idx = 0; idx < elements.length; idx++) {
            elements[idx].style.color = themeColours.primary_acc;
        }

        elements = document.getElementsByTagName("hr");
        for (let idx = 0; idx < elements.length; idx++) {
            elements[idx].style.borderColor = themeColours.primary_acc;
        }

        elements = document.getElementsByTagName("label");
        for (let idx = 0; idx < elements.length; idx++) {
            elements[idx].style.color = themeColours.primary_acc;
        }

        let hoverCSS = ".buttonHover { color: #5e60be; }";
        let hoverStyle = document.createElement("style");
        hoverStyle.style.cssText = hoverCSS;
        elements = document.getElementsByClassName("colours_btn");
        for (let idx = 0; idx < elements.length; idx++) {
            elements[idx].style.color = themeColours.primary_acc;
            elements[idx].style.backgroundColor = themeColours.background_acc;
        }

    } else {
        document.getElementById("set_accessibility_colours").innerText = "Enable Colour Blind Friendly Mode";

        document.body.style.background = themeColours.background;
        document.body.style.borderColor = themeColours.primary;
        document.getElementById("app_icon_text").src = "../images/gen_text.png";

        let elements = document.getElementsByTagName("h1");
        for (let idx = 0; idx < elements.length; idx++) {
            elements[idx].style.color = themeColours.primary;
        }

        elements = document.getElementsByTagName("hr");
        for (let idx = 0; idx < elements.length; idx++) {
            elements[idx].style.borderColor = themeColours.primary;
        }

        elements = document.getElementsByTagName("label");
        for (let idx = 0; idx < elements.length; idx++) {
            elements[idx].style.color = themeColours.primary;
        }

        elements = document.getElementsByClassName("colours_btn");
        for (let idx = 0; idx < elements.length; idx++) {
            elements[idx].style.color = themeColours.primary;
            elements[idx].style.backgroundColor = themeColours.background;
        }
    }
}