const CTA_BANNER = {
    gtmTrack: function() {
        const $ctaBanner = $('.m-ctaBanner a');
        $ctaBanner.click(function() {
            const ctaText = $(this).text().trim();
            window.trackAction && window.trackAction({ id: 115, eL: ctaText });
        });
    }
};

// module ready
$(document).ready(CTA_BANNER.gtmTrack());
