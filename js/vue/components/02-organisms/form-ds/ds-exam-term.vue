<template>
    <div class="o-dsExamTerm">
        <m-form-title title="Training"></m-form-title>

        <div class="o-dsExamTerm__fields">
            <m-documents
                v-if="documentsProcessed.length"
                v-model="documentsStatus"
                class="o-dsExamTerm__detail"
                :catalog="catalog"
                :documents="documentsProcessed"
                :script-id="scriptId"
            ></m-documents>
        </div>

        <m-checkbox
            v-model="term"
            class="mt-16"
            size="sm"
            name="examTerm"
            :label="getLocalizationProp('Labels.ConfirmRead')"
        >
        </m-checkbox>
        <!-- TODO -->
        <!-- <span v-if="isUploadPhotosTermError">请选择</span> -->

        <v-button
            class="-full mt-30"
            @click="submitPartialForm">
            {{ getLocalizationProp('Labels.Continue') }}
        </v-button>
    </div>
</template>

<script>
    import { mapActions } from 'vuex';
    import uniqid from 'uniqid';
    import { validationMixin } from 'vuelidate';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ODsExamTerm',
        mixins: [ localizationMixin, validationMixin],
        validations() {
            return {
                documentsStatus: {
                    validDocumentsStatus: (value) => {
                        return value.every(item => item.valid);
                    }
                },
                term: {
                    required: () => {
                        return this.term;
                    }
                }
            };
        },
        props: {
            scriptId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                documentsStatus: [],
                term: false
            };
        },
        computed: {
            catalog() {
                return this.getLocalizationProp('Data.TrainingMaterialsCatalog');
            },
            documents() {
                return this.getLocalizationProp('Data.TrainingDocuments', []);
            },
            documentsProcessed() {
                return this.documents.map(document => ({...document, Name: uniqid()}));
            }
        },
        methods: {
            ...mapActions('dsApp', ['showExamQuestionOnly']),
            submitPartialForm() {
                this.$v.$touch();
                if(this.$v.$invalid) return;

                this.showExamQuestionOnly();
            }
        }
    };
</script>
