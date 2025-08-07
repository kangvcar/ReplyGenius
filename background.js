// XX Chrome Extension - Background Service Worker
console.log('XX: Background service worker starting...');

// Extension installation and update handling
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('XX: Extension installed/updated', details);
    
    if (details.reason === 'install') {
        console.log('XX: First time installation');
        
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
        console.log('XX: Default configuration set');
        
        // Open welcome page or popup
        chrome.action.openPopup?.();
        
    } else if (details.reason === 'update') {
        console.log('XX: Extension updated from version', details.previousVersion);
        
        // Handle any migration logic for updates if needed
        await handleUpdateMigration(details.previousVersion);
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('XX: Extension startup');
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('XX: Received message:', message, 'from:', sender);
    
    switch (message.type) {
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
            console.error('XX: Error from content script:', message.error);
            break;
            
        default:
            console.warn('XX: Unknown message type:', message.type);
    }
});

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Only act when the page is completely loaded
    if (changeInfo.status !== 'complete') {
        return;
    }
    
    // Check if it's Twitter/X
    if (tab.url && (tab.url.includes('twitter.com') || tab.url.includes('x.com'))) {
        console.log('XX: Twitter/X page detected:', tab.url);
        
        try {
            // Ensure content script is injected
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            });
            console.log('XX: Content script injected successfully');
        } catch (error) {
            // Content script might already be injected, or injection failed
            console.log('XX: Content script injection skipped or failed:', error.message);
        }
    }
});

// Get configuration from storage
async function handleGetConfig(sendResponse) {
    try {
        const config = await chrome.storage.sync.get();
        sendResponse({ success: true, config });
    } catch (error) {
        console.error('XX: Failed to get config:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Update configuration in storage
async function handleUpdateConfig(config, sendResponse) {
    try {
        await chrome.storage.sync.set(config);
        console.log('XX: Configuration updated:', config);
        
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
                console.log('XX: Could not notify tab', tab.id, error.message);
            }
        }
        
        sendResponse({ success: true });
    } catch (error) {
        console.error('XX: Failed to update config:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Test API connectivity
async function handleTestAPI(config, sendResponse) {
    try {
        console.log('XX: Testing API connection...');
        
        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.aiModel,
                messages: [{ role: 'user', content: 'Test' }],
                max_tokens: 5
            })
        });

        if (response.ok) {
            console.log('XX: API test successful');
            sendResponse({ success: true });
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
            console.error('XX: API test failed:', errorMessage);
            sendResponse({ success: false, error: errorMessage });
        }
    } catch (error) {
        console.error('XX: API test error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Generate AI reply (fallback if content script can't do it directly)
async function handleGenerateReply(message, sendResponse) {
    try {
        console.log('XX: Generating reply for:', message.tweetContent);
        
        const config = await chrome.storage.sync.get();
        if (!config.apiKey || !config.baseUrl) {
            throw new Error('API configuration not found');
        }
        
        const prompt = buildPrompt(message.tweetContent, config);
        const systemPrompt = getSystemPrompt();
        
        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.aiModel || 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 280,
                temperature: 0.8
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        
        if (!reply) {
            throw new Error('AI service returned empty reply');
        }

        console.log('XX: Reply generated:', reply);
        sendResponse({ success: true, reply });
        
    } catch (error) {
        console.error('XX: Failed to generate reply:', error);
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
    console.log('XX: Handling migration from version:', previousVersion);
    
    try {
        const config = await chrome.storage.sync.get();
        
        // Add any new default settings that might be missing
        const updates = {};
        
        if (!config.hasOwnProperty('autoSubmit')) {
            updates.autoSubmit = false;
        }
        
        // Add more migration logic as needed for future versions
        
        if (Object.keys(updates).length > 0) {
            await chrome.storage.sync.set(updates);
            console.log('XX: Migration updates applied:', updates);
        }
        
    } catch (error) {
        console.error('XX: Migration failed:', error);
    }
}

// Monitor storage changes for debugging
chrome.storage.onChanged.addListener((changes, areaName) => {
    console.log('XX: Storage changed in', areaName, changes);
});

// Handle extension errors
chrome.runtime.onSuspend?.addListener(() => {
    console.log('XX: Extension suspended');
});

// Context menu for advanced users (optional)
chrome.contextMenus?.onClicked?.addListener((info, tab) => {
    if (info.menuItemId === 'xx-generate-reply' && tab) {
        chrome.tabs.sendMessage(tab.id, { 
            type: 'CONTEXT_MENU_GENERATE',
            selectedText: info.selectionText 
        });
    }
});

// Set up context menu if available
chrome.runtime.onInstalled.addListener(() => {
    if (chrome.contextMenus) {
        chrome.contextMenus.create({
            id: 'xx-generate-reply',
            title: 'Generate AI Reply',
            contexts: ['selection'],
            documentUrlPatterns: ['https://twitter.com/*', 'https://x.com/*']
        });
    }
});

// Keep service worker alive with periodic tasks
function keepAlive() {
    // Simple heartbeat to prevent service worker from being killed
    console.log('XX: Service worker heartbeat');
}

// Set up periodic keepalive (every 25 seconds, under the 30s limit)
setInterval(keepAlive, 25000);

console.log('XX: Background service worker initialized successfully');