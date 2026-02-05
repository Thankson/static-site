import CAROUSEL_MODULE_BUILDER from '@common/source/js/standard/carousel/builders/base-carousel';

const config = {
    // Promo click event not firing on Hero Carousel - Mobile Device (GA Tagging) - Bug 96259
    mobileFirst: $(window).width() < 768,
    responsive: [
        {
            breakpoint: 768,
            settings: {
                arrows: true
            }
        }
    ]
};

const HERO_CAROUSEL_MODULE = CAROUSEL_MODULE_BUILDER('o-heroCarousel', config, true);

// app ready
$(document).ready(HERO_CAROUSEL_MODULE.onReady);
