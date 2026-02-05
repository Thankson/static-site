<template>
    <section class="o-personalLink relative m-10 py-24 px-10 bg-white border border-gray-50 rounded text-gray-150 md:max-w-contain md:mx-auto md:px-36 md:py-40 md:mb-30">
        <h2 class="text-2xl mb-24 leading-base md:mb-30 md:text-2xl-2">
            {{ getLocalizationProp('Labels.MainTitle') }}
        </h2>
        <div class="lg:flex" :class="{'mb-32': !hasLinkBeenSetup || isInSetupOrEditMode}">
            <div class="lg:w-1_2 lg:mr-12">
                <button
                    v-if="!hasLinkBeenSetup && !isInSetupOrEditMode"
                    class="a-button py-15 px-48 text-base font-medium leading-base"
                    data-testid="button-personalLinkSetup"
                    @click="handleSetupButtonClick"
                >
                    {{ getLocalizationProp('Labels.SetupButtonText') }}
                </button>
                <template v-if="isInSetupOrEditMode">
                    <div class="flex mb-6 md:ml-16">
                        <label for="personalLink" class="block font-medium text-sm leading-base uppercase">
                            {{ getLocalizationProp('Labels.PersonalLink.InputLabel') }}
                        </label>
                        <PersonalLinkCharacterMessage
                            v-if="isDesktop"
                            :is-text-red="isUserInputBelowMinCharLimit || isUserInputAboveMaxCharLimit"
                            :message="characterMessage"
                        />
                    </div>
                    <div class="mb-24 md:ml-16">
                        <div
                            class="o-personalLink__inputContainer flex py-15 px-12 leading-tight border border-solid rounded"
                            :class="[
                                isInputFocused && !isInputInvalid && '-focusBorder',
                                isInputFocused && isInputInvalid && '-focusBorderError',
                                isInputInvalid ? 'border-red' : 'border-gray-50'
                            ]"
                        >
                            <div>{{ getLocalizationProp('Labels.Sections[0].BaseUrl') }}/</div>
                            <input
                                id="personalLink"
                                v-model="personalLink"
                                class="o-personalLink__inputElement w-full font-bold"
                                aria-describedby="inputAlert inputLengthAlert"
                                data-testid="input-personalLink"
                                @focus="isInputFocused = true"
                                @blur="isInputFocused = false"
                            />
                        </div>
                        <div v-if="!isDesktop" class="flex">
                            <PersonalLinkCharacterMessage
                                :is-text-red="isUserInputBelowMinCharLimit || isUserInputAboveMaxCharLimit"
                                :message="characterMessage"
                                mods="mt-4"
                            />
                        </div>
                    </div>
                    <div class="flex flex-wrap md:ml-16">
                        <div>
                            <button
                                class="a-button mb-24 mr-24 py-10 px-16 text-xs font-medium leading-base"
                                :class="{'-disabled':isConfirmAvailabilityButtonDisabled}"
                                :disabled="isConfirmAvailabilityButtonDisabled"
                                data-testid="button-personalLinkConfirmAvailability"
                                @click="handleConfirmAvailabilityButtonClick"
                            >
                                {{ getLocalizationProp('Labels.ConfirmAvailabilityButtonText') }}
                            </button>
                        </div>
                        <PersonalLinkMessageList
                            v-if="messageText"
                            :message-text="messageText"
                            :is-personal-link-available="isPersonalLinkAvailable"
                            list-mods="mb-24"
                            :should-render-success-message="true"
                        />
                    </div>
                    <p class="mb-24 text-sm text-gray-100 leading-tight md:mb-8 md:ml-16">
                        {{ getLocalizationProp('Labels.NoteText') }}
                    </p>
                    <template v-if="!isDesktop">
                        <PersonalLinkSaveCancelButtons
                            :cancel-button-text="getLocalizationProp('Labels.CancelButtonText')"
                            :is-save-button-disabled="isSaveButtonDisabled"
                            :save-button-text="getLocalizationProp('Labels.SaveButtonText')"
                            @save="handleSaveButtonClick"
                            @cancel="handleCancelButtonClick"
                        />
                        <PersonalLinkMessageList
                            v-if="messageText"
                            :message-text="messageText"
                            :is-personal-link-available="isPersonalLinkAvailable"
                            list-mods="mt-24"
                            :should-render-success-message="false"
                        />
                    </template>
                </template>
            </div>
            <div class="lg:w-1_2 lg:ml-12" />
        </div>
        <div class="md:flex">
            <div
                v-for="(section, index) in getLocalizationProp('Labels.Sections')"
                :key="uniqid(section.Title)"
                class="md:w-1_2"
                :class="[
                    index === 0 ?
                        'o-personalLink__borderBottomMobile pb-24 md:mr-12 md:pb-0' :
                        'pt-24 md:ml-12 md:pt-0'
                ]"
            >
                <h3 class="o-personalLink__borderBottomDesktop mb-12 text-xl font-bold leading-base md:mb-16 md:pb-12">
                    {{ section.Title }}
                </h3>
                <div class="ml-16">
                    <p class="text-sm leading-tight mb-24 md:mb-15">
                        {{ section.Description }}
                    </p>
                    <p v-if="!hasLinkBeenSetup && !isInSetupOrEditMode" class="leading-tight">
                        {{ section.SetupText }}
                    </p>
                    <div
                        class="justify-between items-center leading-base md:flex"
                    >
                        <p v-if="isInSetupOrEditMode || hasLinkBeenSetup" class="break-all leading-base">
                            <span>{{ section.BaseUrl }}</span>/<span class="font-bold">{{ personalLink }}</span>
                        </p>
                        <div
                            v-if="!isInSetupOrEditMode && hasLinkBeenSetup"
                            class="mt-8 md:mt-0 md:ml-10"
                        >
                            <button
                                v-show="!isCopySuccessMessageVisible[index]"
                                class="a-personalLinkCopyButton a-button py-10 px-16 text-xs leading-base md:py-6 md:px-10 md:text-tiny"
                                data-testid="button-personalLinkCopy"
                                @click="handleCopyButtonClick(index, `https://${section.BaseUrl}/${personalLink}`)"
                            >
                                {{ getLocalizationProp('Labels.CopyButtonText') }}
                            </button>
                            <ul
                                v-show="isCopySuccessMessageVisible[index]"
                                class="o-personalLink__copiedMessageList flex flex-col justify-center"
                            >
                                <li class="o-personalLink__copiedMessageListItem flex text-sm text-green leading-base">
                                    {{ getLocalizationProp('Labels.CopiedText') }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template v-if="isInSetupOrEditMode && isDesktop">
            <PersonalLinkSaveCancelButtons
                :cancel-button-text="getLocalizationProp('Labels.CancelButtonText')"
                container-mods="mt-60 ml-16"
                :is-save-button-disabled="isSaveButtonDisabled"
                :save-button-text="getLocalizationProp('Labels.SaveButtonText')"
                @save="handleSaveButtonClick"
                @cancel="handleCancelButtonClick"
            />
            <PersonalLinkMessageList
                v-if="messageText"
                :message-text="messageText"
                :is-personal-link-available="isPersonalLinkAvailable"
                list-mods="mt-10 ml-16"
                :should-render-success-message="false"
            />
        </template>
        <div v-if="hasLinkBeenSetup && !isInSetupOrEditMode" class="flex flex-wrap mt-60 md:ml-16">
            <button
                class="a-button py-15 px-48 mr-15 text-base font-medium leading-base"
                data-testid="button-personalLinkEdit"
                @click="handleEditButtonClick"
            >
                {{ getLocalizationProp('Labels.EditButtonText') }}
            </button>
            <button
                class="a-button -white py-15 px-48 text-base font-medium leading-base"
                data-testid="button-personalLinkDelete"
                @click="handleDeleteButtonClick"
            >
                {{ getLocalizationProp('Labels.DeleteButtonText') }}
            </button>
        </div>
        <ul v-if="deleteErrorMessageText" class="m-personalLinkErrorMessageList mt-10 md:ml-16">
            <li
                role="alert"
                class="m-personalLinkErrorMessageList__listItem -error flex text-red text-sm leading-base"
                data-testid="listItem-personalLinkEleteError"
                v-html="deleteErrorMessageText"
            />
        </ul>
        <div
            class="o-personalLink__loadingBackground absolute w-full h-full top-0 left-0 z-3"
            :class="[isLoading ? 'block': 'hidden']"
        >
            <div class="flex justify-center items-center h-full">
                <a-loading-spinner :visible="isLoading" />
            </div>
        </div>
        <modal id="delete-modal" :prevent-click-outside-close="true">
            <template v-slot:heading>
                <h3 class="font-bold text-3xl md:text-4xl-2">
                    {{ getLocalizationProp('Labels.DeleteModal.Title') }}
                </h3>
            </template>
            <template v-slot:body>
                <p class="text-gray-120 leading-tight">
                    {{ getLocalizationProp('Labels.DeleteModal.Description') }}
                </p>
            </template>
            <template v-slot:footer>
                <button
                    class="a-button -white mr-20 mb-20 py-15 px-48 text-base font-medium leading-base"
                    data-testid="button-personalLinkCancelDelete"
                    @click="handleCancelDeleteButtonClick"
                >
                    {{ getLocalizationProp('Labels.CancelButtonText') }}
                </button>
                <button
                    class="a-button py-15 px-48 text-base font-medium leading-base"
                    data-testid="button-personalLinkConfirmDelete"
                    @click="deletePersonalLink"
                >
                    {{ getLocalizationProp('Labels.DeleteButtonText') }}
                </button>
            </template>
        </modal>
    </section>
</template>

<script>
    import api from '@api/routes/about/personallink';
    import apiValidate from '@api/routes/about/personallink/validate';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';
    import uniqid from 'uniqid';
    import PersonalLinkCharacterMessage from '@productstore/source/js/vue/components/00-atoms/my-account/personal-link-character-message.vue';
    import PersonalLinkMessageList from '@productstore/source/js/vue/components/01-molecules/my-account/personal-link-message-list.vue';
    import PersonalLinkSaveCancelButtons from '@productstore/source/js/vue/components/01-molecules/my-account/personal-link-save-cancel-buttons.vue';

    const VALIDATE_API_MESSAGE_CODES = [
        'PersonalLinkIsDuplicate',
        'PersonalLinkContainsForbiddenTerm',
        'PersonalLinkTooShort',
        'PersonalLinkContainsInvalidCharacter',
        'PersonalLinkExceedsMaximumLength'
    ];

    export default {
        name: 'OPersonalLink',
        components: {
            PersonalLinkCharacterMessage,
            PersonalLinkMessageList,
            PersonalLinkSaveCancelButtons
        },
        mixins: [ localizationMixin, isDesktop ],
        data() {
            return {
                deleteErrorMessageText: null,
                hasLinkBeenSetup: false,
                isCopySuccessMessageVisible: [false, false],
                isInSetupOrEditMode: false,
                isInputFocused: false,
                isInputInvalid: false,
                isLoading: false,
                isPersonalLinkAvailable: null,
                messageText: null,
                personalLink: null,
                tempPersonalLink: null
            };
        },
        computed: {
            characterMessage() {
                if(!this.personalLink) {
                    return `${this.localization?.Labels?.PersonalLink?.MinCharactersMessage
                        .replace(
                            '{0}',
                            this.localization?.Data?.PersonalLinkMinCharacters
                        )}, ${this.localization?.Labels?.PersonalLink?.MaxCharactersMessage
                        .replace(
                            '{0}',
                            this.localization?.Data?.PersonalLinkMaxCharacters
                        )}`;
                } else if(this.isUserInputBelowMinCharLimit) {
                    return `${this.localization?.Labels?.PersonalLink?.MinCharactersMessage
                        .replace(
                            '{0}',
                            this.localization?.Data?.PersonalLinkMinCharacters
                        )}`;
                } else if(this.isUserInputAboveMaxCharLimit) {
                    return `${this.localization?.Labels?.PersonalLink?.MaxCharactersMessage
                        .replace(
                            '{0}',
                            this.localization?.Data?.PersonalLinkMaxCharacters
                        )}`;
                } else {
                    return `${this.localization?.Labels?.PersonalLink?.CharactersRemainingMessage
                        .replace(
                            '{0}',
                            this.localization?.Data?.PersonalLinkMaxCharacters - this.personalLink.length
                        )}`;
                }
            },
            isConfirmAvailabilityButtonDisabled() {
                return this.isPersonalLinkAvailable === true ||
                    this.isPersonalLinkAvailable === false ||
                    this.localization?.Data?.PersonalLink === this.personalLink ||
                    this.tempPersonalLink === this.personalLink;
            },
            isSaveButtonDisabled() {
                return this.localization?.Data?.PersonalLink === this.personalLink ||
                    this.tempPersonalLink === this.personalLink ||
                    !this.isPersonalLinkAvailable;
            },
            isUserInputAboveMaxCharLimit() {
                return this.personalLink.length > 0 &&
                    this.personalLink.length > this.localization?.Data?.PersonalLinkMaxCharacters;
            },
            isUserInputBelowMinCharLimit() {
                return this.personalLink.length > 0 &&
                    this.personalLink.length < this.localization?.Data?.PersonalLinkMinCharacters;
            }
        },
        watch: {
            personalLink() {
                this.isPersonalLinkAvailable = null;
                this.isInputInvalid = false;
                this.messageText = null;
            }
        },
        mounted() {
            this.hasLinkBeenSetup = !!this.localization?.Data?.PersonalLink;
            if(this.hasLinkBeenSetup) this.personalLink = this.localization.Data.PersonalLink;
        },
        methods: {
            async deletePersonalLink() {
                this.pushToDataLayer('Modal View', this.localization?.Labels?.DeleteButtonText);
                this.$modal.hide({ id: 'delete-modal' });
                this.isLoading = true;
                const response = await api.delete();
                if(response?.data?.Success) {
                    this.personalLink = null;
                    this.tempPersonalLink = null;
                    this.hasLinkBeenSetup = false;
                    this.isPersonalLinkAvailable = null;
                    this.isInSetupOrEditMode = false;
                } else if(!response?.data?.Success && response?.data?.ErrorMessages?.length) {
                    this.deleteErrorMessageText = response?.data?.ErrorMessages[0].Translation;
                }
                this.isLoading = false;
            },
            handleCancelButtonClick() {
                this.pushToDataLayer('CTA', this.localization?.Labels?.CancelButtonText);
                if(!this.hasLinkBeenSetup) this.personalLink = null;
                else this.personalLink = this.tempPersonalLink;
                this.isInSetupOrEditMode = false;
            },
            handleCancelDeleteButtonClick() {
                this.pushToDataLayer('Modal View', this.localization?.Labels?.CancelButtonText);
                this.$modal.hide({ id: 'delete-modal' });
            },
            async handleConfirmAvailabilityButtonClick() {
                this.pushToDataLayer('CTA', this.localization?.Labels?.ConfirmAvailabilityButtonText);
                if(!this.personalLink) {
                    this.isInputInvalid = true;
                    this.messageText = this.localization?.Labels?.PersonalLink?.PersonalLinkIsBlank;
                    return;
                }
                this.isLoading = true;
                const response = await apiValidate.post({ PersonalLink: this.personalLink });
                if(response?.data?.Success) {
                    this.isPersonalLinkAvailable = true;
                    this.messageText = this.localization?.Labels?.PersonalLink?.PersonalLinkIsAvailable;
                } else if(!response?.data?.Success && response?.data?.ErrorMessages?.length) {
                    if(VALIDATE_API_MESSAGE_CODES.includes(response?.data?.ErrorMessages[0]?.Original)) {
                        if(response?.data?.ErrorMessages[0]?.Original === 'PersonalLinkIsDuplicate') {
                            this.isPersonalLinkAvailable = false;
                        }
                        this.isInputInvalid = true;
                        this.messageText =
                            this.localization?.Labels?.PersonalLink?.[response?.data?.ErrorMessages[0]?.Original];
                    } else this.messageText = response?.data?.ErrorMessages[0]?.Translation;
                }
                this.isLoading = false;
            },
            async handleCopyButtonClick(index, linkUrl) {
                await navigator.clipboard.writeText(linkUrl);
                this.$set(this.isCopySuccessMessageVisible, index, true);
                setTimeout(() => {
                    this.$set(this.isCopySuccessMessageVisible, index, false);
                }, 2000); // Reset success message after 2 seconds
            },
            handleDeleteButtonClick() {
                this.pushToDataLayer('Delete', this.localization?.Labels?.DeleteButtonText);
                this.$modal.show({ id: 'delete-modal' });
            },
            handleEditButtonClick() {
                this.pushToDataLayer('Edit', this.localization?.Labels?.EditButtonText);
                this.tempPersonalLink = this.personalLink;
                this.isInSetupOrEditMode = true;
            },
            async handleSaveButtonClick() {
                this.pushToDataLayer('CTA', this.localization?.Labels?.SaveButtonText);
                this.isLoading = true;
                const response = this.hasLinkBeenSetup
                    ? await api.put({ PersonalLink: this.personalLink })
                    : await api.post({ PersonalLink: this.personalLink });
                if(response?.data?.Success) {
                    this.tempPersonalLink = this.personalLink;
                    this.hasLinkBeenSetup = true;
                    this.messageText = null;
                    this.isPersonalLinkAvailable = null;
                    this.isInSetupOrEditMode = false;
                } else if(!response?.data?.Success && response?.data?.ErrorMessages?.length) {
                    this.isPersonalLinkAvailable = null;
                    this.messageText = response?.data?.ErrorMessages[0].Translation;
                }
                this.isLoading = false;
            },
            async handleSetupButtonClick() {
                this.pushToDataLayer('CTA', this.localization?.Labels?.SetupButtonText);
                this.isLoading = true;
                const maxCharLimit = this.localization?.Data?.PersonalLinkMaxCharacters;
                const firstNameWithoutSpaces = this.localization?.Data?.User?.FirstName.replace(/\s+/g, '');
                let lastNameWithoutSpaces = this.localization?.Data?.User?.LastName.replace(/\s+/g, '');
                // If the last name is too long, trim it so the combined link when the just the first letter of the first name is used will not exceed the max character limit
                if(lastNameWithoutSpaces.length - 1 > maxCharLimit) {
                    lastNameWithoutSpaces = lastNameWithoutSpaces.substring(0, maxCharLimit - 1);
                }
                // Concatenate first and last name (without spaces) to form the initial personal link suggestion
                const concatenatedFirstAndLastName = firstNameWithoutSpaces + lastNameWithoutSpaces;
                let tempPersonalLink = ''; // Temporary variable to hold the personal link candidate
                // If the concatenated name exceeds the max character limit, use only the first character of the first name plus the last name
                if(concatenatedFirstAndLastName.length > maxCharLimit) {
                    tempPersonalLink = firstNameWithoutSpaces.charAt(0) + lastNameWithoutSpaces;
                } else tempPersonalLink = concatenatedFirstAndLastName; // Otherwise, use the full concatenated name
                this.personalLink = tempPersonalLink; // Set the personal link to the candidate
                // Validate the generated personal link with the API
                const response = await apiValidate.post({ PersonalLink: tempPersonalLink });
                if(response?.data?.Success) {
                    // If the link is available, set it, mark as available, and display success message
                    this.personalLink = tempPersonalLink;
                    this.$nextTick(() => {
                        this.isPersonalLinkAvailable = true;
                        this.messageText = this.localization?.Labels?.PersonalLink?.PersonalLinkIsAvailable;
                    });
                } else if(
                    !response?.data?.Success &&
                    response?.data?.ErrorMessages?.length
                ) {
                    if(response?.data?.ErrorMessages[0]?.Original === 'PersonalLinkIsDuplicate') {
                        // If the link is a duplicate, generate a random 3-digit number to append
                        const randomThreeDigitNumber = Math.floor(Math.random() * 900) + 100;
                        // If the link is already at max length, trim 3 chars; if 1 or 2 under, trim accordingly to fit the number
                        if(tempPersonalLink.length === maxCharLimit) {
                            tempPersonalLink = tempPersonalLink.slice(0, -3);
                        } else if(tempPersonalLink.length === maxCharLimit - 1) {
                            tempPersonalLink = tempPersonalLink.slice(0, -2);
                        } else if(tempPersonalLink.length === maxCharLimit - 2) {
                            tempPersonalLink = tempPersonalLink.slice(0, -1);
                        }
                        tempPersonalLink = tempPersonalLink + randomThreeDigitNumber; // Append the random number
                        this.personalLink = tempPersonalLink; // Set the new candidate as the personal link
                        // Validate the new candidate with the API
                        const response = await apiValidate.post({ PersonalLink: tempPersonalLink });
                        if(response?.data?.Success) {
                            // If the link is available, mark as available and display success message
                            this.$nextTick(() => {
                                this.isPersonalLinkAvailable = true;
                                this.messageText = this.localization?.Labels?.PersonalLink?.PersonalLinkIsAvailable;
                            });
                        } else if(
                            !response?.data?.Success &&
                            response?.data?.ErrorMessages[0]?.Original === 'PersonalLinkIsDuplicate'
                        ) {
                            // If still duplicate, mark as unavailable and show error message
                            this.$nextTick(() => {
                                this.isPersonalLinkAvailable = false;
                                this.isInputInvalid = true;
                                this.messageText = this.localization?.Labels?.PersonalLink?.PersonalLinkIsDuplicate;
                            });
                        } else if(!response?.data?.Success && response?.data?.ErrorMessages?.length) {
                            // If another error, show the error message
                            this.$nextTick(() => {
                                this.messageText = response?.data?.ErrorMessages[0].Translation;
                            });
                        }
                    } else {
                        // If initial validation failed for another reason, show the error message
                        this.$nextTick(() => {
                            this.messageText = response?.data?.ErrorMessages[0].Translation;
                        });
                    }
                }
                this.isInSetupOrEditMode = true;
                this.isLoading = false;
            },
            pushToDataLayer(eA, eL) {
                window.dataLayer && window.dataLayer.push({
                    event: 'user_event',
                    eC: 'Personal Link',
                    eA: eA,
                    eL: eL
                });
            },
            uniqid(id) {
                return `${id}-${uniqid()}`;
            }
        }
    };
</script>
