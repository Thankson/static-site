// Variables
const $toggler = $('.popUp-toggler');
const popUpClass = '.m-popUp';
let tempTogglerActive;

const POPUP_MODULE = {
    onReady: function() {
        $toggler.each((index, element) => {
            let el = $(element);
            const $popUp = el.next(popUpClass);

            POPUP_MODULE.togglerBtn(el, $popUp, $toggler);
            POPUP_MODULE.closePopupOutside(el, $popUp);
            POPUP_MODULE.closeButton(el, $popUp);
        });
    },

    popUpControl: function(toggler, popUp) {
        popUp.toggleClass('hidden').toggleClass('block');

        // Prevent click on body
        popUp.on('click', (e) => {
            e.stopPropagation();
        });

        POPUP_MODULE.accessibility(toggler, popUp);
    },

    togglerBtn: function(toggler, popUp, allPopups) {
        toggler.on('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Hide all
            if($(toggler)[0] !== tempTogglerActive) {
                allPopups.next(popUpClass).addClass('hidden').removeClass('block');

                // Accessibility
                allPopups.attr('aria-pressed', 'false');
                allPopups.next(popUpClass).children(`${popUpClass}__content`).attr('aria-hidden', 'true');

                tempTogglerActive = e.currentTarget;
            }
            // Show
            POPUP_MODULE.popUpControl(toggler, popUp);
        });
    },

    closePopupOutside: function(toggler, popUp) {
        $('body').on('click', () => {
            if(popUp && popUp.hasClass('block')) POPUP_MODULE.popUpControl(toggler, popUp);
        });

        $(document).on('keyup', (e) => {
            const key = e.which;
            // Esc key
            if(key === 27) {
                if(popUp && popUp.hasClass('block')) POPUP_MODULE.popUpControl(toggler, popUp);
            }
        });
    },

    closeButton: function(toggler, popUp) {
        const closeBtn = popUp.children(`${popUpClass}__content`).children(`${popUpClass}__close`);
        closeBtn.on('click', () => {
            POPUP_MODULE.popUpControl(toggler, popUp);
        });

        closeBtn.on('keypress', (e) => {
            const key = e.which;
            e.preventDefault();
            // Space and enter keys
            if(key === 32 || key === 13) POPUP_MODULE.popUpControl(toggler, popUp);
        });
    },

    accessibility: function(toggler, popUp) {
        // Focus button when closed
        if(popUp && popUp.hasClass('hidden')) toggler.focus();

        // Aria-pressed
        toggler.attr('aria-pressed', (e, attr) => {
            return !(attr === 'true');
        });

        // Aria-hidden
        const popupContent = popUp.children(`${popUpClass}__content`);
        popupContent.attr('aria-hidden', (e, attr) => {
            return !(attr === 'true');
        });

        // Trap pop-up focus: looping through elements via TAB key
        const focusableElements = popupContent.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]');
        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        firstEl.focus();

        $(document).on('keydown', (e) => {
            const key = e.which;
            // Tab key
            if(key === 9) {
                // SHIFT + TAB
                if(e.shiftKey) {
                    if(document.activeElement === firstEl) {
                        e.preventDefault();
                        lastEl.focus();
                    }
                // TAB
                } else {
                    if(document.activeElement === lastEl) {
                        e.preventDefault();
                        firstEl.focus();
                    }
                }
            }
        });
    }
};

// app ready
$(document).ready(POPUP_MODULE.onReady);
