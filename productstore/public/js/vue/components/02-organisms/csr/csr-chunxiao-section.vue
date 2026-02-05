<template>
    <section class="o-acctCardSection -isCn">
        <h4 class="o-acctCardSection__title">{{ getLocalizationProp('Labels.SectionTitle') }}</h4>

        <ul class="o-acctCardSection__list">
            <li v-for="(news, index) in chunxiaoNews" :key="index" class="o-acctCardSection__col">
                <div v-if="loadAll || (index + 1 <= currentStart * perList)" class="m-acctCard">
                    <div class="m-acctCard__card">
                        <div v-html="news.Content"></div>
                    </div>
                </div>
            </li>
        </ul>

        <div v-if="!loadAll" class="block text-center">
            <button v-if="currentStart * perList < totalNumber" class="a-button -outline justify-center px-40 text-center text-base md:mt-30" @click="getChunxiaoNews()">
                {{ getLocalizationProp('Data.AddNewButton.Text') }}
            </button>
        </div>
    </section>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'CsrChunxiaoSection',
        mixins: [ localizationMixin ],
        data() {
            return {
                loadAll: false,
                chunxiaoNews: null,
                totalNumber: 0,
                currentStart: 1,
                perList: 8
            };
        },
        mounted() {
            this.loadAll = this.getLocalizationProp('Data.LoadAll');
            this.totalNumber = this.getLocalizationProp('Data.TotalNumber');
            this.chunxiaoNews = this.getLocalizationProp('Data.ChunxiaoNews');
        },
        methods: {
            getChunxiaoNews() {
                if(Math.ceil(this.totalNumber / this.perList) > this.currentStart) {
                    this.currentStart++;
                    this.chunxiaoNews = this.getLocalizationProp('Data.ChunxiaoNews');
                }
            }
        }
    };
</script>
