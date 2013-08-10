// For JSLINT
/*global $
 */

/**
 *  Client side (performance) monitoring. Takes values from:
 *  - performance.timing
 *  - printing events
 *  - attempts to XSS your site by wrapping and logging console.log(); and alert();
 *  - JavaScript Errors occuring on the client side
 *
 * and transmitts them to the specified URL so they are accessible in the logfiles
 *  @author bjoern.kaiser
 */

/**
  * @params w window objectreference
  * @params d document objectreference
  */
(function(w,d) {

  var MOUSEMOVE_START_TIMESTAMP = 0,
      RUM_BEACON_URL =                "https://www.example.com/some_rum_url.gif",
      JS_BEACON_URL =                 "https://www.example.com/some_js_errors_monitoring_url.gif",
      PRINT_BEACON_URL =              "https://www.example.com/some_print_monitoring_url.gif",
      CONSOLE_BEACON_URL =            "https://www.example.com/some_other_monitoring_url.gif",
      LIVE_URL_PATTERN =              "live.example.com", //for specifying the live env so that you dont monitor on dev or prelive envs
      ALERT_BEACON_URL =              "https://www.example.com/omg_another_monitoring_url.gif",
      URL_PATTERN_FOR_CHECKOUT_PAGE = "/checkout/g",
      USE_GOOGLE_ANALYTICS_TO_TRACK = true,
      DEFAULT_GA_RATIO              = 0.1, //10%
      DEFAULT_GA_CATEGORY           = "SOME_PAGE_NAME_TO_IDENTIFY_THE_TRACKED_PAGE",

      // Disable Features here:
      MONITOR_CONSOLE_LOG           = true,
      MONITOR_ALERT                 = true,
      MONITOR_PRINT_OUTS            = true,
      MONITOR_JS_ERRORS             = true,

      // ####### Police Line !!! Do not alter anything below !! #######
      localStorageAvailable =         !!w.localStorage,
      printTime =                     0; //Chrome has a bug that fire the event twice: https://code.google.com/p/chromium/issues/detail?id=85013

  if(w.location.href.indexOf(LIVE_URL_PATTERN) < 0) {
    return;
  }

  /**
   * If Google Analytics is being used, we need to keep in mind that there is one request per key/value pair.
   * Thus we should scale the number of request with a ratio being tracked and therefore reduce the number of requests.
   **/
  if(USE_GOOGLE_ANALYTICS_TO_TRACK && (Math.random() > DEFAULT_GA_RATIO)) {
    return;
  }


  function observeMouseMove() {
    MOUSEMOVE_START_TIMESTAMP = new Date().getTime();
  }

  function incrementPageViewsInCache() {
    if(localStorage.pageViewsUntilCheckout) {
      localStorage.pageViewsUntilCheckout = parseInt(localStorage.pageViewsUntilCheckout,10) + 1;
    } else {
      localStorage.pageViewsUntilCheckout = 1;
    }

    //Einmaliger Cleanup bei den Usern, wo localStorage.pageviewsUntilCheckout
    // statt nun localStorage.pageViewsUntilCheckout gesetzt war.
    localStorage.pageviewsUntilCheckout && localStorage.removeItem("pageviewsUntilCheckout");
  }

  function resetPageViewsInCache() {
    localStorage.pageViewsUntilCheckout = 0;
  }

  function incrementClicksInCache() {
    if(!localStorageAvailable) {
      return;
    }

    if(localStorage.clicksUntilCheckout) {
      localStorage.clicksUntilCheckout = parseInt(localStorage.clicksUntilCheckout,10) + 1;
    } else {
      localStorage.clicksUntilCheckout = 1;
    }
  }

  function resetClicksInCache() {
    localStorage.clicksUntilCheckout = 0;
  }


  function calcAndSendTimes(event) {
    var perf =          w.performance || w.mozPerformance || w.webkitPerformance || w.msPerformance,
      now =             0,
      dataContainer   = {};
    /*
     * If the browser doesnt have the window.performance object(> IE9, Mozilla < 6) or
     * in case the user leaves the site before dom:ready we just quit RUM here.
     */
    if(!perf || perf.timing.loadEventEnd === 0 || perf.timing.domComplete === 0 || perf.timing.navigationStart ===0) {
      return;
    }

    localStorageAvailable && incrementPageViewsInCache();

    perf = perf.timing;

    now = new Date().getTime();

    dataContainer = {
      networkTime:          perf.responseEnd- perf.navigationStart,
      domTime:              perf.domComplete - perf.domLoading,
      complete:             perf.loadEventEnd - perf.navigationStart,
      dnsTime:              perf.domainLookupEnd - perf.domainLookupStart,
      timeToFirstClick:     now - perf.navigationStart,
      clickObject:          event.target.tagName + ":" + $.trim(event.target.innerHTML.substring(0,20)),
      timeFromMoveToClick:  now - MOUSEMOVE_START_TIMESTAMP,
      parentURL:            w.location.href,
      referrer:             d.referrer,
      htmlLength:           d.body.innerHTML.length,
      numberStylesheets:    d.styleSheets.length
    };

    //On checkout page, reset Click and PageView Counter
    if(localStorageAvailable && w.location.href.match(URL_PATTERN_FOR_CHECKOUT_PAGE)) {
      dataContainer.pageViewsUntilCheckout =  localStorage.pageViewsUntilCheckout;
      dataContainer.clicksUntilCheckout =     localStorage.clicksUntilCheckout;
      resetPageViewsInCache();
      resetClicksInCache();
    }

    if (USE_GOOGLE_ANALYTICS_TO_TRACK) {
      trackWithGA(dataContainer);
    } else {
      trackWithGETRequest(dataContainer);
    }
  }

  /**
   * This function is being used when tracking over GA is prefered.
   * @precondition: _gaq is availabe in the global namespace
   */
  function trackWithGA(dataContainer) {
    var _gaq = w._gaq;
    for (val in dataContainer) {
      _gaq.push(['_trackTiming', DEFAULT_GA_CATEGORY, val, dataContainer[val], "foo", 100]);
      //further documentation for gaq push kann be found here:
      //https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingTiming
    }
  }

  /**
   * This function is being used for traditionally tracking over GET requests
   *
   */
  function trackWithGETRequest(dataContainer) {
    new Image().src = RUM_BEACON_URL + "?" + $.param(dataContainer);
  }

  // Helper Method to be independent from jquery (in this case $.param)
  function objToString (obj) {
    var str = '';
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        str += p + '=' + encodeURIComponent(obj[p]) + '&';
      }
    }
    return str.substring(0,str.length-1);
  }

  // Function to handle and send information about occuring JS Errors
  function computeJSerrors (error, src, line) {
    var dataContainer = {
      parentURL:  w.location.href,
      referrer:   d.referrer || " ",
      errorTitle: error,
      src:        src,
      line:       line,
      browser:    navigator.userAgent
    };

    // Lets count the numbers of JS Errors a user suffers
    if(localStorageAvailable) {
      if(localStorage.jsErrors) {
        localStorage.jsErrors = parseInt(localStorage.jsErrors,10) + 1;
      } else {
        localStorage.jsErrors = 1;
      }
      dataContainer.jsErrors = localStorage.jsErrors;
    }
    new Image().src = JS_BEACON_URL + "?" + objToString(dataContainer);
  }

  /**
   * PRINT Tracking =  observes the onbeforeprint event which is considered as the safest way.
   * one print event per every 5 seconds generates a request with the ?print parameter.
   */

  function observePrintEvents() {
    //IE doesnt properly implement matchMedia();
    if (w.matchMedia && !$.browser.msie) {
      w.matchMedia('print').addListener(function(mql) {
        if (mql.matches) {
          trackPrint();
        }
      });
    }
    w.onbeforeprint = trackPrint;
    w.onafterprint = function() {}; //IE needed
  }

  function trackPrint() {
    //due to Chrome firing the event twice, we just allow firing this event once-per-5-seconds
    if (new Date().getTime() - 5000 > printTime) {
      new Image().src = RUM_BEACON_URL + "?print=1&parentURL=" + w.location.href;
      printTime = new Date().getTime();
    }
  }

  // START OBSERVING HERE

  $(d).one("click", calcAndSendTimes).
    on("click", incrementClicksInCache).
    one("mousemove", observeMouseMove);

  // Start observing printing events
  if (MONITOR_PRINT_OUTS) {
    observePrintEvents();
  }


  // JavaScript ErrorReporting
  if (MONITOR_JS_ERRORS) {
    w.onerror = computeJSerrors;
  }

 /**
   *  We override window.alert and console.log and silently add an image request.
   *  With that, we can gain knowledge whenever Mr Evil uses console.log or alert to XSS our site.
   *  The following function need to be anonymous, self-executing because only that way we can ensure
   *  Mr Evil does not re-override them.
   */

  //Override alert() to maybe caught an XSS Kiddie
  if(MONITOR_ALERT) {
    (function() {
      var proxied = w.alert;
      w.alert = function(param) {
        new Image().src = ALERT_BEACON_URL + "?string=" + param;
        return proxied.apply( this, arguments );
      };
    })();
  }

  //Override console.log() to maybe caught an XSS Kiddie
  if(MONITOR_CONSOLE_LOG) {
    (function() {
      if (typeof console === "undefined") {
        return;
      }
      var proxied = console.log;
      console.log = function(param) {
        new Image().src = CONSOLE_BEACON_URL + "?string=" + param;
        return proxied.apply( this, arguments );
      };
    })();
  }

}(window, document));