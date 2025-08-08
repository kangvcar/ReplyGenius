// ReplyGenius Chrome Extension - Background Service Worker
console.log('ReplyGenius: Background service worker starting...');

// Rate limiting storage
const rateLimiter = new Map();

// API request queue to prevent concurrent issues
const requestQueue = new Map();

// Extension installation and update handling
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('ReplyGenius: Extension installed/updated', details);
    
    if (details.reason === 'install') {
        console.log('ReplyGenius: First time installation');
        
        // Set up default configuration
        const defaultConfig = {
            baseUrl: 'https://api.openai.com/v1',
            apiKey: '',
            aiModel: 'gpt-3.5-turbo',
            defaultStyle: '幽默风格',
            defaultLanguage: '中文简体',
            customStyles: [],
            firstTimeSetup: true,
            autoSubmit: true
        };
        
        await chrome.storage.sync.set(defaultConfig);
        console.log('ReplyGenius: Default configuration set');
        
        // Open welcome page or popup
        chrome.action.openPopup?.();
        
    } else if (details.reason === 'update') {
        console.log('ReplyGenius: Extension updated from version', details.previousVersion);
        
        // Handle any migration logic for updates if needed
        await handleUpdateMigration(details.previousVersion);
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('ReplyGenius: Extension startup');
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('ReplyGenius: Received message:', message, 'from:', sender);
    
    switch (message.type) {
        case 'API_REQUEST':
            // Add sender tab ID to message for rate limiting
            message.tabId = sender?.tab?.id;
            handleAPIRequest(message, sendResponse);
            return true;
            
        case 'GET_CONFIG':
            handleGetConfig(sendResponse);
            return true; // Keep message channel open for async response
            
        case 'UPDATE_CONFIG':
            handleUpdateConfig(message.config, sendResponse);
            return true;
            
        case 'TEST_API':
            handleTestAPI(message.config, sendResponse);
            return true;
            
        case 'GENERATE_REPLY':
            handleGenerateReply(message, sendResponse);
            return true;
            
        case 'LOG_ERROR':
            console.error('ReplyGenius: Error from content script:', message.error);
            break;
            
        default:
            console.warn('ReplyGenius: Unknown message type:', message.type);
    }
});

// Handle API requests through background script (Chrome Web Store compliance)
async function handleAPIRequest(message, sendResponse) {
    try {
        const { config, payload, endpoint = 'chat/completions', tabId } = message;
        
        // Rate limiting check - use tabId from message or fallback to 'popup'
        const rateLimitId = tabId || message.tabId || 'popup';
        if (!checkRateLimit(rateLimitId)) {
            throw new Error('请求过于频繁，请稍后再试');
        }
        
        // Input validation
        if (!config?.baseUrl || !config?.apiKey) {
            throw new Error('API配置不完整');
        }
        
        if (!payload) {
            throw new Error('请求载荷不能为空');
        }
        
        console.log('ReplyGenius: Making API request to:', `${config.baseUrl}/${endpoint}`);
        console.log('ReplyGenius: Request payload:', { 
            model: payload.model,
            messages: payload.messages?.length,
            max_tokens: payload.max_tokens
        });
        
        const response = await fetch(`${config.baseUrl}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
                'User-Agent': 'ReplyGenius/1.0.0'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { error: { message: errorText } };
            }
            
            const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
            console.error('ReplyGenius: API request failed:', errorMessage);
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('ReplyGenius: API request successful');
        sendResponse({ success: true, data });
        
    } catch (error) {
        console.error('ReplyGenius: API request error:', error);
        sendResponse({ 
            success: false, 
            error: error.message || '网络请求失败',
            code: error.code || 'NETWORK_ERROR'
        });
    }
}

// Rate limiting function
function checkRateLimit(identifier) {
    const now = Date.now();
    const key = `rate_${identifier}`;
    const requests = rateLimiter.get(key) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = requests.filter(time => now - time < 60000);
    
    // Allow max 20 requests per minute per tab/user
    if (recentRequests.length >= 20) {
        console.warn('ReplyGenius: Rate limit exceeded for:', identifier);
        return false;
    }
    
    recentRequests.push(now);
    rateLimiter.set(key, recentRequests);
    
    // Clean up old entries periodically
    if (Math.random() < 0.1) { // 10% chance
        cleanupRateLimiter();
    }
    
    return true;
}

// Cleanup old rate limiting entries
function cleanupRateLimiter() {
    const now = Date.now();
    for (const [key, requests] of rateLimiter.entries()) {
        const recentRequests = requests.filter(time => now - time < 60000);
        if (recentRequests.length === 0) {
            rateLimiter.delete(key);
        } else {
            rateLimiter.set(key, recentRequests);
        }
    }
}

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Only act when the page is completely loaded
    if (changeInfo.status !== 'complete') {
        return;
    }
    
    // Check if it's Twitter/X
    if (tab.url && (tab.url.includes('twitter.com') || tab.url.includes('x.com'))) {
        console.log('ReplyGenius: Twitter/X page detected:', tab.url);
        
        try {
            // Ensure content script is injected
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            });
            console.log('ReplyGenius: Content script injected successfully');
        } catch (error) {
            // Content script might already be injected, or injection failed
            console.log('ReplyGenius: Content script injection skipped or failed:', error.message);
        }
    }
});

// Get configuration from storage
async function handleGetConfig(sendResponse) {
    try {
        const config = await chrome.storage.sync.get();
        sendResponse({ success: true, config });
    } catch (error) {
        console.error('ReplyGenius: Failed to get config:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Update configuration in storage
async function handleUpdateConfig(config, sendResponse) {
    try {
        await chrome.storage.sync.set(config);
        console.log('ReplyGenius: Configuration updated:', config);
        
        // Notify all Twitter/X tabs about config update
        const tabs = await chrome.tabs.query({ 
            url: ['https://twitter.com/*', 'https://x.com/*'] 
        });
        
        for (const tab of tabs) {
            try {
                await chrome.tabs.sendMessage(tab.id, { 
                    type: 'CONFIG_UPDATED', 
                    config 
                });
            } catch (error) {
                // Tab might not have content script loaded yet
                console.log('ReplyGenius: Could not notify tab', tab.id, error.message);
            }
        }
        
        sendResponse({ success: true });
    } catch (error) {
        console.error('ReplyGenius: Failed to update config:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Test API connectivity
async function handleTestAPI(config, sendResponse) {
    try {
        console.log('ReplyGenius: Testing API connection...');
        
        const payload = {
            model: config.aiModel === 'custom' ? config.customModel : config.aiModel,
            messages: [{ role: 'user', content: 'Test' }],
            max_tokens: 5
        };
        
        // Use our API proxy function
        const mockMessage = {
            type: 'API_REQUEST',
            config,
            payload,
            endpoint: 'chat/completions',
            tabId: 'test' // Special identifier for API testing
        };
        
        // Create a promise to handle the async response
        const testResult = await new Promise((resolve) => {
            handleAPIRequest(mockMessage, resolve);
        });
        
        if (testResult.success) {
            console.log('ReplyGenius: API test successful');
            sendResponse({ success: true });
        } else {
            console.error('ReplyGenius: API test failed:', testResult.error);
            sendResponse({ success: false, error: testResult.error });
        }
    } catch (error) {
        console.error('ReplyGenius: API test error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Generate AI reply (fallback if content script can't do it directly)
async function handleGenerateReply(message, sendResponse) {
    try {
        console.log('ReplyGenius: Generating reply for:', message.tweetContent);
        
        const config = await chrome.storage.sync.get();
        if (!config.apiKey || !config.baseUrl) {
            throw new Error('API configuration not found');
        }
        
        const prompt = buildPrompt(message.tweetContent, config);
        const systemPrompt = getSystemPrompt();
        
        const payload = {
            model: config.aiModel === 'custom' ? config.customModel : config.aiModel,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            max_tokens: 280,
            temperature: 0.8
        };
        
        // Use our API proxy function
        const apiMessage = {
            type: 'API_REQUEST',
            config,
            payload,
            endpoint: 'chat/completions',
            tabId: 'generate' // Special identifier for reply generation
        };
        
        const result = await new Promise((resolve) => {
            handleAPIRequest(apiMessage, resolve);
        });
        
        if (result.success) {
            const reply = result.data.choices?.[0]?.message?.content?.trim();
            if (!reply) {
                throw new Error('AI service returned empty reply');
            }
            console.log('ReplyGenius: Reply generated:', reply);
            sendResponse({ success: true, reply });
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('ReplyGenius: Failed to generate reply:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Build prompt for AI (same logic as content script)
function buildPrompt(tweetContent, config) {
    const style = config.defaultStyle || '幽默风格';
    const language = config.defaultLanguage || '中文简体';
    
    return `你是Twitter上那个总能说到点子上的用户。请为以下推文写一个让人眼前一亮的回复：

原推文："${tweetContent}"
风格偏好：${style}
语言：${language}

# 你的任务
写一个1-3句话的回复，要求：
1. 有自己的独特观点，不人云亦云
2. 直击要害，说出别人没想到的角度
3. 语言自然有趣，像聪明朋友的随口一说
4. 既有深度又不装逼，既犀利又有人味

请直接给出回复内容，要让人读完想点赞想转发想关注你。`;
}

// Get system prompt
function getSystemPrompt() {
    return `你是一个在Twitter上以睿智、有趣、敢说真话而著称的用户。你的回复总是让人眼前一亮，既有深度又不失人味。

回复必须控制在280字符以内，符合Twitter字数限制。永远不要人云亦云，要有自己的判断。用人性化的语言，避免任何说教味道。`;
}

// Handle extension updates and migrations
async function handleUpdateMigration(previousVersion) {
    console.log('ReplyGenius: Handling migration from version:', previousVersion);
    
    try {
        const config = await chrome.storage.sync.get();
        
        // Add any new default settings that might be missing
        const updates = {};
        
        if (!config.hasOwnProperty('autoSubmit')) {
            updates.autoSubmit = true;
        }
        
        // Add more migration logic as needed for future versions
        
        if (Object.keys(updates).length > 0) {
            await chrome.storage.sync.set(updates);
            console.log('ReplyGenius: Migration updates applied:', updates);
        }
        
    } catch (error) {
        console.error('ReplyGenius: Migration failed:', error);
    }
}

// Monitor storage changes for debugging
chrome.storage.onChanged.addListener((changes, areaName) => {
    console.log('ReplyGenius: Storage changed in', areaName, changes);
});

// Handle extension errors
chrome.runtime.onSuspend?.addListener(() => {
    console.log('ReplyGenius: Extension suspended');
});

// Keep service worker alive with periodic tasks
function keepAlive() {
    // Simple heartbeat to prevent service worker from being killed
    console.log('ReplyGenius: Service worker heartbeat');
}

// Set up periodic keepalive (every 25 seconds, under the 30s limit)
setInterval(keepAlive, 25000);

// Global error handlers
self.addEventListener('error', (event) => {
    console.error('ReplyGenius: Background script error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('ReplyGenius: Background script unhandled rejection:', event.reason);
});

console.log('ReplyGenius: Background service worker initialized successfully');