import CARD_CAROUSEL_MODULE_BUILDER from '@common/source/js/standard/carousel/builders/card-carousel';

const slideCounts = {
    default: {
        slidesToShow: 3,
        slidesToScroll: 3
    },
    xl: {
        breakpoint: 1210,
        settings: {
            slidesToShow: 3,
            slidesToScroll: 3
        }
    },
    lgXL: {
        breakpoint: 1170,
        settings: {
            slidesToShow: 2,
            slidesToScroll: 2
        }
    },
    lg: {
        breakpoint: 992,
        settings: {
            slidesToShow: 2,
            slidesToScroll: 2
        }
    },
    lgMd: {
        breakpoint: 865,
        settings: {
            slidesToShow: 2,
            slidesToScroll: 2
        }
    },
    md: {
        breakpoint: 768,
        settings: {
            slidesToShow: 2,
            slidesToScroll: 2
        }
    },
    sm: {
        breakpoint: 576,
        settings: {
            slidesToShow: 1,
            slidesToScroll: 1
        }
    },
    xs: {
        breakpoint: 415,
        settings: {
            slidesToShow: 1,
            slidesToScroll: 1
        }
    }
};

const config = {
    dots: true
};

const RESOURCES_CAROUSEL_MODULE = CARD_CAROUSEL_MODULE_BUILDER('o-resourcesCarousel__wrapper.-materials', slideCounts, config);

// app ready
$(document).ready(RESOURCES_CAROUSEL_MODULE.onReady);
