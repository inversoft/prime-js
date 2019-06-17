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

import {Utils} from "../ts/Utils.js"
import {PrimeElement} from "./Document/PrimeElement.js";

class Template {
  /**
   * A Javascript Object that can serve to generate Prime.Document.Element from a source string and optional parameters.
   *
   * @constructor
   * @param {string} template The String that defines the source of the template.
   */
  constructor(template) {
    Utils.bindAll(this);
    this.init(template);
  }

  init(template) {
    this.template = template;
  }

  /**
   * Generates a String from the given parameterHash.  Provide a hash of String keys to values.
   * Keys can be regular text strings, in which case it will look for and replace #{key} as with the value.  You can
   * also make the key a String "/key/", which will be converted to a Regex and run.
   *
   * For the value you can provide a straight up String, int, etc, or you can provide a function which will be called
   * to provide the value
   *
   * @param {Object} parameters An object that contains the parameters for the template to replace.
   * @returns {string} The result of executing the template.
   */
  generate(parameters) {
    parameters = Utils.isDefined(parameters) ? parameters : {};
    let templateCopy = String(this.template);
    for (let key in parameters) {
      if (parameters.hasOwnProperty(key)) {
        const value = parameters[key];
        let expressedValue;
        if (typeof(value) === 'function') {
          expressedValue = value();
        } else {
          expressedValue = value;
        }

        if (key.indexOf('/') === 0 && key.lastIndexOf('/') === key.length - 1) {
          templateCopy = templateCopy.replace(new RegExp(key.substring(1, key.length - 1), "g"), expressedValue);
        } else {
          const expressedKey = "#{" + key + "}";
          while (templateCopy.indexOf(expressedKey) !== -1) {
            templateCopy = templateCopy.replace(expressedKey, expressedValue);
          }
        }
      }
    }

    return templateCopy;
  }

  /**
   * Calls to generate and then appends the resulting value to the inner HTML of the provided primeElement.
   *
   * @param {PrimeElement} primeElement The prime Element instance to append the result of executing the template to.
   * @param {Object} parameters An object that contains the parameters for the template to replace.
   */
  appendTo(primeElement, parameters) {
    if (Utils.isDefined(primeElement)) {
      primeElement.setHTML(primeElement.getHTML() + this.generate(parameters));
    } else {
      throw new TypeError('Please supply an element to append to');
    }
  }

  /**
   * Calls to generate and then inserts the resulting elements into the dom before the primeElement
   *
   * @param {PrimeElement} primeElement The prime Element instance to insert the result of executing the template before.
   * @param {Object} parameters An object that contains the parameters for the template to replace.
   */
  insertBefore(primeElement, parameters) {
    if (Utils.isDefined(primeElement)) {
      const holder = document.createElement('div');
      holder.innerHTML = this.generate(parameters);
      new PrimeElement(holder.children[0]).insertBefore(primeElement);
    } else {
      throw new TypeError('Please supply an element to append to');
    }
  }

  /**
   * Calls to generate and then inserts the resulting elements into the dom after the primeElement
   *
   * @param {PrimeElement} primeElement The prime Element instance to insert the result of executing the template after.
   * @param {Object} parameters An object that contains the parameters for the template to replace.
   */
  insertAfter(primeElement, parameters) {
    if (Utils.isDefined(primeElement)) {
      const holder = document.createElement('div');
      holder.innerHTML = this.generate(parameters);
      new PrimeElement(holder.children[0]).insertAfter(primeElement);
    } else {
      throw new TypeError('Please supply an element to append to');
    }
  }
}

export {Template};
