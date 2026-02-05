<template>
    <section
        id="documentUpload"
        class="o-documentUpload m-10 px-6 bg-white border border-gray-50 rounded text-gray-150 md:mx-0 md:px-36 lg:pb-32 lg:max-w-contain lg:mx-auto"
    >
        <div class="py-24 md:pt-40 lg:flex lg:pt-20 lg:pb-15">
            <div class="o-documentUpload__leftWrapper lg:mr-50 lg:mt-20">
                <h2 class="mb-15 px-4 text-2xl leading-base md:px-0 md:text-2xl-2 lg:mb-4">
                    {{ getLocalizationProp('Labels.MainTitle') }}
                </h2>
                <div
                    v-show="isLG"
                    class="ml-16 text-sm leading-tight"
                    v-html="getLocalizationProp('Labels.DesktopTypeAndLimitRte')"
                />
                <div v-show="isLG || !isUploadHistoryVisible" class="lg:mt-16">
                    <div
                        v-show="isLG || !hasStagedFiles"
                        class="o-documentUpload__uploadContainer mb-30 px-6 pb-12 pt-16 flex flex-col items-center border-2 lg:justify-center lg:mb-0 lg:p-16 lg:border border-dashed border-green rounded-lg"
                        :class="{'-isDragOver': isDragOver}"
                        data-testid="div-documentUploadUploadContainer"
                        @dragover.prevent="handleDragOver"
                        @dragleave.prevent="handleDragLeave"
                        @drop.prevent="handleDrop"
                        @click="browseFiles"
                    >
                        <input
                            ref="fileInput"
                            class="hidden"
                            type="file"
                            :accept="accept"
                            :multiple="isLG && true"
                            aria-describedby="fileError"
                            @change="handleFileChange"
                        />
                        <template v-if="isLG || !hasStagedFiles">
                            <h3 class="mb-12 text-lg leading-base lg:text-2xl-2">
                                {{ getLocalizationProp('Labels.FileUpload') }}
                            </h3>
                            <img
                                class="o-documentUpload__uploadImage mb-8 lg:mb-12"
                                src="https://cdnsc1.melaleuca.com/na/images/my-account/Icon-file-upload.png"
                                :alt="getLocalizationProp('Labels.UploadImageAlt')"
                            />
                            <div
                                v-show="!isLG"
                                class="text-sm text-center font-medium leading-tight"
                                v-html="getLocalizationProp('Labels.MobileTypeAndLimitRte')"
                            />
                            <div v-show="isLG" v-html="getLocalizationProp('Labels.DropOrBrowseRte')" />
                        </template>
                    </div>
                    <template v-if="!isLG && hasStagedFiles">
                        <div class="pt-6 px-6 pb-12 border border-gray-50 rounded">
                            <div class="flex mb-15">
                                <div
                                    v-if="firstStagedFile.hasDefaultPreview"
                                    class="o-documentUpload__mobilePreviewHeightControl flex flex-col justify-center items-center border"
                                    :class="[firstStagedFile.error ? 'border-error' : 'border-gray-50']"
                                >
                                    <img
                                        class="w-44 mb-8"
                                        :src="firstStagedFile.previewUrl"
                                        :alt="getLocalizationProp('Labels.DefaultPreviewImageAlt')"
                                    />
                                    <p class="o-documentUpload__mobilePreviewWidthControl text-center text-sm text-gray-95 leading-tight">
                                        {{ getLocalizationProp('Labels.NoPreviewAvailable') }}
                                    </p>
                                </div>
                                <div v-else class="o-documentUpload__mobilePreviewHeightControl flex">
                                    <img
                                        class="o-documentUpload__mobilePreviewWidthControl border"
                                        :class="[firstStagedFile.error ? 'border-error' : 'border-gray-50']"
                                        :src="firstStagedFile.previewUrl"
                                        :alt="firstStagedFile.name"
                                    />
                                </div>
                                <div class="flex flex-col justify-center ml-16 pr-12 text-xs leading-tight">
                                    <ul v-if="firstStagedFile.error" class="mb-10">
                                        <li
                                            id="fileError"
                                            role="alert"
                                            class="o-documentUpload__errorMessage flex text-error font-semibold"
                                            data-testid="listItem-documentUploadErrorMessage"
                                        >
                                            {{ firstStagedFile.error }}
                                        </li>
                                    </ul>
                                    <div v-html="getLocalizationProp('Labels.MobileDocumentInstructionsRte')" />
                                </div>
                            </div>
                            <p
                                class="mb-6 leading-base text-xs font-medium uppercase"
                                :class="[firstStagedFile.error ? 'text-gray-50' : 'text-gray-120']"
                            >
                                {{ getLocalizationProp('Labels.DocumentName') }}
                            </p>
                            <div
                                class="py-12 px-10 leading-base border border-gray-50 rounded break-words"
                                :class="{'text-gray-50': firstStagedFile.error}"
                            >
                                {{ firstStagedFile.name }}
                            </div>
                            <div class="flex justify-center mt-15 mb-3">
                                <button
                                    type="button"
                                    class="o-documentUpload__cta o-documentUpload__mobileUploadCta a-button block mr-15 py-15 px-10 text-base leading-base"
                                    :class="{'-disabled': firstStagedFile.error}"
                                    :disabled="firstStagedFile.error"
                                    data-testid="button-documentUploadMobileBeginUpload"
                                    @click="handleFileApiUpload"
                                >
                                    {{ getLocalizationProp('Labels.BeginUpload') }}
                                </button>
                                <button
                                    type="button"
                                    class="o-documentUpload__cta o-documentUpload__mobileUploadCta a-button -white block py-15 px-10 text-base leading-base"
                                    data-testid="button-documentUploadMobileCancelUpload"
                                    @click="clearStagedFiles"
                                >
                                    {{ getLocalizationProp('Labels.Cancel') }}
                                </button>
                            </div>
                        </div>
                    </template>
                    <button
                        v-show="!isLG && !hasStagedFiles"
                        type="button"
                        class="a-button -white block w-full mb-20 py-16 leading-base"
                        data-testid="button-documentUploadViewUploadHistory"
                        @click="isUploadHistoryVisible = true"
                    >
                        {{ getLocalizationProp('Labels.ViewHistoryButtonText') }}
                    </button>
                </div>
            </div>
            <div v-show="isLG || isUploadHistoryVisible" class="lg:flex-1">
                <div
                    v-if="!isLG"
                    class="o-documentUpload__selectContainer relative flex items-center mb-12 leading-tight border border-solid border-gray-50 rounded"
                    :class="{'-focusBorder': isSelectFocused}"
                >
                    <div class="flex w-full text-md">
                        <div
                            class="py-12 pl-10"
                            :class="{'text-gray-50': !hasUploadHistory}"
                        >
                            {{ getLocalizationProp('Labels.SortByText') }}&nbsp;
                        </div>
                        <select
                            id="filters"
                            v-model="selectedFilter"
                            class="o-documentUpload__selectElement flex-1 py-12 pr-10"
                            :class="{'text-gray-50': !hasUploadHistory}"
                            :disabled="!hasUploadHistory"
                            data-testid="select-documentUploadFilter"
                            @focus="isSelectFocused = true"
                            @blur="isSelectFocused = false"
                        >
                            <option
                                v-for="filter in filters"
                                :key="filter.Id"
                                :value="filter.Id"
                                :data-testid="`option-documentUploadFilter${filter.Id}`"
                            >
                                {{ filter.Label }}
                            </option>
                        </select>
                    </div>
                    <arrow
                        direction="-down"
                        size="-sm"
                        :tailwind-color="hasUploadHistory ? 'black' : 'gray-50'"
                        other-mods="-filled absolute right-10 top-16 pointer-events-none"
                    />
                </div>
                <div
                    class="o-documentUpload__historyContainer relative overflow-hidden border rounded lg:pt-12 lg:rounded-none"
                    :class="hasUploadHistory ? '-hasHistory' : '-noHistory'"
                >
                    <div class="lg:flex lg:items-center lg:mb-18 lg:pl-16 lg:pr-10">
                        <h3
                            v-show="!hasUploadHistory"
                            class="mt-18 mx-12 mb-10 font-bold text-lg leading-base lg:m-0 lg:text-xl"
                        >
                            {{ getLocalizationProp('Labels.NoFilesHeading') }}
                        </h3>
                        <h3
                            v-show="isLG && hasUploadHistory"
                            class="mt-18 mx-12 mb-10 font-bold text-lg leading-base lg:m-0 lg:text-xl"
                        >
                            {{ getLocalizationProp('Labels.UploadedDocuments') }}
                        </h3>
                        <div
                            v-if="isLG"
                            class="o-documentUpload__selectContainer relative flex flex-1 items-center leading-tight border border-solid border-gray-50 rounded"
                            :class="[isSelectFocused && '-focusBorder', hasUploadHistory ? 'ml-12' : 'ml-40']"
                        >
                            <div class="flex w-full text-md">
                                <div class="py-12 pl-10" :class="{'text-gray-50': !hasUploadHistory}">
                                    {{ getLocalizationProp('Labels.SortByText') }}&nbsp;
                                </div>
                                <select
                                    id="filters"
                                    v-model="selectedFilter"
                                    class="o-documentUpload__selectElement flex-1 py-12 pr-10"
                                    :class="{'text-gray-50': !hasUploadHistory}"
                                    :disabled="!hasUploadHistory"
                                    data-testid="select-documentUploadFilter"
                                    @focus="isSelectFocused = true"
                                    @blur="isSelectFocused = false"
                                >
                                    <option
                                        v-for="filter in filters"
                                        :key="filter.Id"
                                        :value="filter.Id"
                                        :data-testid="`option-documentUploadFilter${filter.Id}`"
                                    >
                                        {{ filter.Label }}
                                    </option>
                                </select>
                            </div>
                            <arrow
                                direction="-down"
                                size="-sm"
                                :tailwind-color="hasUploadHistory ? 'black' : 'gray-50'"
                                other-mods="-filled absolute right-10 top-16 pointer-events-none"
                            />
                        </div>
                    </div>
                    <div v-show="hasUploadHistory">
                        <perfect-scrollbar class="o-documentUpload__scrollbar">
                            <div
                                v-for="(file, i) in sortedUploadHistoryArray"
                                :key="`${file.documentName}-${i}`"
                                class="flex justify-between items-center mr-10 pt-8 px-8 pb-10 lg:grid lg:grid-cols-3 lg:pl-16"
                                :class="i % 2 === 0 ? 'bg-gray-25' : 'bg-white'"
                            >
                                <div>
                                    <p class="mb-10 text-sm font-medium leading-base lg:text-base">
                                        {{ truncateWithEllipsis(file.documentName) }}
                                    </p>
                                    <div class="flex items-center text-sm leading-base lg:text-base">
                                        <span class="block mr-10 material-icons text-sm lg:text-base">
                                            {{ determineSourceIcon(file.documentSourceId) }}
                                        </span>
                                        <p class="">{{ formatDate(file.insertedDate) }}</p>
                                        <p v-show="!isLG">&nbsp;&nbsp;|&nbsp;&nbsp;</p>
                                        <p v-show="!isLG">{{ file.documentBatchId }}</p>
                                    </div>
                                </div>
                                <p
                                    v-show="isLG"
                                    class="o-documentUpload__desktopDocumentId self-end leading-base"
                                >
                                    {{ file.documentBatchId }}
                                </p>
                                <div class="o-documentUpload__statusContainer">
                                    <p
                                        class="o-documentUpload__status text-sm leading-tight"
                                        :class="`${determineStatus(file.documentStatusId).color}`"
                                    >
                                        {{ determineStatus(file.documentStatusId).status }}
                                    </p>
                                </div>
                            </div>
                        </perfect-scrollbar>
                    </div>
                    <p v-show="!hasUploadHistory" class="mx-12 text-gray leading-base lg:ml-16 lg:mr-10">
                        {{ getLocalizationProp('Labels.NoFilesSubheading') }}
                    </p>
                    <div
                        class="o-personalLink__loadingBackground absolute w-full h-full top-0 left-0 z-3"
                        :class="[isLoadingHistory ? 'block': 'hidden']"
                    >
                        <div class="flex justify-center items-center h-full">
                            <a-loading-spinner :visible="isLoadingHistory" />
                        </div>
                    </div>
                </div>
                <div v-show="!isLG" class="flex justify-around mt-20 mb-2">
                    <button
                        type="button"
                        class="o-documentUpload__cta o-documentUpload__mobileHistoryCta a-button block py-12 leading-base"
                        data-testid="button-documentUploadBack"
                        @click="isUploadHistoryVisible = false"
                    >
                        {{ getLocalizationProp('Labels.BackButtonText') }}
                    </button>
                    <button
                        type="button"
                        class="o-documentUpload__cta o-documentUpload__mobileHistoryCta a-button -white block py-12 leading-base"
                        data-testid="button-documentUploadMobileHistoryUpload"
                        @click="browseFiles"
                    >
                        {{ getLocalizationProp('Labels.UploadButtonText') }}
                    </button>
                </div>
            </div>
        </div>
        <div
            v-show="isLG"
            class="text-xs leading-tight"
            v-html="getLocalizationProp('Labels.DesktopDocumentInstructionsRte')"
        />
        <modal
            id="upload-modal"
            :width="hasStagedFiles ? '726px' : '460px'"
            :prevent-click-outside-close="true"
            :prevent-close="true"
        >
            <div class="pt-20 px-20 pb-24 bg-white rounded">
                <div class="flex items-center mb-18">
                    <h3 class="flex-shrink-0 mr-12 text-xl font-bold leading-base">
                        {{ getLocalizationProp('Labels.AddFileToUpload') }}
                    </h3>
                    <p v-if="hasStagedFileListLengthError" class="text-error text-tiny font-semibold leading-base">
                        {{ getLocalizationProp('Labels.FileListLengthError') }}
                    </p>
                </div>
                <ul
                    class="grid"
                    :class="
                        hasStagedFiles ?
                            'o-documentUpload__fileListGap grid-cols-5 mb-30'
                            : 'o-documentUpload__fileListNoGap grid-cols-4 mb-144'
                    "
                >
                    <li
                        v-for="(file, index) in stagedFiles"
                        :key="`${index}-${file.name}`"
                        class="relative flex justify-center"
                        :aria-describedby="`${index}-${file.name}-error`"
                    >
                        <button
                            type="button"
                            class="o-documentUpload__removeButton absolute"
                            data-testid="button-documentUploadRemoveFile"
                            @click="removeStagedFile(index)"
                        >
                            <svg width="15" height="15" viewBox="0 0 15 15">
                                <circle cx="7.5" cy="7.5" r="7.5" fill="black" />
                                <line x1="4" y1="4" x2="11" y2="11" stroke="white" stroke-width="2" />
                                <line x1="11" y1="4" x2="4" y2="11" stroke="white" stroke-width="2" />
                            </svg>
                        </button>
                        <div class="o-documentUpload__desktopPreviewWidthControl">
                            <div
                                v-if="file.hasDefaultPreview"
                                class="o-documentUpload__desktopPreviewHeightControl flex flex-col justify-center items-center border"
                                :class="[file.error ? 'border-error' : 'border-gray-50']"
                            >
                                <img
                                    class="w-32 mb-6"
                                    :src="file.previewUrl"
                                    :alt="getLocalizationProp('Labels.DefaultPreviewImageAlt')"
                                />
                                <p class="w-70 text-center text-tiny text-gray-95 leading-tight">
                                    {{ getLocalizationProp('Labels.NoPreviewAvailable') }}
                                </p>
                            </div>
                            <div v-else class="o-documentUpload__desktopPreviewHeightControl flex">
                                <img
                                    class="o-documentUpload__desktopPreviewWidthControl border"
                                    :class="[file.error ? 'border-error' : 'border-gray-50']"
                                    :src="file.previewUrl"
                                    :alt="file.name"
                                />
                            </div>
                            <p class="mt-6 text-tiny leading-base break-words">{{ file.name }}</p>
                            <p
                                v-if="file.error"
                                :id="`${index}-${file.name}-error`"
                                role="alert"
                                class="mt-4 text-error text-tiny font-semibold leading-base"
                            >
                                {{ file.error }}
                            </p>
                        </div>
                    </li>
                    <li v-if="stagedFiles.length < maxFiles" class="flex justify-center">
                        <button
                            type="button"
                            class="o-documentUpload__desktopPreviewHeightControl o-documentUpload__desktopPreviewWidthControl flex flex-col justify-center items-center text-center border border-green border-dashed"
                            @click="browseFiles"
                        >
                            <span class="material-icons font-bold text-4xl text-green">add</span>
                            <p class="mt-4 text-tiny text-green leading-base">
                                {{ getLocalizationProp('Labels.AddFile') }}
                            </p>
                        </button>
                    </li>
                </ul>
                <div class="flex justify-center">
                    <button
                        type="button"
                        class="o-documentUpload__cta o-documentUpload__mobileUploadCta a-button block mr-20 py-15 px-10 text-base leading-base"
                        :class="{'-disabled': hasStagedFileError}"
                        :disabled="hasStagedFileError"
                        data-testid="button-documentUploadDesktopBeginUpload"
                        @click="handleFileApiUpload"
                    >
                        {{ getLocalizationProp('Labels.BeginUpload') }}
                    </button>
                    <button
                        type="button"
                        class="o-documentUpload__cta o-documentUpload__mobileUploadCta a-button -white block py-15 px-10 text-base leading-base"
                        data-testid="button-documentUploadDesktopCancelUpload"
                        @click="handleModalClose"
                    >
                        {{ getLocalizationProp('Labels.Cancel') }}
                    </button>
                </div>
            </div>
        </modal>
    </section>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';
    import mockApi from '@api/routes/documentupload';
    import uniqid from 'uniqid';

    export default {
        name: 'ODocumentUpload',
        mixins: [ localizationMixin, isDesktop ],
        data() {
            return {
                accept: '.jpeg,.jpg,.png,.tiff,.tif,.tga,.bmp,.psd,.gif,.heic,.pdf',
                allowedTypes: [
                    'image/jpeg',
                    'image/png',
                    'image/tiff',
                    'image/targa',
                    'image/bmp',
                    'image/vnd.adobe.photoshop',
                    'image/gif',
                    'image/heic',
                    'application/pdf'
                ],
                hasStagedFileListLengthError: false,
                imagePreviewTypes: [
                    'image/bmp',
                    'image/gif',
                    'image/jpeg',
                    'image/png'
                ],
                isDragOver: false,
                isLoadingHistory: false,
                isSelectFocused: false,
                isUploadHistoryVisible: false, // Used for mobile render logic
                tempFileArray: [],
                selectedFilter: 'Date',
                shouldModalStayOpen: false,
                stagedFiles: [],
                uploadHistoryArray: []
            };
        },
        computed: {
            filters() {
                return this.localization?.Labels?.Filters || [];
            },
            // Mobile upload only allows for one upload at a time
            // Indexing first object in array to avoid needless lopping in template
            firstStagedFile() {
                return this.stagedFiles?.[0] || {};
            },
            hasStagedFileError() {
                return this.stagedFiles?.some(file => !!file.error);
            },
            hasStagedFiles() {
                return !!this.stagedFiles?.length;
            },
            hasUploadHistory() {
                return !!this.uploadHistoryArray?.length || false;
            },
            maxFiles() {
                return this.localization?.Data?.MaxNumberOfFiles || 10;
            },
            maxSize() {
                return (this.localization?.Data?.MaxFileSize || 15) * 1024 * 1024; // MB limit as calculated in Bytes
            },
            sortedUploadHistoryArray() {
                switch (this.selectedFilter) {
                    case 'Date':
                        return [...this.uploadHistoryArray].sort(
                            (a, b) => new Date(b.insertedDate) - new Date(a.insertedDate)
                        );
                    case 'DocumentId':
                        return [...this.uploadHistoryArray].sort(
                            (a, b) => Number(a.documentBatchId) - Number(b.documentBatchId)
                        );
                    case 'DocumentName':
                        return [...this.uploadHistoryArray].sort(
                            (a, b) => a.documentName.localeCompare(b.documentName)
                        );
                    case 'Method':
                        return [...this.uploadHistoryArray].sort(
                            (a, b) => Number(a.documentSourceId) - Number(b.documentSourceId)
                        );
                    case 'Status':
                        return [...this.uploadHistoryArray].sort(
                            (a, b) => Number(a.documentStatusId) - Number(b.documentStatusId)
                        );
                }
                return this.uploadHistoryArray;
            }
        },
        watch: {
            stagedFiles(newVal) {
                if(this.isLG) {
                    if(newVal.length || this.shouldModalStayOpen) {
                        this.$nextTick(() => {
                            this.showUploadModal();
                        });
                    }
                }
            },
            isLG(newVal) {
                if(!newVal && this.stagedFiles.length) {
                    this.hideUploadModal();
                } else if(newVal && this.stagedFiles.length) {
                    this.$nextTick(() => {
                        this.showUploadModal();
                    });
                }
            }
        },
        async mounted() {
            this.isLoadingHistory = true;
            if(process.env.NODE_ENV !== 'development') {
                const requestHeaders = new Headers();
                requestHeaders.append('Authorization', 'Bearer ' + this.getLocalizationProp('Data.Token'));
                requestHeaders.append('Content-Type', 'application/json');

                const requestConfig = {
                    method: 'GET',
                    headers: requestHeaders
                };

                const requestUrl = this.$env?.ServiceBaseUrl + '/documents/v1/documentupload/' + this.$custInfo?.customerID;

                await fetch(requestUrl, requestConfig)
                    .then(async response => {
                        if(response.status === 204) return;
                        const result = await response?.json();
                        if(result) this.uploadHistoryArray = result;
                    })
                    .catch(error => {
                        /* eslint-disable */console.log(...oo_oo(`218655502_551_24_551_64_4`,'DOCUMENT GET ERROR', error));
                    });
            } else {
                const uploadHistoryGetResponse = await mockApi.get();
                if(uploadHistoryGetResponse?.data) {
                    this.uploadHistoryArray = uploadHistoryGetResponse.data;
                }
            }
            this.isLoadingHistory = false;
        },
        methods: {
            browseFiles() {
                if(!this.isLG && this.hasStagedFiles) return;
                this.$refs?.fileInput?.click();
            },
            clearStagedFiles() {
                this.stagedFiles = [];
            },
            // Expected Source and Status IDs as defined in FE Tech Notes in US 234786
            // See http://tfs.melaleuca.net:8080/tfs/MelaleucaIT/Melaleuca/_workitems/edit/234786
            determineSourceIcon(sourceId) {
                switch (sourceId) {
                    case 1:
                    case 5:
                        return 'person';
                    case 2:
                        return 'fax';
                    case 3:
                        return 'mail_outline';
                    case 4:
                        return 'phone_iphone';
                    case 6:
                        return 'desktop_mac';
                    // Icon info_outline to render when sourceId is 0 or undefined
                    // This will render for an unknown source of when document is in 'sending' status
                    default:
                        return 'info_outline';
                }
            },
            determineStatus(statusId) {
                switch (statusId) {
                    // 'sending' status as set at the beginning of the handleFileApiUpload method below
                    case 'sending':
                        return { status: this.getLocalizationProp('Labels.Sending'), color: 'text-black' };
                    // Catch types 'Unknown', 'Error', and 'UploadException' and render error message
                    case 0:
                    case 5:
                    case 7:
                        return { status: this.getLocalizationProp('Labels.UnableToComplete'), color: 'text-red' };
                    case 3:
                        return { status: this.getLocalizationProp('Labels.Processing'), color: 'text-black' };
                    // Catch types 'Inserted' and 'Finished' and define them as complete
                    case 1:
                    case 4:
                        return { status: this.getLocalizationProp('Labels.Complete'), color: 'text-green' };
                    // Default to catch a wide range of ids/types and define them as processing
                    default:
                        return { status: this.getLocalizationProp('Labels.Processing'), color: 'text-black' };
                }
            },
            formatDate(isoString) {
                const date = new Date(isoString);
                const month = date.getMonth() + 1; // getMonth() is zero-based
                const day = date.getDate();
                const year = date.getFullYear() % 100; // get last two digits
                return `${month}/${day}/${year}`;
            },
            handleDragLeave() {
                this.isDragOver = false;
            },
            handleDragOver() {
                this.isDragOver = true;
            },
            handleDrop(event) {
                this.isDragOver = false;
                if(event?.dataTransfer?.files) {
                    this.handleFiles(event.dataTransfer.files);
                }
            },
            handleFileChange(event) {
                this.handleFiles(event.target.files);
                event.target.value = '';
            },
            async handleFileApiUpload() {
                // Instantiate a temp array for displaying staged files in upload history
                // while they are in the sending state
                this.tempFileArray = this.stagedFiles.map(fileObj => ({
                    documentName: fileObj.name,
                    documentBatchId: '',
                    documentStatusId: 'sending',
                    insertedDate: new Date().toISOString(),
                    tempId: uniqid()
                }));
                // Insert objects in the temp array at the beginning of the upload history array
                this.tempFileArray.forEach(fileObj => {
                    this.uploadHistoryArray.unshift(fileObj);
                });
                // Map the staged files to the appropriate payload keys
                const filesPayloadArray = await this.mapStagedFilesToPayloadArray();
                // Create payload object for post
                const payload = {
                    files: filesPayloadArray,
                    forTestCustomer: window?.dataLayer[0]?.isTestCustomer === 'True',
                    uploadDate: new Date().toISOString()
                };
                // Close modal on desktop or show upload history on mobile
                if(this.isLG) this.handleModalClose();
                else {
                    this.isUploadHistoryVisible = true;
                    this.clearStagedFiles();
                }
                // Post to either services or mock api
                if(process.env.NODE_ENV !== 'development') this.postToServices(payload);
                else this.postToMockApi(payload);
            },
            async handleFiles(fileList) {
                let fileListArray = Array.from(fileList);

                const filesWithinAllowedLimit = await this.limitFilesToAvailableSlots(fileListArray);

                filesWithinAllowedLimit.forEach(async file => {
                    let previewUrl = '';
                    let hasDefaultPreview = null;
                    let error = this.validateFile(file);

                    if(this.imagePreviewTypes.includes(file.type)) {
                        // Preview can be rendered from image type as url blob
                        previewUrl = URL.createObjectURL(file);
                        hasDefaultPreview = false;
                    } else {
                        // Preview cannot be rendered from image type - use default preview image
                        previewUrl = 'https://cdnsc1.melaleuca.com/na/images/my-account/icon-nopreview.png';
                        hasDefaultPreview = true;
                    }

                    this.stagedFiles.push({
                        name: file.name,
                        previewUrl,
                        hasDefaultPreview,
                        file,
                        error
                    });
                });
                // Handle persistence of modal on desktop once file selection has begun / until click of cancel button
                this.shouldModalStayOpen = true;
                // Handle closing of mobile upload history when staging a file from mobile upload history view
                this.isUploadHistoryVisible = false;
            },
            handleModalClose() {
                this.shouldModalStayOpen = false;
                this.hideUploadModal();
                // Reset error state and clear all staged files after a short delay
                // (200ms - same length of time as the modal close CSS transition)
                // to avoid modal width collapse
                setTimeout(() => {
                    this.hasStagedFileListLengthError = false;
                    this.clearStagedFiles();
                }, 200);
            },
            hideUploadModal() {
                this.$modal.hide({ id: 'upload-modal' });
            },
            limitFilesToAvailableSlots(fileListArray) {
                // If there are no files currently staged
                if(!this.stagedFiles?.length) {
                    // If the new file list exceeds the maximum allowed files
                    if(fileListArray.length > this.maxFiles) {
                        // Limit the file list to the maximum allowed files
                        fileListArray = fileListArray.slice(0, this.maxFiles);
                        // Set error flag to indicate the file list length exceeded the limit
                        this.hasStagedFileListLengthError = true;
                    }
                } else {
                    // Calculate how many more files can be added
                    const updatedMaxFiles = this.maxFiles - this.stagedFiles.length;
                    // If the new file list exceeds the available slots
                    if(fileListArray.length > updatedMaxFiles) {
                        // Limit the file list to the available slots
                        fileListArray = fileListArray.slice(0, updatedMaxFiles);
                        // Set error flag to indicate the file list length exceeded the limit
                        this.hasStagedFileListLengthError = true;
                    }
                }
                return fileListArray;
            },
            async mapStagedFilesToPayloadArray() {
                const payloadPromises = this.stagedFiles.map(fileObj =>
                    new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = e => {
                            resolve({
                                documentName: fileObj.name,
                                base64EncodedDocumentData: e.target.result.replace(/^data:[^;]+;base64,/, '')
                            });
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(fileObj.file);
                    })
                );
                return Promise.all(payloadPromises);
            },
            async populateUploadHistoryArrayWithResponse(responseDataArray) {
                // Remove the temporary files from wherever they are in the uploadHistoryArray
                // in case the user has sorted while upload post was in flight
                const tempIds = this.tempFileArray.map(obj => obj.tempId);
                this.uploadHistoryArray = await this.uploadHistoryArray.filter(
                    obj => !tempIds.includes(obj.tempId)
                );
                // Place the uploaded file objects from the response at the beginning of the uploadHistoryArray
                this.uploadHistoryArray.unshift(...responseDataArray);
            },
            async postToMockApi(payload) {
                const response = await mockApi.post(payload);

                if(response?.data?.Success && response?.data?.Data) {
                    this.populateUploadHistoryArrayWithResponse(response.data.Data);
                }
            },
            async postToServices(payload) {
                const requestHeaders = new Headers();
                requestHeaders.append('Authorization', 'Bearer ' + this.getLocalizationProp('Data.Token'));
                requestHeaders.append('Content-Type', 'application/json');

                const requestConfig = {
                    method: 'POST',
                    headers: requestHeaders,
                    body: JSON.stringify(payload)
                };

                const requestUrl = this.$env?.ServiceBaseUrl + '/documents/v1/documentupload/' + this.$custInfo?.customerID + '/fileupload';

                await fetch(requestUrl, requestConfig)
                    .then(async response => {
                        const result = await response?.json();
                        if(result) this.populateUploadHistoryArrayWithResponse(result);
                    })
                    .catch(error => {
                        /* eslint-disable */console.log(...oo_oo(`218655502_788_24_788_72_4`,'DOCUMENT UPLOAD POST ERROR', error));
                    });
            },
            removeStagedFile(index) {
                this.stagedFiles.splice(index, 1);
            },
            showUploadModal() {
                this.$modal.show({ id: 'upload-modal' });
            },
            truncateWithEllipsis(str) {
                return str && str.length > 17 ? str.slice(0, 17) + '…' : str;
            },
            uniqid() {
                return uniqid();
            },
            validateFile(file) {
                if(!this.allowedTypes.includes(file.type)) {
                    return this.getLocalizationProp('Labels.InvalidFileTypeErrorMessage');
                }
                if(file.size > this.maxSize) {
                    return this.getLocalizationProp('Labels.FileTooLargeErrorMessage');
                }
                return null;
            }
        }
    };
/* istanbul ignore next *//* c8 ignore start *//* eslint-disable */;function oo_cm(){try{return (0,eval)("globalThis._console_ninja") || (0,eval)("/* https://github.com/wallabyjs/console-ninja#how-does-it-work */'use strict';var _0x27f4ea=_0x5cf7;function _0x36d9(){var _0x2a7840=['690392SBBGXD','ninjaSuppressConsole','level','%c\\x20Console\\x20Ninja\\x20extension\\x20is\\x20connected\\x20to\\x20','_connected','map','_isNegativeZero','getWebSocketClass','_Symbol','5016Girvng','cappedElements','props','negativeInfinity','astro','split','_socket','count','10.0.2.2','forEach','message','85491CEGaSW','getOwnPropertyNames','[object\\x20BigInt]','onopen','expo','depth','stack','prototype','_dateToString','_sortProps','setter','undefined','autoExpandMaxDepth','_reconnectTimeout','[object\\x20Array]','_propertyName','_isPrimitiveType','url','match','_setNodeQueryPath','_p_name','_objectToString','bigint','reducedLimits','env','constructor','[object\\x20Set]','String','_hasSymbolPropertyOnItsPath','196xjkxBf','osName','logger\\x20failed\\x20to\\x20connect\\x20to\\x20host','_connectAttemptCount','resetOnProcessingTimeAverageMs','parent','_ws','_p_','_getOwnPropertyDescriptor','_sendErrorMessage','replace','readyState','get','data','totalStrLength','reducePolicy','function','_additionalMetadata','angular','failed\\x20to\\x20connect\\x20to\\x20host:\\x20','Map','elements','current','_type','autoExpandPropertyCount','endsWith','isExpressionToEvaluate','resetWhenQuietMs','_isMap','_inBrowser','_blacklistedProperty','host','_maxConnectAttemptCount','1.0.0','_hasSetOnItsPath','length','_setNodeLabel','_ninjaIgnoreNextError','negativeZero','Symbol','disabledLog','127.0.0.1','RegExp','origin','[object\\x20Date]','bound\\x20Promise','index','iterator','trace','react-native','_HTMLAllCollection','autoExpand','object','funcName','_console_ninja','node','WebSocket','log','some','_console_ninja_session','versions','disabledTrace','push','call','unknown','timeStamp','_addObjectProperty','_connecting','POSITIVE_INFINITY','startsWith','hostname','next.js','modules','noFunctions','serialize','positiveInfinity','expressionsToEvaluate','_disposeWebsocket','process','concat','_isArray','charAt','capped','return\\x20import(url.pathToFileURL(path.join(nodeModules,\\x20\\x27ws/index.js\\x27)).toString());','_setNodePermissions','name','gateway.docker.internal','\\x20browser','import(\\x27path\\x27)','performance','_addFunctionsNode','onmessage','stackTraceLimit','getOwnPropertyDescriptor','10816xJVhzh','_webSocketErrorDocsLink','_WebSocket','allStrLength','remix','_hasMapOnItsPath','resolveGetters','cappedProps','getOwnPropertySymbols','substr','_connectToHostNow','_consoleNinjaAllowedToStart','toString','_processTreeNodeResult','_quotedRegExp','bind','Boolean','string','strLength','dockerizedApp','eventReceivedCallback','sortProps','autoExpandPreviousObjects','global','android','HTMLAllCollection','location','catch','reduceOnAccumulatedProcessingTimeMs','includes','send','reload','6410qFSoKL','_inNextEdge','\\x20server','default','array','defaultLimits','ws://','unref','test','1770272872048','_allowedToSend','_keyStrRegExp','NEXT_RUNTIME','args','hasOwnProperty',[\"localhost\",\"127.0.0.1\",\"example.cypress.io\",\"10.0.2.2\",\"CNHODWIT013W40C\",\"10.136.130.192\",\"172.28.64.1\"],'','Number','Promise','NEGATIVE_INFINITY','_extendedWarning','root_exp_id','Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20refreshing\\x20the\\x20page\\x20may\\x20help;\\x20also\\x20see\\x20','valueOf','https://tinyurl.com/37x8b79t','close','time','Buffer','_capIfString','fromCharCode','perf_hooks','console','reduceOnCount','_numberRegExp','perLogpoint','_attemptToReconnectShortly','resolve','see\\x20https://tinyurl.com/2vt8jxzw\\x20for\\x20more\\x20info.','autoExpandLimit','_WebSocketClass','hits','Set','[object\\x20Map]','failed\\x20to\\x20find\\x20and\\x20load\\x20WebSocket','reduceLimits','_setNodeExpressionPath','78anopaZ','_setNodeId','import(\\x27url\\x27)','_cleanNode','_allowedToConnectOnSend','coverage','_addLoadNode','284330UEndtY','nodeModules',\"c:\\\\Users\\\\cn4095\\\\.vscode\\\\extensions\\\\wallabyjs.console-ninja-1.0.515\\\\node_modules\",'_regExpToString','_treeNodePropertiesBeforeFullValue','value','_treeNodePropertiesAfterFullValue','_isUndefined',',\\x20see\\x20https://tinyurl.com/2vt8jxzw\\x20for\\x20more\\x20info.','symbol','edge','number','toUpperCase','date','isArray','_getOwnPropertyNames','null','_addProperty','Console\\x20Ninja\\x20extension\\x20is\\x20connected\\x20to\\x20','now','hrtime','warn','toLowerCase','stringify','error','475200jRFXVC','_isPrimitiveWrapperType','onerror','pop','12429FzEnku','_undefined','onclose','type','_isSet'];_0x36d9=function(){return _0x2a7840;};return _0x36d9();}(function(_0x247d5a,_0x341b8b){var _0x3f55d1=_0x5cf7,_0x36495b=_0x247d5a();while(!![]){try{var _0x14d248=-parseInt(_0x3f55d1(0x1dc))/0x1*(-parseInt(_0x3f55d1(0x18e))/0x2)+-parseInt(_0x3f55d1(0x20e))/0x3*(parseInt(_0x3f55d1(0x130))/0x4)+-parseInt(_0x3f55d1(0x1e3))/0x5+-parseInt(_0x3f55d1(0x1fc))/0x6+-parseInt(_0x3f55d1(0x219))/0x7+-parseInt(_0x3f55d1(0x205))/0x8+parseInt(_0x3f55d1(0x200))/0x9*(parseInt(_0x3f55d1(0x1ae))/0xa);if(_0x14d248===_0x341b8b)break;else _0x36495b['push'](_0x36495b['shift']());}catch(_0x4c7c25){_0x36495b['push'](_0x36495b['shift']());}}}(_0x36d9,0xf1d4b));function z(_0x22e966,_0x2a08d4,_0x1d9d5f,_0x18eca4,_0x226865,_0x14e3c8){var _0x3d90b1=_0x5cf7,_0x4c08d3,_0x3dfd9f,_0x48683c,_0x7da6d3;this[_0x3d90b1(0x1a5)]=_0x22e966,this[_0x3d90b1(0x14f)]=_0x2a08d4,this['port']=_0x1d9d5f,this['nodeModules']=_0x18eca4,this[_0x3d90b1(0x1a1)]=_0x226865,this[_0x3d90b1(0x1a2)]=_0x14e3c8,this[_0x3d90b1(0x1b8)]=!0x0,this[_0x3d90b1(0x1e0)]=!0x0,this[_0x3d90b1(0x209)]=!0x1,this[_0x3d90b1(0x173)]=!0x1,this['_inNextEdge']=((_0x3dfd9f=(_0x4c08d3=_0x22e966[_0x3d90b1(0x17e)])==null?void 0x0:_0x4c08d3[_0x3d90b1(0x231)])==null?void 0x0:_0x3dfd9f[_0x3d90b1(0x1ba)])==='edge',this[_0x3d90b1(0x14d)]=!((_0x7da6d3=(_0x48683c=this[_0x3d90b1(0x1a5)][_0x3d90b1(0x17e)])==null?void 0x0:_0x48683c[_0x3d90b1(0x16c)])!=null&&_0x7da6d3['node'])&&!this['_inNextEdge'],this[_0x3d90b1(0x1d5)]=null,this['_connectAttemptCount']=0x0,this[_0x3d90b1(0x150)]=0x14,this['_webSocketErrorDocsLink']=_0x3d90b1(0x1c6),this[_0x3d90b1(0x139)]=(this[_0x3d90b1(0x14d)]?_0x3d90b1(0x1c4):'Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20restarting\\x20the\\x20process\\x20may\\x20help;\\x20also\\x20see\\x20')+this[_0x3d90b1(0x18f)];}z[_0x27f4ea(0x220)][_0x27f4ea(0x20c)]=async function(){var _0x4e9ea2=_0x27f4ea,_0x1bd897,_0x37180d;if(this[_0x4e9ea2(0x1d5)])return this[_0x4e9ea2(0x1d5)];let _0x5520cf;if(this['_inBrowser']||this[_0x4e9ea2(0x1af)])_0x5520cf=this[_0x4e9ea2(0x1a5)][_0x4e9ea2(0x168)];else{if((_0x1bd897=this['global'][_0x4e9ea2(0x17e)])!=null&&_0x1bd897[_0x4e9ea2(0x190)])_0x5520cf=(_0x37180d=this[_0x4e9ea2(0x1a5)][_0x4e9ea2(0x17e)])==null?void 0x0:_0x37180d[_0x4e9ea2(0x190)];else try{_0x5520cf=(await new Function('path',_0x4e9ea2(0x22a),'nodeModules',_0x4e9ea2(0x183))(await(0x0,eval)(_0x4e9ea2(0x188)),await(0x0,eval)(_0x4e9ea2(0x1de)),this[_0x4e9ea2(0x1e4)]))[_0x4e9ea2(0x1b1)];}catch{try{_0x5520cf=require(require('path')['join'](this['nodeModules'],'ws'));}catch{throw new Error(_0x4e9ea2(0x1d9));}}}return this[_0x4e9ea2(0x1d5)]=_0x5520cf,_0x5520cf;},z[_0x27f4ea(0x220)][_0x27f4ea(0x198)]=function(){var _0x80449b=_0x27f4ea;this[_0x80449b(0x173)]||this[_0x80449b(0x209)]||this[_0x80449b(0x133)]>=this[_0x80449b(0x150)]||(this[_0x80449b(0x1e0)]=!0x1,this[_0x80449b(0x173)]=!0x0,this[_0x80449b(0x133)]++,this[_0x80449b(0x136)]=new Promise((_0x3afb54,_0x4b1721)=>{var _0x5882d6=_0x80449b;this['getWebSocketClass']()['then'](_0xa2a631=>{var _0x427cc4=_0x5cf7;let _0x50f21b=new _0xa2a631(_0x427cc4(0x1b4)+(!this[_0x427cc4(0x14d)]&&this[_0x427cc4(0x1a1)]?_0x427cc4(0x186):this['host'])+':'+this['port']);_0x50f21b[_0x427cc4(0x1fe)]=()=>{var _0x4a2b6b=_0x427cc4;this[_0x4a2b6b(0x1b8)]=!0x1,this[_0x4a2b6b(0x17d)](_0x50f21b),this[_0x4a2b6b(0x1d1)](),_0x4b1721(new Error('logger\\x20websocket\\x20error'));},_0x50f21b[_0x427cc4(0x21c)]=()=>{var _0x765837=_0x427cc4;this[_0x765837(0x14d)]||_0x50f21b['_socket']&&_0x50f21b['_socket'][_0x765837(0x1b5)]&&_0x50f21b[_0x765837(0x214)]['unref'](),_0x3afb54(_0x50f21b);},_0x50f21b[_0x427cc4(0x202)]=()=>{var _0x1f14a0=_0x427cc4;this[_0x1f14a0(0x1e0)]=!0x0,this['_disposeWebsocket'](_0x50f21b),this['_attemptToReconnectShortly']();},_0x50f21b[_0x427cc4(0x18b)]=_0x20f72d=>{var _0x2c8687=_0x427cc4;try{if(!(_0x20f72d!=null&&_0x20f72d[_0x2c8687(0x13d)])||!this[_0x2c8687(0x1a2)])return;let _0x31e1bb=JSON['parse'](_0x20f72d[_0x2c8687(0x13d)]);this['eventReceivedCallback'](_0x31e1bb['method'],_0x31e1bb[_0x2c8687(0x1bb)],this[_0x2c8687(0x1a5)],this[_0x2c8687(0x14d)]);}catch{}};})['then'](_0x47392a=>(this[_0x5882d6(0x209)]=!0x0,this[_0x5882d6(0x173)]=!0x1,this[_0x5882d6(0x1e0)]=!0x1,this[_0x5882d6(0x1b8)]=!0x0,this['_connectAttemptCount']=0x0,_0x47392a))['catch'](_0x557458=>(this['_connected']=!0x1,this[_0x5882d6(0x173)]=!0x1,console[_0x5882d6(0x1f8)]('logger\\x20failed\\x20to\\x20connect\\x20to\\x20host,\\x20see\\x20'+this[_0x5882d6(0x18f)]),_0x4b1721(new Error(_0x5882d6(0x143)+(_0x557458&&_0x557458[_0x5882d6(0x218)])))));}));},z['prototype'][_0x27f4ea(0x17d)]=function(_0x1f0a2c){var _0x4bf2ff=_0x27f4ea;this[_0x4bf2ff(0x209)]=!0x1,this['_connecting']=!0x1;try{_0x1f0a2c[_0x4bf2ff(0x202)]=null,_0x1f0a2c[_0x4bf2ff(0x1fe)]=null,_0x1f0a2c[_0x4bf2ff(0x21c)]=null;}catch{}try{_0x1f0a2c[_0x4bf2ff(0x13b)]<0x2&&_0x1f0a2c[_0x4bf2ff(0x1c7)]();}catch{}},z['prototype'][_0x27f4ea(0x1d1)]=function(){var _0x341bb2=_0x27f4ea;clearTimeout(this['_reconnectTimeout']),!(this[_0x341bb2(0x133)]>=this['_maxConnectAttemptCount'])&&(this[_0x341bb2(0x226)]=setTimeout(()=>{var _0x43bebd=_0x341bb2,_0x5a79f4;this[_0x43bebd(0x209)]||this[_0x43bebd(0x173)]||(this[_0x43bebd(0x198)](),(_0x5a79f4=this[_0x43bebd(0x136)])==null||_0x5a79f4[_0x43bebd(0x1a9)](()=>this['_attemptToReconnectShortly']()));},0x1f4),this[_0x341bb2(0x226)]['unref']&&this[_0x341bb2(0x226)]['unref']());},z[_0x27f4ea(0x220)]['send']=async function(_0x1313ed){var _0x479ef0=_0x27f4ea;try{if(!this[_0x479ef0(0x1b8)])return;this[_0x479ef0(0x1e0)]&&this[_0x479ef0(0x198)](),(await this[_0x479ef0(0x136)])[_0x479ef0(0x1ac)](JSON[_0x479ef0(0x1fa)](_0x1313ed));}catch(_0x11a87c){this[_0x479ef0(0x1c2)]?console[_0x479ef0(0x1f8)](this['_sendErrorMessage']+':\\x20'+(_0x11a87c&&_0x11a87c['message'])):(this[_0x479ef0(0x1c2)]=!0x0,console['warn'](this[_0x479ef0(0x139)]+':\\x20'+(_0x11a87c&&_0x11a87c['message']),_0x1313ed)),this[_0x479ef0(0x1b8)]=!0x1,this['_attemptToReconnectShortly']();}};function H(_0x43f896,_0x3f2f5a,_0x564161,_0x3241a8,_0x188d9c,_0x4c2c16,_0x44730f,_0x647db1=ne){var _0x3bb3cc=_0x27f4ea;let _0x1007b5=_0x564161[_0x3bb3cc(0x213)](',')[_0x3bb3cc(0x20a)](_0xc6ed03=>{var _0x401a03=_0x3bb3cc,_0x3c5a4a,_0x19fd6e,_0x46c009,_0x48f9f6,_0x4f2fb0,_0x3aa464,_0x5e5b35,_0x28c6b8;try{if(!_0x43f896[_0x401a03(0x16b)]){let _0x12ab8a=((_0x19fd6e=(_0x3c5a4a=_0x43f896[_0x401a03(0x17e)])==null?void 0x0:_0x3c5a4a[_0x401a03(0x16c)])==null?void 0x0:_0x19fd6e['node'])||((_0x48f9f6=(_0x46c009=_0x43f896['process'])==null?void 0x0:_0x46c009['env'])==null?void 0x0:_0x48f9f6[_0x401a03(0x1ba)])===_0x401a03(0x1ed);(_0x188d9c===_0x401a03(0x177)||_0x188d9c===_0x401a03(0x192)||_0x188d9c===_0x401a03(0x212)||_0x188d9c===_0x401a03(0x142))&&(_0x188d9c+=_0x12ab8a?_0x401a03(0x1b0):_0x401a03(0x187));let _0x1e2f73='';_0x188d9c==='react-native'&&(_0x1e2f73=(((_0x5e5b35=(_0x3aa464=(_0x4f2fb0=_0x43f896[_0x401a03(0x21d)])==null?void 0x0:_0x4f2fb0[_0x401a03(0x178)])==null?void 0x0:_0x3aa464['ExpoDevice'])==null?void 0x0:_0x5e5b35[_0x401a03(0x131)])||'emulator')['toLowerCase'](),_0x1e2f73&&(_0x188d9c+='\\x20'+_0x1e2f73,(_0x1e2f73===_0x401a03(0x1a6)||_0x1e2f73==='emulator'&&((_0x28c6b8=_0x43f896[_0x401a03(0x1a8)])==null?void 0x0:_0x28c6b8[_0x401a03(0x176)])===_0x401a03(0x216))&&(_0x3f2f5a=_0x401a03(0x216)))),_0x43f896[_0x401a03(0x16b)]={'id':+new Date(),'tool':_0x188d9c},_0x44730f&&_0x188d9c&&!_0x12ab8a&&(_0x1e2f73?console[_0x401a03(0x169)](_0x401a03(0x1f5)+_0x1e2f73+_0x401a03(0x1eb)):console[_0x401a03(0x169)](_0x401a03(0x208)+(_0x188d9c[_0x401a03(0x181)](0x0)[_0x401a03(0x1ef)]()+_0x188d9c[_0x401a03(0x197)](0x1))+',','background:\\x20rgb(30,30,30);\\x20color:\\x20rgb(255,213,92)',_0x401a03(0x1d3)));}let _0xb4d9e8=new z(_0x43f896,_0x3f2f5a,_0xc6ed03,_0x3241a8,_0x4c2c16,_0x647db1);return _0xb4d9e8[_0x401a03(0x1ac)][_0x401a03(0x19d)](_0xb4d9e8);}catch(_0x442a97){return console[_0x401a03(0x1f8)](_0x401a03(0x132),_0x442a97&&_0x442a97[_0x401a03(0x218)]),()=>{};}});return _0xd71c01=>_0x1007b5[_0x3bb3cc(0x217)](_0x107bc8=>_0x107bc8(_0xd71c01));}function _0x5cf7(_0x4902ba,_0x15b27a){var _0x36d92a=_0x36d9();return _0x5cf7=function(_0x5cf752,_0xb98aab){_0x5cf752=_0x5cf752-0x12c;var _0xc44896=_0x36d92a[_0x5cf752];return _0xc44896;},_0x5cf7(_0x4902ba,_0x15b27a);}function ne(_0x555c7e,_0x5dc757,_0x561da1,_0x9c004d){var _0x1a4a8b=_0x27f4ea;_0x9c004d&&_0x555c7e===_0x1a4a8b(0x1ad)&&_0x561da1[_0x1a4a8b(0x1a8)]['reload']();}function b(_0xfaeee1){var _0x56d18c=_0x27f4ea,_0x188689,_0x5b92be;let _0x239e1b=function(_0x3eb629,_0x35dec7){return _0x35dec7-_0x3eb629;},_0x4baa4c;if(_0xfaeee1[_0x56d18c(0x189)])_0x4baa4c=function(){var _0x208582=_0x56d18c;return _0xfaeee1['performance'][_0x208582(0x1f6)]();};else{if(_0xfaeee1[_0x56d18c(0x17e)]&&_0xfaeee1[_0x56d18c(0x17e)][_0x56d18c(0x1f7)]&&((_0x5b92be=(_0x188689=_0xfaeee1['process'])==null?void 0x0:_0x188689[_0x56d18c(0x231)])==null?void 0x0:_0x5b92be['NEXT_RUNTIME'])!=='edge')_0x4baa4c=function(){var _0x408a1c=_0x56d18c;return _0xfaeee1[_0x408a1c(0x17e)][_0x408a1c(0x1f7)]();},_0x239e1b=function(_0x10287d,_0x486a40){return 0x3e8*(_0x486a40[0x0]-_0x10287d[0x0])+(_0x486a40[0x1]-_0x10287d[0x1])/0xf4240;};else try{let {performance:_0x173e16}=require(_0x56d18c(0x1cc));_0x4baa4c=function(){var _0x2af0e6=_0x56d18c;return _0x173e16[_0x2af0e6(0x1f6)]();};}catch{_0x4baa4c=function(){return+new Date();};}}return{'elapsed':_0x239e1b,'timeStamp':_0x4baa4c,'now':()=>Date[_0x56d18c(0x1f6)]()};}function X(_0x5acfc3,_0x43f290,_0x403f1a){var _0xc745c8=_0x27f4ea,_0xdb41c8,_0x409db3,_0x56987f,_0x522b44,_0x101e79,_0x272ca2,_0x16bceb;if(_0x5acfc3['_consoleNinjaAllowedToStart']!==void 0x0)return _0x5acfc3[_0xc745c8(0x199)];let _0x525d88=((_0x409db3=(_0xdb41c8=_0x5acfc3['process'])==null?void 0x0:_0xdb41c8[_0xc745c8(0x16c)])==null?void 0x0:_0x409db3[_0xc745c8(0x167)])||((_0x522b44=(_0x56987f=_0x5acfc3[_0xc745c8(0x17e)])==null?void 0x0:_0x56987f['env'])==null?void 0x0:_0x522b44[_0xc745c8(0x1ba)])===_0xc745c8(0x1ed),_0x288ae3=!!(_0x403f1a===_0xc745c8(0x161)&&((_0x101e79=_0x5acfc3['expo'])==null?void 0x0:_0x101e79[_0xc745c8(0x178)]));function _0x5badf3(_0x4edc3a){var _0x169944=_0xc745c8;if(_0x4edc3a[_0x169944(0x175)]('/')&&_0x4edc3a[_0x169944(0x149)]('/')){let _0x55c867=new RegExp(_0x4edc3a['slice'](0x1,-0x1));return _0x48fd8b=>_0x55c867['test'](_0x48fd8b);}else{if(_0x4edc3a['includes']('*')||_0x4edc3a[_0x169944(0x1ab)]('?')){let _0x42f4be=new RegExp('^'+_0x4edc3a[_0x169944(0x13a)](/\\./g,String[_0x169944(0x1cb)](0x5c)+'.')[_0x169944(0x13a)](/\\*/g,'.*')[_0x169944(0x13a)](/\\?/g,'.')+String[_0x169944(0x1cb)](0x24));return _0x169184=>_0x42f4be['test'](_0x169184);}else return _0xbfa32d=>_0xbfa32d===_0x4edc3a;}}let _0x1b436a=_0x43f290[_0xc745c8(0x20a)](_0x5badf3);return _0x5acfc3[_0xc745c8(0x199)]=_0x525d88||!_0x43f290,!_0x5acfc3[_0xc745c8(0x199)]&&((_0x272ca2=_0x5acfc3['location'])==null?void 0x0:_0x272ca2[_0xc745c8(0x176)])&&(_0x5acfc3[_0xc745c8(0x199)]=_0x1b436a[_0xc745c8(0x16a)](_0x2f1a62=>_0x2f1a62(_0x5acfc3[_0xc745c8(0x1a8)][_0xc745c8(0x176)]))),_0x288ae3&&!_0x5acfc3[_0xc745c8(0x199)]&&!((_0x16bceb=_0x5acfc3['location'])!=null&&_0x16bceb['hostname'])&&(_0x5acfc3[_0xc745c8(0x199)]=!0x0),_0x5acfc3[_0xc745c8(0x199)];}function J(_0x1b84cf,_0x22cb75,_0x10c330,_0x425029,_0x513131,_0x475afa){var _0x214696=_0x27f4ea;_0x1b84cf=_0x1b84cf,_0x22cb75=_0x22cb75,_0x10c330=_0x10c330,_0x425029=_0x425029,_0x513131=_0x513131,_0x513131=_0x513131||{},_0x513131[_0x214696(0x1b3)]=_0x513131[_0x214696(0x1b3)]||{},_0x513131[_0x214696(0x230)]=_0x513131[_0x214696(0x230)]||{},_0x513131['reducePolicy']=_0x513131[_0x214696(0x13f)]||{},_0x513131['reducePolicy'][_0x214696(0x1d0)]=_0x513131[_0x214696(0x13f)][_0x214696(0x1d0)]||{},_0x513131[_0x214696(0x13f)]['global']=_0x513131[_0x214696(0x13f)]['global']||{};let _0x5f34e7={'perLogpoint':{'reduceOnCount':_0x513131[_0x214696(0x13f)][_0x214696(0x1d0)][_0x214696(0x1ce)]||0x32,'reduceOnAccumulatedProcessingTimeMs':_0x513131[_0x214696(0x13f)][_0x214696(0x1d0)][_0x214696(0x1aa)]||0x64,'resetWhenQuietMs':_0x513131[_0x214696(0x13f)][_0x214696(0x1d0)][_0x214696(0x14b)]||0x1f4,'resetOnProcessingTimeAverageMs':_0x513131['reducePolicy'][_0x214696(0x1d0)][_0x214696(0x134)]||0x64},'global':{'reduceOnCount':_0x513131['reducePolicy'][_0x214696(0x1a5)][_0x214696(0x1ce)]||0x3e8,'reduceOnAccumulatedProcessingTimeMs':_0x513131[_0x214696(0x13f)][_0x214696(0x1a5)][_0x214696(0x1aa)]||0x12c,'resetWhenQuietMs':_0x513131['reducePolicy']['global'][_0x214696(0x14b)]||0x32,'resetOnProcessingTimeAverageMs':_0x513131[_0x214696(0x13f)][_0x214696(0x1a5)][_0x214696(0x134)]||0x64}},_0x1d7dff=b(_0x1b84cf),_0x48727a=_0x1d7dff['elapsed'],_0x5593f0=_0x1d7dff[_0x214696(0x171)];function _0x34ed1d(){var _0x1a49de=_0x214696;this[_0x1a49de(0x1b9)]=/^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[_$a-zA-Z\\xA0-\\uFFFF][_$a-zA-Z0-9\\xA0-\\uFFFF]*$/,this[_0x1a49de(0x1cf)]=/^(0|[1-9][0-9]*)$/,this[_0x1a49de(0x19c)]=/'([^\\\\']|\\\\')*'/,this[_0x1a49de(0x201)]=_0x1b84cf[_0x1a49de(0x224)],this[_0x1a49de(0x162)]=_0x1b84cf['HTMLAllCollection'],this['_getOwnPropertyDescriptor']=Object[_0x1a49de(0x18d)],this[_0x1a49de(0x1f2)]=Object[_0x1a49de(0x21a)],this['_Symbol']=_0x1b84cf[_0x1a49de(0x157)],this['_regExpToString']=RegExp[_0x1a49de(0x220)]['toString'],this[_0x1a49de(0x221)]=Date[_0x1a49de(0x220)][_0x1a49de(0x19a)];}_0x34ed1d[_0x214696(0x220)][_0x214696(0x17a)]=function(_0x4ed169,_0x7dca5e,_0x1ea1e7,_0x4ca839){var _0x5819cb=_0x214696,_0x2fffed=this,_0xd92b7e=_0x1ea1e7['autoExpand'];function _0x5f2c45(_0x5e761f,_0x4e1bc2,_0x2961a8){var _0x1114dc=_0x5cf7;_0x4e1bc2[_0x1114dc(0x203)]='unknown',_0x4e1bc2[_0x1114dc(0x1fb)]=_0x5e761f['message'],_0x552ab6=_0x2961a8[_0x1114dc(0x167)][_0x1114dc(0x146)],_0x2961a8[_0x1114dc(0x167)]['current']=_0x4e1bc2,_0x2fffed[_0x1114dc(0x1e7)](_0x4e1bc2,_0x2961a8);}let _0x238fcb,_0x5ae890,_0x16e6f7=_0x1b84cf[_0x5819cb(0x206)];_0x1b84cf[_0x5819cb(0x206)]=!0x0,_0x1b84cf[_0x5819cb(0x1cd)]&&(_0x238fcb=_0x1b84cf[_0x5819cb(0x1cd)][_0x5819cb(0x1fb)],_0x5ae890=_0x1b84cf[_0x5819cb(0x1cd)][_0x5819cb(0x1f8)],_0x238fcb&&(_0x1b84cf[_0x5819cb(0x1cd)][_0x5819cb(0x1fb)]=function(){}),_0x5ae890&&(_0x1b84cf['console'][_0x5819cb(0x1f8)]=function(){}));try{try{_0x1ea1e7['level']++,_0x1ea1e7[_0x5819cb(0x163)]&&_0x1ea1e7[_0x5819cb(0x1a4)][_0x5819cb(0x16e)](_0x7dca5e);var _0x16cf4c,_0x36291a,_0x424803,_0x54ac07,_0xd48a44=[],_0x4c8309=[],_0x1661dc,_0x24a5e8=this[_0x5819cb(0x147)](_0x7dca5e),_0x2d0e3c=_0x24a5e8===_0x5819cb(0x1b2),_0x5193fe=!0x1,_0x23c775=_0x24a5e8===_0x5819cb(0x140),_0x6e364c=this[_0x5819cb(0x229)](_0x24a5e8),_0x527786=this['_isPrimitiveWrapperType'](_0x24a5e8),_0x236245=_0x6e364c||_0x527786,_0x2e2de3={},_0x2236a3=0x0,_0x18b840=!0x1,_0x552ab6,_0x5056dd=/^(([1-9]{1}[0-9]*)|0)$/;if(_0x1ea1e7[_0x5819cb(0x21e)]){if(_0x2d0e3c){if(_0x36291a=_0x7dca5e[_0x5819cb(0x153)],_0x36291a>_0x1ea1e7[_0x5819cb(0x145)]){for(_0x424803=0x0,_0x54ac07=_0x1ea1e7[_0x5819cb(0x145)],_0x16cf4c=_0x424803;_0x16cf4c<_0x54ac07;_0x16cf4c++)_0x4c8309[_0x5819cb(0x16e)](_0x2fffed[_0x5819cb(0x1f4)](_0xd48a44,_0x7dca5e,_0x24a5e8,_0x16cf4c,_0x1ea1e7));_0x4ed169[_0x5819cb(0x20f)]=!0x0;}else{for(_0x424803=0x0,_0x54ac07=_0x36291a,_0x16cf4c=_0x424803;_0x16cf4c<_0x54ac07;_0x16cf4c++)_0x4c8309['push'](_0x2fffed[_0x5819cb(0x1f4)](_0xd48a44,_0x7dca5e,_0x24a5e8,_0x16cf4c,_0x1ea1e7));}_0x1ea1e7[_0x5819cb(0x148)]+=_0x4c8309[_0x5819cb(0x153)];}if(!(_0x24a5e8===_0x5819cb(0x1f3)||_0x24a5e8===_0x5819cb(0x224))&&!_0x6e364c&&_0x24a5e8!==_0x5819cb(0x12e)&&_0x24a5e8!==_0x5819cb(0x1c9)&&_0x24a5e8!==_0x5819cb(0x22f)){var _0x260439=_0x4ca839[_0x5819cb(0x210)]||_0x1ea1e7[_0x5819cb(0x210)];if(this['_isSet'](_0x7dca5e)?(_0x16cf4c=0x0,_0x7dca5e['forEach'](function(_0x3545fe){var _0x4f7e9a=_0x5819cb;if(_0x2236a3++,_0x1ea1e7[_0x4f7e9a(0x148)]++,_0x2236a3>_0x260439){_0x18b840=!0x0;return;}if(!_0x1ea1e7[_0x4f7e9a(0x14a)]&&_0x1ea1e7[_0x4f7e9a(0x163)]&&_0x1ea1e7[_0x4f7e9a(0x148)]>_0x1ea1e7[_0x4f7e9a(0x1d4)]){_0x18b840=!0x0;return;}_0x4c8309[_0x4f7e9a(0x16e)](_0x2fffed[_0x4f7e9a(0x1f4)](_0xd48a44,_0x7dca5e,'Set',_0x16cf4c++,_0x1ea1e7,function(_0x28ca76){return function(){return _0x28ca76;};}(_0x3545fe)));})):this[_0x5819cb(0x14c)](_0x7dca5e)&&_0x7dca5e[_0x5819cb(0x217)](function(_0x430279,_0xddf0da){var _0x3b56da=_0x5819cb;if(_0x2236a3++,_0x1ea1e7[_0x3b56da(0x148)]++,_0x2236a3>_0x260439){_0x18b840=!0x0;return;}if(!_0x1ea1e7['isExpressionToEvaluate']&&_0x1ea1e7[_0x3b56da(0x163)]&&_0x1ea1e7[_0x3b56da(0x148)]>_0x1ea1e7[_0x3b56da(0x1d4)]){_0x18b840=!0x0;return;}var _0x352a13=_0xddf0da[_0x3b56da(0x19a)]();_0x352a13[_0x3b56da(0x153)]>0x64&&(_0x352a13=_0x352a13['slice'](0x0,0x64)+'...'),_0x4c8309[_0x3b56da(0x16e)](_0x2fffed[_0x3b56da(0x1f4)](_0xd48a44,_0x7dca5e,'Map',_0x352a13,_0x1ea1e7,function(_0x1916ea){return function(){return _0x1916ea;};}(_0x430279)));}),!_0x5193fe){try{for(_0x1661dc in _0x7dca5e)if(!(_0x2d0e3c&&_0x5056dd[_0x5819cb(0x1b6)](_0x1661dc))&&!this[_0x5819cb(0x14e)](_0x7dca5e,_0x1661dc,_0x1ea1e7)){if(_0x2236a3++,_0x1ea1e7[_0x5819cb(0x148)]++,_0x2236a3>_0x260439){_0x18b840=!0x0;break;}if(!_0x1ea1e7[_0x5819cb(0x14a)]&&_0x1ea1e7[_0x5819cb(0x163)]&&_0x1ea1e7[_0x5819cb(0x148)]>_0x1ea1e7[_0x5819cb(0x1d4)]){_0x18b840=!0x0;break;}_0x4c8309[_0x5819cb(0x16e)](_0x2fffed[_0x5819cb(0x172)](_0xd48a44,_0x2e2de3,_0x7dca5e,_0x24a5e8,_0x1661dc,_0x1ea1e7));}}catch{}if(_0x2e2de3['_p_length']=!0x0,_0x23c775&&(_0x2e2de3[_0x5819cb(0x22d)]=!0x0),!_0x18b840){var _0x57a7fe=[][_0x5819cb(0x17f)](this[_0x5819cb(0x1f2)](_0x7dca5e))[_0x5819cb(0x17f)](this['_getOwnPropertySymbols'](_0x7dca5e));for(_0x16cf4c=0x0,_0x36291a=_0x57a7fe[_0x5819cb(0x153)];_0x16cf4c<_0x36291a;_0x16cf4c++)if(_0x1661dc=_0x57a7fe[_0x16cf4c],!(_0x2d0e3c&&_0x5056dd['test'](_0x1661dc[_0x5819cb(0x19a)]()))&&!this['_blacklistedProperty'](_0x7dca5e,_0x1661dc,_0x1ea1e7)&&!_0x2e2de3[typeof _0x1661dc!='symbol'?_0x5819cb(0x137)+_0x1661dc[_0x5819cb(0x19a)]():_0x1661dc]){if(_0x2236a3++,_0x1ea1e7['autoExpandPropertyCount']++,_0x2236a3>_0x260439){_0x18b840=!0x0;break;}if(!_0x1ea1e7['isExpressionToEvaluate']&&_0x1ea1e7['autoExpand']&&_0x1ea1e7[_0x5819cb(0x148)]>_0x1ea1e7[_0x5819cb(0x1d4)]){_0x18b840=!0x0;break;}_0x4c8309[_0x5819cb(0x16e)](_0x2fffed[_0x5819cb(0x172)](_0xd48a44,_0x2e2de3,_0x7dca5e,_0x24a5e8,_0x1661dc,_0x1ea1e7));}}}}}if(_0x4ed169['type']=_0x24a5e8,_0x236245?(_0x4ed169[_0x5819cb(0x1e8)]=_0x7dca5e[_0x5819cb(0x1c5)](),this[_0x5819cb(0x1ca)](_0x24a5e8,_0x4ed169,_0x1ea1e7,_0x4ca839)):_0x24a5e8===_0x5819cb(0x1f0)?_0x4ed169['value']=this[_0x5819cb(0x221)][_0x5819cb(0x16f)](_0x7dca5e):_0x24a5e8===_0x5819cb(0x22f)?_0x4ed169[_0x5819cb(0x1e8)]=_0x7dca5e[_0x5819cb(0x19a)]():_0x24a5e8===_0x5819cb(0x15a)?_0x4ed169['value']=this[_0x5819cb(0x1e6)][_0x5819cb(0x16f)](_0x7dca5e):_0x24a5e8===_0x5819cb(0x1ec)&&this[_0x5819cb(0x20d)]?_0x4ed169[_0x5819cb(0x1e8)]=this['_Symbol'][_0x5819cb(0x220)][_0x5819cb(0x19a)][_0x5819cb(0x16f)](_0x7dca5e):!_0x1ea1e7['depth']&&!(_0x24a5e8==='null'||_0x24a5e8===_0x5819cb(0x224))&&(delete _0x4ed169[_0x5819cb(0x1e8)],_0x4ed169[_0x5819cb(0x182)]=!0x0),_0x18b840&&(_0x4ed169[_0x5819cb(0x195)]=!0x0),_0x552ab6=_0x1ea1e7[_0x5819cb(0x167)][_0x5819cb(0x146)],_0x1ea1e7['node'][_0x5819cb(0x146)]=_0x4ed169,this['_treeNodePropertiesBeforeFullValue'](_0x4ed169,_0x1ea1e7),_0x4c8309['length']){for(_0x16cf4c=0x0,_0x36291a=_0x4c8309[_0x5819cb(0x153)];_0x16cf4c<_0x36291a;_0x16cf4c++)_0x4c8309[_0x16cf4c](_0x16cf4c);}_0xd48a44[_0x5819cb(0x153)]&&(_0x4ed169['props']=_0xd48a44);}catch(_0xeed0f8){_0x5f2c45(_0xeed0f8,_0x4ed169,_0x1ea1e7);}this[_0x5819cb(0x141)](_0x7dca5e,_0x4ed169),this['_treeNodePropertiesAfterFullValue'](_0x4ed169,_0x1ea1e7),_0x1ea1e7[_0x5819cb(0x167)]['current']=_0x552ab6,_0x1ea1e7[_0x5819cb(0x207)]--,_0x1ea1e7[_0x5819cb(0x163)]=_0xd92b7e,_0x1ea1e7['autoExpand']&&_0x1ea1e7['autoExpandPreviousObjects'][_0x5819cb(0x1ff)]();}finally{_0x238fcb&&(_0x1b84cf[_0x5819cb(0x1cd)][_0x5819cb(0x1fb)]=_0x238fcb),_0x5ae890&&(_0x1b84cf['console'][_0x5819cb(0x1f8)]=_0x5ae890),_0x1b84cf[_0x5819cb(0x206)]=_0x16e6f7;}return _0x4ed169;},_0x34ed1d[_0x214696(0x220)]['_getOwnPropertySymbols']=function(_0x4596fa){var _0x5925e1=_0x214696;return Object[_0x5925e1(0x196)]?Object['getOwnPropertySymbols'](_0x4596fa):[];},_0x34ed1d[_0x214696(0x220)][_0x214696(0x204)]=function(_0x92d40f){var _0x1ac919=_0x214696;return!!(_0x92d40f&&_0x1b84cf['Set']&&this[_0x1ac919(0x22e)](_0x92d40f)===_0x1ac919(0x12d)&&_0x92d40f[_0x1ac919(0x217)]);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x14e)]=function(_0x763159,_0x18e9ad,_0xd5905d){var _0x27605f=_0x214696;if(!_0xd5905d[_0x27605f(0x194)]){let _0x5a0af9=this[_0x27605f(0x138)](_0x763159,_0x18e9ad);if(_0x5a0af9&&_0x5a0af9['get'])return!0x0;}return _0xd5905d['noFunctions']?typeof _0x763159[_0x18e9ad]==_0x27605f(0x140):!0x1;},_0x34ed1d[_0x214696(0x220)][_0x214696(0x147)]=function(_0x5f197d){var _0x3b9da1=_0x214696,_0x254abb='';return _0x254abb=typeof _0x5f197d,_0x254abb===_0x3b9da1(0x164)?this['_objectToString'](_0x5f197d)===_0x3b9da1(0x227)?_0x254abb=_0x3b9da1(0x1b2):this['_objectToString'](_0x5f197d)===_0x3b9da1(0x15c)?_0x254abb=_0x3b9da1(0x1f0):this[_0x3b9da1(0x22e)](_0x5f197d)===_0x3b9da1(0x21b)?_0x254abb=_0x3b9da1(0x22f):_0x5f197d===null?_0x254abb=_0x3b9da1(0x1f3):_0x5f197d['constructor']&&(_0x254abb=_0x5f197d[_0x3b9da1(0x12c)][_0x3b9da1(0x185)]||_0x254abb):_0x254abb===_0x3b9da1(0x224)&&this[_0x3b9da1(0x162)]&&_0x5f197d instanceof this[_0x3b9da1(0x162)]&&(_0x254abb=_0x3b9da1(0x1a7)),_0x254abb;},_0x34ed1d[_0x214696(0x220)][_0x214696(0x22e)]=function(_0x4b3483){var _0x59323a=_0x214696;return Object['prototype'][_0x59323a(0x19a)][_0x59323a(0x16f)](_0x4b3483);},_0x34ed1d['prototype'][_0x214696(0x229)]=function(_0x3f12cc){var _0x14181c=_0x214696;return _0x3f12cc==='boolean'||_0x3f12cc==='string'||_0x3f12cc===_0x14181c(0x1ee);},_0x34ed1d['prototype'][_0x214696(0x1fd)]=function(_0x24d083){var _0x824253=_0x214696;return _0x24d083===_0x824253(0x19e)||_0x24d083===_0x824253(0x12e)||_0x24d083===_0x824253(0x1bf);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1f4)]=function(_0x52c9ee,_0x3dbfa6,_0x54d057,_0x695d62,_0x1e5016,_0x5936ab){var _0x3e21d7=this;return function(_0x59ef4f){var _0x27ad85=_0x5cf7,_0x20a41f=_0x1e5016[_0x27ad85(0x167)][_0x27ad85(0x146)],_0x40b5f5=_0x1e5016[_0x27ad85(0x167)][_0x27ad85(0x15e)],_0x4b6f6b=_0x1e5016[_0x27ad85(0x167)][_0x27ad85(0x135)];_0x1e5016[_0x27ad85(0x167)][_0x27ad85(0x135)]=_0x20a41f,_0x1e5016['node'][_0x27ad85(0x15e)]=typeof _0x695d62==_0x27ad85(0x1ee)?_0x695d62:_0x59ef4f,_0x52c9ee[_0x27ad85(0x16e)](_0x3e21d7['_property'](_0x3dbfa6,_0x54d057,_0x695d62,_0x1e5016,_0x5936ab)),_0x1e5016[_0x27ad85(0x167)]['parent']=_0x4b6f6b,_0x1e5016[_0x27ad85(0x167)]['index']=_0x40b5f5;};},_0x34ed1d[_0x214696(0x220)][_0x214696(0x172)]=function(_0xff3dff,_0x328e71,_0x95c09a,_0x4ef89f,_0x5bbcff,_0xedb075,_0x2f75dd){var _0x33a8a3=_0x214696,_0x5283e9=this;return _0x328e71[typeof _0x5bbcff!=_0x33a8a3(0x1ec)?_0x33a8a3(0x137)+_0x5bbcff[_0x33a8a3(0x19a)]():_0x5bbcff]=!0x0,function(_0x811f2b){var _0x1ebac6=_0x33a8a3,_0x5659b7=_0xedb075['node'][_0x1ebac6(0x146)],_0x5b64e5=_0xedb075['node'][_0x1ebac6(0x15e)],_0x4ebd6c=_0xedb075['node'][_0x1ebac6(0x135)];_0xedb075[_0x1ebac6(0x167)]['parent']=_0x5659b7,_0xedb075[_0x1ebac6(0x167)][_0x1ebac6(0x15e)]=_0x811f2b,_0xff3dff[_0x1ebac6(0x16e)](_0x5283e9['_property'](_0x95c09a,_0x4ef89f,_0x5bbcff,_0xedb075,_0x2f75dd)),_0xedb075[_0x1ebac6(0x167)]['parent']=_0x4ebd6c,_0xedb075[_0x1ebac6(0x167)][_0x1ebac6(0x15e)]=_0x5b64e5;};},_0x34ed1d[_0x214696(0x220)]['_property']=function(_0x18b315,_0x3918ec,_0x5dfa18,_0x5319c6,_0x2d8fa5){var _0x53ed2c=_0x214696,_0x379c68=this;_0x2d8fa5||(_0x2d8fa5=function(_0x3ca008,_0x4b4854){return _0x3ca008[_0x4b4854];});var _0x3d7ff1=_0x5dfa18[_0x53ed2c(0x19a)](),_0x30d254=_0x5319c6['expressionsToEvaluate']||{},_0x155442=_0x5319c6[_0x53ed2c(0x21e)],_0x554fd1=_0x5319c6[_0x53ed2c(0x14a)];try{var _0x3237a0=this[_0x53ed2c(0x14c)](_0x18b315),_0x4e6244=_0x3d7ff1;_0x3237a0&&_0x4e6244[0x0]==='\\x27'&&(_0x4e6244=_0x4e6244[_0x53ed2c(0x197)](0x1,_0x4e6244[_0x53ed2c(0x153)]-0x2));var _0x30807e=_0x5319c6[_0x53ed2c(0x17c)]=_0x30d254[_0x53ed2c(0x137)+_0x4e6244];_0x30807e&&(_0x5319c6[_0x53ed2c(0x21e)]=_0x5319c6[_0x53ed2c(0x21e)]+0x1),_0x5319c6[_0x53ed2c(0x14a)]=!!_0x30807e;var _0x5e0092=typeof _0x5dfa18==_0x53ed2c(0x1ec),_0x4ca784={'name':_0x5e0092||_0x3237a0?_0x3d7ff1:this[_0x53ed2c(0x228)](_0x3d7ff1)};if(_0x5e0092&&(_0x4ca784['symbol']=!0x0),!(_0x3918ec===_0x53ed2c(0x1b2)||_0x3918ec==='Error')){var _0x509ba0=this['_getOwnPropertyDescriptor'](_0x18b315,_0x5dfa18);if(_0x509ba0&&(_0x509ba0['set']&&(_0x4ca784[_0x53ed2c(0x223)]=!0x0),_0x509ba0[_0x53ed2c(0x13c)]&&!_0x30807e&&!_0x5319c6[_0x53ed2c(0x194)]))return _0x4ca784['getter']=!0x0,this[_0x53ed2c(0x19b)](_0x4ca784,_0x5319c6),_0x4ca784;}var _0x14805b;try{_0x14805b=_0x2d8fa5(_0x18b315,_0x5dfa18);}catch(_0x485eec){return _0x4ca784={'name':_0x3d7ff1,'type':_0x53ed2c(0x170),'error':_0x485eec[_0x53ed2c(0x218)]},this[_0x53ed2c(0x19b)](_0x4ca784,_0x5319c6),_0x4ca784;}var _0x2cab07=this[_0x53ed2c(0x147)](_0x14805b),_0x5f522f=this[_0x53ed2c(0x229)](_0x2cab07);if(_0x4ca784[_0x53ed2c(0x203)]=_0x2cab07,_0x5f522f)this[_0x53ed2c(0x19b)](_0x4ca784,_0x5319c6,_0x14805b,function(){var _0x2cdcf4=_0x53ed2c;_0x4ca784[_0x2cdcf4(0x1e8)]=_0x14805b['valueOf'](),!_0x30807e&&_0x379c68['_capIfString'](_0x2cab07,_0x4ca784,_0x5319c6,{});});else{var _0x18c4f5=_0x5319c6[_0x53ed2c(0x163)]&&_0x5319c6[_0x53ed2c(0x207)]<_0x5319c6[_0x53ed2c(0x225)]&&_0x5319c6[_0x53ed2c(0x1a4)]['indexOf'](_0x14805b)<0x0&&_0x2cab07!==_0x53ed2c(0x140)&&_0x5319c6[_0x53ed2c(0x148)]<_0x5319c6[_0x53ed2c(0x1d4)];_0x18c4f5||_0x5319c6[_0x53ed2c(0x207)]<_0x155442||_0x30807e?this[_0x53ed2c(0x17a)](_0x4ca784,_0x14805b,_0x5319c6,_0x30807e||{}):this[_0x53ed2c(0x19b)](_0x4ca784,_0x5319c6,_0x14805b,function(){var _0x9606df=_0x53ed2c;_0x2cab07==='null'||_0x2cab07===_0x9606df(0x224)||(delete _0x4ca784[_0x9606df(0x1e8)],_0x4ca784[_0x9606df(0x182)]=!0x0);});}return _0x4ca784;}finally{_0x5319c6[_0x53ed2c(0x17c)]=_0x30d254,_0x5319c6['depth']=_0x155442,_0x5319c6[_0x53ed2c(0x14a)]=_0x554fd1;}},_0x34ed1d['prototype'][_0x214696(0x1ca)]=function(_0x26ccea,_0x6e0d21,_0x5a73cf,_0x21a5ae){var _0x38dead=_0x214696,_0x3514b6=_0x21a5ae['strLength']||_0x5a73cf[_0x38dead(0x1a0)];if((_0x26ccea===_0x38dead(0x19f)||_0x26ccea===_0x38dead(0x12e))&&_0x6e0d21['value']){let _0x4b9a3f=_0x6e0d21[_0x38dead(0x1e8)][_0x38dead(0x153)];_0x5a73cf[_0x38dead(0x191)]+=_0x4b9a3f,_0x5a73cf['allStrLength']>_0x5a73cf[_0x38dead(0x13e)]?(_0x6e0d21[_0x38dead(0x182)]='',delete _0x6e0d21[_0x38dead(0x1e8)]):_0x4b9a3f>_0x3514b6&&(_0x6e0d21[_0x38dead(0x182)]=_0x6e0d21[_0x38dead(0x1e8)][_0x38dead(0x197)](0x0,_0x3514b6),delete _0x6e0d21['value']);}},_0x34ed1d[_0x214696(0x220)][_0x214696(0x14c)]=function(_0x4c3992){var _0x2533b1=_0x214696;return!!(_0x4c3992&&_0x1b84cf[_0x2533b1(0x144)]&&this['_objectToString'](_0x4c3992)===_0x2533b1(0x1d8)&&_0x4c3992[_0x2533b1(0x217)]);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x228)]=function(_0x3eeb2c){var _0x20c0cd=_0x214696;if(_0x3eeb2c[_0x20c0cd(0x22b)](/^\\d+$/))return _0x3eeb2c;var _0x387e31;try{_0x387e31=JSON['stringify'](''+_0x3eeb2c);}catch{_0x387e31='\\x22'+this['_objectToString'](_0x3eeb2c)+'\\x22';}return _0x387e31[_0x20c0cd(0x22b)](/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)?_0x387e31=_0x387e31['substr'](0x1,_0x387e31[_0x20c0cd(0x153)]-0x2):_0x387e31=_0x387e31['replace'](/'/g,'\\x5c\\x27')[_0x20c0cd(0x13a)](/\\\\\"/g,'\\x22')[_0x20c0cd(0x13a)](/(^\"|\"$)/g,'\\x27'),_0x387e31;},_0x34ed1d[_0x214696(0x220)][_0x214696(0x19b)]=function(_0x30b649,_0x4ffe49,_0x5f6329,_0x38e972){var _0x4d8b4d=_0x214696;this['_treeNodePropertiesBeforeFullValue'](_0x30b649,_0x4ffe49),_0x38e972&&_0x38e972(),this[_0x4d8b4d(0x141)](_0x5f6329,_0x30b649),this[_0x4d8b4d(0x1e9)](_0x30b649,_0x4ffe49);},_0x34ed1d[_0x214696(0x220)]['_treeNodePropertiesBeforeFullValue']=function(_0x5576c4,_0x3ebbfb){var _0x4c4b0a=_0x214696;this[_0x4c4b0a(0x1dd)](_0x5576c4,_0x3ebbfb),this['_setNodeQueryPath'](_0x5576c4,_0x3ebbfb),this['_setNodeExpressionPath'](_0x5576c4,_0x3ebbfb),this['_setNodePermissions'](_0x5576c4,_0x3ebbfb);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1dd)]=function(_0x20825e,_0x33577b){},_0x34ed1d['prototype'][_0x214696(0x22c)]=function(_0x25683b,_0x4784b5){},_0x34ed1d[_0x214696(0x220)][_0x214696(0x154)]=function(_0x33bded,_0x1ca65a){},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1ea)]=function(_0x5224eb){var _0x1075ea=_0x214696;return _0x5224eb===this[_0x1075ea(0x201)];},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1e9)]=function(_0x3bf243,_0x46d534){var _0x3c71e5=_0x214696;this[_0x3c71e5(0x154)](_0x3bf243,_0x46d534),this['_setNodeExpandableState'](_0x3bf243),_0x46d534[_0x3c71e5(0x1a3)]&&this['_sortProps'](_0x3bf243),this[_0x3c71e5(0x18a)](_0x3bf243,_0x46d534),this[_0x3c71e5(0x1e2)](_0x3bf243,_0x46d534),this[_0x3c71e5(0x1df)](_0x3bf243);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x141)]=function(_0x49892b,_0x2c9fcb){var _0x367b88=_0x214696;try{_0x49892b&&typeof _0x49892b['length']==_0x367b88(0x1ee)&&(_0x2c9fcb[_0x367b88(0x153)]=_0x49892b[_0x367b88(0x153)]);}catch{}if(_0x2c9fcb[_0x367b88(0x203)]==='number'||_0x2c9fcb['type']===_0x367b88(0x1bf)){if(isNaN(_0x2c9fcb[_0x367b88(0x1e8)]))_0x2c9fcb['nan']=!0x0,delete _0x2c9fcb[_0x367b88(0x1e8)];else switch(_0x2c9fcb[_0x367b88(0x1e8)]){case Number[_0x367b88(0x174)]:_0x2c9fcb[_0x367b88(0x17b)]=!0x0,delete _0x2c9fcb[_0x367b88(0x1e8)];break;case Number[_0x367b88(0x1c1)]:_0x2c9fcb[_0x367b88(0x211)]=!0x0,delete _0x2c9fcb['value'];break;case 0x0:this[_0x367b88(0x20b)](_0x2c9fcb[_0x367b88(0x1e8)])&&(_0x2c9fcb[_0x367b88(0x156)]=!0x0);break;}}else _0x2c9fcb[_0x367b88(0x203)]===_0x367b88(0x140)&&typeof _0x49892b['name']==_0x367b88(0x19f)&&_0x49892b[_0x367b88(0x185)]&&_0x2c9fcb[_0x367b88(0x185)]&&_0x49892b[_0x367b88(0x185)]!==_0x2c9fcb[_0x367b88(0x185)]&&(_0x2c9fcb[_0x367b88(0x165)]=_0x49892b[_0x367b88(0x185)]);},_0x34ed1d['prototype'][_0x214696(0x20b)]=function(_0x227af0){return 0x1/_0x227af0===Number['NEGATIVE_INFINITY'];},_0x34ed1d['prototype'][_0x214696(0x222)]=function(_0x27dce3){var _0x331cd8=_0x214696;!_0x27dce3[_0x331cd8(0x210)]||!_0x27dce3[_0x331cd8(0x210)][_0x331cd8(0x153)]||_0x27dce3[_0x331cd8(0x203)]===_0x331cd8(0x1b2)||_0x27dce3['type']===_0x331cd8(0x144)||_0x27dce3[_0x331cd8(0x203)]===_0x331cd8(0x1d7)||_0x27dce3[_0x331cd8(0x210)]['sort'](function(_0x1994d2,_0x317377){var _0x4191d5=_0x331cd8,_0x35525d=_0x1994d2[_0x4191d5(0x185)][_0x4191d5(0x1f9)](),_0x18ffb7=_0x317377[_0x4191d5(0x185)][_0x4191d5(0x1f9)]();return _0x35525d<_0x18ffb7?-0x1:_0x35525d>_0x18ffb7?0x1:0x0;});},_0x34ed1d[_0x214696(0x220)][_0x214696(0x18a)]=function(_0x5a52d9,_0x252462){var _0x1838f0=_0x214696;if(!(_0x252462[_0x1838f0(0x179)]||!_0x5a52d9['props']||!_0x5a52d9[_0x1838f0(0x210)]['length'])){for(var _0x25c031=[],_0x4fa983=[],_0x345970=0x0,_0x29561b=_0x5a52d9[_0x1838f0(0x210)][_0x1838f0(0x153)];_0x345970<_0x29561b;_0x345970++){var _0x18ce7d=_0x5a52d9[_0x1838f0(0x210)][_0x345970];_0x18ce7d[_0x1838f0(0x203)]==='function'?_0x25c031['push'](_0x18ce7d):_0x4fa983[_0x1838f0(0x16e)](_0x18ce7d);}if(!(!_0x4fa983[_0x1838f0(0x153)]||_0x25c031['length']<=0x1)){_0x5a52d9[_0x1838f0(0x210)]=_0x4fa983;var _0x1e2b92={'functionsNode':!0x0,'props':_0x25c031};this['_setNodeId'](_0x1e2b92,_0x252462),this[_0x1838f0(0x154)](_0x1e2b92,_0x252462),this['_setNodeExpandableState'](_0x1e2b92),this[_0x1838f0(0x184)](_0x1e2b92,_0x252462),_0x1e2b92['id']+='\\x20f',_0x5a52d9[_0x1838f0(0x210)]['unshift'](_0x1e2b92);}}},_0x34ed1d['prototype'][_0x214696(0x1e2)]=function(_0x34b99c,_0x45eb99){},_0x34ed1d[_0x214696(0x220)]['_setNodeExpandableState']=function(_0x5b55c3){},_0x34ed1d[_0x214696(0x220)][_0x214696(0x180)]=function(_0x58cc5e){var _0xf4ba55=_0x214696;return Array[_0xf4ba55(0x1f1)](_0x58cc5e)||typeof _0x58cc5e==_0xf4ba55(0x164)&&this[_0xf4ba55(0x22e)](_0x58cc5e)===_0xf4ba55(0x227);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x184)]=function(_0x29d75c,_0xe2d021){},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1df)]=function(_0xa023c9){var _0x589591=_0x214696;delete _0xa023c9[_0x589591(0x12f)],delete _0xa023c9[_0x589591(0x152)],delete _0xa023c9[_0x589591(0x193)];},_0x34ed1d['prototype'][_0x214696(0x1db)]=function(_0x2562a9,_0x2d27a2){};let _0x28f581=new _0x34ed1d(),_0x502a66={'props':_0x513131[_0x214696(0x1b3)][_0x214696(0x210)]||0x64,'elements':_0x513131[_0x214696(0x1b3)][_0x214696(0x145)]||0x64,'strLength':_0x513131[_0x214696(0x1b3)]['strLength']||0x400*0x32,'totalStrLength':_0x513131[_0x214696(0x1b3)][_0x214696(0x13e)]||0x400*0x32,'autoExpandLimit':_0x513131[_0x214696(0x1b3)]['autoExpandLimit']||0x1388,'autoExpandMaxDepth':_0x513131[_0x214696(0x1b3)][_0x214696(0x225)]||0xa},_0x13ef23={'props':_0x513131[_0x214696(0x230)][_0x214696(0x210)]||0x5,'elements':_0x513131['reducedLimits'][_0x214696(0x145)]||0x5,'strLength':_0x513131['reducedLimits'][_0x214696(0x1a0)]||0x100,'totalStrLength':_0x513131[_0x214696(0x230)]['totalStrLength']||0x100*0x3,'autoExpandLimit':_0x513131[_0x214696(0x230)][_0x214696(0x1d4)]||0x1e,'autoExpandMaxDepth':_0x513131['reducedLimits']['autoExpandMaxDepth']||0x2};if(_0x475afa){let _0x29800f=_0x28f581[_0x214696(0x17a)][_0x214696(0x19d)](_0x28f581);_0x28f581[_0x214696(0x17a)]=function(_0x10fd5b,_0x3e4059,_0x54184b,_0x152e04){return _0x29800f(_0x10fd5b,_0x475afa(_0x3e4059),_0x54184b,_0x152e04);};}function _0x2b3bff(_0x12d8f0,_0x4cf31e,_0x573668,_0x6b9276,_0x430332,_0x9e1f91){var _0x317b69=_0x214696;let _0x120eeb,_0x5a07b2;try{_0x5a07b2=_0x5593f0(),_0x120eeb=_0x10c330[_0x4cf31e],!_0x120eeb||_0x5a07b2-_0x120eeb['ts']>_0x5f34e7['perLogpoint'][_0x317b69(0x14b)]&&_0x120eeb[_0x317b69(0x215)]&&_0x120eeb[_0x317b69(0x1c8)]/_0x120eeb[_0x317b69(0x215)]<_0x5f34e7[_0x317b69(0x1d0)][_0x317b69(0x134)]?(_0x10c330[_0x4cf31e]=_0x120eeb={'count':0x0,'time':0x0,'ts':_0x5a07b2},_0x10c330[_0x317b69(0x1d6)]={}):_0x5a07b2-_0x10c330['hits']['ts']>_0x5f34e7[_0x317b69(0x1a5)][_0x317b69(0x14b)]&&_0x10c330[_0x317b69(0x1d6)]['count']&&_0x10c330[_0x317b69(0x1d6)]['time']/_0x10c330[_0x317b69(0x1d6)][_0x317b69(0x215)]<_0x5f34e7['global'][_0x317b69(0x134)]&&(_0x10c330['hits']={});let _0x371293=[],_0x57f51c=_0x120eeb[_0x317b69(0x1da)]||_0x10c330[_0x317b69(0x1d6)]['reduceLimits']?_0x13ef23:_0x502a66,_0x1bcf5c=_0x91ed01=>{var _0x1aa6af=_0x317b69;let _0xc556ae={};return _0xc556ae[_0x1aa6af(0x210)]=_0x91ed01['props'],_0xc556ae[_0x1aa6af(0x145)]=_0x91ed01[_0x1aa6af(0x145)],_0xc556ae['strLength']=_0x91ed01[_0x1aa6af(0x1a0)],_0xc556ae[_0x1aa6af(0x13e)]=_0x91ed01[_0x1aa6af(0x13e)],_0xc556ae['autoExpandLimit']=_0x91ed01[_0x1aa6af(0x1d4)],_0xc556ae[_0x1aa6af(0x225)]=_0x91ed01[_0x1aa6af(0x225)],_0xc556ae['sortProps']=!0x1,_0xc556ae['noFunctions']=!_0x22cb75,_0xc556ae[_0x1aa6af(0x21e)]=0x1,_0xc556ae[_0x1aa6af(0x207)]=0x0,_0xc556ae['expId']=_0x1aa6af(0x1c3),_0xc556ae['rootExpression']='root_exp',_0xc556ae[_0x1aa6af(0x163)]=!0x0,_0xc556ae['autoExpandPreviousObjects']=[],_0xc556ae[_0x1aa6af(0x148)]=0x0,_0xc556ae[_0x1aa6af(0x194)]=_0x513131['resolveGetters'],_0xc556ae[_0x1aa6af(0x191)]=0x0,_0xc556ae[_0x1aa6af(0x167)]={'current':void 0x0,'parent':void 0x0,'index':0x0},_0xc556ae;};for(var _0x1b0099=0x0;_0x1b0099<_0x430332[_0x317b69(0x153)];_0x1b0099++)_0x371293['push'](_0x28f581[_0x317b69(0x17a)]({'timeNode':_0x12d8f0===_0x317b69(0x1c8)||void 0x0},_0x430332[_0x1b0099],_0x1bcf5c(_0x57f51c),{}));if(_0x12d8f0===_0x317b69(0x160)||_0x12d8f0===_0x317b69(0x1fb)){let _0x2d5716=Error[_0x317b69(0x18c)];try{Error[_0x317b69(0x18c)]=0x1/0x0,_0x371293[_0x317b69(0x16e)](_0x28f581['serialize']({'stackNode':!0x0},new Error()[_0x317b69(0x21f)],_0x1bcf5c(_0x57f51c),{'strLength':0x1/0x0}));}finally{Error[_0x317b69(0x18c)]=_0x2d5716;}}return{'method':_0x317b69(0x169),'version':_0x425029,'args':[{'ts':_0x573668,'session':_0x6b9276,'args':_0x371293,'id':_0x4cf31e,'context':_0x9e1f91}]};}catch(_0x40679d){return{'method':_0x317b69(0x169),'version':_0x425029,'args':[{'ts':_0x573668,'session':_0x6b9276,'args':[{'type':_0x317b69(0x170),'error':_0x40679d&&_0x40679d[_0x317b69(0x218)]}],'id':_0x4cf31e,'context':_0x9e1f91}]};}finally{try{if(_0x120eeb&&_0x5a07b2){let _0x27a114=_0x5593f0();_0x120eeb['count']++,_0x120eeb[_0x317b69(0x1c8)]+=_0x48727a(_0x5a07b2,_0x27a114),_0x120eeb['ts']=_0x27a114,_0x10c330['hits'][_0x317b69(0x215)]++,_0x10c330[_0x317b69(0x1d6)][_0x317b69(0x1c8)]+=_0x48727a(_0x5a07b2,_0x27a114),_0x10c330[_0x317b69(0x1d6)]['ts']=_0x27a114,(_0x120eeb['count']>_0x5f34e7['perLogpoint'][_0x317b69(0x1ce)]||_0x120eeb['time']>_0x5f34e7['perLogpoint']['reduceOnAccumulatedProcessingTimeMs'])&&(_0x120eeb[_0x317b69(0x1da)]=!0x0),(_0x10c330['hits']['count']>_0x5f34e7['global'][_0x317b69(0x1ce)]||_0x10c330['hits'][_0x317b69(0x1c8)]>_0x5f34e7[_0x317b69(0x1a5)][_0x317b69(0x1aa)])&&(_0x10c330[_0x317b69(0x1d6)][_0x317b69(0x1da)]=!0x0);}}catch{}}}return _0x2b3bff;}function G(_0x434b91){var _0x257403=_0x27f4ea;if(_0x434b91&&typeof _0x434b91=='object'&&_0x434b91[_0x257403(0x12c)])switch(_0x434b91['constructor']['name']){case _0x257403(0x1c0):return _0x434b91[_0x257403(0x1bc)](Symbol[_0x257403(0x15f)])?Promise[_0x257403(0x1d2)]():_0x434b91;case _0x257403(0x15d):return Promise[_0x257403(0x1d2)]();}return _0x434b91;}((_0xb12d58,_0x1c1888,_0x4be2b0,_0x6defa5,_0x3edf33,_0x39ddf7,_0x2e212d,_0x35551d,_0x1eb46e,_0x4e3e05,_0x219815,_0x40c102)=>{var _0x47ee38=_0x27f4ea;if(_0xb12d58[_0x47ee38(0x166)])return _0xb12d58[_0x47ee38(0x166)];let _0x41d96a={'consoleLog':()=>{},'consoleTrace':()=>{},'consoleTime':()=>{},'consoleTimeEnd':()=>{},'autoLog':()=>{},'autoLogMany':()=>{},'autoTraceMany':()=>{},'coverage':()=>{},'autoTrace':()=>{},'autoTime':()=>{},'autoTimeEnd':()=>{}};if(!X(_0xb12d58,_0x35551d,_0x3edf33))return _0xb12d58[_0x47ee38(0x166)]=_0x41d96a,_0xb12d58[_0x47ee38(0x166)];let _0x5cf254=b(_0xb12d58),_0x211417=_0x5cf254['elapsed'],_0x120ed8=_0x5cf254[_0x47ee38(0x171)],_0x4d12ad=_0x5cf254[_0x47ee38(0x1f6)],_0x40a67f={'hits':{},'ts':{}},_0xbddbd0=J(_0xb12d58,_0x1eb46e,_0x40a67f,_0x39ddf7,_0x40c102,_0x3edf33===_0x47ee38(0x177)?G:void 0x0),_0x391c84=(_0x3a42bb,_0x4e5be3,_0x29339e,_0x59a5b4,_0x4e05b6,_0xeaaf9e)=>{var _0x5a78e6=_0x47ee38;let _0x2a987d=_0xb12d58[_0x5a78e6(0x166)];try{return _0xb12d58[_0x5a78e6(0x166)]=_0x41d96a,_0xbddbd0(_0x3a42bb,_0x4e5be3,_0x29339e,_0x59a5b4,_0x4e05b6,_0xeaaf9e);}finally{_0xb12d58[_0x5a78e6(0x166)]=_0x2a987d;}},_0x486373=_0x41f49c=>{_0x40a67f['ts'][_0x41f49c]=_0x120ed8();},_0x375f8a=(_0x586b6b,_0x281c49)=>{var _0x42f9bc=_0x47ee38;let _0x1de228=_0x40a67f['ts'][_0x281c49];if(delete _0x40a67f['ts'][_0x281c49],_0x1de228){let _0x3d4aab=_0x211417(_0x1de228,_0x120ed8());_0x3b4188(_0x391c84(_0x42f9bc(0x1c8),_0x586b6b,_0x4d12ad(),_0x39ea0c,[_0x3d4aab],_0x281c49));}},_0x36a5c5=_0x538015=>{var _0x2867b1=_0x47ee38,_0x3d1b72;return _0x3edf33===_0x2867b1(0x177)&&_0xb12d58[_0x2867b1(0x15b)]&&((_0x3d1b72=_0x538015==null?void 0x0:_0x538015[_0x2867b1(0x1bb)])==null?void 0x0:_0x3d1b72['length'])&&(_0x538015[_0x2867b1(0x1bb)][0x0]['origin']=_0xb12d58[_0x2867b1(0x15b)]),_0x538015;};_0xb12d58[_0x47ee38(0x166)]={'consoleLog':(_0x51ed74,_0xe11fc)=>{var _0x38ecd1=_0x47ee38;_0xb12d58[_0x38ecd1(0x1cd)]['log'][_0x38ecd1(0x185)]!==_0x38ecd1(0x158)&&_0x3b4188(_0x391c84(_0x38ecd1(0x169),_0x51ed74,_0x4d12ad(),_0x39ea0c,_0xe11fc));},'consoleTrace':(_0x137d17,_0x1d312d)=>{var _0x51cf82=_0x47ee38,_0x5b8a58,_0x41a828;_0xb12d58[_0x51cf82(0x1cd)][_0x51cf82(0x169)][_0x51cf82(0x185)]!==_0x51cf82(0x16d)&&((_0x41a828=(_0x5b8a58=_0xb12d58['process'])==null?void 0x0:_0x5b8a58[_0x51cf82(0x16c)])!=null&&_0x41a828['node']&&(_0xb12d58[_0x51cf82(0x155)]=!0x0),_0x3b4188(_0x36a5c5(_0x391c84(_0x51cf82(0x160),_0x137d17,_0x4d12ad(),_0x39ea0c,_0x1d312d))));},'consoleError':(_0x1f78e4,_0x2b1ba8)=>{var _0x13a967=_0x47ee38;_0xb12d58[_0x13a967(0x155)]=!0x0,_0x3b4188(_0x36a5c5(_0x391c84(_0x13a967(0x1fb),_0x1f78e4,_0x4d12ad(),_0x39ea0c,_0x2b1ba8)));},'consoleTime':_0x1a9247=>{_0x486373(_0x1a9247);},'consoleTimeEnd':(_0x5d368a,_0x200ddf)=>{_0x375f8a(_0x200ddf,_0x5d368a);},'autoLog':(_0x5d21fe,_0x1d28a4)=>{var _0x262f79=_0x47ee38;_0x3b4188(_0x391c84(_0x262f79(0x169),_0x1d28a4,_0x4d12ad(),_0x39ea0c,[_0x5d21fe]));},'autoLogMany':(_0x3c9460,_0x1c3a81)=>{_0x3b4188(_0x391c84('log',_0x3c9460,_0x4d12ad(),_0x39ea0c,_0x1c3a81));},'autoTrace':(_0x1e8e77,_0x45393a)=>{var _0x10935e=_0x47ee38;_0x3b4188(_0x36a5c5(_0x391c84(_0x10935e(0x160),_0x45393a,_0x4d12ad(),_0x39ea0c,[_0x1e8e77])));},'autoTraceMany':(_0x5e24f4,_0x2f9fe6)=>{var _0xfcca09=_0x47ee38;_0x3b4188(_0x36a5c5(_0x391c84(_0xfcca09(0x160),_0x5e24f4,_0x4d12ad(),_0x39ea0c,_0x2f9fe6)));},'autoTime':(_0x5efb2d,_0x485584,_0x2bb811)=>{_0x486373(_0x2bb811);},'autoTimeEnd':(_0x43da21,_0x51b33a,_0x2ed8c7)=>{_0x375f8a(_0x51b33a,_0x2ed8c7);},'coverage':_0x188923=>{var _0x35709e=_0x47ee38;_0x3b4188({'method':_0x35709e(0x1e1),'version':_0x39ddf7,'args':[{'id':_0x188923}]});}};let _0x3b4188=H(_0xb12d58,_0x1c1888,_0x4be2b0,_0x6defa5,_0x3edf33,_0x4e3e05,_0x219815),_0x39ea0c=_0xb12d58[_0x47ee38(0x16b)];return _0xb12d58[_0x47ee38(0x166)];})(globalThis,_0x27f4ea(0x159),'61485',_0x27f4ea(0x1e5),'webpack',_0x27f4ea(0x151),_0x27f4ea(0x1b7),_0x27f4ea(0x1bd),_0x27f4ea(0x1be),'','1',{\"resolveGetters\":false,\"defaultLimits\":{\"props\":100,\"elements\":100,\"strLength\":51200,\"totalStrLength\":51200,\"autoExpandLimit\":5000,\"autoExpandMaxDepth\":10},\"reducedLimits\":{\"props\":5,\"elements\":5,\"strLength\":256,\"totalStrLength\":768,\"autoExpandLimit\":30,\"autoExpandMaxDepth\":2},\"reducePolicy\":{\"perLogpoint\":{\"reduceOnCount\":50,\"reduceOnAccumulatedProcessingTimeMs\":100,\"resetWhenQuietMs\":500,\"resetOnProcessingTimeAverageMs\":100},\"global\":{\"reduceOnCount\":1000,\"reduceOnAccumulatedProcessingTimeMs\":300,\"resetWhenQuietMs\":50,\"resetOnProcessingTimeAverageMs\":100}}});");}catch(e){console.error(e);}};/* istanbul ignore next */function oo_oo(/**@type{any}**/i,/**@type{any}**/...v){try{oo_cm().consoleLog(i, v);}catch(e){} return v};/* istanbul ignore next */function oo_tr(/**@type{any}**/i,/**@type{any}**/...v){try{oo_cm().consoleTrace(i, v);}catch(e){} return v};/* istanbul ignore next */function oo_tx(/**@type{any}**/i,/**@type{any}**/...v){try{oo_cm().consoleError(i, v);}catch(e){} return v};/* istanbul ignore next */function oo_ts(/**@type{any}**/v){try{oo_cm().consoleTime(v);}catch(e){} return v;};/* istanbul ignore next */function oo_te(/**@type{any}**/v, /**@type{any}**/i){try{oo_cm().consoleTimeEnd(v, i);}catch(e){} return v;};/*eslint unicorn/no-abusive-eslint-disable:,eslint-comments/disable-enable-pair:,eslint-comments/no-unlimited-disable:,eslint-comments/no-aggregating-enable:,eslint-comments/no-duplicate-disable:,eslint-comments/no-unused-disable:,eslint-comments/no-unused-enable:,*/</script>
