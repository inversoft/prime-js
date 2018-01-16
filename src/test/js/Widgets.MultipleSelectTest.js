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

describe('MultipleSelect class tests', function() {
  beforeEach(function() {
    this.multipleSelect = new Prime.Widgets.MultipleSelect(Prime.Document.queryFirst('#multiple-select'))
        .withPlaceholder('Select One')
        .withCustomAddEnabled(true)
        .withCustomAddLabel('Add New Value: ')
        .initialize();
    this.multipleSelect.removeAllOptions();
    this.multipleSelect.addOption('one', 'One');
    this.multipleSelect.addOption('two', 'Two');
    this.multipleSelect.addOption('three', 'Three');
    this.multipleSelect.selectOptionWithValue('one');
    this.multipleSelect.selectOptionWithValue('three');
    this.multipleSelect.searcher.closeSearchResults();

    this.multipleSelectCustomAddDisabled = new Prime.Widgets.MultipleSelect(Prime.Document.queryFirst('#multiple-select-custom-add-disabled'))
        .withPlaceholder('Choose:')
        .withCustomAddEnabled(false)
        .initialize();
    this.multipleSelectCustomAddDisabled.removeAllOptions();
    this.multipleSelectCustomAddDisabled.addOption('one', 'One');
    this.multipleSelectCustomAddDisabled.addOption('two', 'Two');
    this.multipleSelectCustomAddDisabled.addOption('three', 'Three');
    this.multipleSelectCustomAddDisabled.addOption('twenty', 'Twenty');
    this.multipleSelectCustomAddDisabled.selectOptionWithValue('one');
    this.multipleSelectCustomAddDisabled.selectOptionWithValue('three');
    this.multipleSelectCustomAddDisabled.searcher.closeSearchResults();

    // Duplicate multiple select ('test', 'test', 'tags', 'some', 'tags') is possible
    var tags = ['test', 'some', 'tags'];

    this.multipleSelectAllowDuplicates = new Prime.Widgets.MultipleSelect(Prime.Document.queryFirst('#multiple-select-allow-duplicates'))
        .withPlaceholder('Create a phrase')
        .withCustomAddEnabled(false)
        .withAllowDuplicates(true)
        .withSearchFunction(function(searchText) { // A search function that allows duplicates.
          return {
            results: tags.filter(function(tag) {
              if (searchText === null || searchText.length === 0) {
                return true;
              }
              return tag.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
            }),
            tooManyResults: false
          }
        })
        .initialize();

    this.multipleSelectAllowDuplicates.removeAllOptions();
    tags.forEach(function(tag) {
      this.multipleSelectAllowDuplicates.addOption(tag, tag);
    }.bind(this));
  });

  it('setup', function() {
    var display = Prime.Document.queryFirst('#multiple-select-display');
    assert.isNotNull(display);

    var children = display.getChildren();
    assert.equal(children.length, 2);
    assert.equal(children[0].getTagName(), 'UL');
    assert.equal(children[0].getChildren().length, 3);
    assert.equal(children[0].getChildren()[0].getId(), 'multiple-select-option-one');
    assert.equal(children[0].getChildren()[0].getChildren()[0].getHTML(), 'One');
    assert.equal(children[0].getChildren()[0].getChildren()[1].getAttribute('value'), 'one');
    assert.equal(children[0].getChildren()[0].getChildren()[1].getHTML(), 'X');
    assert.equal(children[0].getChildren()[1].getId(), 'multiple-select-option-three');
    assert.equal(children[0].getChildren()[1].getChildren()[0].getHTML(), 'Three');
    assert.equal(children[0].getChildren()[1].getChildren()[1].getAttribute('value'), 'three');
    assert.equal(children[0].getChildren()[1].getChildren()[1].getHTML(), 'X');
    assert.equal(children[0].getChildren()[2].getChildren()[0].getTagName(), 'INPUT');
    assert.equal(children[1].getTagName(), 'UL');
    assert.isTrue(children[1].hasClass('search-results'));
    assert.equal(children[1].getChildren().length, 0);
  });

  it('addOption', function() {
    // Event listener
    var called = false;
    var ms = this.multipleSelect;
    var listener = function(event) {
      called = true;
      assert.equal(event.event, Prime.Widgets.MultipleSelect.AddOptionEvent);
      assert.equal(event.memo, 'four');
      assert.equal(event.target, ms);
    };

    // Add the option
    this.multipleSelect.addEventListener(Prime.Widgets.MultipleSelect.AddOptionEvent, listener);
    this.multipleSelect.addOption('four', 'Four');
    assert.isTrue(called);

    var select = this.multipleSelect.element.domElement;
    assert.equal(select.length, 4);
    assert.equal(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equal(select.options[1].value, 'two');
    assert.isFalse(select.options[1].selected);
    assert.equal(select.options[2].value, 'three');
    assert.isTrue(select.options[2].selected);
    assert.equal(select.options[3].value, 'four');
    assert.isFalse(select.options[3].selected);

    // Ensure that the option didn't get added to the display
    var displayOptions = Prime.Document.query('#multiple-select-display ul.option-list li');
    assert.equal(displayOptions.length, 3);
    assert.equal(displayOptions[0].getId(), 'multiple-select-option-one');
    assert.equal(displayOptions[0].getAttribute('value'), 'one');
    assert.equal(displayOptions[1].getId(), 'multiple-select-option-three');
    assert.equal(displayOptions[1].getAttribute('value'), 'three');
  });

  it('containsOptionWithValue', function() {
    assert.isTrue(this.multipleSelect.containsOptionWithValue('one'));
    assert.isTrue(this.multipleSelect.containsOptionWithValue('two'));
    assert.isTrue(this.multipleSelect.containsOptionWithValue('three'));
    assert.isFalse(this.multipleSelect.containsOptionWithValue('four'));
  });

  it('deselectOptionWithValue', function() {
    // Event listener
    var called = false;
    var ms = this.multipleSelect;
    var listener = function(event) {
      called = true;
      assert.equal(event.event, Prime.Widgets.MultipleSelect.DeselectOptionEvent);
      assert.equal(event.memo, 'one');
      assert.equal(event.target, ms);
    };

    // Deselect the option
    this.multipleSelect.addEventListener(Prime.Widgets.MultipleSelect.DeselectOptionEvent, listener);
    this.multipleSelect.deselectOptionWithValue('one');
    assert.isTrue(called);

    var select = this.multipleSelect.element.domElement;
    assert.equal(select.length, 3);
    assert.equal(select.options[0].value, 'one');
    assert.isFalse(select.options[0].selected);
    assert.equal(select.options[1].value, 'two');
    assert.isFalse(select.options[1].selected);
    assert.equal(select.options[2].value, 'three');
    assert.isTrue(select.options[2].selected);

    var displayOptions = Prime.Document.query('#multiple-select-display ul.option-list li');
    assert.equal(displayOptions.length, 2);
    assert.equal(displayOptions[0].getId(), 'multiple-select-option-three');
    assert.equal(displayOptions[0].getAttribute('value'), 'three');
  });

  it('findOptionWithText', function() {
    var option = this.multipleSelect.findOptionWithText('One');
    assert.isTrue(option instanceof Prime.Document.Element);
    assert.isTrue(option.isSelected());
    assert.equal(option.getHTML(), 'One');
    assert.equal(option.getValue(), 'one');
  });

  it('findOptionWithValue', function() {
    var option = this.multipleSelect.findOptionWithValue('one');
    assert.isTrue(option instanceof Prime.Document.Element);
    assert.isTrue(option.isSelected());
    assert.equal(option.getHTML(), 'One');
    assert.equal(option.getValue(), 'one');
  });

  it('hasOptionWithValue', function() {
    assert.isTrue(this.multipleSelect.hasOptionWithValue('one'));
    assert.isTrue(this.multipleSelect.hasOptionWithValue('two'));
    assert.isTrue(this.multipleSelect.hasOptionWithValue('three'));
    assert.isFalse(this.multipleSelect.hasOptionWithValue('four'));
  });

  it('highlightOptionForUnselect', function() {
    this.multipleSelect.highlightOptionForUnselect(); // Highlight Three
    assert.isTrue(this.multipleSelect.isLastOptionHighlightedForUnselect());

    var displayOptions = Prime.Document.query('#multiple-select-display ul.option-list li');
    assert.equal(displayOptions.length, 3);
    assert.equal(displayOptions[0].getId(), 'multiple-select-option-one');
    assert.isFalse(displayOptions[0].hasClass('selected'));
    assert.equal(displayOptions[1].getId(), 'multiple-select-option-three');
    assert.isTrue(displayOptions[1].hasClass('selected'));
  });

  it('removeHighlightedOption', function() {
    this.multipleSelect.highlightOptionForUnselect(); // Highlight Three
    assert.isTrue(this.multipleSelect.isLastOptionHighlightedForUnselect());
    this.multipleSelect.removeHighlightedOption();

    // Verify the backing select is updated
    var select = this.multipleSelect.element.domElement;
    assert.equal(select.length, 3);
    assert.equal(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equal(select.options[1].value, 'two');
    assert.isFalse(select.options[1].selected);
    assert.equal(select.options[2].value, 'three');
    assert.isFalse(select.options[2].selected);

    var displayOptions = Prime.Document.query('#multiple-select-display ul.option-list li');
    assert.equal(displayOptions.length, 2);
    assert.equal(displayOptions[0].getId(), 'multiple-select-option-one');
    assert.isFalse(displayOptions[0].hasClass('selected'));
  });

  it('removeOptionWithValue', function() {
    // Remove the option and retest
    this.multipleSelect.removeOptionWithValue('one');

    var select = this.multipleSelect.element.domElement;
    assert.equal(select.length, 2);
    assert.equal(select.options[0].value, 'two');
    assert.equal(select.options[1].value, 'three');

    // Ensure that the option gets removed from the display
    var displayOptions = Prime.Document.query('#multiple-select-display ul.option-list li');
    assert.equal(displayOptions.length, 2);
    assert.equal(displayOptions[0].getId(), 'multiple-select-option-three');
  });

  it('search', function() {
    // Execute a search
    this.multipleSelect.searcher.search('t');
    assert.isTrue(this.multipleSelect.searcher.isSearchResultsVisible());
    assert.isTrue(this.multipleSelect.searcher.isCustomAddVisible());
    assert.equal(this.multipleSelect.input.getValue(), 't');
    assert.isTrue(this.multipleSelect.searchResults.isVisible());
    assert.equal(this.multipleSelect.searchResults.getChildren().length, 2); // The option for Two and the add custom option
    assert.equal(this.multipleSelect.searchResults.getChildren()[0].getClass(), 'search-result');
    assert.equal(this.multipleSelect.searchResults.getChildren()[0].getHTML(), 'Two');
    assert.equal(this.multipleSelect.searchResults.getChildren()[1].getClass(), 'custom-add selected');
    assert.equal(this.multipleSelect.searchResults.getChildren()[1].getHTML(), 'Add New Value: t');

    // Add a letter
    this.multipleSelect.searcher.search('tw');
    assert.isTrue(this.multipleSelect.searcher.isSearchResultsVisible());
    assert.isTrue(this.multipleSelect.searcher.isCustomAddVisible());
    assert.equal(this.multipleSelect.input.getValue(), 'tw');
    assert.isTrue(this.multipleSelect.searchResults.isVisible());
    assert.equal(this.multipleSelect.searchResults.getChildren().length, 2); // The option for Two and the add custom option
    assert.equal(this.multipleSelect.searchResults.getChildren()[0].getClass(), 'search-result');
    assert.equal(this.multipleSelect.searchResults.getChildren()[0].getHTML(), 'Two');
    assert.equal(this.multipleSelect.searchResults.getChildren()[1].getClass(), 'custom-add selected');
    assert.equal(this.multipleSelect.searchResults.getChildren()[1].getHTML(), 'Add New Value: tw');

    // Make the custom add option go away
    this.multipleSelect.searcher.search('two');
    assert.isTrue(this.multipleSelect.searcher.isSearchResultsVisible());
    assert.isFalse(this.multipleSelect.searcher.isCustomAddVisible());
    assert.equal(this.multipleSelect.input.getValue(), 'two');
    assert.isTrue(this.multipleSelect.searchResults.isVisible());
    assert.equal(this.multipleSelect.searchResults.getChildren().length, 1);
    assert.equal(this.multipleSelect.searchResults.getChildren()[0].getClass(), 'search-result selected');
    assert.equal(this.multipleSelect.searchResults.getChildren()[0].getHTML(), 'Two');

    // Add a letter
    this.multipleSelect.searcher.search('twos');
    assert.isTrue(this.multipleSelect.searcher.isSearchResultsVisible());
    assert.isTrue(this.multipleSelect.searcher.isCustomAddVisible());
    assert.equal(this.multipleSelect.input.getValue(), 'twos');
    assert.isTrue(this.multipleSelect.searchResults.isVisible());
    assert.equal(this.multipleSelect.searchResults.getChildren().length, 1); // The option for Two and the add custom option
    assert.equal(this.multipleSelect.searchResults.getChildren()[0].getClass(), 'custom-add selected');
    assert.equal(this.multipleSelect.searchResults.getChildren()[0].getHTML(), 'Add New Value: twos');

    // Empty search
    this.multipleSelect.searcher.search('');
    assert.isTrue(this.multipleSelect.searcher.isSearchResultsVisible());
    assert.isFalse(this.multipleSelect.searcher.isCustomAddVisible());
    assert.equal(this.multipleSelect.input.getValue(), '');
    assert.isTrue(this.multipleSelect.searchResults.isVisible());
    assert.equal(this.multipleSelect.searchResults.getChildren().length, 1);
    assert.equal(this.multipleSelect.searchResults.getChildren()[0].getClass(), 'search-result');
    assert.equal(this.multipleSelect.searchResults.getChildren()[0].getHTML(), 'Two');

    // Whitespace search
    this.multipleSelect.searcher.search('   ');
    assert.isFalse(this.multipleSelect.searcher.isSearchResultsVisible());
    assert.isFalse(this.multipleSelect.searcher.isCustomAddVisible());
    assert.equal(this.multipleSelect.input.getValue().length, 0);
    assert.equal(this.multipleSelect.input.getValue(), '');
    assert.isFalse(this.multipleSelect.searchResults.hasClass('open'));

    // Empty search with no options available
    this.multipleSelect.selectOptionWithValue('two');
    this.multipleSelect.searcher.search('');
    assert.isFalse(this.multipleSelect.searcher.isSearchResultsVisible());
    assert.isFalse(this.multipleSelect.searcher.isCustomAddVisible());
    assert.equal(this.multipleSelect.input.getValue(), '');
    assert.isFalse(this.multipleSelect.searchResults.hasClass('open'));
    assert.equal(this.multipleSelect.searchResults.getChildren().length, 0);
  });

  it('search custom add disabled', function() {
    // Search with no results
    this.multipleSelectCustomAddDisabled.searcher.search('nothing');
    assert.isTrue(this.multipleSelectCustomAddDisabled.searcher.isSearchResultsVisible());
    assert.isFalse(this.multipleSelectCustomAddDisabled.searcher.isCustomAddVisible());
    assert.equal(this.multipleSelectCustomAddDisabled.input.getValue(), 'nothing');
    assert.isTrue(this.multipleSelectCustomAddDisabled.searchResults.isVisible());
    assert.equal(this.multipleSelectCustomAddDisabled.searchResults.getChildren().length, 1);
    assert.equal(this.multipleSelectCustomAddDisabled.searchResults.getChildren()[0].getClass(), 'no-search-results');
    assert.equal(this.multipleSelectCustomAddDisabled.searchResults.getChildren()[0].getHTML(), 'No Matches For: nothing');
  });

  it('MultipleSelect.search', function() {
    // Deselect the options and add some extras
    this.multipleSelect.deselectOptionWithValue('one');
    this.multipleSelect.deselectOptionWithValue('three');
    this.multipleSelect.addOption('one1', 'One1');
    this.multipleSelect.addOption('one2', 'One2');
    this.multipleSelect.addOption('two1', 'Two1');
    this.multipleSelect.addOption('two2', 'Two2');

    var options = this.multipleSelect.search(null);
    assert.equal(options.results.length, 7);
    assert.equal(options.results[0], 'One');
    assert.equal(options.results[1], 'One1');
    assert.equal(options.results[2], 'One2');
    assert.equal(options.results[3], 'Three');
    assert.equal(options.results[4], 'Two');
    assert.equal(options.results[5], 'Two1');
    assert.equal(options.results[6], 'Two2');

    options = this.multipleSelect.search('t');
    assert.equal(options.results.length, 4);
    assert.equal(options.results[0], 'Three');
    assert.equal(options.results[1], 'Two');
    assert.equal(options.results[2], 'Two1');
    assert.equal(options.results[3], 'Two2');
  });

  it('selectHighlightedSearchResult', function() {
    // This will result in the search results having Two and the custom option shown and the custom option will be selected
    this.multipleSelect.searcher.search('t');

    // Add the custom option
    this.multipleSelect.searcher.selectHighlightedSearchResult();

    // Verify the backing select box is updated
    var select = this.multipleSelect.element.domElement;
    assert.equal(select.length, 4);
    assert.equal(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equal(select.options[1].value, 'two');
    assert.isFalse(select.options[1].selected);
    assert.equal(select.options[2].value, 'three');
    assert.isTrue(select.options[2].selected);
    assert.equal(select.options[3].value, 't');
    assert.isTrue(select.options[3].selected);

    // Verify the display is updated
    var displayOptions = Prime.Document.query('#multiple-select-display ul.option-list li');
    assert.equal(displayOptions.length, 4);
    assert.equal(displayOptions[0].getId(), 'multiple-select-option-one');
    assert.equal(displayOptions[0].getAttribute('value'), 'one');
    assert.equal(displayOptions[1].getId(), 'multiple-select-option-three');
    assert.equal(displayOptions[1].getAttribute('value'), 'three');
    assert.equal(displayOptions[2].getId(), 'multiple-select-option-t');
    assert.equal(displayOptions[2].getAttribute('value'), 't');

    // Add a non-custom option
    this.multipleSelect.searcher.search('t');
    this.multipleSelect.searcher.highlightNextSearchResult(); // Highlight Two
    this.multipleSelect.searcher.selectHighlightedSearchResult();

    // Verify the backing select box is updated
    assert.equal(select.length, 4);
    assert.equal(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equal(select.options[1].value, 'two');
    assert.isTrue(select.options[1].selected);
    assert.equal(select.options[2].value, 'three');
    assert.isTrue(select.options[2].selected);
    assert.equal(select.options[3].value, 't');
    assert.isTrue(select.options[3].selected);

    // Verify the display is updated
    displayOptions = Prime.Document.query('#multiple-select-display ul.option-list li');
    assert.equal(displayOptions.length, 5);
    assert.equal(displayOptions[0].getId(), 'multiple-select-option-one');
    assert.equal(displayOptions[0].getAttribute('value'), 'one');
    assert.equal(displayOptions[1].getId(), 'multiple-select-option-three');
    assert.equal(displayOptions[1].getAttribute('value'), 'three');
    assert.equal(displayOptions[2].getId(), 'multiple-select-option-t');
    assert.equal(displayOptions[2].getAttribute('value'), 't');
    assert.equal(displayOptions[3].getId(), 'multiple-select-option-two');
    assert.equal(displayOptions[3].getAttribute('value'), 'two');
  });

  it('selectOptionWithValue', function() {
    // Event listener
    var called = false;
    var ms = this.multipleSelect;
    var listener = function(event) {
      called = true;
      assert.equal(event.event, Prime.Widgets.MultipleSelect.SelectOptionEvent);
      assert.equal(event.memo, 'two');
      assert.equal(event.target, ms);
    };

    // Select the option
    this.multipleSelect.addEventListener(Prime.Widgets.MultipleSelect.SelectOptionEvent, listener);
    this.multipleSelect.selectOptionWithValue('two');
    assert.isTrue(called);

    var select = this.multipleSelect.element.domElement;
    assert.equal(select.length, 3);
    assert.equal(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equal(select.options[1].value, 'two');
    assert.isTrue(select.options[1].selected);
    assert.equal(select.options[2].value, 'three');
    assert.isTrue(select.options[2].selected);

    // Ensure that the option is added to the display
    var displayOptions = Prime.Document.query('#multiple-select-display ul.option-list li');
    assert.equal(displayOptions.length, 4);
    assert.equal(displayOptions[0].getId(), 'multiple-select-option-one');
    assert.equal(displayOptions[0].getAttribute('value'), 'one');
    assert.equal(displayOptions[1].getId(), 'multiple-select-option-three');
    assert.equal(displayOptions[1].getAttribute('value'), 'three');
    assert.equal(displayOptions[2].getId(), 'multiple-select-option-two');
    assert.equal(displayOptions[2].getAttribute('value'), 'two');
  });

  it('setSelectedValues', function() {
    // Select one option
    this.multipleSelect.setSelectedValues('two');
    assert.deepEqual(this.multipleSelect.getSelectedValues(), ['two']);

    var select = this.multipleSelect.element.domElement;
    assert.equal(select.length, 3);
    assert.equal(select.options[0].value, 'one');
    assert.isFalse(select.options[0].selected);
    assert.equal(select.options[1].value, 'two');
    assert.isTrue(select.options[1].selected);
    assert.equal(select.options[2].value, 'three');
    assert.isFalse(select.options[2].selected);

    // Ensure that the option is added to the display
    var displayOptions = Prime.Document.query('#multiple-select-display ul.option-list li');
    assert.equal(displayOptions.length, 2);
    assert.equal(displayOptions[0].getId(), 'multiple-select-option-two');
    assert.equal(displayOptions[0].getAttribute('value'), 'two');

    // Select multiple options
    this.multipleSelect.setSelectedValues('one', 'two');
    assert.deepEqual(this.multipleSelect.getSelectedValues(), ['one', 'two']);

    select = this.multipleSelect.element.domElement;
    assert.equal(select.length, 3);
    assert.equal(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equal(select.options[1].value, 'two');
    assert.isTrue(select.options[1].selected);
    assert.equal(select.options[2].value, 'three');
    assert.isFalse(select.options[2].selected);

    // Ensure that the option is added to the display
    displayOptions = Prime.Document.query('#multiple-select-display ul.option-list li');
    assert.equal(displayOptions.length, 3);
    assert.equal(displayOptions[0].getId(), 'multiple-select-option-one');
    assert.equal(displayOptions[0].getAttribute('value'), 'one');
    assert.equal(displayOptions[1].getId(), 'multiple-select-option-two');
    assert.equal(displayOptions[1].getAttribute('value'), 'two');
  });

  it('unhighlightOptionForUnselect', function() {
    this.multipleSelect.highlightOptionForUnselect(); // Highlight Three
    assert.isTrue(this.multipleSelect.isLastOptionHighlightedForUnselect());
    this.multipleSelect.unhighlightOptionForUnselect();
    assert.isFalse(this.multipleSelect.isLastOptionHighlightedForUnselect());

    // Verify the backing select is correct
    var select = this.multipleSelect.element.domElement;
    assert.equal(select.length, 3);
    assert.equal(select.options[0].value, 'one');
    assert.isTrue(select.options[0].selected);
    assert.equal(select.options[1].value, 'two');
    assert.isFalse(select.options[1].selected);
    assert.equal(select.options[2].value, 'three');
    assert.isTrue(select.options[2].selected);

    var displayOptions = Prime.Document.query('#multiple-select-display ul.option-list li');
    assert.equal(displayOptions.length, 3);
    assert.equal(displayOptions[0].getId(), 'multiple-select-option-one');
    assert.isFalse(displayOptions[0].hasClass('selected'));
    assert.equal(displayOptions[1].getId(), 'multiple-select-option-three');
    assert.isFalse(displayOptions[1].hasClass('selected'));
  });

  it('Select the same option several times', function() {
    this.multipleSelectAllowDuplicates.selectOptionWithValue('test');
    this.multipleSelectAllowDuplicates.selectOptionWithValue('test');

    var selected = this.multipleSelectAllowDuplicates.getSelectedValues();
    assert.lengthOf(selected, 2);
    assert.deepEqual(selected, ['test', 'test']);
  })
});
