/*
 * Copyright (c) 2012-2017, Inversoft Inc., All Rights Reserved
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

import {Utils} from "./Utils";
import {PrimeElement} from "./Document/PrimeElement";

class BaseTransition {
  /**
   * Constructs a BaseTransition for the given element.
   *
   * @param {PrimeElement|Element|EventTarget} element The Prime Element the effect will be applied to.
   * @param {number} endValue The end value for the transition.
   * @constructor
   */
  constructor(element, endValue) {
    Utils.bindAll(this);
    this.element = PrimeElement.wrap(element);
    this.duration = 1000;
    this.endFunction = null;
    this.endValue = endValue;
    this.iterations = 20;
  }

  /**
   * Sets the function that is called when the effect has completed.
   *
   * @param {Function} endFunction The function that is called when the effect is completed.
   * @returns {BaseTransition} This Effect.
   */
  withEndFunction(endFunction) {
    this.endFunction = endFunction;
    return this;
  }

  /**
   * Sets the duration of the fade-out effect.
   *
   * @param {number} duration The duration in milliseconds.
   * @returns {BaseTransition} This Effect.
   */
  withDuration(duration) {
    if (duration < 100) {
      throw new TypeError('Duration should be greater than 100 milliseconds or it won\'t really be noticeable');
    }

    this.duration = duration;
    return this;
  }

  /*
   * Protected functions
   */

  /**
   * Changes an integer style property of the Element iteratively over a given period of time from one value to another
   * value.
   *
   * @protected
   * @param {Function} getFunction The function on the element to call to get the current value for the transition.
   * @param {Function} setFunction The function on the element to call to set the new value for the transition.
   */
  _changeNumberStyleIteratively(getFunction, setFunction) {
    let currentValue = getFunction.call(this.element);
    const step = Math.abs(this.endValue - currentValue) / this.iterations;

    // Close around ourselves
    const self = this;
    const stepFunction = function(last) {
      if (last) {
        currentValue = self.endValue;
      } else {
        if (currentValue < self.endValue) {
          currentValue += step;
        } else {
          currentValue -= step;
        }
      }

      setFunction.call(self.element, currentValue);
    };

    Utils.callIteratively(this.duration, this.iterations, stepFunction, this._internalEndFunction);
  }

  /* ===================================================================================================================
   * Private Methods
   * ===================================================================================================================*/

  /**
   * Handles the call back at the end.
   *
   * @private
   */
  _internalEndFunction() {
    this._subclassEndFunction(this);

    if (this.endFunction) {
      this.endFunction(this);
    }
  }

  /**
   * Virtual function stub
   *
   * @private
   */
  _subclassEndFunction() {
  }
}

class Fade extends BaseTransition {
  /**
   * Constructs a new Fade for the given element. The fade effect uses the CSS opacity style and supports the IE alpha
   * style. The duration defaults to 1000 milliseconds (1 second). This changes the opacity over the duration from 1.0 to
   * 0.0. At the end, this hides the element so that it doesn't take up any space.
   *
   * @constructor
   * @param {PrimeElement|Element|EventTarget} element The Prime Element to fade out.
   */
  constructor(element) {
    super(element, 0.0);
  }

  /**
   * Internal call back at the end of the transition. This hides the element so it doesn't take up space.
   *
   * @override
   * @private
   */
  _subclassEndFunction() {
    this.element.hide();
  }

  /**
   * Executes the fade effect on the element using the opacity style.
   */
  go() {
    this._changeNumberStyleIteratively(this.element.getOpacity, this.element.setOpacity);
  }
}

class Appear extends BaseTransition {
  /**
   * Constructs a new Appear for the given element. The appear effect uses the CSS opacity style and supports the IE
   * alpha style. The duration defaults to 1000 milliseconds (1 second). This first sets the opacity to 0, then it shows
   * the element and finally it raises the opacity.
   *
   * @constructor
   * @param {PrimeElement|Element|EventTarget} element The Prime Element to appear.
   * @param {number} [opacity=1.0] The final opacity to reach when the effect is complete. Defaults to 1.0.
   */
  constructor(element, opacity) {
    if (!Utils.isDefined(opacity)) {
      opacity = 1.0;
    }
    super(element, opacity);
  }

  /**
   * Executes the appear effect on the element using the opacity style.
   */
  go() {
    this.element.setOpacity(0.0);
    this.element.show();
    this._changeNumberStyleIteratively(this.element.getOpacity, this.element.setOpacity);
  }
}

class ScrollTo extends BaseTransition {
  /**
   * Constructs a new ScrollTo for the given element. The duration defaults to 1000 milliseconds (1 second).
   *
   * @param {PrimeElement|Element|EventTarget} element The Prime Element to scroll.
   * @param {number} position The position to scroll the element to.
   * @constructor
   */
  constructor(element, position) {
    super(element, position);

    this.axis = 'vertical';
  }

  /**
   * Set the scroll axis, either 'horizontal' or 'vertical'. Default is 'vertical'.
   *
   * @param {string} axis The axis to scroll.
   * @returns {ScrollTo}
   */
  withAxis(axis) {
    this.axis = axis || 'vertical';
    return this;
  }

  /**
   * Executes the scroll effect on the element.
   */
  go() {
    if (this.axis === 'vertical') {
      this._changeNumberStyleIteratively(this.element.getScrollTop, this.element.scrollTo);
    } else {
      this._changeNumberStyleIteratively(this.element.getScrollLeft, this.element.scrollLeftTo);
    }
  }
}

class SlideOpen {
  /**
   * Creates a SlideOpen effect on the given element.
   *
   * @param {PrimeElement} element The element.
   * @constructor
   */
  constructor(element) {
    Utils.bindAll(this);

    this.element = element;
    if (this.isOpen()) {
      element.domElement.primeVisibleHeight = element.getHeight();
    } else {
      element.setStyle('height', 'auto');
      element.domElement.primeVisibleHeight = element.getHeight();
      element.setStyle('height', '0');
    }
  }

  close() {
    if (!this.isOpen()) {
      return;
    }

    // Set a fixed height instead of auto so that the transition runs, but only if the element is "open"
    this.element.setHeight(this.element.domElement.primeVisibleHeight);

    // This timeout is needed since the height change takes time to run
    setTimeout(function() {
      this.element.setHeight(0);
      this.element.removeClass('open');
    }.bind(this), 50);
  }

  isOpen() {
    return this.element.getHeight() !== 0 || this.element.hasClass('open');
  }

  open() {
    this.element.setHeight(this.element.domElement.primeVisibleHeight);
    setTimeout(function() {
      this.element.setHeight('auto');
      this.element.addClass('open');
    }.bind(this), 500);
  }

  toggle() {
    if (this.element.getHeight() !== 0 || this.element.hasClass('open')) {
      this.close();
    } else {
      this.open();
    }
  }
}

export {BaseTransition, Fade, Appear, ScrollTo, SlideOpen}
