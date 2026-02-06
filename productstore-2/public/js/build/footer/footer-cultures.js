const FTR_CULTURE_MODULE = {
    onReady: function () {
        $('[data-culture-select] select').change(function (e) {
            const $cultureSelect = $(this);
            const cultureVal = $cultureSelect.val();
            if(cultureVal) {
                window.open(cultureVal, '_self');
            }
        });
    }
};

// module ready
$(document).ready(FTR_CULTURE_MODULE.onReady());
