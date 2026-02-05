import CARD_CAROUSEL_MODULE_BUILDER from '@common/source/js/standard/carousel/builders/card-carousel';

const slideCounts = {
    default: {
        slidesToShow: 4,
        slidesToScroll: 4
    },
    lg: {
        breakpoint: 1024,
        settings: {
            slidesToShow: 4,
            slidesToScroll: 4
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
            slidesToShow: 2.4,
            slidesToScroll: 1
        }
    },
    tiny: {
        breakpoint: 320,
        settings: {
            slidesToShow: 2.07,
            slidesToScroll: 1
        }
    }
};

const SAVED_LATER_CAROUSEL_MODULE = CARD_CAROUSEL_MODULE_BUILDER('o-savedLaterCarousel__wrapper', slideCounts);

window.refreshSavedLaterCarousel = SAVED_LATER_CAROUSEL_MODULE.onReady;
window.removeSavedLaterCarouselItem = SAVED_LATER_CAROUSEL_MODULE.removeItem;
