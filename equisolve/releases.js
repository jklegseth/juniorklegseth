/* jshint undef: true, unused: true */
/* global $, window */

/**
 * Retrieves press releases via AJAX and adds them to the page.
 * Initially loads a set of releases and then lazily continues
 * to load based on scroll position.
 *
 */
(function() {
  'use strict';
  var records_to_retrieve = 15,
    records_offset = 0,
    loading = false,
    getRecordHtml,
    monthIntegerToName,
    convertToReadableDate,
    getData,
    addLoading,
    removeLoading,
    loadDataOnPagePosition,
    addDataToDom,
    handleFail,
    removeFailMessage,
    bind,
    init;

  // Constructs and returns an HTML snippet for each reelase.
  getRecordHtml = function(release) {
    return '<div class="release"><span class="release__timestamp">' + convertToReadableDate(release.published) + '</span><div class="release__title">' + release.title + '</div></div>';
  };

  // Converting month number to month name. This would ideally be handled by some date utility library.
  monthIntegerToName = function(month_integer) {
    switch (month_integer) {
      case 0:
        return 'January';
      case 1:
        return 'February';
      case 2:
        return 'March';
      case 3:
        return 'April';
      case 4:
        return 'May';
      case 5:
        return 'June';
      case 6:
        return 'July';
      case 7:
        return 'August';
      case 8:
        return 'September';
      case 9:
        return 'October';
      case 10:
        return 'November';
      case 11:
        return 'December';
      default:
        break;
    }
  };

  // Takes a 'YYYY-mm-dd hh:mm:ss', corrects it to be a valid
  // string for a `Date` object argument and returns the format
  // we want: "June 10, 2015".
  convertToReadableDate = function(timestamp) {
    var formatted_timestamp = timestamp.replace(' ', 'T'),
      date_object = new Date(formatted_timestamp),
      month = monthIntegerToName(date_object.getMonth()),
      day = date_object.getDate(),
      year = date_object.getFullYear();

    month = monthIntegerToName(date_object.getMonth());
    day = date_object.getDate();
    year = date_object.getFullYear();

    // Cheap validation: if the `timestamp` argument is invalid
    // we still get a valid `Date` object. In that case we can
    // get `undefined` for `month` and `NaN` for `day` and `year`,
    // so we'll make sure we have valid return variables or return
    // an empty string.
    if (!month, !day, !year) {
      return '';
    }

    return month + ' ' + day + ', ' + year;
  };

  // Adds a message that we are loading more releases
  // @TODO: this is less than stellar on mobile if scrolling
  // fast. Ideas would be to scroll to the bottom of this
  // `div` tag to make sure it's visible, or perhap ovlay
  // a "loading" message on the last current release showing.
  addLoading = function() {
    loading = true;

    var loading_message = '<div class="release release__loading"><div class="release__message">Loading...</div></div>';
    $('.releases').append(loading_message);
  };

  // Removes "loading" message, if any
  removeLoading = function() {
    $('.release__loading').remove();
  };

  // Makes an AJAX call to retrieve press releases from endpoint.
  getData = function() {
    // Stop repeated loading of same data
    if (loading) {
      return;
    }

    addLoading();

    $.ajax({
      url: 'http://www.stellarbiotechnologies.com/media/press-releases/json',
      data: {
        limit: records_to_retrieve,
        offset: records_offset
      },
      dataType: 'json'
    })
    .fail(handleFail)
    .done(addDataToDom);
  };

  // Displays a message if our AJAX call fails for some reason.
  handleFail = function() {
    var error_message = '<div class="release release__error"><div class="release__message">We are unable to retrieve press releases at this time. We apologize for any inconvenience.</div></div>';

    removeLoading();
    $('.releases').append(error_message);
  };

  // Removes fail message, if any
  removeFailMessage = function() {
    $('.release__error').remove();
  };

  // Takes the JSON response and parses it and adds releases to DOM.
  addDataToDom = function(response) {
    removeLoading();

    // If we didn't get a response or don't have the JSON format
    // we expected or no records we'll fail silently.
    if (!response || !response.news || !response.news.length) {
      return;
    }

    // If we had a failure earlier we don't want that message displayed now.
    removeFailMessage();

    // Update our offset variable for the next call
    records_offset += response.news.length;

    // Iterate
    $.each(response.news, function(item, json) {
      $('.releases').append(getRecordHtml(json));
    });

    // And now that we've handled this we'll set this flag back to false.
    loading = false;
  };

  // Called on scroll checks to see if the last press release is visible
  // in the viewport and if it is makes a call to load more. We taking
  // 100px away from the top of our last element so that the loading starts
  // before we actually scroll to it--this is particularly useful for mobile.
  loadDataOnPagePosition = function() {
    var elm = $('.releases > div').last(),
      viewport_height = $(window).height(),
      scrolltop = $(window).scrollTop(),
      offset_top = $(elm).offset().top - 100,
      element_height = $(elm).height();

    if ((offset_top < (viewport_height + scrolltop)) && (offset_top > (scrolltop - element_height))) {
      getData();
    }
  };

  // Binds any events we need to handle
  bind = function() {
    $(window).scroll(loadDataOnPagePosition);

  };

  init = function() {
    getData();
    bind();
  };

  init();
}());