const FTR_GTM_TRACK = {
    gtmTrack: function() {
        const $selectElement = $('.o-siteFooter select');
        $selectElement.change(() => {
            const $selectedOption = $('select option:selected');
            const language = $selectedOption.val();
            const region = $selectedOption.text();
            if((language && region) !== 'Select Region and Language') {
                window.trackAction && window.trackAction({ id: 0, eL: `${region}/${language}` });
            }
        });
    }
};

// module ready
$(document).ready(FTR_GTM_TRACK.gtmTrack());
