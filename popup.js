// ReplyGenius Chrome Extension - Popup Configuration Panel
document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const elements = {
        welcomeScreen: document.getElementById('welcomeScreen'),
        configScreen: document.getElementById('configScreen'),
        statusMessage: document.getElementById('statusMessage'),
        startSetup: document.getElementById('startSetup'),
        
        // AI Configuration
        baseUrl: document.getElementById('baseUrl'),
        apiKey: document.getElementById('apiKey'),
        aiModel: document.getElementById('aiModel'),
        customModel: document.getElementById('customModel'),
        customModelGroup: document.getElementById('customModelGroup'),
        toggleApiKey: document.getElementById('toggleApiKey'),
        testConnection: document.getElementById('testConnection'),
        
        // Reply Preferences
        defaultStyle: document.getElementById('defaultStyle'),
        defaultLanguage: document.getElementById('defaultLanguage'),
        autoSubmit: document.getElementById('autoSubmit'),
        customStylesList: document.getElementById('customStylesList'),
        addCustomStyle: document.getElementById('addCustomStyle'),
        
        // Actions
        saveConfig: document.getElementById('saveConfig'),
        resetConfig: document.getElementById('resetConfig'),
        
        // Modal
        customStyleModal: document.getElementById('customStyleModal'),
        customStyleName: document.getElementById('customStyleName'),
        customStyleDescription: document.getElementById('customStyleDescription'),
        saveCustomStyle: document.getElementById('saveCustomStyle'),
        cancelCustomStyle: document.getElementById('cancelCustomStyle')
    };

    // Default configuration
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

    // Load saved configuration
    let config = await loadConfig();
    
    // Initialize UI
    initializeUI();
    
    // Event Listeners
    setupEventListeners();

    // Functions
    async function loadConfig() {
        const result = await chrome.storage.sync.get(defaultConfig);
        return { ...defaultConfig, ...result };
    }

    async function saveConfig() {
        await chrome.storage.sync.set(config);
    }

    function initializeUI() {
        if (config.firstTimeSetup) {
            showWelcomeScreen();
        } else {
            showConfigScreen();
            loadConfigurationValues();
        }
    }

    function showWelcomeScreen() {
        elements.welcomeScreen.classList.remove('hidden');
        elements.configScreen.classList.add('hidden');
    }

    function showConfigScreen() {
        elements.welcomeScreen.classList.add('hidden');
        elements.configScreen.classList.remove('hidden');
    }

    function loadConfigurationValues() {
        elements.baseUrl.value = config.baseUrl;
        elements.apiKey.value = config.apiKey;
        elements.aiModel.value = config.aiModel;
        elements.customModel.value = config.customModel || '';
        elements.defaultStyle.value = config.defaultStyle;
        elements.defaultLanguage.value = config.defaultLanguage;
        elements.autoSubmit.checked = config.autoSubmit;
        
        // Show/hide custom model input based on selection
        toggleCustomModelInput();
        
        // Update style dropdown with custom styles
        updateStyleDropdown();
        
        renderCustomStyles();
    }

    function updateStyleDropdown() {
        const styleSelect = elements.defaultStyle;
        
        // Get current selection
        const currentValue = styleSelect.value;
        
        // Clear existing custom options (keep built-in ones)
        const builtInOptions = styleSelect.querySelectorAll('option:not([data-custom])');
        styleSelect.innerHTML = '';
        
        // Re-add built-in options
        const builtInStyles = [
            { value: '幽默风格', text: '😄 幽默风格' },
            { value: '正面积极', text: '✨ 正面积极' },
            { value: '专业严肃', text: '🎯 专业严肃' },
            { value: '友好亲切', text: '🤗 友好亲切' },
            { value: '提问互动', text: '❓ 提问互动' },
            { value: '赞同支持', text: '👍 赞同支持' },
            { value: '理性分析', text: '🔍 理性分析' },
            { value: '简洁直接', text: '⚡ 简洁直接' }
        ];
        
        builtInStyles.forEach(style => {
            const option = document.createElement('option');
            option.value = style.value;
            option.textContent = style.text;
            styleSelect.appendChild(option);
        });
        
        // Add separator if there are custom styles
        if (config.customStyles && config.customStyles.length > 0) {
            const separator = document.createElement('option');
            separator.disabled = true;
            separator.textContent = '────── 自定义风格 ──────';
            styleSelect.appendChild(separator);
            
            // Add custom styles
            config.customStyles.forEach(customStyle => {
                const option = document.createElement('option');
                option.value = customStyle.name;
                option.textContent = `🎭 ${customStyle.name}`;
                option.setAttribute('data-custom', 'true');
                styleSelect.appendChild(option);
            });
        }
        
        // Restore selection
        styleSelect.value = currentValue;
        
        // If current selection is not available, reset to default
        if (styleSelect.value !== currentValue) {
            styleSelect.value = '幽默风格';
            config.defaultStyle = '幽默风格';
        }
    }

    function setupEventListeners() {
        // Welcome screen
        elements.startSetup.addEventListener('click', () => {
            config.firstTimeSetup = false;
            showConfigScreen();
            loadConfigurationValues();
        });

        // API Key visibility toggle
        elements.toggleApiKey.addEventListener('click', () => {
            const input = elements.apiKey;
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            
            const eyeIcon = document.getElementById('eyeIcon');
            eyeIcon.textContent = isPassword ? '🙈' : '👁️';
        });

        // Test connection
        elements.testConnection.addEventListener('click', testAPIConnection);

        // Custom style management
        elements.addCustomStyle.addEventListener('click', showCustomStyleModal);
        elements.saveCustomStyle.addEventListener('click', saveCustomStyleHandler);
        elements.cancelCustomStyle.addEventListener('click', hideCustomStyleModal);
        
        // Style template buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.template-btn')) {
                const templateType = e.target.closest('.template-btn').dataset.template;
                applyStyleTemplate(templateType);
            }
        });

        // Configuration actions
        elements.saveConfig.addEventListener('click', saveConfigHandler);
        elements.resetConfig.addEventListener('click', resetConfigHandler);

        // Close modal when clicking outside
        elements.customStyleModal.addEventListener('click', (e) => {
            if (e.target === elements.customStyleModal) {
                hideCustomStyleModal();
            }
        });

        // Real-time config updates
        elements.baseUrl.addEventListener('input', (e) => config.baseUrl = e.target.value);
        elements.apiKey.addEventListener('input', (e) => config.apiKey = e.target.value);
        elements.aiModel.addEventListener('change', (e) => {
            config.aiModel = e.target.value;
            toggleCustomModelInput();
        });
        elements.customModel.addEventListener('input', (e) => config.customModel = e.target.value);
        elements.defaultStyle.addEventListener('change', (e) => config.defaultStyle = e.target.value);
        elements.defaultLanguage.addEventListener('change', (e) => config.defaultLanguage = e.target.value);
        elements.autoSubmit.addEventListener('change', async (e) => {
            config.autoSubmit = e.target.checked;
            console.log('ReplyGenius: AutoSubmit toggle changed to:', config.autoSubmit);
            
            // Immediately save and notify content script
            await saveConfig();
            
            // Notify content script about the change
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tab && (tab.url.includes('twitter.com') || tab.url.includes('x.com'))) {
                    chrome.tabs.sendMessage(tab.id, { 
                        type: 'CONFIG_UPDATED', 
                        config: config 
                    });
                    console.log('ReplyGenius: AutoSubmit config update sent to content script');
                }
            } catch (error) {
                console.log('ReplyGenius: Could not notify content script of autoSubmit change:', error);
            }
        });
    }

    // Toggle custom model input visibility
    function toggleCustomModelInput() {
        const isCustomSelected = elements.aiModel.value === 'custom';
        elements.customModelGroup.style.display = isCustomSelected ? 'block' : 'none';
        
        // Clear custom model if not selected
        if (!isCustomSelected) {
            elements.customModel.value = '';
            config.customModel = '';
        }
    }

    // Get the actual model to use for API calls
    function getActiveModel() {
        if (config.aiModel === 'custom' && config.customModel) {
            return config.customModel.trim();
        }
        return config.aiModel;
    }

    async function testAPIConnection() {
        const button = elements.testConnection;
        const originalText = button.innerHTML;
        
        // Show loading state
        button.disabled = true;
        button.innerHTML = `⏳ 测试中...`;

        try {
            const activeModel = getActiveModel();
            const response = await fetch(`${config.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    model: activeModel,
                    messages: [{ role: 'user', content: 'Hello' }],
                    max_tokens: 5
                })
            });

            if (response.ok) {
                showStatusMessage('连接成功！API 配置有效', 'success');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP ${response.status}`);
            }
        } catch (error) {
            showStatusMessage(`连接失败: ${error.message}`, 'error');
        } finally {
            // Restore button state
            button.disabled = false;
            button.innerHTML = originalText;
        }
    }

    function showStatusMessage(message, type = 'info') {
        const messageContainer = elements.statusMessage;
        const messageContent = messageContainer.querySelector('div');
        
        // Set message content
        messageContent.textContent = message;
        
        // Set appropriate styling based on type
        messageContent.className = `rounded-lg border p-3 text-sm ${getStatusMessageClass(type)}`;
        
        // Show message
        messageContainer.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageContainer.classList.add('hidden');
        }, 5000);
    }

    function getStatusMessageClass(type) {
        const classes = {
            success: 'border-green-200/50 bg-green-50/80 dark:bg-green-900/30 text-green-800 dark:text-green-200 backdrop-blur-sm',
            error: 'border-red-200/50 bg-red-50/80 dark:bg-red-900/30 text-red-800 dark:text-red-200 backdrop-blur-sm',
            warning: 'border-yellow-200/50 bg-yellow-50/80 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 backdrop-blur-sm',
            info: 'border-blue-200/50 bg-blue-50/80 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 backdrop-blur-sm'
        };
        return classes[type] || classes.info;
    }

    function showCustomStyleModal() {
        elements.customStyleName.value = '';
        elements.customStyleDescription.value = '';
        elements.customStyleModal.classList.remove('hidden');
    }

    function hideCustomStyleModal() {
        elements.customStyleModal.classList.add('hidden');
        // Clear form when hiding
        elements.customStyleName.value = '';
        elements.customStyleDescription.value = '';
        
        // Reset modal state
        editingStyleId = null;
        const modalHeader = elements.customStyleModal.querySelector('.modal-header h3');
        modalHeader.textContent = '创建自定义风格';
        elements.saveCustomStyle.textContent = '保存风格';
    }

    function applyStyleTemplate(templateType) {
        const templates = {
            healing: {
                name: '温暖治愈',
                description: '用温柔关怀的语言给人以慰藉和鼓励，多使用治愈系词汇，传递温暖正能量，让人感受到被理解和关爱'
            },
            tech: {
                name: '技术极客',
                description: '从技术和理性角度分析问题，适当使用专业术语，保持客观严谨的态度，提供有建设性的技术见解'
            },
            poetry: {
                name: '诗意文艺',
                description: '用优美文雅的语言表达观点，偶尔引用诗词或使用比喻修辞，营造唯美意境，展现文学素养'
            },
            motivational: {
                name: '激励鸡汤',
                description: '充满正能量和激励性，用振奋人心的话语鼓舞他人，传递积极向上的人生态度，激发奋斗精神'
            }
        };
        
        const template = templates[templateType];
        if (template) {
            elements.customStyleName.value = template.name;
            elements.customStyleDescription.value = template.description;
        }
    }

    function saveCustomStyleHandler() {
        const name = elements.customStyleName.value.trim();
        const description = elements.customStyleDescription.value.trim();

        if (!name) {
            showStatusMessage('请输入风格名称', 'warning');
            return;
        }

        // Check for duplicate names (excluding current editing style)
        const duplicateStyle = config.customStyles.find(style => 
            style.name === name && style.id !== editingStyleId
        );
        
        if (duplicateStyle) {
            showStatusMessage('该风格名称已存在', 'warning');
            return;
        }

        if (editingStyleId) {
            // Update existing style
            const styleIndex = config.customStyles.findIndex(s => s.id === editingStyleId);
            if (styleIndex !== -1) {
                const oldName = config.customStyles[styleIndex].name;
                config.customStyles[styleIndex].name = name;
                config.customStyles[styleIndex].description = description;
                
                // Update selected style if it was the one being edited
                if (config.defaultStyle === oldName) {
                    config.defaultStyle = name;
                    elements.defaultStyle.value = name;
                }
                
                renderCustomStyles();
                updateStyleDropdown();
                hideCustomStyleModal();
                showStatusMessage(`已更新风格: ${name}`, 'success');
            }
        } else {
            // Add new custom style
            config.customStyles.push({
                id: Date.now().toString(),
                name,
                description
            });

            renderCustomStyles();
            updateStyleDropdown(); // Update dropdown to include new style
            hideCustomStyleModal();
            showStatusMessage(`已添加自定义风格: ${name}`, 'success');
        }
    }

    function renderCustomStyles() {
        const container = elements.customStylesList;
        container.innerHTML = '';

        if (config.customStyles.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div class="text-4xl mb-2">🎨</div>
                    <p class="text-sm">还没有自定义风格</p>
                    <p class="text-xs">点击上方按钮创建你的专属风格</p>
                </div>
            `;
            return;
        }

        config.customStyles.forEach(style => {
            const styleElement = document.createElement('div');
            styleElement.className = 'flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all duration-200 hover:bg-white/70 dark:hover:bg-white/10';
            styleElement.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
                        <span class="text-lg text-white">🎭</span>
                    </div>
                    <div>
                        <div class="font-semibold text-sm text-gray-800 dark:text-gray-200">${escapeHtml(style.name)}</div>
                        ${style.description ? `<div class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs truncate" title="${escapeHtml(style.description)}">${escapeHtml(style.description)}</div>` : ''}
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button class="edit-style p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20" data-id="${style.id}" title="编辑风格">
                        <span class="text-sm">✏️</span>
                    </button>
                    <button class="delete-style p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20" data-id="${style.id}" title="删除风格">
                        <span class="text-sm">🗑️</span>
                    </button>
                </div>
            `;

            // Add event listeners
            styleElement.querySelector('.edit-style').addEventListener('click', (e) => {
                const styleId = e.currentTarget.dataset.id;
                editCustomStyle(styleId);
            });
            
            styleElement.querySelector('.delete-style').addEventListener('click', (e) => {
                const styleId = e.currentTarget.dataset.id;
                deleteCustomStyle(styleId);
            });

            container.appendChild(styleElement);
        });
    }

    // Global variable to track editing state
    let editingStyleId = null;

    function editCustomStyle(styleId) {
        const style = config.customStyles.find(s => s.id === styleId);
        if (!style) return;
        
        // Set editing state
        editingStyleId = styleId;
        
        // Fill form with existing values
        elements.customStyleName.value = style.name;
        elements.customStyleDescription.value = style.description;
        
        // Update modal title
        const modalHeader = elements.customStyleModal.querySelector('.modal-header h3');
        modalHeader.textContent = '编辑自定义风格';
        
        // Update save button text
        elements.saveCustomStyle.textContent = '更新风格';
        
        // Show modal
        elements.customStyleModal.classList.remove('hidden');
    }

    function deleteCustomStyle(styleId) {
        const styleName = config.customStyles.find(s => s.id === styleId)?.name;
        config.customStyles = config.customStyles.filter(style => style.id !== styleId);
        
        // If deleted style was selected, reset to default
        if (config.defaultStyle === styleName) {
            config.defaultStyle = '幽默风格';
            elements.defaultStyle.value = '幽默风格';
        }
        
        renderCustomStyles();
        updateStyleDropdown(); // Update dropdown to remove deleted style
        showStatusMessage('已删除自定义风格', 'success');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async function saveConfigHandler() {
        try {
            // Validate configuration
            if (!config.baseUrl) {
                showStatusMessage('请输入 Base URL', 'warning');
                return;
            }

            if (!config.apiKey) {
                showStatusMessage('请输入 API Key', 'warning');
                return;
            }

            // Validate custom model if selected
            if (config.aiModel === 'custom' && !config.customModel?.trim()) {
                showStatusMessage('请输入自定义模型名称', 'warning');
                return;
            }

            // Save configuration
            await saveConfig();
            showStatusMessage('配置已保存', 'success');
            
            // Notify content script about config update
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tab && (tab.url.includes('twitter.com') || tab.url.includes('x.com'))) {
                    chrome.tabs.sendMessage(tab.id, { 
                        type: 'CONFIG_UPDATED', 
                        config: config 
                    });
                }
            } catch (error) {
                console.log('Could not notify content script:', error);
            }
        } catch (error) {
            showStatusMessage('保存失败: ' + error.message, 'error');
        }
    }

    async function resetConfigHandler() {
        if (confirm('确定要重置所有配置吗？这将删除所有自定义设置。')) {
            config = { ...defaultConfig, firstTimeSetup: false };
            await chrome.storage.sync.clear();
            await saveConfig();
            loadConfigurationValues();
            showStatusMessage('配置已重置', 'success');
        }
    }

    // Initialize theme detection
    function detectAndApplyTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
    }

    // Apply theme on load and when system preference changes
    detectAndApplyTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectAndApplyTheme);
});