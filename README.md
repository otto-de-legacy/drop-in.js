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

## Data being delivered

<table>
  <tr>
    <th>parameter</th>
    <th>value</th>
  </tr>
  <tr>
    <td>domTime</td>
    <td>The time the browser spends on evaluating the loaded document (DOM calculation, Asset fetching) until dom:ready</td>
  </tr>
</table>
