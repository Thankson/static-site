const FTR_SOCIALSHARE_MODULE = {
    onReady: function() {
        if(!$('[data-js="socialPopup"]').length) {
            return;
        }
        const socialPopup = $('[data-target="socialPopup"]');
        $('[data-js="socialPopup"]').on('click', function(e) {
            if(socialPopup) {
                socialPopup.toggle();
            }
        });
        $('[data-js="socialPopupClose"]').on('click', function(e) {
            if(socialPopup) {
                socialPopup.hide();
            }
        });
        $('.o-siteFooter.-isCn').on('click', function(e) {
            var spi = $('[data-js="socialPopup"]>img');
            var sp = $('[data-js="socialPopup"]');
            var spc = $('.o-siteFooter__qrcode');
            if(e.target === spi[0] || e.target === sp[0] || e.target === spc[0]) return;
            if(socialPopup) {
                socialPopup.hide();
            }
        });
    }
};

// module ready
$(document).ready(FTR_SOCIALSHARE_MODULE.onReady());
