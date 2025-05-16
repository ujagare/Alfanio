# Alfanio वेबसाइट मॉनिटरिंग सेटअप गाइड

इस डॉक्युमेंट में Alfanio वेबसाइट के लिए मॉनिटरिंग सेटअप का विस्तृत विवरण दिया गया है। यह गाइड आपको वेबसाइट की परफॉर्मेंस, अपटाइम और एरर्स को ट्रैक करने में मदद करेगी।

## 1. अपटाइम मॉनिटरिंग (UptimeRobot)

UptimeRobot एक फ्री सर्विस है जो आपकी वेबसाइट के अपटाइम को मॉनिटर करती है और डाउनटाइम होने पर आपको अलर्ट भेजती है।

### सेटअप स्टेप्स

1. [UptimeRobot](https://uptimerobot.com/) पर जाएं और एक फ्री अकाउंट क्रिएट करें
2. "Add New Monitor" पर क्लिक करें
3. निम्न डिटेल्स भरें:
   - Monitor Type: HTTP(s)
   - Friendly Name: Alfanio Website
   - URL: https://alfanio.onrender.com
   - Monitoring Interval: 5 minutes
4. अलर्ट्स सेटअप करें:
   - Email Alerts: अपना ईमेल एड्रेस एंटर करें
   - SMS Alerts (प्रीमियम): ऑप्शनल
   - Webhook: ऑप्शनल (Slack या Discord इंटीग्रेशन के लिए)
5. "Create Monitor" पर क्लिक करें

### एडिशनल मॉनिटर्स

निम्न एंडपॉइंट्स के लिए अतिरिक्त मॉनिटर्स सेटअप करें:

1. **बैकएंड API**:
   - URL: https://alfanio-backend.onrender.com
   - Monitoring Interval: 5 minutes

2. **API हेल्थ चेक**:
   - URL: https://alfanio-backend.onrender.com/api/health
   - Monitoring Interval: 5 minutes

3. **कॉन्टैक्ट फॉर्म एंडपॉइंट**:
   - URL: https://alfanio-backend.onrender.com/contact
   - Monitoring Interval: 15 minutes
   - Monitor Type: Keyword
   - Keyword Type: Not exists
   - Keyword Value: "error"

## 2. एरर ट्रैकिंग (Sentry)

Sentry एक पावरफुल एरर ट्रैकिंग टूल है जो रियल-टाइम में फ्रंटएंड और बैकएंड एरर्स को कैप्चर करता है।

### सेटअप स्टेप्स

1. [Sentry](https://sentry.io/) पर जाएं और एक फ्री अकाउंट क्रिएट करें
2. नया प्रोजेक्ट क्रिएट करें:
   - Platform: React
   - Project Name: alfanio-frontend
3. Sentry SDK इंस्टॉल करें:

```bash
npm install @sentry/react @sentry/tracing
```

4. `frontend/src/main.jsx` में Sentry इनिशियलाइज करें:

```jsx
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN", // Sentry से मिला DSN यहां पेस्ट करें
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0, // प्रोडक्शन में 0.2 (20%) पर सेट करें
  environment: import.meta.env.MODE,
});
```

5. बैकएंड के लिए भी Sentry सेटअप करें:

```bash
npm install @sentry/node @sentry/tracing
```

6. `backend/server/server.js` में Sentry इनिशियलाइज करें:

```javascript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: "YOUR_BACKEND_SENTRY_DSN",
  integrations: [
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0, // प्रोडक्शन में 0.2 (20%) पर सेट करें
  environment: process.env.NODE_ENV,
});
```

## 3. परफॉर्मेंस मॉनिटरिंग (Google Analytics)

Google Analytics आपकी वेबसाइट के ट्रैफिक, यूजर बिहेवियर और परफॉर्मेंस को ट्रैक करने में मदद करता है।

### सेटअप स्टेप्स

1. [Google Analytics](https://analytics.google.com/) पर जाएं और एक अकाउंट क्रिएट करें
2. नया प्रॉपर्टी क्रिएट करें:
   - Property Name: Alfanio Website
   - Reporting Time Zone: आपका लोकल टाइम जोन
   - Currency: INR
3. डेटा स्ट्रीम सेटअप करें:
   - Platform: Web
   - Website URL: https://alfanio.onrender.com
   - Stream Name: Alfanio Web Stream
4. मिले हुए ट्रैकिंग कोड को `frontend/index.html` में एड करें:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-XXXXXXXXXX');
</script>
```

5. कस्टम इवेंट्स सेटअप करें:
   - फॉर्म सबमिशन
   - ब्रोशर डाउनलोड
   - प्रोडक्ट व्यू

## 4. रियल-यूजर मॉनिटरिंग (Lighthouse CI)

Lighthouse CI आपकी वेबसाइट की परफॉर्मेंस, एक्सेसिबिलिटी, SEO और बेस्ट प्रैक्टिसेज को ऑटोमेटिकली चेक करता है।

### सेटअप स्टेप्स

1. Lighthouse CI इंस्टॉल करें:

```bash
npm install -g @lhci/cli
```

2. `.lighthouserc.js` फाइल क्रिएट करें:

```javascript
module.exports = {
  ci: {
    collect: {
      url: ['https://alfanio.onrender.com/', 'https://alfanio.onrender.com/contact'],
      numberOfRuns: 3,
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['warn', {minScore: 0.7}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'categories:best-practices': ['warn', {minScore: 0.8}],
        'categories:seo': ['warn', {minScore: 0.8}],
      },
    },
  },
};
```

3. GitHub Actions में इंटीग्रेट करें (ऑप्शनल):

```yaml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
      - run: npm install -g @lhci/cli
      - run: lhci autorun
```

## 5. सर्वर मॉनिटरिंग (PM2)

PM2 एक प्रोसेस मैनेजर है जो आपके Node.js एप्लिकेशन को मॉनिटर करता है और क्रैश होने पर ऑटोमेटिकली रिस्टार्ट करता है।

### सेटअप स्टेप्स

1. PM2 इंस्टॉल करें:

```bash
npm install -g pm2
```

2. `ecosystem.config.js` फाइल क्रिएट करें:

```javascript
module.exports = {
  apps: [{
    name: 'alfanio-backend',
    script: 'server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5001
    }
  }],
};
```

3. PM2 स्टार्ट करें:

```bash
pm2 start ecosystem.config.js --env production
```

4. PM2 मॉनिटरिंग सेटअप करें:

```bash
pm2 install pm2-server-monit
pm2 install pm2-logrotate
```

5. PM2 स्टेटस चेक करें:

```bash
pm2 status
pm2 monit
```

## 6. डेटाबेस मॉनिटरिंग (MongoDB Atlas)

MongoDB Atlas अपने इन-बिल्ट मॉनिटरिंग टूल्स प्रदान करता है।

### सेटअप स्टेप्स

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) पर लॉगिन करें
2. अपने क्लस्टर पर जाएं
3. "Metrics" टैब पर क्लिक करें
4. अलर्ट्स सेटअप करें:
   - "Alerts" टैब पर जाएं
   - "New Alert" पर क्लिक करें
   - CPU, मेमोरी और डिस्क यूसेज के लिए अलर्ट्स सेटअप करें
   - नोटिफिकेशन चैनल्स कॉन्फिगर करें (ईमेल, Slack, आदि)

## 7. सिक्योरिटी मॉनिटरिंग (OWASP ZAP)

OWASP ZAP एक फ्री सिक्योरिटी स्कैनिंग टूल है जो आपकी वेबसाइट में सिक्योरिटी वल्नरेबिलिटीज को डिटेक्ट करता है।

### सेटअप स्टेप्स

1. [OWASP ZAP](https://www.zaproxy.org/download/) डाउनलोड और इंस्टॉल करें
2. ZAP स्टार्ट करें और "Automated Scan" चुनें
3. टारगेट URL एंटर करें: https://alfanio.onrender.com
4. स्कैन स्टार्ट करें और रिपोर्ट जनरेट करें
5. फाउंड वल्नरेबिलिटीज को फिक्स करें

## 8. मॉनिटरिंग डैशबोर्ड

सभी मॉनिटरिंग टूल्स को एक सेंट्रल डैशबोर्ड में इंटीग्रेट करने के लिए, आप निम्न ऑप्शन्स कंसिडर कर सकते हैं:

1. **Grafana**: ओपन-सोर्स मॉनिटरिंग डैशबोर्ड
2. **Datadog**: कॉम्प्रिहेंसिव मॉनिटरिंग प्लेटफॉर्म (पेड)
3. **New Relic**: एप्लिकेशन परफॉर्मेंस मॉनिटरिंग (पेड)

## 9. रेगुलर मेंटेनेंस चेकलिस्ट

### वीकली चेक्स
- अपटाइम रिपोर्ट्स रिव्यू करें
- एरर लॉग्स रिव्यू करें
- परफॉर्मेंस मेट्रिक्स चेक करें

### मंथली चेक्स
- सिक्योरिटी स्कैन रन करें
- डेटाबेस परफॉर्मेंस ऑप्टिमाइज करें
- बैकअप्स वेरिफाई करें
- डिपेंडेंसीज अपडेट करें

### क्वार्टरली चेक्स
- कॉम्प्रिहेंसिव सिक्योरिटी ऑडिट
- परफॉर्मेंस ऑप्टिमाइजेशन
- यूजर एक्सपीरियंस रिव्यू
- मॉनिटरिंग स्ट्रैटेजी रिव्यू
