<template>
    <div class="m-updateInvoiceTitle">
        <h3 v-if="!editing" class="m-updateInvoiceTitle__title">{{ labels.title }} : {{ curInvoiceTitle }}</h3>
        <button
            v-if="!editing"
            ref="showFormButton"
            type="button"
            class="m-updateInvoiceTitle__change"
            @click="[editing = true, $emit('update-title',true), gtmTrackAction({id: 243}, $event)]"
        >
            {{ labels.change }}
        </button>

        <form v-if="editing" class="m-updateInvoiceTitle__editor" @submit="updateInvoiceTitle">
            <div v-for="(item, index) in invoiceTitles" :key="index" class="m-updateInvoiceTitle__radio">
                <m-radio v-model="selectedIndex" name="CheckoutPaymentMethod" :input-value="item.InvoiceTitleType" mods="flex-1" label-mods="">
                    <span class="m-updateInvoiceTitle__label">
                        {{ item.Title }}
                    </span>
                </m-radio>
            </div>
            <div class="m-updateInvoiceTitle__submit">
                <button class="a-button -full" :class="{ '-disabled -disabled -isCn': selectedIndex === curInvoiceType }" type="submit" @click="gtmTrackAction({id: 242}, $event)">
                    {{ labels.submit }}
                </button>
            </div>
        </form>
    </div>
</template>

<script>
    import api from '@api/routes/account/updateinvoicetype';

    export default {
        name: 'UpdateInvoiceTitle',
        props: {
            labels: {
                type: Object,
                default() {
                    return {};
                }
            },
            curInvoiceTitle: {
                type: String,
                default: ''
            },
            curInvoiceType: {
                type: String,
                default: ''
            },
            invoiceTitles: {
                type: Array,
                default() {
                    return [];
                }
            }
        },

        data() {
            return {
                editing: false,
                error: '',
                updated: false,
                selectedIndex: ''
            };
        },

        watch: {
            editing(newVal) {
                this.error = '';
                if(newVal) {
                    this.updated = false;
                }
            }
        },

        mounted() {
            setTimeout(() => {
                this.selectedIndex = this.curInvoiceType;
            }, 500);
        },

        methods: {
            cancelEdit() {
                this.editing = false;
                this.$emit('update-title', this.editing);
                this.$nextTick(() => this.$refs['showFormButton']?.focus());
            },
            async updateInvoiceTitle(event) {
                event.preventDefault();
                if(this.selectedIndex === this.curInvoiceType) return false;
                const invoicetype = this.selectedIndex;
                const response = await api.put({ InvoiceType: invoicetype });
                if(response.success) {
                    this.editing = false;
                    this.$emit('update-title', this.editing);
                    this.updated = true;
                    this.error = '';
                    this.$nextTick(() => this.$refs['showFormButton']?.focus());
                }
            }
        }
    };
</script>
