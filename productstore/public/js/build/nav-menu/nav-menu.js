import navigationStore from '../../vue/stores/modules/navigation';

const { actions: navigationActions, getters: navigationGetters } = navigationStore;

// Variables
const $navToggle = $('.m-navMenu__toggle');
const $navWrapper = $('.m-navMenu__content-wrapper');
const $navContent = $navWrapper.children('.m-navMenu__content');
const $navOverlay = $navWrapper.children('.m-navMenu__overlay');
const $navContentInner = $navContent.children('.m-navMenu__inner'); // Control the lvls visibility

const $MenuLevel1 = $('.m-navMenu__list.-lvl1');
const $MenuLevel2 = $('.m-navMenu__list.-lvl2');
const $MenuLevel3 = $('.m-navMenu__list.-lvl3');

const $buttonsLvl1 = $('.m-navMenu__item.-lvl1 a.m-navMenu__item-btn').not('.-closeButton');
const $buttonsLvl2 = $('.m-navMenu__item.-lvl2 a.m-navMenu__item-btn').not('.-closeButton');
const $buttonsLvl3 = $('.m-navMenu__item.-lvl3 a.m-navMenu__item-btn').not('.-closeButton');

const $closeBtnMobile = $navWrapper.children('.m-navMenu__close');
const $backButton = $('.m-navMenu__back').children('.m-navMenu__back-btn');

const mobileBreakpoint = 768;
const timeToHide = 300;
let $selectedMenuLvl1;
let $selectedMenuLvl2;
let $MenuLevel2Inner;
let $selectedHref = null;

let toggleOpenedClass = []; // Elements to toggle "-opened" class

// ADA
const $navLabel = $navToggle.attr('aria-label');
const $navDesktopLabel = $navToggle.data('label-escape-key');

const NAV_MENU_MODULE = {
    onReady: function() {
        toggleOpenedClass.push($navToggle, $navContent, $closeBtnMobile, $navOverlay, 'body');
        NAV_MENU_MODULE.cleaningIds();
        NAV_MENU_MODULE.toggleNavMenu();
        $navContent.removeClass('-left');
        NAV_MENU_MODULE.gtmTrack();

        // event listener to close the nav menu from vue component
        if(navigationGetters.onCloseNavMenu) {
            navigationGetters.onCloseNavMenu()(() => {
                if($navToggle.hasClass('-opened')) {
                    $navToggle.click();
                }
            });
        }
    },
    gtmTrack: function () {
        // GTM Track action: Nav links (all levels)
        $buttonsLvl1.on('click', (e) => {
            window.trackAction && window.trackAction({ id: 26, eL: $(e.target).text().trim() });
        });
        // GTM Track action: Opened menu.
        $navToggle.on('click', (e) => {
            window.trackAction && window.trackAction({ id: 23, eL: 'Hamburger' });
        });
    },
    cleaningIds: function() {
        const lvl1Itens = $MenuLevel1.children('li');
        const regxPattern = /[^A-z0-9]/g;

        // Level 1
        lvl1Itens.map((index, element) => {
            const $href = $(element).children('a').attr('href');

            if($href && $href.indexOf('#') === 0) {
                const regx = $href.replace(regxPattern, '');
                $(element).children('a').attr('href', `#${regx}`);
                $(element).children('a').attr('aria-controls', `#${regx}`);
            }
        });

        // Level 2
        $MenuLevel2.map((index, element) => {
            const id = $(element).attr('id');
            const regx = id.replace(regxPattern, '');

            // ID to the ul
            $(element).attr('id', `${regx}`);

            $(element).children('li').map((indexInner, elementInner) => {
                const $href = $(elementInner).children('a').attr('href');

                if($href && $href.indexOf('#') === 0) {
                    const regx = $href.replace(regxPattern, '');
                    $(elementInner).children('a').attr('href', `#${regx}`);
                    $(elementInner).children('a').attr('aria-controls', `#${regx}`);
                }
            });
        });

        // Level 3
        $MenuLevel3.map((index, element) => {
            const id = $(element).attr('id');
            const regx = id.replace(regxPattern, '');
            $(element).attr('id', `${regx}`);
        });
    },
    toggleNavMenu: function() {
        $navToggle.on('click', (e) => {
            if($navToggle.hasClass('-opened')) {
                NAV_MENU_MODULE.resetNavMenu();
                NAV_MENU_MODULE.accessibility.cancelFocus();
                $selectedHref = null;
            } else {
                window.scrollTo(0, 0);
                NAV_MENU_MODULE.listenerScroll();
                NAV_MENU_MODULE.accessibility.levelFocus(1, $MenuLevel1);
                // ADA
                (window.innerWidth < mobileBreakpoint) ? $navToggle.attr('aria-label', $navLabel) : $navToggle.attr('aria-label', `${$navLabel} - ${$navDesktopLabel}`);

                // fire event to notify child Vue components
                navigationActions.emitNavMenuExpanded();
            }

            toggleOpenedClass.forEach((element, index) => {
                $(element).toggleClass('-opened');
            });
        });

        // Esc key
        $(document).on('keyup', (e) => {
            if($navToggle.hasClass('-opened')) {
                const key = e.which;
                e.preventDefault();
                if(key === 27) $navToggle.click();
            }
        });

        NAV_MENU_MODULE.bind();
    },
    listenerScroll: function() {
        window.onscroll = function() {
            if($('body').hasClass('-opened') && window.pageYOffset > 0) {
                window.scrollTo(0, 0);
            }
        };
    },
    resetNavMenu: function() {
        setTimeout(() => {
            toggleOpenedClass.forEach((element, index) => {
                $(element).removeClass('-opened');
            });
            $navContentInner.removeClass('-lvl2');
            $navContentInner.removeClass('-lvl3');
            $MenuLevel2.removeClass('-opened');
            $MenuLevel3.removeClass('-opened');
            $MenuLevel2.children('.-lvl2').removeClass('-opened');
            $MenuLevel3.children('.-lvl3').removeClass('-opened');
            if($selectedMenuLvl1 !== undefined) {
                $selectedMenuLvl1.parent().removeClass('-opened');
            }
            if($selectedMenuLvl2 !== undefined) {
                $selectedMenuLvl2.parent().removeClass('-opened');
            }
            $MenuLevel1.scrollTop(0);
            $navToggle.focus();
            $navToggle.attr('aria-label', 'Toggle Main Navigation');
            NAV_MENU_MODULE.accessibility.hideAll();
        }, timeToHide);
    },
    bind: function() {
        let hideTimeOut;
        // Level 1 buttons
        $buttonsLvl1.on('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            clearInterval(hideTimeOut);

            // Storing the clicked button
            if($(e.currentTarget).parent().hasClass('-lvl1')) {
                $selectedMenuLvl1 = $(e.currentTarget);
                $selectedHref = $selectedMenuLvl1.attr('href');
            }

            // Follow url if there is a link
            if($selectedHref.indexOf('#') === -1) {
                window.location.href = $selectedHref;
                return false;
            }

            // Opening level 2
            $navContentInner.addClass('-lvl2');
            $MenuLevel2Inner = $selectedMenuLvl1.parent()
                .children('.m-navMenu__item-inner')
                .children('.m-navMenu__list.-lvl2');

            // Show relative item on Menu Level 2
            $MenuLevel2Inner.addClass('-opened');

            // Aria-expanded
            $selectedMenuLvl1.attr('aria-expanded', 'true');

            // Adding class to set ADA on mobile
            // All the parents need to have: aria-hidden= false
            $selectedMenuLvl1.parent().addClass('-opened');

            // ARIA on Level 2
            NAV_MENU_MODULE.accessibility.levelFocus(2, $selectedHref);
        });

        // Level 2 buttons
        $buttonsLvl2.on('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            clearInterval(hideTimeOut);

            // Storing the clicked button
            if($(e.currentTarget).parent().hasClass('-lvl2')) {
                $selectedMenuLvl2 = $(e.currentTarget);
                $selectedHref = $selectedMenuLvl2.attr('href');
            }

            // Follow url if there is a link
            if($selectedHref.indexOf('#') === -1) {
                window.location.href = $selectedHref;
                return false;
            }

            // Opening level 3
            $navContentInner.addClass('-lvl3');

            // Aria-expanded
            $selectedMenuLvl2.attr('aria-expanded', 'true');

            // Adding class to set ADA on mobile
            // All the parents need to have aria-hidden false
            $selectedMenuLvl2.parent().addClass('-opened');

            // Show relative item on Menu Level 3
            const $MenuLevel3Inner = $selectedMenuLvl2.parent()
                .children('.m-navMenu__list.-lvl3');

            // Show relative item on Menu Level 2
            $MenuLevel3Inner.addClass('-opened');

            // ARIA on Level 3
            NAV_MENU_MODULE.accessibility.levelFocus(3, $selectedHref);
        });

        // Level 3 buttons
        $buttonsLvl3.on('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            let $selectedMenuLvl3 = $(e.currentTarget);
            window.location.href = $selectedMenuLvl3.attr('href');
        });

        // Back button
        $backButton.on('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            clearInterval(hideTimeOut);

            const $selectedBackButton = $(e.currentTarget);

            // Level 2 --
            if($selectedBackButton.hasClass('-lvl2')) {
                // Back to level 1
                $navContentInner.removeClass('-lvl2');

                // Aria-expanded
                $selectedMenuLvl1.attr('aria-expanded', 'false');

                // Removing class
                $selectedMenuLvl1.parent().removeClass('-opened');

                // ARIA on Level 1
                NAV_MENU_MODULE.accessibility.levelFocus(1, $MenuLevel1);

                // Focus after the animation
                hideTimeOut = setTimeout(() => {
                    $selectedMenuLvl1.focus();
                    $('.m-navMenu__list.-lvl2').removeClass('-opened');
                }, timeToHide);
            }

            // Level 3 --
            if($selectedBackButton.hasClass('-lvl3')) {
                // Back to level 2
                $navContentInner.removeClass('-lvl3').addClass('-lvl2');

                // Aria-expanded
                $selectedMenuLvl2.attr('aria-expanded', 'false');

                // Removing class - ADA
                $selectedMenuLvl2.parent().removeClass('-opened');

                // ARIA on Level 2
                NAV_MENU_MODULE.accessibility.levelFocus(2, $MenuLevel2Inner);

                hideTimeOut = setTimeout(() => {
                    $selectedMenuLvl2.focus();
                    $('.m-navMenu__list.-lvl3').removeClass('-opened');
                }, timeToHide);
            }
        });

        // Close Menu m-navMenu__overlay -opened
        $.merge($('.m-navMenu__close-btn'), $('.m-navMenu__overlay')).on('click', () => {
            $navToggle.click();
        });
    },
    accessibility: {
        hideAll: function() {
            const elementsToHide = [$MenuLevel1, $MenuLevel2, $MenuLevel3];
            elementsToHide.map((element, index) => {
                $(element).attr('aria-hidden', 'true');
                $(element).attr('tabindex', '-1');
                $(element).children(`.m-navMenu__item`).attr('aria-hidden', 'true');
                $(element).children(`.m-navMenu__item`).children('.m-navMenu__item-btn').attr('tabindex', '-1');
                $(`.m-navMenu__back-btn.-lvl${index + 1}`).attr('tabindex', '0');
                // Mobile
                $(element).find('.m-navMenu__list').children('.m-navMenu__item.-mobile').children('.m-navMenu__item-btn').attr('tabindex', '-1');
            });
            $closeBtnMobile.children('.m-navMenu__close-btn').attr('tabindex', '-1');
            $navToggle.attr('aria-expanded', 'false');
            $navWrapper.attr('aria-hidden', 'true');
            $navWrapper.attr('tabindex', '-1');
            $backButton.attr('tabindex', '-1');

            // Fake close buttons
            $(`.m-navMenu__item-btn.m-navMenu__close-btn.-lvls.-lvl1`).attr('tabindex', '-1');
            $(`.m-navMenu__item-btn.m-navMenu__close-btn.-lvls.-lvl2`).attr('tabindex', '-1');
            $(`.m-navMenu__item-btn.m-navMenu__close-btn.-lvls.-lvl3`).attr('tabindex', '-1');
            $('.m-navMenu__close.-root').removeClass('-focused');
            this.cancelFocus();
        },
        levelFocus: function(levelNumber, idItem) {
            let level = `#m-navMenu__lvl${levelNumber}`;

            // On level 1 we have separate elements. Get the parent.
            if(levelNumber === 1) {
                level = $('.m-navMenu__scroll');
                $('.m-navMenu__item-inner').attr('aria-hidden', 'true');
            }

            // Reset
            this.hideAll();

            // Main toggle button
            $navToggle.attr('aria-expanded', 'true');
            $navWrapper.attr('aria-hidden', 'false');
            $navWrapper.attr('tabindex', '0');

            // Close Button
            $closeBtnMobile.children('.m-navMenu__close-btn').removeAttr('tabindex');

            // Focus on level and item
            $(level).removeAttr('aria-hidden');
            $(level).removeAttr('tabindex');
            $(idItem).removeAttr('aria-hidden');
            $(idItem).removeAttr('tabindex');
            $(idItem).children(`.m-navMenu__item.-lvl${levelNumber}`).attr('aria-hidden', 'false');
            $(idItem).children(`.m-navMenu__item.-lvl${levelNumber}`).children('.m-navMenu__item-btn').attr('tabindex', '0');
            $(`.m-navMenu__back-btn.-lvl${levelNumber}`).attr('tabindex', '0');

            // Mobile
            $(idItem).children('.m-navMenu__item.-mobile').children('.m-navMenu__item-btn').removeAttr('tabindex');
            if(window.innerWidth < mobileBreakpoint) {
                $('.m-navMenu__list.-lvl1').attr('aria-hidden', 'false');
                $('.m-navMenu__list.-lvl2').attr('aria-hidden', 'false');
                $(idItem).parent().parent().attr('aria-hidden', 'false');
            }

            if(typeof idItem === 'undefined') idItem = level;

            // Fake close button
            $(`.m-navMenu__item-btn.m-navMenu__close-btn.-lvls.-lvl${levelNumber}`).attr('tabindex', '0');

            // Trap tab key
            // Focus on the First element, after animation
            setTimeout(() => {
                // Removing bind (tab-key) and trapping the level
                $navWrapper.off('keydown');
                if(levelNumber === 1) {
                    this.trapFocus(levelNumber, level);
                } else {
                    this.trapFocus(levelNumber, idItem);
                }
            }, timeToHide);
        },
        trapFocus: function(levelNumber, level) {
            // Trap focus: looping through elements via TAB key
            let focusableElements = $(level).find('a[href], area[href], input, select, textarea, button, iframe, object, embed, *[tabindex], *[contenteditable]').not('[tabindex=-1], [disabled], :hidden');
            let firstEl = focusableElements[0];
            let lastEl = focusableElements[focusableElements.length - 1];

            // Focus element
            if(levelNumber === 1 && !$selectedHref) {
                // First level, focus on close button
                lastEl.focus();
                $('.m-navMenu__close.-root.-opened').addClass('-focused');
            } else {
                // Other levels, focus on back button
                firstEl.focus();
            }

            $navWrapper.on('keyup', (e) => {
                if(document.activeElement === lastEl) {
                    document.querySelector('.m-navMenu__scroll').scrollTo(0, 0);
                    $('.m-navMenu__close.-root.-opened').addClass('-focused');
                } else {
                    $('.m-navMenu__close.-root.-opened').removeClass('-focused');
                }
            });

            $navWrapper.on('keydown', (e) => {
                const key = e.which;
                // Tab key
                if(key === 9) {
                    // SHIFT + TAB
                    if(e.shiftKey) {
                        if(document.activeElement === firstEl) {
                            e.preventDefault();
                            e.stopPropagation();
                            lastEl.focus();
                        }
                    // TAB
                    } else {
                        if(document.activeElement === lastEl) {
                            e.preventDefault();
                            e.stopPropagation();
                            firstEl.focus();
                        }
                    }
                }
            });

            if(levelNumber === 1) {
                this.toggleLightbox($('.m-navMenu__scroll'), true);
            } else {
                this.toggleLightbox($(level), true);
            }
        },
        toggleLightbox: function(el, open) {
            // All elements on page
            const { body } = document;
            let currentEl = el[0];
            do {
                const siblings = currentEl.parentNode.childNodes;
                for (let i = 0; i < siblings.length; i++) {
                    const sibling = siblings[i];
                    if(sibling !== currentEl && sibling.setAttribute &&
                        $(sibling).attr('class') !== 'm-navMenu__content-wrapper' &&
                        $(sibling).attr('class') !== 'm-navMenu__item -lvl1 -opened' &&
                        $(sibling).attr('class') !== 'm-navMenu__item -lvl2 -opened' &&
                        // $(sibling).attr('id') !== 'silktide-toolbar') &&
                        $(sibling).attr('class') !== 'm-navMenu__close -opened') {
                        if(open) {
                            $(sibling).attr('data-old-aria-hidden', sibling.ariaHidden || 'null');
                            $(sibling).attr('aria-hidden', 'true');
                            $(sibling).attr('data-old-tabindex', sibling.tabindex || 'null');
                            $(sibling).attr('tabindex', '-1');
                        } else {
                            $(sibling).attr('aria-hidden', 'false');
                            $(sibling).attr('tabindex', '0');
                        }
                    } else {
                        $(sibling).attr('aria-hidden', 'false');
                    }
                }
                currentEl = currentEl.parentNode;
            } while (currentEl !== body);
        },
        cancelFocus: function() {
            const elsToReset = $('[data-old-aria-hidden]');
            for (let i = 0; i < elsToReset.length; i++) {
                const el = elsToReset[i];

                // Aria-hidden
                const ariaHiddenVal = el.getAttribute('data-old-aria-hidden');
                if(ariaHiddenVal === 'null') {
                    el.removeAttribute('aria-hidden');
                } else {
                    el.setAttribute('aria-hidden', ariaHiddenVal);
                }
                el.removeAttribute('data-old-aria-hidden');

                // Tabindex
                const tabindexVal = el.getAttribute('data-old-tabindex');
                if(tabindexVal === 'null') {
                    el.removeAttribute('tabindex');
                } else {
                    el.setAttribute('tabindex', tabindexVal);
                }
                el.removeAttribute('data-old-tabindex');
            }
        }
    }
};

// app ready
$(document).ready(NAV_MENU_MODULE.onReady);
