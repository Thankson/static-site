import CARD_CAROUSEL_MODULE_BUILDER from '@common/source/js/standard/carousel/builders/card-carousel';

const slideCounts = {
    default: {
        slidesToShow: 7,
        slidesToScroll: 7
    },
    xl: {
        breakpoint: 1210,
        settings: {
            slidesToShow: 7,
            slidesToScroll: 7
        }
    },
    lg: {
        breakpoint: 992,
        settings: {
            slidesToShow: 6,
            slidesToScroll: 6
        }
    },
    lgMd: {
        breakpoint: 865,
        settings: {
            slidesToShow: 5,
            slidesToScroll: 5
        }
    },
    md: {
        breakpoint: 768,
        settings: {
            slidesToShow: 4,
            slidesToScroll: 4
        }
    },
    sm: {
        breakpoint: 576,
        settings: {
            slidesToShow: 3,
            slidesToScroll: 3
        }
    },
    xs: {
        breakpoint: 415,
        settings: {
            slidesToShow: 2,
            slidesToScroll: 2
        }
    },
    tiny: {
        breakpoint: 320,
        settings: {
            slidesToShow: 1.5,
            slidesToScroll: 1
        }
    }
};

const PRODUCT_CAROUSEL_MODULE = CARD_CAROUSEL_MODULE_BUILDER('o-productCarousel__wrapper', slideCounts);

// app ready
$(document).ready(PRODUCT_CAROUSEL_MODULE.onReady);
window.refreshProductCarousel = PRODUCT_CAROUSEL_MODULE.onReady;
