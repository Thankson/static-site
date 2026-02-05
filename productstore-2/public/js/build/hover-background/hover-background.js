// module setup

/*******
 *
 *  1. This module requires a container and that container requires a single, direct child inner div
 *  2. data-js="hoverBg" is REQUIRED on the container
 *  3. data-bg-overlay is REQUIRED and its value can be any valid CSS background value
 *  4. data-hover-text is OPTIONAL and should contain any valid CSS text color value
 *  5. Everything else is automated by the JS module below
 *
 * Example:
 *
 *  <div class="someContainer" data-js="hoverBg" data-bg-overlay="#fff" data-hover-text="#000">
 *      <div class="myInnerDivChild">
 *          This div and its contents will be cloned by the JS Below
 *      </div>
 *  </div>
 *
 *
 *******/

const HOVER_BG = {
    onReady: function () {
        const $PRIMARY_BG = $('[data-js=hoverBg]');

        if(!$PRIMARY_BG.length) {
            return;
        }

        $PRIMARY_BG
            .each(
                function (index, el) {
                    let $el = $(el);
                    $el.children().attr('data-js', 'hoverOriginalContent'); // Add data attribute to original content div for targeting
                    HOVER_BG.buildOverlay($el);
                }
            )
            .hover(
                HOVER_BG.toggleOverlay
            );
    },
    buildOverlay: function ($primary) {
        const TextColor = $primary.data('hover-text');

        // Get direct child and create clone for overlay (should be a child div of primary)
        let $clonedContent = $primary.children().clone();

        // Set attributes on cloned content
        $clonedContent.attr({
            'class': 'opacity-0 sr-only',
            'aria-hidden': 'true',
            'data-js': 'hoverClonedContent',
            'style': TextColor?.length ? `color:${TextColor};` : ''
        });

        // Apply text color styles to all children/grandchildren of cloned content
        $clonedContent.contents().each(function () {
            let $el = $(this);
            if(this.nodeType === 1) { // apply only to node types of 'element'
                $el.attr({
                    'aria-hidden': 'true',
                    'style': TextColor?.length ? `color:${TextColor};` : ''
                });
            }
        });

        // Push cloned content to DOM
        $primary.prepend($clonedContent);

        // Create background overlay styles and push hover background to DOM
        const BgVal = ($primary.data('bg-overlay') ?? '').replace(/\s{2,}/g, ' ');
        const bgAttrStyles = BgVal.length ? `background: ${BgVal};` : '';
        const bgFullStyles = `transition: all 200ms ease-in-out;${bgAttrStyles}`;
        const hoverBgEl = `<div class="absolute left-0 top-0 w-full h-full -z-1 opacity-0 " style="${bgFullStyles}" data-js="hoverBgOverlay"></div>`;
        $primary.prepend(hoverBgEl);
    },
    toggleOverlay: function () {
        let hoverBg = $(this).find('[data-js=hoverBgOverlay]');
        let hoverClonedContent = $(this).find('[data-js=hoverClonedContent]');
        let originalContent = $(this).find('[data-js=hoverOriginalContent]');

        if(hoverBg.hasClass('opacity-0')) { // If Background is hidden, show it and hide original content
            hoverBg.removeClass('opacity-0');
            hoverClonedContent.removeClass('opacity-0 sr-only');
            originalContent.addClass('opacity-0 sr-only');
        } else { // else hide background and show original content
            hoverBg.addClass('opacity-0');
            hoverClonedContent.addClass('opacity-0 sr-only');
            originalContent.removeClass('opacity-0 sr-only');
        }
    }
};

// module ready
$(document).ready(HOVER_BG.onReady);
