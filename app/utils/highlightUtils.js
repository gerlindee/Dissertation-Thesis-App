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
    recursiveWrapper(highlightInfo)

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

function recursiveWrapper(highlightInfo) {
    // Initialize the values of 'startFound' and 'charsHighlighted'
    return _recursiveWrapper(highlightInfo, false, 0);
}

function _recursiveWrapper(highlightInfo, startFound, charsHighlighted) {
    const { container, anchor, focus, anchorOffset, focusOffset, color, textColor, highlightIndex, selectionString, selectionLength } = highlightInfo;

    container.contents().each((index, element) => {
        if (charsHighlighted >= selectionLength) return; // Stop early if we are done highlighting

        if (element.nodeType === Node.TEXT_NODE) {
            let startIndex = 0;

            // Step 1:
            // The first element to appear could be the anchor OR the focus node,
            // since you can highlight from left to right or right to left
            if (!startFound) {
                if (anchor.is(element)) {
                    startFound = true;
                    startIndex = anchorOffset;
                }
                if (focus.is(element)) {
                    if (startFound) { // If the anchor and the focus elements are the same, use the smallest index
                        startIndex = Math.min(anchorOffset, focusOffset);
                    } else {
                        startFound = true;
                        startIndex = focusOffset;
                    }
                }
            }

            // Step 2:
            if (startFound && charsHighlighted < selectionLength) {
                const nodeValue = element.nodeValue;
                const nodeValueLength = element.nodeValue.length;
                const parent = element.parentElement;

                let firstSplitTextEl = null;
                let firstSplitIndex = -1;
                let secondSplitTextEl = null;

                // Go over all characters to see if they match the selection.
                // This is done because the selection text and node text contents differ.
                for (let i = 0; i < nodeValueLength; i++) {
                    if (i === startIndex) {
                        firstSplitTextEl = element.splitText(i);
                        firstSplitIndex = i;
                    }
                    if (charsHighlighted === selectionLength) {
                        secondSplitTextEl = firstSplitTextEl.splitText(i - firstSplitIndex);
                        break;
                    }

                    if (i >= startIndex && charsHighlighted < selectionLength) {
                        // Skip whitespaces as they often cause trouble (differences between selection and actual text)
                        while (charsHighlighted < selectionLength && selectionString[charsHighlighted].match(/\s/u)) {
                            charsHighlighted++;
                        }

                        if (selectionString[charsHighlighted] === nodeValue[i]) {
                            charsHighlighted++;
                        }
                    }
                }

                // If textElement is wrapped in a .highlighter--highlighted span, do not add this highlight
                if (parent.classList.contains('highlighter--highlighted')) {
                    parent.normalize(); // Undo any 'splitText' operations
                    return;
                }

                if (firstSplitTextEl) {
                    const highlightNode = document.createElement('span');
                    highlightNode.classList.add((color === 'inherit') ? 'highlighter--deleted' : 'highlighter--highlighted');
                    highlightNode.style.backgroundColor = color;
                    highlightNode.style.color = textColor;
                    highlightNode.dataset.highlightId = highlightIndex;
                    highlightNode.textContent = firstSplitTextEl.nodeValue;

                    firstSplitTextEl.remove();
                    const insertBeforeElement = secondSplitTextEl || element.nextSibling;
                    parent.insertBefore(highlightNode, insertBeforeElement);
                }
            }
        } else {
            highlightInfo.container = $(element);
            [startFound, charsHighlighted] = _recursiveWrapper(highlightInfo, startFound, charsHighlighted);
        }
    });

    return [startFound, charsHighlighted];
}