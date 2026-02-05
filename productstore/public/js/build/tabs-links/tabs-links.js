const TABS_LINKS_MODULE = {
    onReady: function() {
        const $TABS_LIST = $('.m-tabs__list');

        if($TABS_LIST.length && window.innerWidth < 768) {
            this.centerAlignTabs();
        }
    },
    centerAlignTabs: function() {
        const $activeTab = $('.m-tabs__tab a.-isActive').closest('.m-tabs__tab');
        const $container = $activeTab.parent();
        if($activeTab.length && $container.length) {
            // Calculate the new scroll position
            const tabLeft = $activeTab.position().left;
            const tabWidth = $activeTab.outerWidth();
            const containerScrollLeft = $container.scrollLeft();
            const containerWidth = $container.width();

            const tabCenter = tabLeft + (tabWidth / 2);
            const containerCenter = containerWidth / 2;
            const newScrollLeft = containerScrollLeft + tabCenter - containerCenter;

            $container.animate({
                scrollLeft: newScrollLeft
            }, 500);
        }
    }
};

// module ready
$(document).ready(TABS_LINKS_MODULE.onReady());
