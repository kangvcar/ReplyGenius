// XX Chrome Extension - Content Script for Twitter Integration
(function() {
    'use strict';

    // Configuration and state management
    let config = null;
    let isProcessing = false;
    let observer = null;
    
    // CSS classes and selectors for Twitter/X
    const SELECTORS = {
        tweet: '[data-testid="tweet"]',
        tweetText: '[data-testid="tweetText"]',
        tweetActions: '[role="group"]',
        replyButton: '[data-testid="reply"]',
        retweetButton: '[data-testid="retweet"]',
        likeButton: '[data-testid="like"]',
        shareButton: '[data-testid="share"]',
        bookmarkButton: '[data-testid="bookmark"]',
        composeTextarea: '[data-testid="tweetTextarea_0"]',
        composeEditor: '.DraftEditor-editorContainer [contenteditable="true"]',
        tweetButton: '[data-testid="tweetButtonInline"], [data-testid="tweetButton"]'
    };

    // Initialize the extension
    async function init() {
        console.log('XX: Initializing Twitter integration...');
        
        // Load configuration
        await loadConfig();
        
        // Set up UI observer
        setupObserver();
        
        // Add initial buttons to existing tweets
        addButtonsToExistingTweets();
        
        // Listen for configuration updates
        chrome.runtime.onMessage.addListener(handleMessage);
        
        console.log('XX: Twitter integration initialized successfully');
    }

    // Load configuration from storage
    async function loadConfig() {
        try {
            const result = await chrome.storage.sync.get();
            config = result;
            console.log('XX: Configuration loaded', config);
        } catch (error) {
            console.error('XX: Failed to load configuration:', error);
        }
    }

    // Handle messages from popup/background
    function handleMessage(message, sender, sendResponse) {
        switch (message.type) {
            case 'CONFIG_UPDATED':
                config = message.config;
                console.log('XX: Configuration updated', config);
                break;
        }
    }

    // Set up mutation observer to detect new tweets
    function setupObserver() {
        observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node contains tweets
                        const tweets = node.matches?.(SELECTORS.tweet) 
                            ? [node] 
                            : node.querySelectorAll?.(SELECTORS.tweet) || [];
                        
                        tweets.forEach(addXXButton);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Add XX buttons to existing tweets on page
    function addButtonsToExistingTweets() {
        const tweets = document.querySelectorAll(SELECTORS.tweet);
        tweets.forEach(addXXButton);
    }

    // Add XX button to a specific tweet
    function addXXButton(tweet) {
        // Skip if button already exists
        if (tweet.querySelector('.xx-button')) {
            return;
        }

        const actionsGroup = tweet.querySelector(SELECTORS.tweetActions);
        if (!actionsGroup) {
            return;
        }

        // Create XX button
        const xxButton = createXXButton();
        
        // Insert button at the end of actions group
        actionsGroup.appendChild(xxButton);
        
        // Add click handler
        xxButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleXXButtonClick(tweet, xxButton);
        });
    }

    // Create the XX button element
    function createXXButton() {
        const button = document.createElement('div');
        button.className = 'xx-button';
        button.setAttribute('role', 'button');
        button.setAttribute('tabindex', '0');
        button.setAttribute('aria-label', 'Generate AI reply');
        button.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 36px;
            height: 36px;
            border-radius: 9999px;
            cursor: pointer;
            transition: background-color 0.2s, transform 0.1s;
            user-select: none;
            margin-left: 12px;
        `;

        // Create emoji icon
        const emojiSpan = document.createElement('span');
        emojiSpan.textContent = '✍️';
        emojiSpan.style.cssText = `
            font-size: 18px;
            opacity: 0.7;
            transition: opacity 0.2s;
        `;

        button.appendChild(emojiSpan);

        // Add hover effects
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = 'rgba(29, 155, 240, 0.1)';
            emojiSpan.style.opacity = '1';
        });

        button.addEventListener('mouseleave', () => {
            if (!button.classList.contains('processing')) {
                button.style.backgroundColor = 'transparent';
                emojiSpan.style.opacity = '0.7';
            }
        });

        return button;
    }

    // Handle XX button click
    async function handleXXButtonClick(tweet, button) {
        if (isProcessing) {
            return;
        }

        // Check if configuration is available
        if (!config || !config.apiKey || !config.baseUrl) {
            showNotification('请先在扩展设置中配置 AI 服务', 'warning');
            return;
        }

        // Extract tweet content
        const tweetContent = extractTweetContent(tweet);
        if (!tweetContent) {
            showNotification('无法提取推文内容', 'error');
            return;
        }

        // Show loading state
        setButtonLoadingState(button, true);
        isProcessing = true;

        try {
            // Generate AI reply
            const reply = await generateAIReply(tweetContent);
            
            // Open reply dialog and insert content
            const success = await openReplyAndInsertContent(tweet, reply);
            
            if (success === true) {
                showNotification('🎉 AI回复已自动发布！', 'success');
            } else if (success === 'filled_only') {
                showNotification('✅ AI回复已生成并填入，请查看后手动发布', 'info');
            } else if (success === false) {
                showNotification('⚠️ 回复生成完成，但自动发布失败，请手动发布', 'warning');
            }
            
        } catch (error) {
            console.error('XX: Error generating reply:', error);
            showNotification('❌ 生成回复失败: ' + error.message, 'error');
        } finally {
            setButtonLoadingState(button, false);
            isProcessing = false;
        }
    }

    // Extract content from tweet
    function extractTweetContent(tweet) {
        const tweetTextElement = tweet.querySelector(SELECTORS.tweetText);
        if (!tweetTextElement) {
            return null;
        }

        // Get text content, preserving line breaks
        let content = '';
        const walker = document.createTreeWalker(
            tweetTextElement,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            content += node.textContent;
        }

        return content.trim();
    }

    // Generate AI reply using configured service
    async function generateAIReply(tweetContent) {
        const prompt = buildPrompt(tweetContent);
        
        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.aiModel || 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: getSystemPrompt()
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
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
            throw new Error('AI 服务返回空回复');
        }

        return reply;
    }

    // Build prompt for AI based on tweet content and user preferences
    function buildPrompt(tweetContent) {
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

# 思考路径
- 这条推文背后的真实动机/情绪是什么？
- 大众的惯性回应是什么？我能提供什么不同角度？
- 有什么更深层的社会/心理现象值得点出？
- 如何用最精练的话点破关键？

# 回复要求
✓ 洞察深刻：看到表象背后的东西
✓ 表达精准：一针见血，不啰嗦
✓ 语言自然：口语化但有文采
✓ 适度叛逆：敢质疑，有态度
✓ 人格鲜明：有个性，不平庸

请直接给出回复内容，要让人读完想点赞想转发想关注你。`;
    }

    // Get system prompt based on configuration
    function getSystemPrompt() {
        return `你是一个在Twitter上以睿智、有趣、敢说真话而著称的用户。你的回复总是让人眼前一亮，既有深度又不失人味。

# 身份设定
你是一个：
- 有独立思考能力的观察者，不随波逐流
- 既有人文关怀又有理性分析的思考者
- 敢于质疑权威和主流叙述的自由灵魂
- 用幽默和智慧化解严肃话题的高手
- 能在复杂问题中找到简单真相的洞察者

# 表达风格
语言特色：
- 言简意赅但信息密度高
- 口语化但有文采和思想深度
- 偶尔会有金句式的表达
- 不怕说出不合时宜的真话
- 用轻松的语气说深刻的话

# 回复原则
1. 永远不要人云亦云，要有自己的判断
2. 找到推文背后真正想表达但没说出的东西
3. 如果能一针见血，绝不绕弯子
4. 适当的叛逆和质疑让回复更有价值
5. 用人性化的语言，避免任何说教味道

回复必须控制在280字符以内，符合Twitter字数限制。`;
    }

    // Directly submit reply without opening dialog
    async function openReplyAndInsertContent(tweet, reply) {
        // Click reply button to open dialog
        const replyButton = tweet.querySelector(SELECTORS.replyButton);
        if (!replyButton) {
            throw new Error('找不到回复按钮');
        }

        replyButton.click();

        // Wait for reply dialog to appear
        await waitForElement(SELECTORS.composeTextarea, 3000);

        // Find the Draft.js editor
        const editor = document.querySelector(SELECTORS.composeEditor);
        if (!editor) {
            throw new Error('找不到Draft.js编辑器');
        }

        // Insert content using Draft.js compatible method
        await insertTextInDraftEditor(editor, reply);
        
        // Wait a moment for Twitter's UI to update
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Check if auto-submit is enabled
        if (config.autoSubmit) {
            // Auto-submit the reply
            const submitSuccess = await submitReply();
            return submitSuccess;
        } else {
            // Just fill in the content, don't submit
            return 'filled_only';
        }
    }

    // Insert text into Draft.js editor
    async function insertTextInDraftEditor(editor, text) {
        // Focus the editor
        editor.focus();
        
        // Wait for focus to be established
        await new Promise(resolve => setTimeout(resolve, 100));

        // Method 1: Try to trigger React's input handler directly
        try {
            // Find React fiber node for the editor
            const reactKey = Object.keys(editor).find(key => 
                key.startsWith('__reactProps') || 
                key.startsWith('__reactInternalInstance')
            );
            
            if (reactKey) {
                const reactProps = editor[reactKey];
                if (reactProps && reactProps.children && reactProps.children.props) {
                    // Try to get the onChange handler
                    const onChange = reactProps.children.props.onChange;
                    if (onChange && typeof onChange === 'function') {
                        // Create a synthetic event
                        const syntheticEvent = {
                            target: { textContent: text, innerText: text },
                            currentTarget: editor,
                            type: 'input'
                        };
                        onChange(syntheticEvent);
                        console.log('XX: Content inserted using React onChange handler');
                        return;
                    }
                }
            }
        } catch (error) {
            console.log('XX: React handler method failed:', error);
        }

        // Method 2: Use execCommand if available
        try {
            // Focus and select all content
            editor.focus();
            document.execCommand('selectAll');
            
            // Insert the new text
            if (document.execCommand('insertText', false, text)) {
                console.log('XX: Content inserted using execCommand');
                
                // Trigger additional events
                editor.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }
        } catch (error) {
            console.log('XX: execCommand failed, trying alternative method');
        }

        // Method 3: Use Clipboard API (most reliable for Draft.js)
        try {
            // Select all existing content and replace it
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(editor);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Use clipboard to paste the text
            await navigator.clipboard.writeText(text);
            
            // Execute paste command
            const pasteResult = document.execCommand('paste');
            if (pasteResult) {
                console.log('XX: Content inserted using clipboard paste');
                
                // Trigger additional events to ensure Twitter recognizes the change
                editor.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }
        } catch (clipboardError) {
            console.log('XX: Clipboard method failed:', clipboardError);
        }

        // Method 4: Simulate typing with keyboard events
        try {
            // Clear existing content first
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(editor);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Delete existing content
            editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', keyCode: 8, bubbles: true }));
            await new Promise(resolve => setTimeout(resolve, 50));

            // Type the text character by character
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                
                // Simulate keydown
                editor.dispatchEvent(new KeyboardEvent('keydown', { 
                    key: char,
                    bubbles: true,
                    cancelable: true
                }));
                
                // Simulate keypress
                editor.dispatchEvent(new KeyboardEvent('keypress', { 
                    key: char,
                    bubbles: true,
                    cancelable: true
                }));
                
                // Insert text using input event
                editor.dispatchEvent(new InputEvent('input', {
                    bubbles: true,
                    cancelable: true,
                    inputType: 'insertText',
                    data: char
                }));
                
                // Simulate keyup
                editor.dispatchEvent(new KeyboardEvent('keyup', { 
                    key: char,
                    bubbles: true,
                    cancelable: true
                }));

                await new Promise(resolve => setTimeout(resolve, 5));
            }
            
            console.log('XX: Content inserted using keyboard simulation');
            
        } catch (error) {
            console.error('XX: Keyboard simulation failed:', error);
            
            // Method 5: Direct DOM manipulation as last resort
            try {
                // Find the content container
                const contentContainer = editor.querySelector('[data-contents="true"]');
                if (contentContainer) {
                    // Create new content structure
                    const newContent = `
                        <div data-rbd-draggable-context-id="1" data-rbd-draggable-id="block1">
                            <div class="" data-block="true" data-editor="editor" data-offset-key="block1-0-0">
                                <div data-offset-key="block1-0-0" class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
                                    <span data-offset-key="block1-0-0">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    contentContainer.innerHTML = newContent;
                    
                    // Trigger events to notify Twitter
                    editor.dispatchEvent(new Event('input', { bubbles: true }));
                    editor.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    console.log('XX: Content inserted using DOM manipulation');
                } else {
                    throw new Error('无法找到内容容器');
                }
                
            } catch (domError) {
                console.error('XX: DOM manipulation failed:', domError);
                
                // Final fallback: Set textContent directly
                try {
                    editor.textContent = text;
                    editor.dispatchEvent(new Event('input', { bubbles: true }));
                    editor.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log('XX: Content inserted using textContent fallback');
                } catch (finalError) {
                    console.error('XX: All methods failed:', finalError);
                    throw new Error('所有文本插入方法都失败了');
                }
            }
        }

        // Final events to ensure Twitter recognizes the content
        editor.dispatchEvent(new Event('blur', { bubbles: true }));
        editor.dispatchEvent(new Event('focus', { bubbles: true }));
        editor.dispatchEvent(new KeyboardEvent('keyup', { 
            bubbles: true, 
            key: 'Enter',
            keyCode: 13 
        }));
    }

    // Submit the reply automatically
    async function submitReply() {
        // Wait for any UI updates
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Try multiple selectors for the tweet button as Twitter might change them
        const buttonSelectors = [
            '[data-testid="tweetButtonInline"]',
            '[data-testid="tweetButton"]', 
            'button[type="button"]:has-text("回复")',
            'button[type="button"]:has-text("Reply")',
            'div[role="button"]:has-text("回复")',
            'div[role="button"]:has-text("Reply")'
        ];
        
        let tweetButton = null;
        
        // Try to find the tweet button
        for (const selector of buttonSelectors) {
            tweetButton = document.querySelector(selector);
            if (tweetButton && !tweetButton.disabled && !tweetButton.getAttribute('aria-disabled')) {
                break;
            }
        }
        
        // If we still can't find it, try a more general approach
        if (!tweetButton) {
            // Look for buttons that contain "回复" or "Reply" text
            const buttons = document.querySelectorAll('button, div[role="button"]');
            for (const button of buttons) {
                const text = button.textContent?.trim().toLowerCase();
                if ((text === '回复' || text === 'reply' || text === 'tweet') && 
                    !button.disabled && 
                    !button.getAttribute('aria-disabled') &&
                    button.offsetParent !== null) { // Check if button is visible
                    tweetButton = button;
                    break;
                }
            }
        }
        
        if (tweetButton && !tweetButton.disabled && !tweetButton.getAttribute('aria-disabled')) {
            console.log('XX: Submitting reply automatically...');
            tweetButton.click();
            
            // Wait a moment to see if submission was successful
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if the reply dialog is still open (which would indicate failure)
            const dialogStillOpen = document.querySelector(SELECTORS.composeTextarea);
            if (!dialogStillOpen) {
                console.log('XX: Reply submitted successfully');
                return true;
            } else {
                console.log('XX: Reply submission may have failed, dialog still open');
                return false;
            }
        } else {
            console.log('XX: Could not find enabled tweet button');
            throw new Error('无法找到可用的发送按钮');
        }
    }

    // Wait for an element to appear
    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver((mutations) => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    // Set button loading state
    function setButtonLoadingState(button, loading) {
        const emojiSpan = button.querySelector('span');
        
        if (loading) {
            button.classList.add('processing');
            button.style.backgroundColor = 'rgba(29, 155, 240, 0.1)';
            emojiSpan.style.opacity = '1';
            // Change emoji to indicate processing
            emojiSpan.textContent = '⏳';
            emojiSpan.style.animation = 'pulse 1s ease-in-out infinite';
        } else {
            button.classList.remove('processing');
            button.style.backgroundColor = 'transparent';
            emojiSpan.style.opacity = '0.7';
            // Reset to original emoji
            emojiSpan.textContent = '✍️';
            emojiSpan.style.animation = 'none';
        }
    }

    // Show notification to user
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'xx-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 300px;
            transition: all 0.3s ease;
            transform: translateX(100%);
        `;

        // Set background color based on type
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { 
                opacity: 1; 
                transform: scale(1); 
            }
            50% { 
                opacity: 0.5; 
                transform: scale(1.1); 
            }
        }
        
        .xx-button:active {
            transform: scale(0.95);
        }
        
        .xx-notification {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
    `;
    document.head.appendChild(style);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (observer) {
            observer.disconnect();
        }
    });

})();