import CARD_CAROUSEL_MODULE_BUILDER from '@common/source/js/standard/carousel/builders/card-carousel';

const config = {
    variableWidth: true
};

const slideCounts = {
    default: {
        slidesToShow: 4.5,
        slidesToScroll: 4,
        variableWidth: true
    },
    xl: {
        breakpoint: 1210,
        settings: {
            slidesToShow: 4.5,
            slidesToScroll: 4
        }
    },
    lgXL: {
        breakpoint: 1170,
        settings: {
            slidesToShow: 4.5,
            slidesToScroll: 3
        }
    },
    lg: {
        breakpoint: 992,
        settings: {
            slidesToShow: 2.5,
            slidesToScroll: 2,
            variableWidth: true

        }
    },
    md: {
        breakpoint: 768,
        settings: {
            slidesToShow: 2.5,
            slidesToScroll: 2,
            variableWidth: true

        }
    },
    sm: {
        breakpoint: 576,
        settings: {
            slidesToShow: 2.5,
            slidesToScroll: 1,
            variableWidth: true

        }
    },
    xs: {
        breakpoint: 415,
        settings: {
            slidesToShow: 1.5,
            slidesToScroll: 1,
            variableWidth: true

        }
    },
    tiny: {
        breakpoint: 320,
        settings: {
            slidesToShow: 1.5,
            slidesToScroll: 1,
            variableWidth: true

        }
    }
};

const LTE_RELATED_VIDEO_MODULE = CARD_CAROUSEL_MODULE_BUILDER('o-relatedVideos__wrapper', slideCounts, config);
// app ready is done when all cards is loaded via API
$(document).ready(LTE_RELATED_VIDEO_MODULE.onReady);
window.refreshRelatedVideo = LTE_RELATED_VIDEO_MODULE.onReady;
