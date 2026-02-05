const BECOMEMKTEXEC_MODULE = {
    onReady: function() {
        BECOMEMKTEXEC_MODULE.bind();
    },
    config: {
        apiUrl: '/api/account/marketingexecutive',
        id: null,
        originalUrl: '',
        finalUrl: ''
    },
    addLoadingSpin: function(bool) {
        const loadingIcon = $('.becomeMktExec__loading');
        if(bool) {
            loadingIcon.removeClass('hidden');
        } else {
            loadingIcon.addClass('hidden');
        }
    },
    bind: function() {
        $('#become-mkt-exec, .-becomeMktExec').click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            BECOMEMKTEXEC_MODULE.originalUrl = $(e.currentTarget).attr('data-href') ? $(e.currentTarget).attr('data-href') : $(e.currentTarget).attr('href');

            // Check if has a token (call api) or just go to url
            if(BECOMEMKTEXEC_MODULE.originalUrl?.indexOf('{0}') !== -1) {
                BECOMEMKTEXEC_MODULE.callApi();
            } else if(BECOMEMKTEXEC_MODULE.originalUrl) {
                window.location.href = BECOMEMKTEXEC_MODULE.originalUrl;
            } else {
                console.error('No URL value detected on the clicked button/link, cannot redirect');
            }
        });
    },
    callApi: function() {
        // If token exists
        $.ajax({
            url: BECOMEMKTEXEC_MODULE.config.apiUrl,
            type: 'GET',
            beforeSend: function(xhr) {
                // Add loading
                BECOMEMKTEXEC_MODULE.addLoadingSpin(true);
            },
            contentType: 'application/json',
            accept: 'application/json',
            success: function(data) {
                BECOMEMKTEXEC_MODULE.config.id = data?.Data?.mobileInvitationCode;
                BECOMEMKTEXEC_MODULE.getUrlAndGo();

                // Remove loading
                BECOMEMKTEXEC_MODULE.addLoadingSpin(false);
            },
            error: function(data) {
                // sending to the original URL
                window.location.href = BECOMEMKTEXEC_MODULE.originalUrl;
            }
        });
    },
    getUrlAndGo: function() {
        const finalUrl = BECOMEMKTEXEC_MODULE.originalUrl.replace('{0}', BECOMEMKTEXEC_MODULE.config.id);
        window.location.href = finalUrl;
    }
};

// module ready
$(document).ready(BECOMEMKTEXEC_MODULE.onReady());
