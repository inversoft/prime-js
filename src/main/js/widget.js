/*
 * Copyright (c) 2013, Inversoft Inc., All Rights Reserved
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
var Prime = Prime || {};
Prime.Widget = Prime.Widget || {};

/**
 * Constructs a MultipleSelect object for the given element.
 *
 * @param {Prime.Dom.Element} element The Prime Element for the MultipleSelect.
 * @constructor
 */
Prime.Widget.MultipleSelect = function(element) {
  this.element = (element instanceof Prime.Dom.Element) ? element : new Prime.Dom.Element(element);
  if (this.element.domElement.tagName !== 'SELECT') {
    throw new TypeError('You can only use Prime.Widget.MultipleSelect with select elements');
  }

  if (this.element.getAttribute('multiple') !== 'multiple') {
    throw new TypeError('The select box you are attempting to convert to a Prime.Widget.MultipleSelect must have the multiple="multiple" attribute set');
  }

  this.element.hide();
  this.searchDisplayed = false;

  var id = this.element.getID();
  if (id === null) {
    id = 'prime-multiple-select' + Prime.Widget.MultipleSelect.count++;
    this.element.setID(id);
  }

  this.displayContainer = Prime.Dom.queryByID(id + '-display');
  if (this.displayContainer === null) {
    this.displayContainer = Prime.Dom.newElement('<div/>').
        setID(id + '-display').
        addClass('prime-multiple-select-display').
        addEventListener('click', this.openSearch, this).
        addEventListener('keydown', this.handleKeyEvent, this).
        insertAfter(this.element);

    this.displayContainerSelectedOptionList = Prime.Dom.newElement('<ul/>').
        setID(id + '-option-list').
        addClass('prime-multiple-select-option-list').
        appendTo(this.displayContainer);
  } else {
    this.displayContainerSelectedOptionList = Prime.Dom.queryByID(id + '-option-list');
  }

  // Rebuild the display
  this.rebuildDisplay();
};

/*
 * Statics
 */
Prime.Widget.MultipleSelect.count = 1;

Prime.Widget.MultipleSelect.prototype = {
  /**
   * Adds the given option to this select. The option will not be selected.
   *
   * @param {String} value The value for the option.
   * @param {String} display The display text for the option.
   * @return {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  addOption: function(value, display) {
    if (this.containsOptionWithValue(value)) {
      return this;
    }

    Prime.Dom.newElement('<option/>').
        setValue(value).
        setHTML(display).
        appendTo(this.element);

    return this;
  },

  /**
   * Displays the search input box and search results div.
   */
  closeSearch: function() {
    if (this.searchDisplayed) {
      this.searchDisplayed = false;
      this.inputOption.hide();
    }
  },

  /**
   * Determines if this MultipleSelect contains an option with the given value.
   *
   * @param {String} value The value to look for.
   */
  containsOptionWithValue: function(value) {
    return this.findOptionWithValue(value) !== null;
  },

  /**
   * Deselects the option with the given value by removing the selected attribute from the option in the select box and
   * removing the option from the display container.
   *
   * @param {Prime.Dom.Element} option The option to deselect.
   * @return {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  deselectOption: function(option) {
    option.removeAttribute('selected');

    var id = this.makeOptionID(option);
    var displayOption = Prime.Dom.queryByID(id);
    if (displayOption !== null) {
      displayOption.removeFromDOM();
    }

    return this;
  },

  /**
   * Deselects the option with the given value by removing the selected attribute from the option in the select box and
   * removing the option from the display container. If the MultipleSelect doesn't contain an option for the given value,
   * this method throws an exception.
   *
   * @param {String} value The value to look for.
   * @return {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  deselectOptionWithValue: function(value) {
    var option = this.findOptionWithValue(value);
    if (option === null) {
      throw new Error('MultipleSelect doesn\'t contain an option with the value [' + value + ']');
    }

    this.deselectOption(option);

    return this;
  },

  /**
   * Finds the HTMLSelectOption with the given value and returns it wrapped in a Prime.Dom.Element.
   *
   * @param {String} value The value to look for.
   * @return {Prime.Dom.Element} The option element or null.
   */
  findOptionWithValue: function(value) {
    for (var i = 0; i < this.element.domElement.length; i++) {
      var cur = this.element.domElement.options[i];
      if (cur.value === value) {
        return new Prime.Dom.Element(cur);
      }
    }

    return null;
  },

  /**
   * Displays the search input box and search results div.
   */
  openSearch: function() {
    if (!this.searchDisplayed) {
      this.searchDisplayed = true;
      this.displayContainer.scrollToBottom();
      this.input.setValue('');
      this.inputOption.show();
      this.input.focus();
    }

    return false;
  },

  /**
   * Rebuilds the display from the underlying select element. All of the current display options (li elements) are
   * removed. New display options are added for each selected option in the select box.
   *
   * @return {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  rebuildDisplay: function() {
    // Remove the currently displayed options
    this.displayContainerSelectedOptionList.getChildren().each(function(option) {
      option.removeFromDOM();
    });

    // Add the input option since the select options are inserted before it
    var id = this.element.getID();
    this.inputOption = Prime.Dom.newElement('<li/>').
        addClass('prime-multiple-select-input-option').
        setID(id + '-input-option').
        hide(). // Start hidden
        appendTo(this.displayContainerSelectedOptionList);
    this.input = Prime.Dom.newElement('<input/>').
        setAttribute('type', 'text').
        setID(id + '-input').
        addClass('prime-multiple-select-input').
        appendTo(this.inputOption);

    // Add the selected options
    for (var i = 0; i < this.element.domElement.length; i++) {
      var option = this.element.domElement.options[i];
      if (option.selected) {
        this.selectOption(new Prime.Dom.Element(option));
      }
    }

    return this;
  },

  /**
   * Removes all of the options from the MultipleSelect.
   *
   * @returns {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  removeAllOptions: function() {
    // Remove in reverse order because the options array is dynamically updated when elements are deleted from the DOM
    var options = this.element.domElement.options;
    for (var i = options.length - 1; i >= 0; i--) {
      this.removeOption(new Prime.Dom.Element(options[i]));
    }

    return this;
  },

  /**
   * Removes the given option from the MultipleSelect by removing the option in the select box and the option in the
   * display container.
   *
   * @param {Prime.Dom.Element} option The option to select.
   * @returns {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  removeOption: function(option) {
    if (!(option instanceof Prime.Dom.Element)) {
      throw new TypeError('MultipleSelect#removeOption only takes Prime.Dom.Element instances');
    }

    option.removeFromDOM();

    var id = this.makeOptionID(option);
    var displayOption = Prime.Dom.queryByID(id);

    // Check if the option has already been selected
    if (displayOption !== null) {
      displayOption.removeFromDOM();
    }

    return this;
  },

  /**
   * Removes the option with the given value from the MultipleSelect by removing the option in the select box and the
   * option in the display container. If the MultipleSelect doesn't contain an option with the given value, this throws
   * an exception.
   *
   * @param {Prime.Dom.Element} value The value of the option to remove.
   * @returns {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  removeOptionWithValue: function(value) {
    var option = this.findOptionWithValue(value);
    if (option === null) {
      throw new Error('MultipleSelect doesn\'t contain an option with the value [' + value + ']');
    }

    this.removeOption(option);

    return this;
  },

  /**
   * Selects the given option by setting the selected attribute on the option in the select box (the object passed in is
   * the option from the select box wrapped in a Prime.Dom.Element) and adding it to the display container. If the
   * option is already in the display container, that step is skipped.
   *
   * @param {Prime.Dom.Element} option The option object from the select box wrapped in a Prime.Dom.Element instance.
   * @returns {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  selectOption: function(option) {
    if (!(option instanceof Prime.Dom.Element)) {
      throw new TypeError('MultipleSelect#selectOption only takes Prime.Dom.Element instances');
    }

    var id = this.makeOptionID(option);

    // Check if the option has already been selected
    if (Prime.Dom.queryByID(id) === null) {
      option.setAttribute('selected', 'selected');

      var li = Prime.Dom.newElement('<li/>').
          addClass('prime-multiple-select-option').
          setID(id).
          insertBefore(this.inputOption);
      Prime.Dom.newElement('<span/>').
          setHTML(option.getHTML()).
          appendTo(li);
      Prime.Dom.newElement('<a/>').
          setAttribute('href', '#').
          setAttribute('value', option.getValue()).
          setHTML('X').
          addEventListener('click', function(event) {
            this.deselectOptionWithValue(new Prime.Dom.Element(event.target).getAttribute('value'));
            return false;
          }, this).
          appendTo(li);
    }

    return this;
  },

  /**
   * Selects the option with the given value by setting the selected attribute on the option in the select box (the
   * object passed in is the option from the select box wrapped in a Prime.Dom.Element) and adding it to the display
   * container. If the option is already in the display container, that step is skipped.
   * <p/>
   * If there isn't an option with the given value, this throws an exception.
   *
   * @param {String} value The value of the option to select.
   * @return {Prime.Widget.MultipleSelect} This MultipleSelect.
   */
  selectOptionWithValue: function(value) {
    var option = this.findOptionWithValue(value);
    if (option === null) {
      throw new Error('MultipleSelect doesn\'t contain an option with the value [' + value + ']');
    }

    this.selectOption(option);

    return this;
  },


  /*
   * Private methods
   */

  /**
   * Handles all key events sent to the display container.
   *
   * @private
   * @param {Event} event The browser event object.
   * @returns {boolean} True if the search display is not open, false otherwise. This will prevent the event from continuing.
   */
  handleKeyEvent: function(event) {
    if (!this.searchDisplayed) {
      return true;
    }

    var key = event.keyCode;
    if (key === Prime.Event.Keys.ESCAPE) {
      this.closeSearch();
    }

    return true;
  },

  /**
   * Makes an ID for the option.
   *
   * @private
   * @param {Prime.Dom.Element} option The option to make the ID for.
   */
  makeOptionID: function(option) {
    return this.element.getID() + '-option-' + option.getValue().replace(' ', '-');
  },

  /**
   * Returns the set of selectable options for the given prefix.
   *
   * @private
   * @param {string} [prefix] The prefix to look for options for.
   * @returns {Array} The options as strings.
   */
  selectableOptionsForPrefix: function(prefix) {
    prefix = typeof prefix !== 'undefined' ? prefix : null;

    var options = this.element.domElement.options;
    var selectableOptions = [];
    for (var i = 0; i < options.length; i++) {
      var option = new Prime.Dom.Element(options[i]);
      if (option.isSelected()) {
        continue;
      }

      var html = option.getHTML();
      if (prefix === null || html.startsWith(prefix)) {
        selectableOptions.push(html);
      }
    }

    // Alphabetize the options
    if (selectableOptions.length > 0) {
      selectableOptions.sort();
    }

    return selectableOptions;
  }
};