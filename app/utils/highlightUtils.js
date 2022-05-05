function highlightSelectedElement(colour, highlightIndex) {
    const selection = window.getSelection();
    const selectionString = selection.toString();

    if (selectionString) { // If there is any text selected
        let container = selection.getRangeAt(0).commonAncestorContainer;

        // Sometimes the element will only be text => Get the uppermost parent container in that case
        while (!container.innerHTML) {
            container = container.parentNode;
        }

        return highlightSelection(selectionString, container, selection, colour, highlightIndex);
    } else {
        return true
    }
}

function highlightSelection(selectionString, container, selection, colour, highlightIndex) {

    const highlightInfo = {
        color: colour,
        selectionString: selectionString,
        selectionLength: selectionString.length,
        highlightIndex: highlightIndex,
        anchor: $(selection.anchorNode),
        anchorOffset: selection.anchorOffset,
        container: $(container),
        focus: $(selection.focusNode),
        focusOffset: selection.focusOffset,
    };

    // Step 1: Use the offset of the anchor/focus to find the start of the selected text in the anchor/focus element
    //         From there, go through the elements and find all Text Nodes until the selected text is all found.
    //         Wrap all the text nodes (or parts of them) in a span DOM element with special highlight class name and bg color
    try {
        recursiveWrapper($(container), highlightInfo);
    } catch (e) {
        return false;
    }

    // Step 2: Deselect text
    if (selection.removeAllRanges) selection.removeAllRanges();

    // Step 3: Attach mouse hover event listeners to display the delete button when hovering over a highlight
    const parent = highlightInfo.container.parent();
    const HIGHLIGHT_CLASS = 'highlighter--highlighted';
    parent.find(`.${HIGHLIGHT_CLASS}`).each((i, el) => {
        el.addEventListener('mouseenter', onHighlightMouseEnterOrClick);
        el.addEventListener('mouseleave', onHighlightMouseLeave);
    });

    // If we made it until here => Text was highlighted successfully
    return true;
}

function recursiveWrapper(container, highlightInfo) {
    // Initialize the values of 'startFound' and 'charsHighlighted'
    return _recursiveWrapper(container, highlightInfo, false, 0);
}

function _recursiveWrapper(container, highlightInfo, startFound, charsHighlighted) {
    const {anchor, focus, anchorOffset, focusOffset, color, selectionString} = highlightInfo;
    const selectionLength = selectionString.length;

    container.contents().each((_index, element) => {
        // Stop early if we are done highlighting
        if (charsHighlighted >= selectionLength) return;

        if (element.nodeType !== Node.TEXT_NODE) {
            // Only look at visible nodes because invisible nodes aren't included in the selected text
            const jqElement = $(element);
            if (jqElement.is(':visible') && getComputedStyle(element).visibility !== 'hidden') {
                [startFound, charsHighlighted] = _recursiveWrapper(jqElement, highlightInfo, startFound, charsHighlighted);
            }
            return;
        }

        // Step 1: The first element to appear could be the anchor OR the focus node, since you can highlight from left to right or right to left
        let startIndex = 0;
        if (!startFound) {
            // If the element is not the anchor or focus, continue
            if (!anchor.is(element) && !focus.is(element)) {
                return;
            }

            startFound = true;
            startIndex = Math.min(...[
                ...(anchor.is(element) ? [anchorOffset] : []),
                ...(focus.is(element) ? [focusOffset] : []),
            ]);
        }

        // Step 2: If we get here, we are in a text node, the start was found, and we are not done highlighting
        const {nodeValue, parentElement: parent} = element;

        if (startIndex > nodeValue.length) {
            // Start index is beyond the length of the text node, can't find the highlight
            debugger
            throw new Error(`No match found for highlight string '${selectionString}'`);
        }

        // Split the text content into three parts: the part before the highlight, the highlight and the part after the highlight
        const highlightTextEl = element.splitText(startIndex);

        // Instead of simply highlighting the text by counting characters, we check if the text is the same as the selection string
        let i = startIndex;
        for (; i < nodeValue.length; i++) {
            // Skip any whitespace characters in the selection string as there can be more than in the text node:
            while (charsHighlighted < selectionLength && selectionString[charsHighlighted].match(/\s/u)) {
                charsHighlighted++;
            }

            if (charsHighlighted >= selectionLength) {
                break;
            }

            const char = nodeValue[i];
            if (char === selectionString[charsHighlighted]) {
                charsHighlighted++;
            } else if (!char.match(/\s/u)) { // FIXME: Here, this is where the issue happens
                // Similarly, if the char in the text node is a whitespace, ignore any differences
                // Otherwise, we can't find the highlight text => Throw an error
                debugger
                throw new Error(`No match found for highlight string '${selectionString}'`);
            }
        }

        // If the text element is wrapped in a .highlighter--highlighted span => Text is already highlighted, but still count the number of characters highlighted
        if (parent.classList.contains('highlighter--highlighted')) return;

        const elementCharCount = i - startIndex; // Number of chars to highlight in this particular element
        const insertBeforeElement = highlightTextEl.splitText(elementCharCount);
        const highlightText = highlightTextEl.nodeValue;

        // If the text is all whitespace, ignore it
        if (highlightText.match(/^\s*$/u)) {
            parent.normalize(); // Undo any 'splitText' operations
            return;
        }

        // If we get here => Wrap the highlighted text in a span with the highlight class name
        const highlightNode = document.createElement('span');
        highlightNode.classList.add((color === 'inherit') ? 'highlighter--deleted' : 'highlighter--highlighted');
        highlightNode.style.backgroundColor = color;
        highlightNode.textContent = highlightTextEl.nodeValue;
        highlightNode.dataset.highlightId = "1";
        highlightTextEl.remove();
        parent.insertBefore(highlightNode, insertBeforeElement);
    });

    return [startFound, charsHighlighted];
}