import CAROUSEL_MODULE_BUILDER from '@common/source/js/standard/carousel/builders/base-carousel';

const config = {
    responsive: [
        {
            breakpoint: 768,
            settings: {
                arrows: true
            }
        }
    ]
};

const HERO_CAROUSEL_MODULE = CAROUSEL_MODULE_BUILDER('o-contentBlockCarousel', config, true);

// app ready
$(document).ready(HERO_CAROUSEL_MODULE.onReady);
