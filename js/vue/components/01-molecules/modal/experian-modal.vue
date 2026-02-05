<template>
    <modal id="m-experianModal" heading-class="m-experianModal__heading" width="460px">
        <template v-slot:heading>
            {{ verifyAddressLabel }}
        </template>

        <template v-slot:body>
            <div class="m-experianModal__body">
                <span
                    class="m-experianModal__title"
                    :class="{'-system': !hasAddressSuggestionList || !canSelectAddressEntered}">
                    {{ addressEnteredLabel }}
                </span>

                <div
                    v-if="hasAddressSuggestionList"
                    class="m-experianModal__suggestions">

                    <!-- Address entered -->
                    <component
                        :is="canSelectAddressEntered ? 'm-radio' : 'div'"
                        v-model="radioSelectedIndex"
                        name="verifyAddress"
                        class="m-experianModal__radio"
                        :label-mods="isMarketplace ? '-blue' : ''"
                        :input-value="0"
                        mods="w-auto flex-1"
                    >

                        <span v-html="addressEnteredFormatted" />
                    </component>
                    <div v-if="!canSelectAddressEntered" class="italic text-gray-100 pt-10 pb-15">{{ problemWithAddressLabel }}</div>
                    <span
                        class="m-experianModal__title -suggested"
                        :class="{'-system': !hasAddressSuggestionList}">
                        {{ suggestedLabel }}
                    </span>

                    <!-- Suggestions -->
                    <m-radio
                        v-for="(item, index) in addressList.slice(0, 3)"
                        :key="index"
                        v-model="radioSelectedIndex"
                        name="verifyAddress"
                        :input-value="index + 1"
                        :label-mods="isMarketplace ? '-blue pb-30' : 'pb-30'"
                        mods="w-auto flex-1"
                    >
                        <span v-html="formattedAddress(item.textFormatted || item.text || item.suggestion)" />
                    </m-radio>
                </div>
                <div
                    v-else
                    class="m-experianModal__system">

                    <span v-html="addressEnteredFormatted" />

                    <p
                        class="m-experianModal__desc"
                        :class="{'-system': !hasAddressSuggestionList}">
                        {{ addressNotInSystemLabel }}
                    </p>
                </div>
            </div>
        </template>

        <template v-slot:footer>
            <div class="m-experianModal__footer">
                <v-button
                    class="m-experianModal__btn -secondary -white"
                    :class="isMarketplace ? '-mkt -outline': ''"
                    :href="secondaryLink"
                    :aria-disabled="loading"
                    :disabled="loading"
                    :is-anchor="Boolean(secondaryLink)"
                    @click="secondaryLink ? null : [closeModal(), gtmTrackAction({id: 407, text: backLabel }, $event)]">
                    {{ backLabel }}
                </v-button>

                <v-button
                    class="m-experianModal__btn -primary"
                    :class="isMarketplace ? '-mkt': '-green'"
                    :aria-disabled="loading"
                    :disabled="loading"
                    @click="[getAddressChose(), gtmTrackAction({ id: 204, text: useThisAddressLabel }, $event)]">
                    {{ useThisAddressLabel }}
                </v-button>
                <a-loading-spinner :visible="loading" mods="ml-20" size="sm" />
            </div>
        </template>
    </modal>
</template>

<script>
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';

    const UNITED_STATES = 'United States';

    export default {
        name: 'MExperianModal',
        props: {
            addressEntered: {
                type: Object,
                default: () => {}
            },
            addressEnteredFormatted: {
                type: String,
                default: ''
            },
            addressEnteredLabel: {
                type: String,
                default: 'Address You Entered:'
            },
            addressList: {
                type: Array,
                default: () => []
            },
            addressNotInSystemLabel: {
                type: String,
                default: 'This address is not currently in our system. Please review the address and make sure it is correct before continuing.'
            },
            backLabel: {
                type: String,
                default: 'Back'
            },
            canSelectEnteredAddress: {
                type: Boolean,
                default: false
            },
            isMarketplace: {
                type: Boolean,
                default: false
            },
            loading: {
                type: Boolean,
                default: false
            },
            problemWithAddressLabel: {
                type: String,
                default: ''
            },
            secondaryLink: {
                type: String,
                default: null
            },
            showModal: {
                type: Boolean,
                default: false
            },
            suggestedLabel: {
                type: String,
                default: 'Suggested:'
            },
            useThisAddressLabel: {
                type: String,
                default: 'Use this address'
            },
            verifyAddressLabel: {
                type: String,
                default: 'Verify Address'
            }
        },
        data() {
            return {
                show: false,
                radioSelectedIndex: 1
            };
        },
        computed: {
            canSelectAddressEntered() {
                let usMxZip = '[0-9]{5}(-[0-9]{4})?';
                let auNzPostal = '[0-9]{4}';
                let caPostal = '[a-z][0-9][a-z] [0-9][a-z][0-9]$';
                let postalFormat = '';

                switch (this.addressEntered.country) {
                    case 'Australia':
                    case 'New Zealand':
                        postalFormat = auNzPostal;
                        break;
                    case 'Canada':
                        postalFormat = caPostal;
                        break;
                    default:
                        postalFormat = usMxZip;
                }

                let zipPostalCodeRegEx = new RegExp(`${postalFormat}`, 'i');
                // create regex of first 3 digits of user provided zip code
                let zipFirst3regEx =
                    new RegExp('^' + this.addressEntered.zipCode?.slice(0, 3), 'i');

                // This value changes based on which version used for the experian API. 'Suggestion' is for v2
                let suggestionProperty = 'suggestion';

                if(this.addressEntered.country === UNITED_STATES) {
                    suggestionProperty = 'textFormatted';
                } else if(this.addressEntered.country === 'Canada') {
                    suggestionProperty = 'text';
                }

                // Mexico is allowed to override whatever address they like
                if(this.addressEntered.country.toLowerCase() === 'mexico') {
                    return true;
                }

                // test against results provided by experian, if a zip or postal code
                // returned by experian matches the zipFirst3regEx regex then the user
                // should be allowed to select the address they have provided
                return this.canSelectEnteredAddress || this.addressList.map(obj => zipPostalCodeRegEx.exec(obj[suggestionProperty]))
                    // filter out any possible null results
                    .filter(regexResult => regexResult)
                    .map(regexResult => regexResult[0])
                    .some(zip => zipFirst3regEx.test(zip));
            },
            hasAddressSuggestionList() {
                return this.addressList?.length > 0;
            }
        },
        watch: {
            showModal(newVal) {
                if(newVal) {
                    this.gtmTrackAction({id: 455, text: this.verifyAddressLabel}, {});
                    this.$modal.show({ id: 'm-experianModal' });
                    // Reset radio selected
                    this.radioSelectedIndex = 1;
                }
            }
        },
        mounted() {
            this.$modal.$on.hide(() => {
                this.$emit('close');
            });
        },
        methods: {
            replaceTokenArray,
            closeModal() {
                this.$modal.hide({ id: 'm-experianModal' });
            },
            formattedAddress(address) {
                return address.indexOf(',') > -1 ? address.replace(/,/g, '<br>') : address;
            },
            async getAddressChose() {
                if(this.hasAddressSuggestionList) {
                    const addressChose = this.radioSelectedIndex - 1;
                    if(addressChose >= 0) {
                        await this.$emit('chose-address', this.addressList[addressChose]);
                    } else {
                        await this.$emit('chose-entered-address');
                    }
                } else if(this.input) {
                    await this.$emit('chose-address', this.input);
                } else {
                    await this.$emit('chose-entered-address');
                }
                this.closeModal();
            }
        }
    };
</script>
