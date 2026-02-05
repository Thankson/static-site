const FTR_SOCIALSHARE_MODULE = {
    onReady: function() {
        if(!($('[data-js="socialPopup"]').length)) {
            return;
        }
        $('[data-js="socialPopup"]').on('click', function() {
            const triggerEl = $(this).parents('.o-footer__socialIcon');
            triggerEl.siblings().find('[data-target="socialPopup"]').hide();
            triggerEl.find('[data-target="socialPopup"]').toggle();
        });
        $('[data-js="socialPopupClose"]').on('click', function() {
            const triggerEl = $(this).parents('.o-footer__socialIcon');
            triggerEl.find('[data-target="socialPopup"]').hide();
        });
        $(document).on('click', function(event) {
            const clickTarget = $(event.target);

            // click outside
            if(!clickTarget.parents('.o-footer__socialIcon').length) {
                FTR_SOCIALSHARE_MODULE.closeAll();
            }
        });
    },
    closeAll: function() {
        $('[data-target="socialPopup"]').hide();
    }
};

// module ready
$(document).ready(FTR_SOCIALSHARE_MODULE.onReady());
