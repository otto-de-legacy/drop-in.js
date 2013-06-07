# drop-in rum.js

## Description

A good start to do Real User Monitoring (RUM) in your project with this simple drop-in js file.
All you have to do is loading this the rum.js (e.g. by merging it into your main.js) on your website and adjust the monitoring urls:

```javascript
RUM_BEACON_URL =                "https://www.example.com/some_rum_url.gif",
JS_BEACON_URL =                 "https://www.example.com/some_js_errors_monitoring_url.gif",
PRINT_BEACON_URL =              "https://www.example.com/some_print_monitoring_url.gif",
CONSOLE_BEACON_URL =            "https://www.example.com/some_other_monitoring_url.gif",
LIVE_URL_PATTERN =              "live.example.com", //for specifying the live env so that you dont monitor on dev or prelive envs
ALERT_BEACON_URL =              "https://www.example.com/omg_another_monitoring_url.gif",
```

The URLs you insert should point to an image beacon url under your control. Providing that you get in your (apache|nginx).log files all the RUM data you ever dreamed of.

## Installation

1) Just include the file as

```html
<script src="rum.js"></script>
```
anywhere in your project. Preferably at the very end of your document.

2) You must have a server under your control where the JavaScript can send the data to. E.g. Apache or nginix where
you have good access to the logfiles.

3) For optimal evaluation of the data you use a logfile parser/analyzer such as splunk together graphite.


## Requirements

drop-in rum.js only works with browsers supporting the navigation.timing api (https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html).
Those are currently: Firefox 7+, Chrome 5+ and IE9+

Oh, and you will need jQuery.
Pull requests for a jQuery-less version are welcome.

## Data being delivered

The format in the logs will look like:
https://www.example.com/some_rum_url.gif?networkTime=386&domTime=431&complete=770&dnsTime=0&timeToFirstClick=7039&clickObject=DIV%3A&timeFromMoveToClick=6548&parentURL=https%3A%2F%2Fwww.example.com%2F&referrer=&htmlLength=110186&numberStylesheets=3

### Performance Data

<table>
  <tr>
    <th>parameter</th>
    <th>value</th>
  </tr>
  <tr>
    <td>domTime</td>
    <td>The time the browser spends on evaluating the loaded document (DOM calculation, Asset fetching) until dom:ready</td>
  </tr>
  <tr>
    <td>networkTime</td>
    <td>The time thats being spent only to fetch the whole document excluding assets.</td>
  </tr>
    <tr>
    <td>dnsTime</td>
    <td>Time being spend resolving the hostname</td>
  </tr>
    <tr>
    <td>complete</td>
    <td>The complete time from initiating the pageload until dom:ready. Including dom:ready relevant asset requests</td>
  </tr>
    <tr>
    <td>clickObject</td>
    <td>A nice insight of minor importance: where did the user click on the loaded page. Could it be, that your users constantly click your exit button on a special page because it peforms bad ?</td>
  </tr>
  <tr>
    <td>timeToFirstClick</td>
    <td>Another new metric: When (counting from the triggering the pageload) does the user perform the first click. Could lead to some interesting performance insights</td>
  </tr>
  <tr>
    <td>timeFromMoveToClick</td>
    <td>Delivers the time difference from the first movement of the mouse until the first click. Question could be: "Do your users move the mouse around for hours until they click due to bad performance ?"</td>
  </tr>
  <tr>
    <td>parentURL</td>
    <td>The URL where the user was at time of the monitoring</td>
  </tr>
  <tr>
    <td>referrer</td>
    <td>The URL before this page</td>
  </tr>
  <tr>
    <td>htmlLength</td>
    <td>The number of characters inside the body at the moment of the first click in the document. A good metric to learn about your avg pagesizse. </td>
  </tr>
  <tr>
    <td>numberStylesheets</td>
    <td>The number of Stylesheets being loaded from this page. Two is a good number, more than 5 far too much.</td>
  </tr>
  <tr>
    <td>pageViewsUntilCheckout</td>
    <td>The number of pageviews a user performs until he buys something on your site.  Indicator is when he arrives at URL_PATTERN_FOR_CHECKOUT_PAGE . Afterwards the counter here is resetted. </td>
  </tr>
  <tr>
    <td>clicksUntilCheckout</td>
    <td>The number of click a user performs until he buys something on your site. Indicator is when he arrives at URL_PATTERN_FOR_CHECKOUT_PAGE . Afterwards the counter here is resetted. Can give some insights to your UX on how click intensively your website is (JIRA or Typo3 should have awesome high numbers here).</td>
  </tr>
</table>

### Print out data

<table>
  <tr>
    <th>parameter</th>
    <th>value</th>
  </tr>
  <tr>
    <td>print</td>
    <td>Just an integer 1. You need to sum them up get the overall printouts per time period.</td>
  </tr>
</table>

### JavaScript Errors

### use of console.log

### use of alert()


