# Gmail App Password Setup Guide for Alfanio

इस गाइड में Gmail App Password सेटअप के स्टेप-बाय-स्टेप निर्देश दिए गए हैं, जो Alfanio वेबसाइट के लिए ईमेल सेंडिंग फंक्शनैलिटी को सही ढंग से कॉन्फिगर करने के लिए आवश्यक है।

## क्यों App Password की आवश्यकता है?

Google ने सुरक्षा कारणों से "कम सुरक्षित ऐप्स एक्सेस" को बंद कर दिया है। इसका मतलब है कि अब आप अपने रेगुलर Gmail पासवर्ड का उपयोग करके थर्ड-पार्टी ऐप्स से ईमेल नहीं भेज सकते हैं। इसके बजाय, आपको App Password का उपयोग करना होगा।

## पूर्व आवश्यकताएं

1. Gmail अकाउंट (alfanioindia@gmail.com)
2. 2-स्टेप वेरिफिकेशन एनेबल होना चाहिए

## 2-स्टेप वेरिफिकेशन एनेबल करें

अगर आपके Gmail अकाउंट में 2-स्टेप वेरिफिकेशन पहले से एनेबल नहीं है, तो इसे एनेबल करें:

1. [Google अकाउंट](https://myaccount.google.com/) पर जाएं
2. बाईं ओर "सिक्योरिटी" पर क्लिक करें
3. "Google में साइन-इन" सेक्शन में "2-स्टेप वेरिफिकेशन" पर क्लिक करें
4. "शुरू करें" बटन पर क्लिक करें
5. अपने फोन नंबर को वेरिफाई करें और सेटअप पूरा करें

## App Password जनरेट करें

2-स्टेप वेरिफिकेशन एनेबल होने के बाद, App Password जनरेट करें:

1. [Google अकाउंट](https://myaccount.google.com/) पर जाएं
2. बाईं ओर "सिक्योरिटी" पर क्लिक करें
3. "Google में साइन-इन" सेक्शन में "2-स्टेप वेरिफिकेशन" पर क्लिक करें
4. नीचे स्क्रॉल करें और "ऐप पासवर्ड" पर क्लिक करें (अगर यह ऑप्शन नहीं दिखता है, तो सुनिश्चित करें कि 2-स्टेप वेरिफिकेशन एनेबल है)
5. "ऐप" ड्रॉपडाउन से "अन्य (कस्टम नाम)" चुनें
6. "Alfanio Website" नाम दें और "जनरेट" पर क्लिक करें
7. जनरेट किए गए 16-कैरेक्टर पासवर्ड को कॉपी करें (यह स्पेस के साथ दिखाया जाएगा, लेकिन आप स्पेस को हटा सकते हैं)

![App Password Generation](https://support.google.com/accounts/answer/185833?hl=en#zippy=%2Cwhy-you-may-need-an-app-password)

## App Password का उपयोग करें

जनरेट किए गए App Password को `backend/server/emailService.js` फाइल में अपडेट करें:

```javascript
const transportConfig = {
  service: 'gmail',
  auth: {
    user: 'alfanioindia@gmail.com',
    pass: 'YOUR_APP_PASSWORD_HERE' // जनरेट किए गए 16-कैरेक्टर App Password से रिप्लेस करें
  }
};
```

## सुरक्षा टिप्स

1. **App Password को सुरक्षित रखें**: इसे किसी के साथ शेयर न करें
2. **App Password को गिट रिपॉजिटरी में पुश न करें**: इसे `.env` फाइल में रखें और `.gitignore` में `.env` फाइल को एड करें
3. **रेगुलर पासवर्ड अपडेट करें**: समय-समय पर App Password को रीजनरेट करें

## ट्रबलशूटिंग

### 1. "Invalid login" एरर

अगर आप "Invalid login" या "Authentication failed" एरर देख रहे हैं:

- सुनिश्चित करें कि ईमेल एड्रेस सही है
- सुनिश्चित करें कि App Password सही है और स्पेस नहीं हैं
- सुनिश्चित करें कि 2-स्टेप वेरिफिकेशन एनेबल है

### 2. "Secure connection required" एरर

अगर आप "Secure connection required" एरर देख रहे हैं:

- पोर्ट 465 का उपयोग करें और `secure: true` सेट करें:

```javascript
const transportConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'alfanioindia@gmail.com',
    pass: 'YOUR_APP_PASSWORD_HERE'
  }
};
```

### 3. "Daily user sending quota exceeded" एरर

Gmail फ्री अकाउंट्स के लिए दैनिक ईमेल सेंडिंग लिमिट है (लगभग 500 ईमेल्स प्रति दिन):

- ईमेल सेंडिंग को लिमिट करें
- बिजनेस के लिए Google Workspace का उपयोग करें
- अल्टरनेटिव ईमेल सर्विस जैसे SendGrid या Mailgun का उपयोग करें

## अल्टरनेटिव ईमेल सर्विसेज

अगर Gmail के साथ समस्याएं जारी रहती हैं, तो आप इन अल्टरनेटिव ईमेल सर्विसेज पर विचार कर सकते हैं:

1. **SendGrid**: [SendGrid](https://sendgrid.com/) पर अकाउंट क्रिएट करें (फ्री प्लान उपलब्ध है)
2. **Mailgun**: [Mailgun](https://www.mailgun.com/) पर अकाउंट क्रिएट करें
3. **Amazon SES**: [Amazon SES](https://aws.amazon.com/ses/) पर अकाउंट क्रिएट करें

## अधिक जानकारी

- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [Nodemailer Gmail Configuration](https://nodemailer.com/usage/using-gmail/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
