/*
 * Copyright (c) 2017-2018, Inversoft Inc., All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 */

'use strict';

import {Overlay} from "./Overlay";
import {PrimeDocument} from "../PrimeDocument";
import {PrimeElement} from "../Document/PrimeElement";
import {PrimeRequest} from "../PrimeRequest";
import {Utils} from "../Utils";
import {PrimeWindow} from "../Window";
import {Draggable} from "./Draggable";

class AJAXDialogOptions {
    public closeTimeout: number;
    public ajaxRequest: PrimeRequest;
    public additionalClasses: string;
    public callback: Function;
    public className: string;
    public closeButtonElementSelector: string;
    public draggableElementSelector: string;
    public formErrorCallback: Function;
    public formHandling: boolean;
    public formPreSubmitCallback: Function;
    public formSuccessCallback: Function;
    public zIndexOffset: number;
}

class AJAXDialog {
    /**
     * Constructs a new dialog box, which is dynamically built and then populated with the HTML returned from an AJAX call.
     *
     * @constructor
     */

    public draggable: Draggable;
    public element: PrimeElement;
    public initialized: boolean;
    public options: AJAXDialogOptions;
    public form: PrimeElement;

    constructor() {
        Utils.bindAll(this);

        this.draggable = null;
        this.element = null;
        this.initialized = false;
        this.setInitialOptions();
    }

    /**
     * Closes the dialog, destroys the HTML and updates or hides the overlay.
     * @returns {AJAXDialog} This.
     */
    public close() {
        this.element.removeClass('open');
        if (this.draggable !== null) {
            this.draggable.destroy();
            this.draggable = null;
        }

        setTimeout(() => {
            this.element.removeFromDOM();
            this.element = null;

            const highestZIndex = this.determineZIndex();
            if (highestZIndex !== 0) {
                Overlay.instance.setZIndex(highestZIndex);
            } else {
                Overlay.instance.close();
            }
        }, this.options.closeTimeout);

        return this;
    }

    /**
     * Destroys the dialog by calling the close function.
     * @returns {AJAXDialog} This.
     */
    public destroy() {
        this.close();
        return this;
    }

    /**
     * Initializes the dialog.
     * @returns {AJAXDialog} This.
     */
    public initialize() {
        return this;
    }

    /**
     * Opens the dialog by making the AJAX GET request to the given URI and the opening then dialog.
     *
     * @param uri {string} The URI to make the AJAX GET request to.
     * @returns {AJAXDialog} This.
     */
    public open(uri) {
        const request = this.options.ajaxRequest || new PrimeRequest(uri, 'GET');
        request.withSuccessHandler(this.handleAJAXDialogResponse)
            .withErrorHandler(this.handleAJAXDialogResponse)
            .go();
        return this;
    }

    /**
     * Opens the dialog by making the AJAX POST request to the given URI with the given form and extra data (optional)
     * and then opening the dialog.
     *
     * @param uri {string} The URI to make the AJAX POST request to.
     * @param form {HTMLFormElement|PrimeElement} The Form element to retrieve the data from.
     * @param extraData [extraData=] {object} (Optional) Extra data to send with the POST.
     * @returns {AJAXDialog} This.
     */
    public openPost(uri, form, extraData) {
        new PrimeRequest(uri, 'POST')
            .withDataFromForm(form)
            .withData(extraData)
            .withSuccessHandler(this.handleAJAXDialogResponse)
            .go();
        return this;
    }

    /**
     * Updates the HTML contents of the dialog.
     *
     * @param html {String} The HTML.
     * @returns {AJAXDialog} This.
     */
    public setHTML(html) {
        this.element.setHTML(html);
        this.initializeDialog();
        return this;
    }

    /**
     * Sets any additional classes that should be on the dialog.
     *
     * @param classes {string} The list of additional classes.
     * @returns {AJAXDialog} This.
     */
    public withAdditionalClasses(classes) {
        this.options.additionalClasses = classes;
        return this;
    }

    /**
     * Override the default Ajax Request used to open the dialog. This does not override the
     * success and error handlers.
     *
     * @param request {PrimeRequest} The Ajax Request to use to open the dialog.
     * @returns {AJAXDialog} This.
     */
    public withAjaxRequest(request) {
        this.options.ajaxRequest = request;
        return this;
    }

    /**
     * Sets the callback that is called after the dialog has been fetched and rendered.
     *
     * @param callback {function} The callback function.
     * @returns {AJAXDialog} This.
     */
    public withCallback(callback) {
        this.options.callback = callback;
        return this;
    }

    /**
     * Sets the class name for the dialog element.
     *
     * @param className {string} The class name.
     * @returns {AJAXDialog} This.
     */
    public withClassName(className) {
        if (className.indexOf(' ') !== -1) {
            throw 'Invalid class name [' + className + ']. You can use the additionalClasses options to add more classes.';
        }

        this.options.className = className;
        return this;
    }

    /**
     * Sets the close button element selector that is used to setup the close button in the HTML that was returned from
     * the server.
     *
     * @param selector {string} The element selector.
     * @returns {AJAXDialog} This.
     */
    public withCloseButtonElementSelector(selector) {
        this.options.closeButtonElementSelector = selector;
        return this;
    }

    /**
     * Sets the timeout used in the close method to allow for transitions.
     *
     * @param timeout {int} The timeout.
     * @returns {AJAXDialog} This.
     */
    public withCloseTimeout(timeout) {
        this.options.closeTimeout = timeout;
        return this;
    }

    /**
     * Sets the draggable element selector that is used for the DraggableWidget.
     *
     * @param selector {string} The element selector.
     * @returns {AJAXDialog} This.
     */
    public withDraggableButtonElementSelector(selector) {
        this.options.draggableElementSelector = selector;
        return this;
    }

    /**
     * Sets an error callback for AJAX form handling. This is called after a failed form submission.
     *
     * @param callback {Function} The callback function. The callback function will called with two parameters,
     *        the first is a reference this object, the second is the XMLHttpRequest object.
     * @returns {AJAXDialog} This.
     */
    public withFormErrorCallback(callback) {
        this.options.formErrorCallback = callback;
        return this;
    }

    /**
     * Sets whether or not forms inside the dialog are handled via AJAX or not.
     *
     * @param enabled {boolean} The choice.
     * @returns {AJAXDialog} This.
     */
    public withFormHandling(enabled) {
        this.options.formHandling = enabled;
        return this;
    }

    /**
     * Sets a pre-submit callback for AJAX form handling. This is called before the form is submitted.
     *
     * @param callback {Function} The callback function.
     * @returns {AJAXDialog} This.
     */
    public withFormPreSubmitCallback(callback) {
        this.options.formPreSubmitCallback = callback;
        return this;
    }

    /**
     * Sets a success callback for AJAX form handling. This is called after a successful form submission.
     *
     * @param callback {Function} The callback function. The callback function will called with two parameters,
     *        the first is a reference this object, the second is the XMLHttpRequest object.
     * @returns {AJAXDialog} This.
     */
    public withFormSuccessCallback(callback) {
        this.options.formSuccessCallback = callback;
        return this;
    }

    /**
     * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
     * method to set options on the widget. The caller needs to know what properties are valid in the options object.
     *
     * @param options Key value pair of configuration options.
     * @returns {AJAXDialog} This.
     */
    public withOptions(options: AJAXDialogOptions) {
        if (!Utils.isDefined(options)) {
            return this;
        }

        for (let option in options) {
            if (options.hasOwnProperty(option)) {
                this.options[option] = options[option];
            }
        }
        return this;
    }

    /* ===================================================================================================================
     * Private methods
     * ===================================================================================================================*/

    private determineZIndex() {
        let highestZIndex = 0;
        PrimeDocument.query('.' + this.options.className).each(function (dialog) {
            const zIndex = parseInt(dialog.getComputedStyle()['zIndex']);
            if (dialog.isVisible() && zIndex > highestZIndex) {
                highestZIndex = zIndex;
            }
        });
        return highestZIndex;
    }

    private handleCloseClickEvent(event) {
        Utils.stopEvent(event);
        this.close();
    }

    private handleAJAXDialogResponse(xhr) {
        this.element = PrimeDocument.newElement('<div/>', {class: this.options.className + ' ' + this.options.additionalClasses}).appendTo(document.body);
        this.setHTML(xhr.responseText);
    }

    private handleAJAXFormError(xhr) {
        this.setHTML(xhr.responseText);
        this.form = this.element.queryFirst('form').addEventListener('submit', this.handleAJAXFormSubmit);

        if (this.options.formErrorCallback !== null) {
            this.options.formErrorCallback(this, xhr);
        }

        if (this.draggable !== null) {
            this.draggable.destroy();
        }

        if (this.options.draggableElementSelector !== null && this.element.queryFirst(this.options.draggableElementSelector) !== null) {
            this.draggable = new Draggable(this.element, this.options.draggableElementSelector).initialize();
        }
    }

    private handleAJAXFormSuccess(xhr) {
        if (this.options.formSuccessCallback !== null) {
            this.options.formSuccessCallback(this, xhr);
        } else {
            const successURI = this.form.getDataSet()['ajaxSuccessUri'];
            if (successURI !== undefined) {
                window.location = successURI;
            } else {
                window.location.reload();
            }
        }
    }

    private handleAJAXFormSubmit(event) {
        Utils.stopEvent(event);

        if (this.options.formPreSubmitCallback !== null) {
            this.options.formPreSubmitCallback(this);
        }

        new PrimeRequest(this.form.getAttribute('action'), this.form.getAttribute('method'))
            .withDataFromForm(this.form)
            .withSuccessHandler(this.handleAJAXFormSuccess)
            .withErrorHandler(this.handleAJAXFormError)
            .go();
    }

    private initializeDialog() {
        this.element.query(this.options.closeButtonElementSelector).each(function (e) {
            e.addEventListener('click', this.handleCloseClickEvent);
        }.bind(this));

        // Only set the z-index upon first open
        if (!this.initialized) {
            const highestZIndex = this.determineZIndex();
            Overlay.instance.open(highestZIndex + this.options.zIndexOffset);
            this.element.setStyle('zIndex', (highestZIndex + this.options.zIndexOffset + 10).toString());
            this.element.addClass('open');
        }

        // Call the callback before positioning to ensure all changes to the dialog have been made
        if (this.options.callback !== null) {
            this.options.callback(this);
        }

        // Setup forms if enabled
        if (this.options.formHandling) {
            this.form = this.element.queryFirst('form').addEventListener('submit', this.handleAJAXFormSubmit);
        }

        // Only set the position of the dialog when we first open it, if someone calls setHTML on the dialog we are not resizing it.
        if (!this.initialized) {
            // Position the fixed dialog in the center of the screen
            const windowHeight = PrimeWindow.getInnerHeight();
            const dialogHeight = this.element.getHeight();
            this.element.setTop(((windowHeight - dialogHeight) / 2) - 20);
        }

        if (this.options.draggableElementSelector !== null && this.element.queryFirst(this.options.draggableElementSelector) !== null) {
            this.draggable = new Draggable(this.element, this.options.draggableElementSelector).initialize();
        }

        this.initialized = true;
    }

    /**
     * Set the initial options for this widget.
     * @private
     */
    private setInitialOptions() {
        // Defaults
        this.options = {
            additionalClasses: '',
            ajaxRequest: null,
            callback: null,
            className: 'prime-dialog',
            closeButtonElementSelector: '[data-dialog-role="close-button"]',
            closeTimeout: 200,
            draggableElementSelector: '[data-dialog-role="draggable"]',
            formErrorCallback: null,
            formHandling: false,
            formPreSubmitCallback: null,
            formSuccessCallback: null,
            zIndexOffset: 1000
        };
    }
}

export {AJAXDialog};
