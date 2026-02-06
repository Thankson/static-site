<template>
    <modal :id="modalId" :width="viewportWidth < 768 ? '304px' : '390px'">
        <div class="m-shoplistsAlreadyInListModal" :class="{'-isCn':isCn}">
            <h2
                id="global-modal-heading"
                class="m-shoplistsAlreadyInListModal__title"
                v-html="modalLabels.title">
            </h2>

            <div class="m-shoplistsAlreadyInListModal__footer">
                <a
                    class="m-shoplistsAlreadyInListModal__button a-button -white"
                    :href="modalLabels.goToListLink()">
                    {{ modalLabels.goToList }}
                </a>
                <button
                    class="m-shoplistsAlreadyInListModal__button a-button -green"
                    @click="close(modalId)">
                    {{ modalLabels.close }}
                </button>
            </div>
        </div>
    </modal>
</template>

<script>
    export default {
        name: 'MShoplistsAlreadyInListModal',
        props: {
            list: {
                type: Object,
                default() {
                    return {};
                }
            },
            localization: {
                type: Object,
                default() {
                    return {};
                }
            },
            modalId: {
                type: String,
                default: 'modal-item-already-in-list'
            }
        },
        data() {
            return {
                viewportWidth: 0
            };
        },
        computed: {
            modalLabels() {
                return {
                    title: (this.localization?.Labels?.ItemAlreadyExists || 'This item already exists in') +
                        (this.isCn ? ' ' : '<span class="italic"> ') + this.list.listName + (this.isCn ? '' : '</span>'),
                    goToList: this.localization?.Labels?.GoToList || 'Go to list',
                    close: this.localization?.Labels?.Close || 'Close',
                    goToListLink: () => {
                        let link = '/';

                        if(this.localization?.Data?.ListsPage?.Url) {
                            link = this.localization.Data.ListsPage.Url + '?listId=' + this.list.listId;
                        }

                        return link;
                    }
                };
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        created() {
            // Viewport
            this.setViewport();

            // Create resize listener
            window.addEventListener('resize', this.resize);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.resize);
        },
        mounted() {
            this.$modal.$on.hidden(() => {
                this.$emit('adding-list-hide', true);
            });
        },
        methods: {
            open(modalId) {
                this.$modal.show({ id: modalId });
            },
            close(modalId) {
                this.$modal.hide({ id: modalId });
            },
            resize() {
                this.setViewport();
            },
            setViewport() {
                this.viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            }
        }
    };
</script>
