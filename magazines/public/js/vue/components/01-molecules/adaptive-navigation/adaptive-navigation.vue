<template>
    <nav ref="headerMenuRef" class="m-adaptiveNavigation" :style="`width: ${headerMenuWidth};`">
        <ul ref="headerNavRef" class="m-adaptiveNavigation__list">
            <li
                v-for="nav in navs" :key="nav.Text"
                class="m-adaptiveNavigation__navItem -inline"
                :class="{'-active': nav.IsCurrent}"
            >
                <a :href="nav.Link">{{ nav.Text }}</a>
            </li>

            <li
                v-show="hasMore"
                ref="moreMenuRef"
                class="m-adaptiveNavigation__navItemMore" :class="{'-active': showMorePanel}"
                @mouseenter="showMorePanel = true"
                @mouseleave="showMorePanel = false"
            >
                <button
                    ref="moreBtnRef"
                    class="m-adaptiveNavigation__navItemMoreCta"
                    aria-haspopup="menu"
                    aria-controls="nav-dropdown-menu-more"
                    tabindex="0"
                    @click.stop="showMorePanel = !showMorePanel"
                >
                    {{ getLocalizationProp('Labels.LoadMore', 'More') }}
                    <span class="m-adaptiveNavigation__navItemMoreCtaIcon ml-5" aria-hidden="true">&gt;</span>
                </button>

                <ul id="nav-dropdown-menu-more" ref="moreNavRef" class="m-adaptiveNavigation__navItemDropdown">
                    <li
                        v-for="nav in moreNavs" :key="nav.Text"
                        class="m-adaptiveNavigation__navItem -fold"
                        :class="{'-active': nav.IsCurrent}"
                    >
                        <a :href="nav.Link">{{ nav.Text }}</a>
                    </li>
                </ul>
            </li>
        </ul>
    </nav>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'MAdaptiveNavigation',
        mixins: [ localizationMixin],
        data() {
            return {
                headerMenu: null,
                headerNav: null,
                moreMenu: null,
                moreNav: null,
                moreBtn: null,
                showMorePanel: false,
                headerMenuWidth: '',
                navs: [],
                moreNavs: []
            };
        },
        computed: {
            hasMore() {
                return this.moreNavs.length > 0;
            }
        },
        mounted () {
            this.$nextTick(() => {
                this.init();
            });
        },
        methods: {
            init() {
                this.navs = this.getLocalizationProp('Data.Navs', []);

                this.headerMenu = this.$refs.headerMenuRef;
                this.headerNav = this.$refs.headerNavRef;
                this.moreMenu = this.$refs.moreMenuRef;
                this.moreNav = this.$refs.moreNavRef;
                this.moreBtn = this.$refs.moreBtnRef;

                const maxWidth = this.getAdaptiveNavMaxWidth();
                const headerMenuMarginSize = this.getElHorizontalMarginSize(this.headerNav);
                this.headerMenuWidth = `calc(100% - ${maxWidth}px - ${headerMenuMarginSize}px)`;

                this.$nextTick(() => {
                    this.adjustMoreNav();
                });
                this.resize();
            },
            resize() {
                window.addEventListener('resize', this.adjustMoreNav);
                this.$once('hook:beforeDestroy', () => window.removeEventListener('resize', this.adjustMoreNav));
            },
            adjustMoreNav() {
                let childNumber = 2;
                let windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                if(windowWidth >= 760) {
                    const headerMenuWidth = this.headerMenu.offsetWidth;
                    const headerNavWidth = this.headerNav.offsetWidth;
                    if(headerNavWidth > headerMenuWidth && this.navs.length > 1) {
                        this.moreNavs.unshift(this.navs.splice(this.navs.length - childNumber + 1, 1)[0]);
                        this.$nextTick(() => {
                            this.adjustMoreNav();
                        });
                    } else if(this.hasMore) {
                        const moreFirstWidth = this.moreNav.querySelector('li:first-child').offsetWidth;
                        if(headerNavWidth + moreFirstWidth < headerMenuWidth) {
                            this.navs.push(this.moreNavs.shift());
                            this.$nextTick(() => {
                                this.adjustMoreNav();
                            });
                        }
                    }
                    if(this.hasMore) {
                        childNumber = 2;
                    } else {
                        childNumber = 1;
                    }
                }
            },
            getElHorizontalMarginSize(el) {
                const computedStyle = window.getComputedStyle(el, null);
                const marginLeft = parseFloat(computedStyle.marginLeft);
                const marginRight = parseFloat(computedStyle.marginRight);
                return marginLeft + marginRight;
            },
            getElOuterWidth(el) {
                return el.offsetWidth + this.getElHorizontalMarginSize(el);
            },
            getAdaptiveNavMaxWidth() {
                let navSpredSpace = 0;
                const headerMenuSiblings = this.headerMenu.parentNode.childNodes;
                for (let i = 0; i < headerMenuSiblings.length; i++) {
                    const el = headerMenuSiblings[i];
                    if(el !== this.headerNav && el.nodeType === Node.ELEMENT_NODE) {
                        navSpredSpace += this.getElOuterWidth(el);
                    }
                }
                return navSpredSpace;
            }
        }
    };
</script>
