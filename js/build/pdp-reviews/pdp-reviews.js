// TODO: Refactor PDP ReviewDisplay component to hide/show elements with CSS only solution
// See http://tfs:8080/tfs/MelaleucaIT/Melaleuca/_workitems/edit/112684

const PDP_REVIEWS = {
    hasReviews() {
        return document.getElementsByClassName('pr-review').length > 0;
    },
    hideReviewsList() {
        const showHideElements = [];
        const reviews = document.getElementById('section-pdp-reviews');
        if(reviews) {
            // show/hide Review Section
            showHideElements.push(reviews);

            // show/hide HR
            const prevSibling = reviews.previousElementSibling;
            if(prevSibling) showHideElements.push(prevSibling);
        }

        // show/hide Jump Link
        const jumpLink = document.querySelectorAll('.m-jumpLinks__item.-reviews')[0];
        if(jumpLink) showHideElements.push(jumpLink);

        showHideElements.forEach((ratingsElement) => {
            if(this.isUserLoggedIn() && this.hasReviews()) {
                ratingsElement.classList.remove('hidden');
            } else {
                ratingsElement.classList.add('hidden');
            }
        });
    },
    hideTopReviews() {
        const starReviews = document.getElementsByClassName('a-reviewSnippet');
        starReviews.forEach(review => {
            if(this.hasReviews()) {
                review.classList.remove('hidden');
            } else {
                review.classList.add('hidden');
            }
        });
    },
    isUserLoggedIn() {
        return window.dataLayer && window.dataLayer[0].userLogged;
    },
    moveAndChangeReviewDisplayElements(
        marketingExecutiveText,
        nonMarketingExecutiveText,
        yesText,
        merchantResponseHeadlineText,
        isMerchantResponseBlockHidden
    ) {
        const prReviews = document.querySelectorAll('.pr-review');

        prReviews.forEach((review) => {
            const stars = review.querySelector('.pr-rd-star-rating');
            const date = review.querySelector('.pr-rd-author-submission-date');
            const description = review.querySelector('.pr-rd-description');
            const voting = review.querySelector('.pr-rd-helpful-action-group');
            const header = review.querySelector('.pr-rd-header');
            const author = review.querySelector('.pr-rd-author-nickname');
            const defList = review.querySelector('.pr-rd-def-list');
            const merchantResponseBlock = review.querySelector('.pr-rd-merchant-response');
            const merchantResponseHeadline = review.querySelector(
                '.pr-rd-merchant-response-headline > strong'
            );

            // move voting feature into container below review description text
            description.append(voting);

            if(merchantResponseBlock && !isMerchantResponseBlockHidden) {
                // move merchant response block below review voting
                description.append(merchantResponseBlock);
                // replace merchant response headline with custom text arg
                merchantResponseHeadline.innerText = merchantResponseHeadlineText;
            }

            // move submission date into stars container
            stars.append(date);

            // move author name into header container below heading
            header.append(author);

            if(defList) {
                // move reviewer label into header container below author
                header.append(defList);

                const descriptionDetail = defList.querySelector('dd');

                if(descriptionDetail) {
                    if(descriptionDetail.innerHTML.toLowerCase() === yesText.toLowerCase()) {
                        // change text if marketing executive
                        defList.innerText = marketingExecutiveText;
                    } else {
                        defList.innerText = nonMarketingExecutiveText;
                    }
                }
            } else {
                // if the reviewer didn't say if they were a marketing executive or not, apply the nonMarketingExecutiveText
                const nonMemberElement = document.createElement('p');
                nonMemberElement.classList.add('pr-rd-def-list');
                const nonMemberText = document.createTextNode(nonMarketingExecutiveText);
                nonMemberElement.appendChild(nonMemberText);
                header.append(nonMemberElement);
            }
        });
    },
    onReady(
        marketingExecutiveText,
        nonMarketingExecutiveText,
        yesText,
        merchantResponseHeadlineText,
        isMerchantResponseBlockHidden = true
    ) {
        this.hideTopReviews();
        this.hideReviewsList();
        this.reviewsLink();
        this.moveAndChangeReviewDisplayElements(
            marketingExecutiveText,
            nonMarketingExecutiveText,
            yesText,
            merchantResponseHeadlineText,
            isMerchantResponseBlockHidden
        );
        this.prReviewDisplayMutationObserver(
            marketingExecutiveText,
            nonMarketingExecutiveText,
            yesText,
            merchantResponseHeadlineText,
            isMerchantResponseBlockHidden
        );
    },
    prReviewDisplayMutationObserver(
        marketingExecutiveText,
        nonMarketingExecutiveText,
        yesText,
        merchantResponseHeadlineText,
        isMerchantResponseBlockHidden
    ) {
        const observerTarget = document.getElementById('pr-review-display');
        const onChildListMutation = () => {
            this.moveAndChangeReviewDisplayElements(
                marketingExecutiveText,
                nonMarketingExecutiveText,
                yesText,
                merchantResponseHeadlineText,
                isMerchantResponseBlockHidden
            );
        };
        const observer = new MutationObserver(onChildListMutation);
        if(observerTarget) {
            observer.observe(observerTarget, { childList: true });
        }
    },
    reviewsLink() {
        const reviewLink = document.getElementsByClassName('pr-snippet-review-count')[0];
        if(reviewLink && reviewLink.style.display !== 'none') {
            // create a substitute tag and make it anchor link if user is logged-in else para tag
            const reviewNewLink = this.isUserLoggedIn() ? document.createElement('a') : document.createElement('p');
            reviewNewLink.innerHTML = reviewLink.innerHTML;
            reviewNewLink.className += 'pr-snippet-review-count';
            reviewLink.parentElement.appendChild(reviewNewLink);
            reviewLink.style.display = 'none';
            if(this.isUserLoggedIn()) {
                reviewNewLink.href = '#section-pdp-reviews';
            }
        }
    }
};

window.PDPReviews = PDP_REVIEWS;
