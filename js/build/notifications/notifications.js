const NOTIFICATIONS_MODULE = {
    onReady() {
        const MODULE = this;

        if($('.o-notifications').length) {
            MODULE.click(MODULE);

            MODULE.setConfigData();
            MODULE.handleNotifications();
            MODULE.handleEachNotificationClTrack();
        }
    },
    click(MODULE) {
        $('[data-notif-select] select').change(function(e) {
            const $filterSelect = $(this);
            const selectedVal = $filterSelect.val();

            MODULE.filter(MODULE, selectedVal);
        });
    },
    filter(MODULE, selectedVal) {
        const NOTIF_DATES = $('[data-notif-date]');
        const NOTIF_GROUPS = $('[data-notif-groups]');
        const NOTIF_ITEMS = NOTIF_GROUPS.find('[data-notif-type]');

        MODULE.itemsVisibility(NOTIF_ITEMS, selectedVal);
        MODULE.datesVisibility(NOTIF_DATES);
    },
    datesVisibility($notifDates) {
        $notifDates.each(function(index, el) {
            const $dateGroup = $(el);
            const isHidden = $dateGroup.find('[data-notif-hidden="false"]').length;

            !isHidden ? $dateGroup.addClass('hidden') : $dateGroup.removeClass('hidden');
        });
    },
    itemsVisibility($notifItems, selectedVal) {
        $notifItems.each(function(index, el) {
            let $item = $(el);
            let $itemType = $item.data('notif-type');

            if(selectedVal === 'All' || selectedVal === $itemType) {
                $item.removeClass('hidden').attr('data-notif-hidden', 'false');
            } else {
                $item.addClass('hidden').attr('data-notif-hidden', 'true');
            }
        });
    },
    data: {
        enableConvertLabFeatureFlag: false,
        enableNewWebAlertFeatureFlag: false,
        url: `/api/customerprofile/notification?sc_itemid=${window.globalUrlQueryParams?.sc_itemid}&sc_lang=${window.globalUrlQueryParams?.sc_lang}&sc_site=${window.globalUrlQueryParams?.sc_site}`,
        allNotifications: [],
        unreadNotifications: []
    },
    setConfigData() {
        const enableNewWebAlertFeatureFlag = $('[name=enableNewWebAlertFeatureFlag]').data('webalert-flag');
        // eslint-disable-next-line no-unneeded-ternary
        NOTIFICATIONS_MODULE.data.enableNewWebAlertFeatureFlag = ['true', 'True', true].includes(enableNewWebAlertFeatureFlag) ? true : false;

        NOTIFICATIONS_MODULE.data.enableConvertLabFeatureFlag = window.enableConvertLabFeatureFlag;
    },
    handleNotifications() {
        if(!NOTIFICATIONS_MODULE.data.enableNewWebAlertFeatureFlag) return;

        $.ajax({
            url: NOTIFICATIONS_MODULE.data.url,
            type: 'GET',
            contentType: 'application/json',
            accept: 'application/json',
            success: function(data) {
                NOTIFICATIONS_MODULE.data.allNotifications = data || [];
                NOTIFICATIONS_MODULE.data.unreadNotifications = NOTIFICATIONS_MODULE.data.allNotifications.filter(i => !i.ViewedTime);
                if(NOTIFICATIONS_MODULE.data.unreadNotifications.length) {
                    NOTIFICATIONS_MODULE.setAsReaded();

                    NOTIFICATIONS_MODULE.handleUnreadNotificationsClTrack();
                }
            }
        });
    },
    setAsReaded() {
        const params = {
            MessageIds: NOTIFICATIONS_MODULE.data.unreadNotifications.map(i => i.MessageId)
        };
        $.ajax({
            url: NOTIFICATIONS_MODULE.data.url,
            type: 'PUT',
            data: JSON.stringify(params),
            contentType: 'application/json',
            accept: 'application/json',
            success: function(data) {
                if(data?.success) {
                    console.log('---Successfully set the message as read---');
                }
            }
        });
    },
    handleUnreadNotificationsClTrack() {
        if(!(NOTIFICATIONS_MODULE.data.enableConvertLabFeatureFlag && window.clab_tracker?.track)) return;

        NOTIFICATIONS_MODULE.data.unreadNotifications.forEach(item => {
            window.clab_tracker?.track('c_open_webalert', {
                c_webalert_templateid: item.WebAlertTemplateId,
                c_webalert_alerttype: 'WebAlert',
                c_webalert_templatetype: item.CallToActionType,
                c_webalert_channel: '全渠道',
                c_webalert_filtertype: item.FilterType,
                c_webalert_senddate: item.NotificationGroup?.DeliveredTime,
                c_webalert_browsechannel: '官网',
                c_webalert_vediolink: item.CallToActionVideo?.Data?.Id,
                c_webalert_urllink: item.CallToActionLink,
                c_webalert_productsku: item.CallToActionData?.Sku,
                externalId: item.MessageId
            });

            // GA
            window.dataLayer && window.dataLayer.push({
                'event': 'userEvent',
                'eC': 'Web Alerts-CN',
                'eA': 'View',
                'eL': item.Message
            });
        });
    },
    handleEachNotificationClTrack() {
        if(!(NOTIFICATIONS_MODULE.data.enableConvertLabFeatureFlag && window.clab_tracker?.track)) return;

        $('.o-notifications.-page .o-videoModalButton,.o-notifications.-page .a-actionIcon,.o-notifications.-page a').on('click', function() {
            const notificationEl = this.closest('.m-notification');
            if(!notificationEl) return;

            const messageId = $(notificationEl).data('cl-message-id');
            if(!messageId) return;

            const currentNotification = NOTIFICATIONS_MODULE.data.allNotifications.find(i => i.MessageId === String(messageId));
            if(!currentNotification) return;

            window.clab_tracker?.track('c_click_webalert', {
                c_webalert_templateid: currentNotification.WebAlertTemplateId,
                c_webalert_alerttype: 'WebAlert',
                c_webalert_templatetype: currentNotification.CallToActionType,
                c_webalert_channel: '全渠道',
                c_webalert_filtertype: currentNotification.FilterType,
                c_webalert_senddate: currentNotification.NotificationGroup?.DeliveredTime,
                c_webalert_browsechannel: '官网',
                c_webalert_vediolink: currentNotification.CallToActionVideo?.Data?.Id,
                c_webalert_urllink: currentNotification.CallToActionLink,
                c_webalert_productsku: currentNotification.CallToActionData?.Sku
            });

            // GA
            window.dataLayer && window.dataLayer.push({
                'event': 'userEvent',
                'eC': 'Web Alerts-CN',
                'eA': 'Click',
                'eL': currentNotification.Message
            });
        });
    }
};

$(document).ready(NOTIFICATIONS_MODULE.onReady());
