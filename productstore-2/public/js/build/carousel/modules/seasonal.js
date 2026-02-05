import CAROUSEL_MODULE_BUILDER from '@common/source/js/standard/carousel/builders/base-carousel';

const config = {
    dots: false,
    autoplay: false,
    responsive: []
};

const SEASONAL_CAROUSEL_MODULE = CAROUSEL_MODULE_BUILDER('o-seasonalCarousel__wrapper', config);

// app ready
$(document).ready(SEASONAL_CAROUSEL_MODULE.onReady);
