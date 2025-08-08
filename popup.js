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
    
    // Setup real-time validation
    setupRealTimeValidation();

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
        document.getElementById('closeStyleModal').addEventListener('click', hideCustomStyleModal);
        
        // Style template buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.template-btn')) {
                const templateType = e.target.closest('.template-btn').dataset.template;
                applyStyleTemplate(templateType);
                
                // Visual feedback for template selection
                document.querySelectorAll('.template-btn').forEach(btn => btn.classList.remove('selected'));
                e.target.closest('.template-btn').classList.add('selected');
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
        
        // Clear any previous validation messages
        clearValidationMessage(elements.baseUrl);
        clearValidationMessage(elements.apiKey);
        clearValidationMessage(elements.customModel);

        // Validate inputs before testing
        if (!config.baseUrl) {
            showValidationMessage(elements.baseUrl, '请输入Base URL', 'error');
            elements.baseUrl.focus();
            return;
        }

        if (!validateUrl(config.baseUrl)) {
            showValidationMessage(elements.baseUrl, 'URL格式不正确', 'error');
            elements.baseUrl.focus();
            return;
        }

        if (!config.apiKey) {
            showValidationMessage(elements.apiKey, '请输入API Key', 'error');
            elements.apiKey.focus();
            return;
        }

        if (!validateApiKey(config.apiKey)) {
            showValidationMessage(elements.apiKey, 'API Key格式不正确', 'error');
            elements.apiKey.focus();
            return;
        }

        const activeModel = getActiveModel();
        if (!activeModel) {
            const targetElement = config.aiModel === 'custom' ? elements.customModel : elements.aiModel;
            showValidationMessage(targetElement, '请选择或输入模型', 'error');
            targetElement.focus();
            return;
        }

        // Show loading state
        button.classList.add('btn-loading');
        button.disabled = true;

        try {
            // Use background script for API testing (Chrome Web Store compliance)
            const result = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    type: 'API_REQUEST',
                    config: {
                        baseUrl: config.baseUrl,
                        apiKey: config.apiKey
                    },
                    payload: {
                        model: activeModel,
                        messages: [{ role: 'user', content: 'Hello' }],
                        max_tokens: 5
                    },
                    endpoint: 'chat/completions'
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else if (response && response.success) {
                        resolve(response);
                    } else {
                        reject(new Error(response?.error || '测试连接失败'));
                    }
                });
            });

            // Show success validation for inputs
            showValidationMessage(elements.baseUrl, 'URL连接成功', 'success');
            showValidationMessage(elements.apiKey, 'API Key有效', 'success');
            if (config.aiModel === 'custom') {
                showValidationMessage(elements.customModel, '模型可用', 'success');
            }
            showStatusMessage('✅ 连接成功！API 配置有效', 'success');
            
        } catch (error) {
            console.error('API Connection test failed:', error);
            
            // Show specific error based on error message
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('unauthorized') || errorMessage.includes('invalid api key')) {
                showValidationMessage(elements.apiKey, 'API Key无效或已过期', 'error');
            } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
                showValidationMessage(elements.baseUrl, 'API端点不存在', 'error');
            } else if (errorMessage.includes('model')) {
                const targetElement = config.aiModel === 'custom' ? elements.customModel : elements.aiModel;
                showValidationMessage(targetElement, '模型不可用', 'error');
            }
            
            showStatusMessage(`❌ 连接失败: ${error.message}`, 'error');
        } finally {
            // Restore button state
            button.classList.remove('btn-loading');
            button.disabled = false;
        }
    }

    function showStatusMessage(message, type = 'info') {
        const messageContainer = elements.statusMessage;
        const messageContent = messageContainer.querySelector('.status-content');
        
        // Clear existing classes
        messageContainer.className = 'status-message';
        
        // Set message content
        messageContent.textContent = message;
        
        // Add appropriate class
        messageContainer.classList.add(`status-${type}`);
        
        // Show message with animation
        messageContainer.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageContainer.classList.add('hidden');
        }, 5000);
    }

    async function saveConfigHandler() {
        const button = elements.saveConfig;
        
        try {
            // Clear previous validation messages
            document.querySelectorAll('.validation-message').forEach(msg => msg.remove());
            document.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('error', 'success', 'warning');
            });

            let hasErrors = false;

            // Validate all required fields
            if (!config.baseUrl) {
                showValidationMessage(elements.baseUrl, '请输入Base URL', 'error');
                hasErrors = true;
            } else if (!validateUrl(config.baseUrl)) {
                showValidationMessage(elements.baseUrl, 'URL格式不正确', 'error');
                hasErrors = true;
            }

            if (!config.apiKey) {
                showValidationMessage(elements.apiKey, '请输入API Key', 'error');
                hasErrors = true;
            } else if (!validateApiKey(config.apiKey)) {
                showValidationMessage(elements.apiKey, 'API Key格式不正确', 'error');
                hasErrors = true;
            }

            if (config.aiModel === 'custom' && !config.customModel?.trim()) {
                showValidationMessage(elements.customModel, '请输入自定义模型名称', 'error');
                hasErrors = true;
            }

            if (hasErrors) {
                showStatusMessage('⚠️ 请检查并修正表单错误', 'warning');
                return;
            }

            // Show loading state
            button.classList.add('btn-loading');
            button.disabled = true;

            // Save configuration
            await saveConfig();
            
            // Show success validation for all fields
            showValidationMessage(elements.baseUrl, '已保存', 'success');
            showValidationMessage(elements.apiKey, '已保存', 'success');
            if (config.aiModel === 'custom' && config.customModel) {
                showValidationMessage(elements.customModel, '已保存', 'success');
            }
            
            showStatusMessage('✅ 配置已保存成功', 'success');
            
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
            console.error('Save config failed:', error);
            showStatusMessage('❌ 保存失败: ' + error.message, 'error');
        } finally {
            // Restore button state
            button.classList.remove('btn-loading');
            button.disabled = false;
        }
    }

    // Enhanced validation and status functions
    function showValidationMessage(element, message, type = 'error') {
        // Remove any existing validation message
        const existingMessage = element.parentNode.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Update form group class
        const formGroup = element.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error', 'success', 'warning');
            if (type !== 'clear') {
                formGroup.classList.add(type);
            }
        }

        // Add validation message if provided
        if (message && type !== 'clear') {
            const messageElement = document.createElement('div');
            messageElement.className = `validation-message ${type}`;
            messageElement.textContent = message;
            element.parentNode.appendChild(messageElement);
        }
    }

    function clearValidationMessage(element) {
        showValidationMessage(element, '', 'clear');
    }

    function validateUrl(url) {
        try {
            new URL(url);
            return url.startsWith('http://') || url.startsWith('https://');
        } catch {
            return false;
        }
    }

    function validateApiKey(key) {
        return key && key.trim().length >= 10;
    }

    function validateModel(model) {
        return model && model.trim().length > 0;
    }

    // Real-time validation
    function setupRealTimeValidation() {
        // Base URL validation
        elements.baseUrl.addEventListener('blur', () => {
            const url = elements.baseUrl.value.trim();
            if (url && !validateUrl(url)) {
                showValidationMessage(elements.baseUrl, '请输入有效的URL地址', 'error');
            } else if (url) {
                showValidationMessage(elements.baseUrl, 'URL格式正确', 'success');
            } else {
                clearValidationMessage(elements.baseUrl);
            }
        });

        elements.baseUrl.addEventListener('input', () => {
            if (elements.baseUrl.value.trim()) {
                clearValidationMessage(elements.baseUrl);
            }
        });

        // API Key validation
        elements.apiKey.addEventListener('blur', () => {
            const key = elements.apiKey.value.trim();
            if (key && !validateApiKey(key)) {
                showValidationMessage(elements.apiKey, 'API密钥长度至少10个字符', 'error');
            } else if (key) {
                showValidationMessage(elements.apiKey, 'API密钥格式正确', 'success');
            } else {
                clearValidationMessage(elements.apiKey);
            }
        });

        elements.apiKey.addEventListener('input', () => {
            if (elements.apiKey.value.trim()) {
                clearValidationMessage(elements.apiKey);
            }
        });

        // Custom model validation
        elements.customModel.addEventListener('blur', () => {
            if (elements.aiModel.value === 'custom') {
                const model = elements.customModel.value.trim();
                if (!validateModel(model)) {
                    showValidationMessage(elements.customModel, '请输入模型名称', 'error');
                } else {
                    showValidationMessage(elements.customModel, '模型名称正确', 'success');
                }
            }
        });

        // Custom style name validation
        elements.customStyleName.addEventListener('input', () => {
            const name = elements.customStyleName.value.trim();
            const maxLength = 20;
            const remaining = maxLength - name.length;
            
            if (name.length > maxLength) {
                showValidationMessage(elements.customStyleName, `名称过长，请删除${name.length - maxLength}个字符`, 'error');
            } else if (remaining <= 5 && remaining > 0) {
                showValidationMessage(elements.customStyleName, `还可输入${remaining}个字符`, 'warning');
            } else if (name.length > 0) {
                clearValidationMessage(elements.customStyleName);
            }
        });
    }

    function showCustomStyleModal() {
        // Reset form
        elements.customStyleName.value = '';
        elements.customStyleDescription.value = '';
        
        // Clear template selection
        document.querySelectorAll('.template-btn').forEach(btn => btn.classList.remove('selected'));
        
        // Clear validation messages
        clearValidationMessage(elements.customStyleName);
        clearValidationMessage(elements.customStyleDescription);
        
        // Show modal
        elements.customStyleModal.classList.remove('hidden');
        
        // Focus on name input
        setTimeout(() => elements.customStyleName.focus(), 100);
    }

    function hideCustomStyleModal() {
        elements.customStyleModal.classList.add('hidden');
        
        // Clear form when hiding
        elements.customStyleName.value = '';
        elements.customStyleDescription.value = '';
        
        // Clear template selection
        document.querySelectorAll('.template-btn').forEach(btn => btn.classList.remove('selected'));
        
        // Clear validation messages
        clearValidationMessage(elements.customStyleName);
        clearValidationMessage(elements.customStyleDescription);
        
        // Reset modal state
        editingStyleId = null;
        const modalHeader = elements.customStyleModal.querySelector('.modal-title-section h3');
        modalHeader.textContent = '创建自定义风格';
        elements.saveCustomStyle.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
            </svg>
            保存风格
        `;
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
            },
            witty: {
                name: '机智幽默',
                description: '运用聪明机智的语言和幽默感，通过巧妙的表达方式和风趣的观点来回应，让人会心一笑'
            },
            philosophical: {
                name: '哲学思辨',
                description: '从深层次哲学角度思考问题，提出发人深省的观点和质疑，引导深度思考和理性讨论'
            }
        };
        
        const template = templates[templateType];
        if (template) {
            elements.customStyleName.value = template.name;
            elements.customStyleDescription.value = template.description;
            
            // Clear any existing validation messages
            clearValidationMessage(elements.customStyleName);
            clearValidationMessage(elements.customStyleDescription);
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
                <div class="custom-styles-empty">
                    <div class="empty-icon">🎭</div>
                    <h4>还没有自定义风格</h4>
                    <p>点击"添加风格"按钮创建你的专属回复风格</p>
                </div>
            `;
            return;
        }

        config.customStyles.forEach(style => {
            const styleElement = document.createElement('div');
            styleElement.className = 'custom-style-item';
            styleElement.innerHTML = `
                <div class="custom-style-info">
                    <div class="custom-style-avatar">🎭</div>
                    <div class="custom-style-content">
                        <h4>${escapeHtml(style.name)}</h4>
                        ${style.description ? `<p title="${escapeHtml(style.description)}">${escapeHtml(style.description)}</p>` : ''}
                    </div>
                </div>
                <div class="custom-style-actions">
                    <button class="edit-style" data-id="${style.id}" title="编辑风格">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="delete-style" data-id="${style.id}" title="删除风格">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
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
        
        // Clear template selection and validation messages
        document.querySelectorAll('.template-btn').forEach(btn => btn.classList.remove('selected'));
        clearValidationMessage(elements.customStyleName);
        clearValidationMessage(elements.customStyleDescription);
        
        // Update modal title
        const modalHeader = elements.customStyleModal.querySelector('.modal-title-section h3');
        modalHeader.textContent = '编辑自定义风格';
        
        // Update save button text
        elements.saveCustomStyle.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
            </svg>
            更新风格
        `;
        
        // Show modal
        elements.customStyleModal.classList.remove('hidden');
        
        // Focus on name input
        setTimeout(() => elements.customStyleName.focus(), 100);
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