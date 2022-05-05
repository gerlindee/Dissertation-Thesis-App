let hoverToolEl = null;
let hoverToolTimeout = null;
let currentHighlightEl = null;
let deleteBtnEl = null;
let isHoverClicked = false;

$.get(chrome.runtime.getURL('utils/highlightHover.html'), (data) => {
    hoverToolEl = $(data)
    hoverToolEl.hide().appendTo('body')
    hoverToolEl[0].addEventListener('mouseenter', onHoverToolMouseEnter);
    hoverToolEl[0].addEventListener('mouseleave', onHighlightMouseLeave);

    deleteBtnEl = hoverToolEl.find('.highlighter--icon-delete')[0];
    deleteBtnEl.addEventListener('click', onDeleteBtnClicked);
})

function onDeleteBtnClicked() {
    const highlightId = currentHighlightEl.getAttribute('data-highlight-id');
    const highlights = $(`.highlighter--highlighted[data-highlight-id='${highlightId}']`);
    $('.highlighter--hovered').removeClass('highlighter--hovered');
    hoverToolEl.hide();
    hoverToolTimeout = null;

    highlights.css('backgroundColor', 'inherit'); // Change the background color attribute
    highlights.removeClass('highlighter--highlighted').addClass('highlighter--deleted'); // Change the class name to the 'deleted' version

    highlights.each((_, el) => { // Finally, remove the event listeners that were attached to this highlight element
        el.removeEventListener('mouseenter', onHighlightMouseEnterOrClick);
        el.removeEventListener('mouseleave', onHighlightMouseLeave);
    });
}

// When clicking outside the selected text => Hide the hover toolbar
window.addEventListener('click', (e) => {
    // Check if the click is done within the highlight
    if (e.target.classList.contains('highlighter--highlighted')) {
        return;
    }
    // If not => Hide the hover toolbar
    hide();
});

window.addEventListener("scroll", () => {
    if (isHoverClicked) {
        moveToolbarToHighlight(currentHighlightEl);
    }
});

function hide() {
    $('.highlighter--hovered').removeClass('highlighter--hovered');
    hoverToolEl.hide();
    hoverToolTimeout = null;
}

function onHoverToolMouseEnter() {
    if (hoverToolTimeout !== null) {
        clearTimeout(hoverToolTimeout);
        hoverToolTimeout = null;
    }
}

function onHighlightMouseEnterOrClick(e) {
    isHoverClicked = true

    const newHighlightEl = e.target
    const newHighlightId = newHighlightEl.getAttribute('data-highlight-id')

    // Clear any previous timeout that would hide the toolbar
    if (hoverToolTimeout !== null) {
        clearTimeout(hoverToolTimeout)
        hoverToolTimeout = null

        if (newHighlightId === currentHighlightEl.getAttribute('data-highlight-id')) {
            return
        }
    }

    currentHighlightEl = newHighlightEl

    // Position (and show) the hover toolbar above the highlight
    moveToolbarToHighlight(newHighlightEl, e.clientX);

    // Remove any previous borders and add a border to the highlight (by id) to clearly see what was selected
    $('.highlighter--hovered').removeClass('highlighter--hovered');
    $(`.highlighter--highlighted[data-highlight-id='${newHighlightId}']`).addClass('highlighter--hovered');
}

// cursorX is optional, in which case no change is made to the x position of the hover toolbar
function moveToolbarToHighlight(highlightEl, cursorX) {
    const boundingRect = highlightEl.getBoundingClientRect();
    const toolWidth = 50; // When changing this, also update the width in css #highlighter--hover-tools--container

    const hoverTop = boundingRect.top - 45;
    hoverToolEl.css({ top: hoverTop });

    if (cursorX !== undefined) {
        let hoverLeft;
        if (boundingRect.width < toolWidth) {
            // center the toolbar if the highlight is smaller than the toolbar
            hoverLeft = boundingRect.left + (boundingRect.width / 2) - (toolWidth / 2);
        } else if (cursorX - boundingRect.left < toolWidth / 2) {
            // If the toolbar would overflow the highlight on the left, snap it to the left of the highlight
            hoverLeft = boundingRect.left;
        } else if (boundingRect.right - cursorX < toolWidth / 2) {
            // If the toolbar would overflow the highlight on the right, snap it to the right of the highlight
            hoverLeft = boundingRect.right - toolWidth;
        } else {
            // Else, center the toolbar above the cursor
            hoverLeft = cursorX - (toolWidth / 2);
        }

        hoverToolEl.css({ left: hoverLeft });
    }

    hoverToolEl.show();
}

function onHighlightMouseLeave() {
    if (isHoverClicked) {
        isHoverClicked = false
        hoverToolTimeout = setTimeout(hide, 170);
    }
}