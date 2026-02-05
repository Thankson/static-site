<template>
    <button class="m-historyShelf" @click="openShelf">
        <div class="m-historyShelf__wrapper">
            <img class="m-historyShelf__img" :src="getLocalizationProp('Data.IconSrc')" :alt="historyText">
            <span class="m-historyShelf__desc">{{ historyText }}</span>
        </div>
        <shelf>
            <template v-slot:default>
                <div class="m-historyShelf__content">
                    <div class="m-historyShelf__header">{{ headerTitle }}</div>

                    <div class="m-historyShelf__bookList">
                        <a v-for="book in books" :key="book.Title" :href="book.Link" class="m-historyShelf__bookItem">
                            <div class="m-historyShelf__bookCover">
                                <img :src="book.Cover" :alt="book.Title">
                            </div>
                            <div class="m-historyShelf__bookTitle">{{ book.Title }}</div>
                        </a>
                    </div>
                </div>
            </template>
        </shelf>
    </button>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    export default {
        name: 'MHistoryShelf',
        mixins: [ localizationMixin],
        computed: {
            books() {
                return this.localization?.Data?.Issues || [];
            },
            headerTitle() {
                return this.localization?.Data?.Title || 'History Issues';
            },
            historyText() {
                return this.getLocalizationProp('Data.IconText', 'history');
            }
        },
        mounted() {
        },
        methods: {
            openShelf() {
                this.$shelf.show();
            }
        }
    };
</script>
