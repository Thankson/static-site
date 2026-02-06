const LVIP_TABLE = {
    onReady: function() {
        const $LVIP_TABLE_INNER = $('.o-lvipJourneyTable__inner');
        const $LVIP_TABLE_AFTER = $('.o-lvipJourneyTable__after');
        const $LVIP_TABLE_CONTENT = $('.o-lvipJourneyTable__content');

        $LVIP_TABLE_INNER.scroll(function() {
            if($LVIP_TABLE_INNER.scrollLeft() > 0) {
                $LVIP_TABLE_CONTENT.css('padding-left', '200px');
                $LVIP_TABLE_AFTER.css('display', 'block');
            } else {
                $LVIP_TABLE_CONTENT.css('padding-left', '176px');
                $LVIP_TABLE_AFTER.css('display', 'none');
            }
        });
    }

};

// module ready
$(document).ready(LVIP_TABLE.onReady());
