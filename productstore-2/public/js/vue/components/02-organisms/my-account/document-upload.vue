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
                        console.log('DOCUMENT GET ERROR', error);
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
                        console.log('DOCUMENT UPLOAD POST ERROR', error);
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
</script>
