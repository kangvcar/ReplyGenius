# Chrome Web Store Privacy Form Responses

## Single Purpose Description
ReplyGenius is an AI-powered Twitter assistant that generates contextual, witty replies to tweets. Users click an AI button under any tweet to automatically generate and optionally post intelligent responses using their configured AI service (OpenAI, Claude, etc.). The extension helps users engage more effectively on Twitter/X with personalized, high-quality replies in multiple styles and languages.

## Permission Justifications

### Storage Justification
Store user configuration settings locally including AI service credentials (API keys), reply style preferences, custom reply styles, language settings, and extension preferences. All data is stored locally on the user's device using Chrome's secure storage API for persistent configuration across browser sessions.

### ActiveTab Justification  
Access the currently active Twitter/X tab to integrate AI reply buttons into the Twitter interface, extract tweet content for AI processing, inject generated replies into Twitter's compose interface, and provide seamless user experience without requiring broad host permissions.

### Scripting Justification
Inject content scripts into Twitter/X pages to add AI reply buttons, integrate with Twitter's native interface, extract tweet text for AI analysis, insert generated replies into Twitter's reply composer, and provide the core functionality of AI-powered reply generation within Twitter's environment.

### Host Permission Justification
Access twitter.com and x.com domains to integrate AI reply functionality directly into Twitter's interface. This allows the extension to add AI reply buttons under tweets, extract tweet content for processing, and seamlessly integrate with Twitter's native reply system for optimal user experience.

## Remote Code Question
**Selected: No, I am not using remote code**

(ReplyGenius does not use remote code. All JavaScript is bundled within the extension package. While the extension communicates with external AI APIs, it does not download or execute remote JavaScript code.)

## Data Collection

**Selected Data Types: Website content**

**Justification for Website content:**
ReplyGenius temporarily processes tweet text content when users click the AI reply button. The tweet text is sent to the user's configured AI service (OpenAI, Claude, etc.) to generate contextually relevant replies. This content is processed in real-time and not stored by the extension - it's only used for AI reply generation purposes.

## Data Usage Certifications
✅ I do not sell or transfer user data to third parties, outside of the approved use cases
✅ I do not use or transfer user data for purposes that are unrelated to my item's single purpose  
✅ I do not use or transfer user data to determine creditworthiness or for lending purposes

## Privacy Policy URL
https://replygenius.app/privacy

---

## Copy-Paste Ready Responses:

**Single purpose description:**
```
ReplyGenius is an AI-powered Twitter assistant that generates contextual, witty replies to tweets. Users click an AI button under any tweet to automatically generate and optionally post intelligent responses using their configured AI service (OpenAI, Claude, etc.). The extension helps users engage more effectively on Twitter/X with personalized, high-quality replies in multiple styles and languages.
```

**Storage justification:**
```
Store user configuration settings locally including AI service credentials (API keys), reply style preferences, custom reply styles, language settings, and extension preferences. All data is stored locally on the user's device using Chrome's secure storage API for persistent configuration across browser sessions.
```

**ActiveTab justification:**
```
Access the currently active Twitter/X tab to integrate AI reply buttons into the Twitter interface, extract tweet content for AI processing, inject generated replies into Twitter's compose interface, and provide seamless user experience without requiring broad host permissions.
```

**Scripting justification:**
```
Inject content scripts into Twitter/X pages to add AI reply buttons, integrate with Twitter's native interface, extract tweet text for AI analysis, insert generated replies into Twitter's reply composer, and provide the core functionality of AI-powered reply generation within Twitter's environment.
```

**Host permission justification:**
```
Access twitter.com and x.com domains to integrate AI reply functionality directly into Twitter's interface. This allows the extension to add AI reply buttons under tweets, extract tweet content for processing, and seamlessly integrate with Twitter's native reply system for optimal user experience.
```

**Website content justification:**
```
ReplyGenius temporarily processes tweet text content when users click the AI reply button. The tweet text is sent to the user's configured AI service (OpenAI, Claude, etc.) to generate contextually relevant replies. This content is processed in real-time and not stored by the extension - it's only used for AI reply generation purposes.
```

**Privacy policy URL:**
```
https://replygenius.app/privacy
```