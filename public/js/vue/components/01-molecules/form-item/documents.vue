<template>
    <div class="m-documents">
        <div ref="documentCatalogRef" class="m-documents__catalog" v-html="catalogDisplay"></div>
        <modal
            v-for="(m, index) in documents" :id="`${m.Name}`"
            :key="m.Name"
            :ref="`${m.Name}ModalRef`"
            :prevent-close="!validateResult[index]?.valid"
        >
            <div :key="`${m.Name}Content`" class="m-documents__modalContent">
                <h2
                    v-if="m.Title"
                    class="m-documents__modalTitle"
                >
                    {{ m.Title }}
                </h2>
                <div :ref="`${m.Name}ScrollRef`" class="m-documents__scroll" @scroll="handleScroll(m, index)">
                    <div class="m-rte pr-16" v-html="m.Details"></div>
                </div>
                <m-tip :text="getLocalizationProp('Labels.PleaseReadAllTip')" class="mt-16"></m-tip>
                <v-button
                    :ref="`${m.Name}ModalCtaBtnRef`"
                    :disabled="!validateResult[index]?.valid"
                    class="m-documents__ctaBtn -full mt-16"
                    @click="closeModal(m.Name)"
                >
                    {{ getLocalizationProp('Labels.CompleteReading') }}
                </v-button>
            </div>
        </modal>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'MDocuments',
        mixins: [ localizationMixin],
        props: {
            scriptId: {
                type: String,
                default: ''
            },
            value: {
                type: Array,
                default: () => ([])
            },
            catalog: {
                type: String,
                default: ''
            },
            documents: {
                type: Array,
                default: () => ([])
            }
        },
        data() {
            return {
                validateResult: [],
                validateResultFromStorage: []
            };
        },
        computed: {
            catalogDisplay() {
                return this.documents.reduce((cate, placeholder, index) => {
                    const calcPlaceholder = `<a href="#" class="example-cta" data-id="${placeholder.Name}" data-index="${index}">${placeholder.Title}</a>`;
                    return cate.replace(`{${index}}`, calcPlaceholder);
                }, this.catalog);
            }
        },
        watch: {
            validateResult(newValue) {
                this.$emit('input', newValue);
            }
        },
        mounted () {
            // TODO 从local storage 里读取条例是否读过
            // this.validateResultFromStorage = [
            //     {valid: true},
            //     {valid: true}
            // ];
            this.$nextTick(() => {
                this.initValidateResult();
                this.bindTermsLink();
            });
        },
        methods: {
            openModal(id) {
                this.$modal.show({id});
            },
            closeModal(id) {
                this.$modal.hide({id});
            },
            bindTermsLink() {
                this.$refs.documentCatalogRef.addEventListener('click', (event) => {
                    const id = event.target.dataset.id;
                    if(id) {
                        this.openModal(id);

                        setTimeout(() => {
                            const index = event.target.dataset.index;
                            this.handleScroll({Name: id}, index);
                        }, 100);
                    }
                    return false;
                });
            },
            initValidateResult() {
                this.documents.forEach((document, index) => {
                    const validFromStorage = this.validateResultFromStorage[index]?.valid;
                    this.validateResult.push({
                        valid: typeof validFromStorage === 'boolean' ? validFromStorage : document.IsRequired === false
                    });
                });
            },
            changeModalCtaBtnDisableMode(document, disable = false) {
                const modalCtaBtnRef = `${document.Name}ModalCtaBtnRef`;

                this.$refs[modalCtaBtnRef][0].$el.disabled = disable;
                this.$refs[modalCtaBtnRef][0].$el.classList.remove('-disabled');
            },
            handleScroll(document, index) {
                // if(!document.IsRequired) return;
                if(this.validateResult[index]?.valid) return;

                const name = document.Name;
                const scrollRef = `${name}ScrollRef`;
                const scrollContainer = this.$refs[scrollRef][0];
                const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

                if(scrollTop + clientHeight >= scrollHeight - 20) {
                    this.$set(this.validateResult[index], 'valid', true);
                    // TAG validateResult[index]?.valid is not reactive in modal component
                    // const modalRef = `${name}ModalRef`;
                    // this.$refs[modalRef][0].$forceUpdate();
                    this.changeModalCtaBtnDisableMode(document, false);
                }
            }
        }

    };
</script>
