import CARD_CAROUSEL_MODULE_BUILDER from '@common/source/js/standard/carousel/builders/card-carousel';

const slideCounts = {
    default: {
        slidesToShow: 6,
        slidesToScroll: 6
    },
    xl: {
        breakpoint: 1210,
        settings: {
            slidesToShow: 6,
            slidesToScroll: 6
        }
    },
    lg: {
        breakpoint: 992,
        settings: {
            slidesToShow: 5,
            slidesToScroll: 5
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
    }
};

const config = {
    dots: true
};

const RESOURCES_CAROUSEL_MODULE = CARD_CAROUSEL_MODULE_BUILDER('o-resourcesCarousel__wrapper.-default', slideCounts, config);

// app ready
$(document).ready((RESOURCES_CAROUSEL_MODULE.onReady));
