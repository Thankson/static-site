<template>
    <div class="o-dsCommit">
        <m-signup-contract script-id="" :check-box="checkboxes" :check-read="true" v-on:stepEvent="goToNextStep">
            <template v-slot:contract-title>
                <m-form-title :title="getLocalizationProp('Data.DSAgreementTitle')"></m-form-title>
            </template>
            <template v-slot:ContractTerms>
                <div v-html="getLocalizationProp('Data.ContractTerms')"></div>
            </template>
            <template v-slot:checkTermsError>
                <p class="e-formError__item" role="alert" v-html="getLocalizationProp('Labels.ErrorTermUnchecked')"></p>
            </template>
            <template v-slot:checkReadError>
                <p class="e-formError__item" role="alert" v-html="getLocalizationProp('Labels.ErrorTermReadAll')"></p>
            </template>
            <template v-slot:ContractTip>
                <div class="text-xs text-gray-100 pt-6 pb-16">{{ contractTip }}</div>
            </template>
            <template v-slot:btnLabel>
                {{ getLocalizationProp('Labels.Continue') }}
            </template>
        </m-signup-contract>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ODsCommit',
        mixins: [ localizationMixin],
        data() {
            return {
                checkboxes: []
            };
        },
        computed: {
            contractTip() {
                return (this.getLocalizationProp('Labels.ContractTip') || '').replace('{0}', this.getLocalizationProp('Labels.Continue'));
            }
        },
        created() {
            // ...
        },
        mounted() {
            this.checkboxInit();
        },
        methods: {
            checkboxInit() {
                let checkboxItem01 = this.getLocalizationProp('Labels.TermAgree');
                let checkboxItem02 = this.getLocalizationProp('Labels.TermGuarantee');
                this.checkboxes = [{
                    'checked': false,
                    'label': checkboxItem01,
                    'name': 'TermAgree',
                    'required': true
                }, {
                    'checked': false,
                    'label': checkboxItem02,
                    'name': 'TermGuarantee',
                    'required': true
                }];
                // todolist: go to next step
            },
            goToNextStep() {
                console.log('ds-commit step event');
                // ...
            }
        }
    };
</script>
