<template>
    <p v-if="formattedName || typeOrStatus" ref="cust-name" class="a-custNameStatus">
        <span v-if="formattedName" class="a-custNameStatus__name" :title="showTitle ? formattedName : '' ">{{ greeting }}</span>
        <span v-if="typeOrStatus" class="a-custNameStatus__status">, {{ typeOrStatus }}</span>
        <span class="pl-3 font-thin">|</span>
    </p>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import replaceToken from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'ACustNameStatus',
        mixins: [ localizationMixin ],
        data() {
            return {
                nameArea: null
            };
        },
        computed: {
            formattedName() {
                return this.$custInfo?.formattedName;
            },
            showTitle() {
                return this.nameArea && this.nameArea.offsetWidth < this.nameArea.scrollWidth;
            },
            typeOrStatus() {
                return this.$custInfo?.status;
            },
            greeting() {
                return this.localization?.Labels?.Greeting ? this.formattedName + this.localization?.Labels?.Greeting : this.formattedName;
            }
        },
        async mounted() {
            this.$nextTick(function() {
                this.nameArea = this.$refs['cust-name'];
            });
        },
        methods: {
            replaceToken
        }
    };
</script>
