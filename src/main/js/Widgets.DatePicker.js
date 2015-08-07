/*
 * Copyright (c) 2015, Inversoft Inc., All Rights Reserved
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

/**
 * The Prime.Widgets namespace.
 *
 * @namespace Prime.Widgets
 */
Prime.Widgets = Prime.Widgets || {};

/**
 * Constructs a new DatePicker object for the given input element.
 *
 * @param {Prime.Document.Element} element The Prime Element for the DatePicker widget.
 * @constructor
 */
Prime.Widgets.DatePicker = function(element) {

  this.element = (element instanceof Prime.Document.Element) ? element : new Prime.Document.Element(element.domElement);
  if (!this.element.is('input')) {
    throw new TypeError('You can only use Prime.Widgets.DatePicker with an input element');
  }

  this.container = this._buildDatePicker();

  this.nextMonth = this.container.queryFirst('.month span.next');
  this.previousMonth = this.container.queryFirst('.month span.prev');
  this.month = this.container.queryFirst('.month span.month');

  this.nextMonth.addEventListener('click', this._handleNextMonth, this);
  this.previousMonth.addEventListener('click', this._handlePreviousMonth, this);
};

Prime.Widgets.DatePicker.prototype = {

  months: {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December"
  },

  /**
   * Destroys the DatePicker Widget
   */
  destroy: function() {
  },

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Build the HTML to render the date picker widget.
   * @private
   */
  _buildDatePicker: function() {
    var now = new Date();
    var html =
        '<div class="prime-date-picker">' +
          '<div class="month">' +
            '<span class="prev">&#9664;</span>' +
              '<span class="month" data-month="' + now.getMonth() + '">' + this.months[now.getMonth()] + '</span>' +
            '<span class="next">&#9654;</span>' +
          '</div>' +
        '</div>';

    Prime.Document.appendHTML(html);
    return Prime.Document.queryFirst('div.prime-date-picker');
  },

  /**
   * Handle the next month button click.
   * @private
   */
  _handleNextMonth: function() {
    var current = parseInt(this.month.getDataSet().month);
    if (current < 12) {
      var next = current + 1;
      this.month.setAttribute('data-month', next);
      this.month.setHTML(this.months[next]);
    }
  },

  /**
   * Handle the previous month button click.
   * @private
   */
  _handlePreviousMonth: function() {
    var current = parseInt(this.month.getDataSet().month);
    if (current > 1) {
      var previous = current - 1;
      this.month.setAttribute('data-month', previous);
      this.month.setHTML(this.months[previous]);
    }
  }

};