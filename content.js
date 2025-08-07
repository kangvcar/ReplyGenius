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
            // Define default configuration to ensure all properties exist
            const defaultConfig = {
                baseUrl: 'https://api.openai.com/v1',
                apiKey: '',
                aiModel: 'gpt-3.5-turbo',
                defaultStyle: '幽默风格',
                defaultLanguage: '中文简体',
                autoSubmit: true,
                customStyles: [],
                customModel: '',
                firstTimeSetup: true
            };
            
            const result = await chrome.storage.sync.get(defaultConfig);
            config = { ...defaultConfig, ...result };
            console.log('XX: Configuration loaded', config);
            console.log('XX: AutoSubmit setting:', config.autoSubmit);
        } catch (error) {
            console.error('XX: Failed to load configuration:', error);
            // Fallback to default config
            config = {
                baseUrl: 'https://api.openai.com/v1',
                apiKey: '',
                aiModel: 'gpt-3.5-turbo',
                defaultStyle: '幽默风格',
                defaultLanguage: '中文简体',
                autoSubmit: true,
                customStyles: [],
                customModel: '',
                firstTimeSetup: true
            };
        }
    }

    // Handle messages from popup/background
    function handleMessage(message, sender, sendResponse) {
        switch (message.type) {
            case 'CONFIG_UPDATED':
                config = message.config;
                console.log('XX: Configuration updated via message', config);
                console.log('XX: Updated AutoSubmit setting:', config.autoSubmit);
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
        emojiSpan.textContent = '🤖';
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

        // Reload configuration to ensure we have the latest settings
        await loadConfig();

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

    // Get the actual model to use for API calls
    function getActiveModel() {
        if (config.aiModel === 'custom' && config.customModel) {
            return config.customModel.trim();
        }
        return config.aiModel || 'gpt-3.5-turbo';
    }

    // Generate AI reply using configured service
    async function generateAIReply(tweetContent) {
        const prompt = buildPrompt(tweetContent);
        const activeModel = getActiveModel();
        
        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: activeModel,
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

    // Get human-like elements to reduce AI feel
    function getHumanLikeElements() {
        const personalExperiences = [
            "我之前也这样", "朋友圈也在说", "昨天刚聊过", "上周也遇到", "想起一个事", 
            "我妈老说", "同事都在讨论", "前几天看到", "室友也这样", "闺蜜刚说过",
            "老板经常讲", "导师提过", "网上看到过", "抖音刷到过", "微博热搜", 
            "群里在聊", "家人也说", "邻居提到", "医生建议过", "老师说过",
            "专家分析", "新闻报过", "书上写过", "经历过类似", "深有体会"
        ];

        const colloquialPatterns = [
            "说实话", "不得不说", "真的是", "怎么说呢", "emmm", "哈哈哈", "确实", "感觉",
            "应该是", "可能", "估计", "大概", "反正", "总之", "话说回来", "不过呢",
            "其实吧", "坦率说", "老实讲", "实话实说", "直白点", "简单说", "换句话说",
            "这么说吧", "怎么讲", "按理说", "一般来说", "正常情况", "通常", "基本上",
            "差不多", "大致", "约莫", "看起来", "听起来", "想想也是", "仔细想想"
        ];

        const emotionalMarkers = [
            "太真实了", "扎心了", "绝了", "爱了", "真香", "麻了", "服了", "离谱", "上头", "破防",
            "yyds", "绝绝子", "爱死了", "笑死", "哭死", "气死", "急死", "美死", "香死", "甜死",
            "太好了", "太棒了", "太牛了", "太强了", "太秀了", "太6了", "太丝滑", "太舒服",
            "刺激", "过瘾", "带劲", "有趣", "好玩", "搞笑", "逗死", "乐死", "萌死", "暖死",
            "感动", "震撼", "惊艳", "惊喜", "意外", "巧了", "缘分", "命中", "中了", "对了"
        ];

        const conversationalStarters = [
            "话说", "不过", "但是吧", "其实呢", "这样说吧", "你看啊", "讲道理", "冷静分析",
            "仔细想想", "换个角度", "从某种程度", "客观来说", "理性分析", "深入思考", 
            "多方面看", "综合考虑", "全面看待", "具体问题", "就事论事", "实际情况",
            "现实点说", "务实点", "接地气点", "通俗点", "白话点", "直接点", "明确点",
            "清楚点", "简单点", "具体点", "详细点", "准确点", "精确点", "严格说"
        ];

        const internetSlangs = [
            "awsl", "xswl", "u1s1", "yyds", "emo了", "cpu烧了", "DNA动了", "爷青回", "爷青结",
            "内卷", "躺平", "摸鱼", "划水", "打工人", "社畜", "996", "007", "福报", "内耗",
            "焦虑", "抑郁", "丧", "佛系", "咸鱼", "废物", "菜鸡", "萌新", "大佬", "巨佬",
            "凡尔赛", "白嫖", "氪金", "肝", "肝爆", "肝帝", "欧皇", "非酋", "血亏", "血赚"
        ];

        const quickResponses = [
            "哈", "啊", "嗯", "哦", "诶", "咦", "嘿", "喂", "哟", "呀", "呢", "吧", "嘛", "啦",
            "好吧", "算了", "罢了", "得了", "行吧", "可以", "不错", "还行", "马马虎虎", "一般般",
            "看情况", "再说", "以后", "下次", "改天", "有空", "有时间", "回头", "等等", "慢着"
        ];

        return {
            personalExperience: personalExperiences[Math.floor(Math.random() * personalExperiences.length)],
            colloquial: colloquialPatterns[Math.floor(Math.random() * colloquialPatterns.length)],
            emotional: emotionalMarkers[Math.floor(Math.random() * emotionalMarkers.length)],
            starter: conversationalStarters[Math.floor(Math.random() * conversationalStarters.length)],
            internetSlang: internetSlangs[Math.floor(Math.random() * internetSlangs.length)],
            quickResponse: quickResponses[Math.floor(Math.random() * quickResponses.length)]
        };
    }

    // Get style-specific prompt instructions
    function getStyleInstructions(style) {
        const stylePrompts = {
            '幽默风格': {
                personality: '你是Twitter上那个总能用幽默化解严肃话题的高手',
                requirements: [
                    '用轻松幽默的语气表达观点',
                    '善用反讽、对比或自嘲',
                    '可以适当使用网络梗或流行语',
                    '让人会心一笑的同时有所思考',
                    '可以用"哈哈哈"、"笑死"、"绝了"等语气词',
                    '偶尔用网络缩写如"yyds"、"emo了"、"CPU烧了"'
                ],
                examples: '选择使用："绝了哈哈"、"笑死我了"、"太真实"、"扎心了老铁"、"这很离谱"、"经典现场"、"人间真实"、"yyds"、"xswl"、"awsl"、"社死现场"、"血压上来了"、"CPU烧了"、"DNA动了"、"爷青回"、"内卷警告"、"躺平了"、"摸鱼被发现"、"这很凡尔赛"、"真香现场"'
            },
            '正面积极': {
                personality: '你是Twitter上那个总能传递正能量和希望的温暖存在',
                requirements: [
                    '从积极角度解读内容',
                    '提供建设性的观点或建议',
                    '传递希望和鼓励',
                    '避免批评，多用赞美和支持'
                ],
                examples: '选择使用："太棒了"、"加油鸭"、"你很棒"、"真好呀"、"支持你"、"太优秀了"、"爱了爱了"、"好厉害"、"超赞的"、"很不错"、"继续加油"、"你可以的"、"相信你"、"没问题的"、"会更好的"、"保持下去"、"真棒呢"、"好样的"、"给你点赞"'
            },
            '专业严肃': {
                personality: '你是Twitter上那个以专业分析和理性思考著称的权威声音',
                requirements: [
                    '提供专业、理性的分析',
                    '使用准确的逻辑和事实',
                    '避免感性表达，注重客观性',
                    '展现专业素养和深度思考'
                ],
                examples: '选择使用："需要数据"、"系统问题"、"逻辑有误"、"值得深思"、"缺乏依据"、"不够严谨"、"有待验证"、"需要论证"、"存疑"、"待研究"、"不确定"、"有风险"、"需谨慎"、"要客观"、"看数据"、"凭事实"、"要理性"、"需分析"'
            },
            '友好亲切': {
                personality: '你是Twitter上那个像邻家朋友一样温暖亲切的存在',
                requirements: [
                    '用温暖、关怀的语调',
                    '展现共情和理解',
                    '像朋友聊天一样自然',
                    '让人感到被理解和支持',
                    '可以用"宝贝"、"亲"、"小可爱"等亲昵称呼',
                    '多用"我懂你"、"抱抱"、"心疼"等温暖表达'
                ],
                examples: '选择使用："抱抱你"、"心疼呀"、"我懂的"、"辛苦啦"、"加油鸭"、"别难过"、"会好的"、"理解你"、"陪着你"、"不要紧"、"慢慢来"、"别着急"、"注意休息"、"要开心"、"保重身体"、"想开点"、"放轻松"、"没关系的"、"一切都好"'
            },
            '提问互动': {
                personality: '你是Twitter上那个善于引发思考和讨论的提问高手',
                requirements: [
                    '提出有启发性的问题',
                    '引导大家深入思考',
                    '用疑问句增加互动性',
                    '激发更多讨论和参与',
                    '多用"你觉得呢？"、"有同感吗？"、"求问"等互动词',
                    '可以表达困惑："我也不太懂"、"求解答"'
                ],
                examples: '选择使用："怎么看？"、"你觉得呢？"、"求问大家"、"有同感吗？"、"咋回事？"、"为啥呀？"、"真的假的？"、"有道理吗？"、"你们说呢？"、"怎么办？"、"求解答"、"懂的来说说"、"有经验的聊聊"、"大家讨论下"、"什么情况？"、"正常吗？"、"合理吗？"、"对不对？"'
            },
            '赞同支持': {
                personality: '你是Twitter上那个总能给别人鼓励和支持的正向力量',
                requirements: [
                    '表达赞同和支持',
                    '肯定对方的观点或行为',
                    '提供鼓励和认可',
                    '让人感到被理解和支持'
                ],
                examples: '选择使用："太对了"、"赞同"、"说得好"、"就是这样"、"同意"、"没错"、"完全正确"、"支持你"、"有道理"、"说到心坎"、"深表赞同"、"我也觉得"、"确实如此"、"言之有理"、"很有见地"、"说得在理"、"非常认同"、"深有同感"、"说得太好了"'
            },
            '理性分析': {
                personality: '你是Twitter上那个以冷静分析和逻辑思维见长的理性声音',
                requirements: [
                    '进行深入的逻辑分析',
                    '从多个角度分析问题',
                    '提供客观中立的观点',
                    '用数据或事实支撑论点'
                ],
                examples: '选择使用："逻辑有问题"、"需要数据"、"值得思考"、"原因复杂"、"多重因素"、"深层原因"、"关键问题"、"核心矛盾"、"本质上"、"根本在于"、"从逻辑看"、"分析发现"、"综合来看"、"客观说"、"理性看待"、"需要研究"、"待观察"、"存在问题"'
            },
            '简洁直接': {
                personality: '你是Twitter上那个以言简意赅、一语中的著称的直言者',
                requirements: [
                    '用最少的字表达核心观点',
                    '直击要害，不绕弯子',
                    '避免冗余的修饰',
                    '让每个字都有价值',
                    '可以用"就是"、"直接"、"简单说"等直接表达',
                    '偶尔用省略句和短句增强力度'
                ],
                examples: '选择使用："就这样"、"没错"、"直接"、"简单说"、"对"、"是的"、"当然"、"必须的"、"肯定"、"绝对"、"确实"、"就是"、"对吧"、"嗯"、"好"、"行"、"可以"、"不行"、"算了"、"得了"'
            }
        };
        
        return stylePrompts[style] || stylePrompts['幽默风格'];
    }

    // Build prompt for AI based on tweet content and user preferences
    function buildPrompt(tweetContent) {
        const style = config.defaultStyle || '幽默风格';
        const language = config.defaultLanguage || '中文简体';
        const styleInfo = getStyleInstructions(style);
        const humanElements = getHumanLikeElements();
        
        return `${styleInfo.personality}。请为以下推文写一个符合${style}的回复：

原推文："${tweetContent}"
回复风格：${style}
语言：${language}

# 风格要求
${styleInfo.requirements.map(req => `• ${req}`).join('\n')}

# 参考示例
${styleInfo.examples}

# 让回复更像真人的技巧
• 口语化表达：${humanElements.colloquial}、${humanElements.starter}
• 个人化元素：${humanElements.personalExperience}
• 情感表达：${humanElements.emotional}
• 网络用语：${humanElements.internetSlang}
• 简短回应：${humanElements.quickResponse}
• 语言要有不完美性：偶尔省略、重复、犹豫
• 避免过于完整的句式结构
• 不要太理性，要有真实的情感倾向
• 可以有个人偏好和小"偏见"
• 语气要像在和朋友聊天，不是在写作文

# 字数限制要求（重要！）
• 回复总长度：最短2个字，最长35个字
• 优先简短精炼的表达
• 宁可简短有力，也不要冗长无力
• 计算所有汉字、标点、emoji的总数

# 绝对要避免的AI特征
• 不要用"作为一个..."开头
• 不要过分政治正确和中性
• 不要用过于正式的书面语
• 不要结构过于工整
• 不要给建议（除非被问到）
• 不要解释太多，要像随口一说

请直接给出回复内容，严格控制在2-35个字以内，要让人感觉这是一个真实的人在自然表达。`;
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
        console.log('XX: Checking autoSubmit setting:', config.autoSubmit);
        if (config.autoSubmit) {
            console.log('XX: AutoSubmit is enabled, submitting reply...');
            // Auto-submit the reply
            const submitSuccess = await submitReply();
            return submitSuccess;
        } else {
            console.log('XX: AutoSubmit is disabled, only filling content...');
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
            emojiSpan.textContent = '🤖';
            emojiSpan.style.animation = 'pulse 1s ease-in-out infinite';
        } else {
            button.classList.remove('processing');
            button.style.backgroundColor = 'transparent';
            emojiSpan.style.opacity = '0.7';
            // Reset to original emoji
            emojiSpan.textContent = '🤖';
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