/*
 * Copyright (c) 2019, Inversoft Inc., All Rights Reserved
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

declare global {
  interface Window {
    eventListeners: { [s: string]: Array<EventListener> };
    attachEvent: Function;
    customEventListeners: { [s: string]: Array<EventListener> };
  }
}

export namespace PrimeWindow {
  /**
   * Attaches an event listener to the window, returning the handler proxy.
   *
   * @param {string} event The name of the event.
   * @param {Function} listener The event handler.
   * @returns {Window} The window object.
   */
  export function addEventListener(event: string, listener: EventListener): Window {
    if (event.indexOf(':') === -1) {
      window.eventListeners = window.eventListeners || {};
      window.eventListeners[event] = window.eventListeners[event] || [];
      window.eventListeners[event].push(listener);
      if (window.addEventListener) {
        window.addEventListener(event, listener, false);
      } else if (window.attachEvent) {
        window.attachEvent('on' + event, listener);
      } else {
        throw new TypeError('Unable to set event onto the window. Neither addEventListener nor attachEvent methods are available');
      }
    } else {
      // Custom event
      window.customEventListeners = window.customEventListeners || {};
      window.customEventListeners[event] = window.customEventListeners[event] || [];
      window.customEventListeners[event].push(listener);
    }

    return window;
  }

  /**
   * Returns the inner height of the window. This includes only the rendering area and not the window chrome (toolbars,
   * status bars, etc). If this method can't figure out the inner height, it throws an exception.
   *
   * @returns {number} The inner height of the window.
   */
  export function getInnerHeight(): number {
    if (typeof (window.innerHeight) === 'number') {
      // Most browsers
      return window.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) {
      // IE 6+ in 'standards compliant mode'
      return document.documentElement.clientHeight;
    } else if (document.body && document.body.clientHeight) {
      // IE 4 compatible
      return document.body.clientHeight;
    }

    throw new Error('Unable to determine inner height of the window');
  }

  /**
   * Returns the inner width of the window. This includes only the rendering area and not the window chrome (toolbars,
   * status bars, etc). If this method can't figure out the inner width, it throws an exception.
   *
   * @returns {number} The inner width of the window.
   */
  export function getInnerWidth() {
    if (typeof (window.innerWidth) === 'number') {
      // Most browsers
      return window.innerWidth;
    } else if (document.documentElement && document.documentElement.clientWidth) {
      // IE 6+ in 'standards compliant mode'
      return document.documentElement.clientWidth;
    } else if (document.body && document.body.clientWidth) {
      // IE 4 compatible
      return document.body.clientWidth;
    }

    throw new Error('Unable to determine inner width of the window');
  }

  /**
   * Returns the number of pixels the Window is scrolled by.
   *
   * @returns {number} The number of pixels.
   */
  export function getScrollTop() {
    if (typeof (window.pageYOffset) === 'number') {
      return window.pageYOffset;
    } else if (document.body && document.body.scrollTop) {
      return document.body.scrollTop;
    } else if (document.documentElement && document.documentElement.scrollTop) {
      return document.documentElement.scrollTop;
    }

    throw new Error('Unable to determine scrollTop of the window');
  }
}

