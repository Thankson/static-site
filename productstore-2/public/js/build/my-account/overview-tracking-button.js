const TRACKBTN_MODULE = {
    onReady: function() {
        $('[data-tracking-select] select').change(function(e) {
            const $trackingSelect = $(this);
            const selectedTrack = $trackingSelect.val();
            if(selectedTrack !== '') {
                $trackingSelect.val('');
                const newWindow = window.open();

                // For built-in popup blockers (like Safari)
                if(newWindow === undefined || newWindow === null) {
                    // open in the same page
                    window.location = selectedTrack;
                }

                newWindow.location.href = selectedTrack;
            }
        });
    }
};

// module ready
$(document).ready(TRACKBTN_MODULE.onReady());
