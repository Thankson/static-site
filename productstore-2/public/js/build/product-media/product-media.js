import PinchZoom from 'pinch-zoom-js';

let $prodMedia;

// Thumbs
let $mediaThumbs;
let $mediaThumbsArrows;
let $mediaThumbsWrapper;

// Images
let $mediaImagesList;
let $mediaImagesDots;
let $mediaImagesArrows;
let $mediaImage;

// Big images - Lightbox
let $lightboxWrapper;
let $lightbox;
let $lightboxList;
let $lightboxArrows;
let $lightboxCounter;
let $lightboxClose;
let imagesPinch;

// Zoom
let $zoomDiv;
let $targetZoom;

// Counter
let $counter;

// Screen Reader click
let srClick = false;

// Labels
let labels = {}; // All labels coming from data-*

const speedAnimation = 200;

// APP
const PROD_MEDIA_MODULE = {
    initVars: function() {
        $prodMedia = $("[data-js='productMedia']");

        // Thumbs
        $mediaThumbs = $prodMedia.find('.m-prodMedia__list.-thumbs');
        $mediaThumbsArrows = $prodMedia.find('.m-prodMedia__actions.-thumbs').children('.m-prodMedia__arrows');
        $mediaThumbsWrapper = $prodMedia.find('.m-prodMedia__wrapper.-thumbs');

        // Labels with fallback
        labels['clickToZoom'] = $mediaThumbsWrapper.data('label-click-to-zoom') || 'click to zoom';
        labels['count'] = $mediaThumbsWrapper.data('label-count') || 'slide {0} out of {1}';
        labels['media'] = $mediaThumbsWrapper.data('label-media') || 'Media';
        labels['of'] = $mediaThumbsWrapper.data('label-of') || 'Of';
        labels['selected'] = $mediaThumbsWrapper.data('label-selected') || 'Selected';
        labels['showing'] = $mediaThumbsWrapper.data('label-showing') || 'Showing';
        labels['next'] = $mediaThumbsWrapper.data('label-next') || 'Next';
        labels['prev'] = $mediaThumbsWrapper.data('label-previous') || 'Previous';

        // Images
        $mediaImagesList = $prodMedia.find('.m-prodMedia__list.-images');
        $mediaImagesDots = $prodMedia.find('.m-prodMedia__actions.-images').children('.m-prodMedia__dots');
        $mediaImagesArrows = $prodMedia.find('.m-prodMedia__actions.-images').children('.m-prodMedia__arrows');
        $mediaImage = $mediaImagesList.children('.m-prodMedia__mediaItem');

        // Big images - Lightbox
        $lightboxWrapper = $prodMedia.find('.m-prodMedia__wrapper.-lightbox');
        $lightbox = $prodMedia.find('.m-prodMedia__lightbox');
        $lightboxList = $prodMedia.find('.m-prodMedia__list.-lightbox');
        $lightboxArrows = $lightbox.find('.m-prodMedia__arrows');
        $lightboxCounter = $lightbox.find('.m-prodMedia__counter');
        $lightboxClose = $lightbox.find('.m-prodMedia__close');
        imagesPinch = $lightboxList.find('.m-prodMedia__lightboxImage img');

        // Zoom
        $zoomDiv = $prodMedia.find('.m-prodMedia__zoom');
        $targetZoom = $zoomDiv.children('.m-prodMedia__zoomImage');

        // Counter
        $counter = $prodMedia.find('.m-prodMedia__wrapper.-images .m-prodMedia__counter');
    },
    onReady: function() {
        PROD_MEDIA_MODULE.initVars();
        // Events
        // Thumbs
        $mediaThumbs.on('init', (event, slick) => {
            // Set first thumb active
            $prodMedia.find('.slick-current').addClass('active');
        });

        $mediaThumbs.on('init afterChange', (event, slick) => {
            const $slides = slick.$slides;
            if($slides) {
                $slides.map((index, element) => {
                    // Tabindex
                    const classThumbs = $(element).attr('class');
                    if(classThumbs.indexOf('slick-active') !== -1) {
                        $(element).find('button').attr('tabindex', 0);
                    } else {
                        $(element).find('button').attr('tabindex', -1);
                    }
                });
            }
        });

        // Main media
        $mediaImagesList.on('init', (event, slick, currentSlide, nextSlide) => {
            // Zoom - set first image
            const initImage = $mediaImagesList.find('.slick-slide.slick-current.slick-active').find('.m-prodMedia__mediaItem').data('zoom');
            $targetZoom.css('background-image', `url(${initImage})`);

            // Accessibility
            PROD_MEDIA_MODULE.accessibility(slick);

            // Counter
            let i = (!currentSlide ? 0 : currentSlide) + 1;
            $counter.html(`<span class="sr-only">${labels.media} </span>${i} ${labels.of} ${slick.slideCount} <span class="sr-only">${labels.selected}/${labels.showing}</span>`);

            $(window).resize(() => {
                PROD_MEDIA_MODULE.accessibility(slick);
            });
        });

        $mediaImagesList.on('afterChange', (event, slick, currentSlide, nextSlide) => {
            // Counter
            let i = (!currentSlide ? 0 : currentSlide) + 1;
            $counter.html(`<span class="sr-only">${labels.media} </span>${i} ${labels.of} ${slick.slideCount}`);

            // Update thumbs
            if(srClick) {
                const $thumbToUpdate = $mediaThumbs.find(`.slick-slide[data-slick-index=${currentSlide}]`);
                $prodMedia.find('.m-prodMedia__list.-thumbs .slick-slide').removeClass('active');
                $thumbToUpdate.click();
                srClick = false;
            }

            // Accessibility
            PROD_MEDIA_MODULE.accessibility(slick);
        });

        $mediaImagesList.on('init afterChange', (event, slick, currentSlide, nextSlide) => {
            // Update tabindex
            const $slides = slick.$slides;
            if($slides) {
                $slides.map((index, element) => {
                    // Tabindex
                    const classThumbs = $(element).attr('class');
                    if($(element).find('.m-prodMedia__video').length === 0) {
                        if(classThumbs.indexOf('slick-active') !== -1) {
                            if($(window).width() <= 768) {
                                $(element).find('.m-prodMedia__mediaItem').attr('tabindex', 0);
                                $(element).find('button').attr('tabindex', 0);
                            } else {
                                $(element).find('.m-prodMedia__mediaItem').removeAttr('tabindex');
                                $(element).find('button').removeAttr('tabindex');
                            }
                        } else {
                            $(element).find('.m-prodMedia__mediaItem').attr('tabindex', -1);
                            $(element).find('button').attr('tabindex', -1);
                        }
                    } else {
                        if(classThumbs.indexOf('slick-active') !== -1) {
                            $(element).find('.m-prodMedia__mediaItem').removeAttr('tabindex');
                            $(element).find('button').removeAttr('tabindex');
                        } else {
                            $(element).find('.m-prodMedia__mediaItem').attr('tabindex', -1);
                            $(element).find('button').attr('tabindex', -1);
                        }
                    }
                });
            }
        });

        // Big Images - Lightbox
        $lightboxList.on('init', (event, slick, currentSlide, nextSlide) => {
            // Counter
            let i = (!currentSlide ? 0 : currentSlide) + 1;
            $lightboxCounter.html(`<span class="sr-only">${labels.media} ${i} ${labels.of} ${slick.slideCount}</span>`);
        });

        $lightboxList.on('afterChange', (event, slick, currentSlide, nextSlide) => {
            // Counter
            let i = (!currentSlide ? 0 : currentSlide) + 1;
            $lightboxCounter.html(`<span class="sr-only">${labels.media} ${i} ${labels.of} ${slick.slideCount}</span>`);

            // Update Images Slick
            $mediaImagesList.slick('slickGoTo', currentSlide);
        });

        PROD_MEDIA_MODULE.resize();
        PROD_MEDIA_MODULE.slickThumbs($mediaThumbs);
        PROD_MEDIA_MODULE.slickImages($mediaImagesList);
        PROD_MEDIA_MODULE.slickImagesBig($lightboxList);
        PROD_MEDIA_MODULE.bind();
    },
    resize: function() {
        $(window).resize(() => {
            PROD_MEDIA_MODULE.refreshSlick();
        });
    },
    refreshSlick: function() {
        $mediaThumbs.slick('refresh');
        $mediaImagesList.slick('refresh');

        // Set thumb active
        const indexImageActive = $mediaImagesList.find('.slick-slide.slick-current').data('slick-index');
        const thumbTarget = $mediaThumbs.find(`.slick-slide[data-slick-index=${indexImageActive}]`);
        thumbTarget.addClass('active');

        PROD_MEDIA_MODULE.bind();
    },
    unloadSlick: function() {
        if($mediaThumbs) {
            $mediaThumbs.slick('unslick');
        }
        if($mediaImagesList) {
            $mediaImagesList.slick('unslick');
        }
        if($lightboxList) {
            $lightboxList.slick('unslick');
        }
    },
    slickThumbs: function(target) {
        target.slick({
            appendArrows: $mediaThumbsArrows,
            autoplay: false,
            dots: false,
            arrows: true,
            infinite: false,
            speed: speedAnimation,
            slidesToShow: 5,
            slidesToScroll: 1,
            vertical: true,
            accessibility: false,
            focusOnChange: false,
            focusOnSelect: false,
            draggable: false,
            nextArrow: `<button class="slick-next focus:outline-none focus:shadow-outline"
                        aria-label="${labels.next}" type="button">
                            <span class="a-arrow -sm -down" aria-hidden="true">
                                <span class="a-arrow__icon border-black"></span>
                            </span>${labels.next}
                        </button>`,
            prevArrow: `<button class="slick-prev focus:outline-none focus:shadow-outline"
                            aria-label="${labels.prev}" type="button">
                            <span class="a-arrow -sm -up" aria-hidden="true">
                                <span class="a-arrow__icon border-black"></span>
                            </span>${labels.prev}
                        </button>`
        });
    },
    slickImages: function(target) {
        target.slick({
            appendDots: $mediaImagesDots,
            appendArrows: $mediaImagesArrows,
            autoplay: false,
            dots: false,
            arrows: true,
            infinite: false,
            speed: speedAnimation,
            slidesToShow: 1,
            slidesToScroll: 1,
            centerMode: false,
            draggable: false,
            accessibility: false,
            nextArrow: `<button class="slick-next focus:outline-none focus:shadow-outline"
                        aria-label="${labels.next} ${labels.media}" type="button">
                            <span class="a-arrow -sm -right" aria-hidden="true">
                                <span class="a-arrow__icon border-black"></span>
                            </span>
                            ${labels.next} ${labels.media}
                        </button>`,
            prevArrow: `<button class="slick-prev focus:outline-none focus:shadow-outline"
                            aria-label="${labels.prev} ${labels.media}" type="button">
                            <span class="a-arrow -sm -left" aria-hidden="true">
                                <span class="a-arrow__icon border-black"></span>
                            </span>${labels.prev} ${labels.media}
                        </button>`,
            responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        draggable: true
                    }
                }
            ]
        });
    },
    slickImagesBig: function(target) {
        target.slick({
            appendArrows: $lightboxArrows,
            autoplay: false,
            dots: false,
            arrows: true,
            infinite: true,
            speed: speedAnimation,
            slidesToShow: 1,
            slidesToScroll: 1,
            centerMode: false,
            draggable: true,
            accessibility: false,
            nextArrow: `<button class="slick-next focus:outline-none focus:shadow-outline"
                        aria-label=""${labels.next} ${labels.media}" type="button">
                            <span class="a-arrow -sm -right" aria-hidden="true">
                                <span class="a-arrow__icon border-black"></span>
                            </span>
                            "${labels.next} ${labels.media}
                        </button>`,
            prevArrow: `<button class="slick-prev focus:outline-none focus:shadow-outline"
                            aria-label="${labels.prev} ${labels.media}" type="button">
                            <span class="a-arrow -sm -left" aria-hidden="true">
                                <span class="a-arrow__icon border-black"></span>
                            </span>${labels.prev} ${labels.media}
                        </button>`
        });
    },
    bind: function() {
        // Bind thumbs buttons
        $prodMedia.find('.m-prodMedia__list.-thumbs .slick-slide').on('click', (e) => {
            const _this = e.currentTarget;
            let index = $(_this).data('slickIndex');

            // Set thumb active
            $prodMedia.find('.m-prodMedia__list.-thumbs .slick-slide').removeClass('active');
            $(_this).addClass('active');

            // Changing main image
            $mediaImagesList.slick('slickGoTo', index);

            // Zoom image or video
            const targetImage = $mediaImagesList.find(`.slick-slide[data-slick-index=${index}]`).find('.m-prodMedia__mediaItem').data('zoom');

            if(targetImage !== undefined) {
                // Image
                $targetZoom.css('background-image', `url(${targetImage})`);
                $.merge($zoomDiv, $targetZoom).removeClass('-video');
            } else {
                // Video
                $targetZoom.css('background-image', 'none');
                $.merge($zoomDiv, $targetZoom).addClass('-video');
            }
        });

        // Zoom
        $zoomDiv.on('mousemove', (e) => {
            const _this = e.currentTarget;
            $targetZoom.css({'background-position': ((e.pageX - $(_this).offset().left) / $(_this).width()) * 100 + '% ' + ((e.pageY - $(_this).offset().top) / $(_this).height()) * 100 + '%'});
        });

        // Bind image arrows: sr-only
        $mediaImagesArrows.children('.slick-arrow').on('click', () => {
            srClick = true;
        });

        // Bind Images: open big images - Lightbox
        $mediaImage.on('click', (e) => {
            const _this = e.currentTarget;
            const index = $(_this).parent().parent().data('slick-index');

            // Only on mobile and images (not on video)
            if(!$(_this).children('.m-prodMedia__video').length && $(window).width() <= 768) {
                $lightboxWrapper.css('display', 'block');
                $lightboxList.slick('slickGoTo', index);
                PROD_MEDIA_MODULE.pinch.start();
                PROD_MEDIA_MODULE.trapTabKey.images();
                $('body').addClass('-noScroll');
            }
        });
        // Bind ESC - close modal
        $mediaImage.on('keyup', (e) => {
            const key = e.which;
            const _this = e.currentTarget;
            // Enter key
            if(key === 13) $(_this).trigger('click');
        });

        // Bind close Big images - Lightbox
        $lightboxClose.off('click').on('click', () => {
            $('body').removeClass('-noScroll');
            $lightboxWrapper.css('display', 'none');
            PROD_MEDIA_MODULE.pinch.reset();
            PROD_MEDIA_MODULE.setFocus.toggleLightbox($lightbox);
        });
        // Close when press ESC key
        $(document).on('keyup', (e) => {
            const key = e.which;
            if(key === 27) $lightboxClose.click();
        });
    },
    pinch: {
        start: function() {
            $lightboxList.slick('refresh');
            $(imagesPinch).each((index, element) => {
                new PinchZoom(element, {
                    draggableUnzoomed: false,
                    lockDragAxis: true,
                    horizontalPadding: 40
                });

                // check height
                const pinchContainer = $(element).parent('.pinch-zoom-container');
                const pinchHeight = pinchContainer.height();
                const containerHeight = pinchContainer.parent('.m-prodMedia__lightboxImage').height();
                setTimeout(() => {
                    if(pinchHeight === 0) $(element).parent('.pinch-zoom-container').css('height', containerHeight);
                }, 100);
            });
        },
        reset: function() {
            $('.pinch-zoom-container img').unwrap();
            $(imagesPinch).each((index, element) => {
                $(element).css({
                    'transform-origin': '0% 0%',
                    'position': 'absolute',
                    'transform': 'scale(1, 1) translate(0px, 77.5px)'
                });
            });
        }
    },
    accessibility: function(slick) {
        const $slider = slick.$slider;
        const $currentSlide = $slider.find('.slick-slide.slick-current.slick-active');
        const $currVideoSlide = $currentSlide.find('.m-prodMedia__video');
        const $allVideosSlides = $slider.find('.m-prodMedia__video');
        const $ImagesBtnActive = $mediaImagesList.find('.slick-slide').find('.m-prodMedia__mediaItem');
        const $CurrImagesBtnActive = $mediaImagesList.find('.slick-slide.slick-current').find('.m-prodMedia__mediaItem');

        $allVideosSlides.attr('tabindex', '-1');

        // Thumbs
        const $thumbs = $mediaThumbs.find('.m-prodMedia__thumb');
        $thumbs.map((index, element) => {
            // Aria-label
            let ariaLabel = $(element).attr('aria-label');
            if(ariaLabel && ariaLabel.indexOf('Media') === -1) {
                const newAriaLabel = `${ariaLabel} - ${labels.media} ${index + 1} ${labels.of} ${$thumbs.length} ${labels.selected}/${labels.showing}`;
                $(element).attr('aria-label', newAriaLabel);
            }
        });

        PROD_MEDIA_MODULE.thumbsAda();
        $mediaThumbs.on('afterChange', () => {
            PROD_MEDIA_MODULE.thumbsAda();
        });

        if($currVideoSlide.length) {
            $currVideoSlide.attr('tabindex', '0');
        }
        // aria-label and role for the main image
        if($(window).width() <= 768) {
            $ImagesBtnActive.map((index, element) => {
                const altImg = $(element).children('img').attr('alt');
                if(typeof altImg !== 'undefined' && altImg.indexOf(labels.clickToZoom) === -1) {
                    $(element).attr('aria-label', `${altImg} ${labels.clickToZoom}`);
                    $(element).children('img').attr('alt', `${altImg} ${labels.clickToZoom}`);
                }
            });

            // add tabindex only on the images and not on the videos
            if(!$CurrImagesBtnActive.find('button').length) {
                $CurrImagesBtnActive.attr('tabindex', '0');
                $CurrImagesBtnActive.children('img').attr('tabindex', '-1');
                $CurrImagesBtnActive.children('img').attr('aria-hidden', 'true');
            }
        } else {
            $ImagesBtnActive.map((index, element) => {
                const altImg = $(element).children('img').attr('alt');
                if(typeof altImg !== 'undefined' && altImg.indexOf(labels.clickToZoom) > -1) {
                    $(element).attr('aria-label', altImg.replace(labels.clickToZoom, ''));
                    $(element).children('img').attr('alt', altImg.replace(labels.clickToZoom, ''));
                }
            });

            $CurrImagesBtnActive.attr('tabindex', '0');
            $ImagesBtnActive.removeAttr('aria-label');
            $CurrImagesBtnActive.children('img').removeAttr('tabindex');
            $CurrImagesBtnActive.children('img').attr('aria-hidden', 'false');
        }
    },
    thumbsAda: function() {
        const $thumbsVisibles = $mediaThumbs.find('.slick-slide.slick-active');
        const $thumbsTotal = $mediaThumbs.find('.slick-slide').length;
        let thumbsIndex = [];
        $thumbsVisibles.map((index, element) => {
            const indexThumb = parseInt($(element).attr('data-slick-index')) + 1;
            thumbsIndex.push(indexThumb);
        });
        const $slickNext = $('.m-prodMedia__actions.-thumbs').find('.slick-next');
        const $slickPrev = $('.m-prodMedia__actions.-thumbs').find('.slick-prev');
        let firstThumbAvailable = thumbsIndex[0];
        let lastThumbAvailable = thumbsIndex[thumbsIndex.length - 1];

        // Updating aria-label with a fallback
        function replaceLabel(target) {
            const labelReplaced = labels.count.replace('{0}', `${firstThumbAvailable}-${lastThumbAvailable}`).replace('{1}', $thumbsTotal);
            return (labelReplaced) ? `${target} - ${labels.showing} ${labelReplaced}` : '';
        }
        (labels.next) ? $slickNext.attr('aria-label', replaceLabel(labels.next)) : $slickNext.attr('aria-label', 'Next');
        (labels.prev) ? $slickPrev.attr('aria-label', replaceLabel(labels.prev)) : $slickNext.attr('aria-label', 'Previous');
    },
    trapTabKey: {
        images: function() {
            // Trap focus: looping through elements via TAB key
            const $arrowLeft = $lightbox.find('.m-prodMedia__arrows').children('.slick-prev');
            const $arrowRight = $lightbox.find('.m-prodMedia__arrows').children('.slick-next');
            const $closeBtn = $lightbox.find('.m-prodMedia__close');
            const focusableElements = [$arrowLeft, $arrowRight, $closeBtn];
            const firstEl = focusableElements[0];
            const lastEl = focusableElements[focusableElements.length - 1][0];

            firstEl.focus();
            PROD_MEDIA_MODULE.setFocus.toggleLightbox($lightbox, true);

            $(document).on('keydown', (e) => {
                const key = e.which;
                // Tab key
                if(key === 9) {
                    // SHIFT + TAB
                    if(e.shiftKey) {
                        if(document.activeElement === firstEl) {
                            e.preventDefault();
                            lastEl.focus();
                        }
                    // TAB
                    } else {
                        if(document.activeElement === lastEl) {
                            e.preventDefault();
                            firstEl.focus();
                        }
                    }
                }
            });
        }
    },
    setFocus: {
        toggleLightbox: function(el, open) {
            // All elements on page
            const { body } = document;
            let currentEl = el[0];
            do {
                const siblings = currentEl?.parentNode?.childNodes || [];
                siblings.forEach(sibling => {
                    if(sibling !== currentEl && sibling.setAttribute &&
                        $(sibling).attr('class') !== 'm-prodMedia__actions -lightbox' &&
                        $(sibling).attr('id') !== 'silktide-toolbar') {
                        if(open) {
                            $(sibling).attr('aria-hidden', 'true');
                        } else {
                            $(sibling).attr('aria-hidden', 'false');
                        }
                    }
                });
                currentEl = currentEl.parentNode;
            } while (currentEl !== body && currentEl !== null);

            // For lightbox
            if(open) {
                $lightboxWrapper.children('.m-prodMedia__lightbox').attr('aria-hidden', 'false');
            } else {
                $lightboxWrapper.children('.m-prodMedia__lightbox').attr('aria-hidden', 'true');
                PROD_MEDIA_MODULE.refreshSlick();
            }
        }
    }
};

// app ready
$(document).ready(() => {
    PROD_MEDIA_MODULE.onReady();
    window.refreshProdMedia = PROD_MEDIA_MODULE.onReady;
    window.unslickProdMedia = PROD_MEDIA_MODULE.unloadSlick;
});
