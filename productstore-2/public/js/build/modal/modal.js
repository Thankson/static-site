const MODAL_MODULE = {
    onReady: function() {
        MODAL_MODULE.closeModal('m-modal');
        // Listener
        $('body').on('DOMNodeInserted', '#m-modal', function() {
            MODAL_MODULE.accessibility('m-modal', $('.m-modal__close'));
        });
    },

    config: {
        target: $('#m-modal')
    },

    closeModal: function(target) {
        const modal = $(`#${target}`);

        // Prevent click on body
        modal.on('click', (e) => {
            e.stopPropagation();
        });

        // Close button
        const closeBtn = modal.find(`.${target}__close`);
        closeBtn.on('click', () => {
            modal.hide();
            $('body').removeClass('-noScroll');
        });

        closeBtn.on('keypress', (e) => {
            const key = e.which;
            e.preventDefault();
            // Space and enter keys
            if(key === 32 || key === 13) {
                modal.hide();
                $('body').removeClass('-noScroll');
            }
        });

        // Close outside
        $(`.${target}__overlay`).on('click', () => {
            if(modal.is(':visible')) {
                modal.hide();
                $('body').removeClass('-noScroll');
            }
        });

        // Esc key
        $(document).on('keyup', (e) => {
            const key = e.which;
            e.preventDefault();
            if(key === 27 && modal.is(':visible')) {
                modal.hide();
                $('body').removeClass('-noScroll');
            }
        });
    },

    accessibility: function(target, closeBtn) {
        const modal = $(`#${target}`);
        // Trap pop-up focus: looping through elements via TAB key
        const focusableElements = modal.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]');
        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        closeBtn.focus();

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
$(document).ready(MODAL_MODULE.onReady);
