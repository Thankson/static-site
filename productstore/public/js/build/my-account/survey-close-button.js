const SURVEYCLOSEBTN_MODULE = {
    onReady: function() {
        $('.m-onlineSurvey__closeX').click(function(e) {
            $(this).closest('.m-onlineSurvey').addClass('hidden');
        });
    }
};

// module ready
$(document).ready(SURVEYCLOSEBTN_MODULE.onReady());
