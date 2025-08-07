// XX Chrome Extension - Popup Configuration Panel
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
        elements.defaultStyle.value = config.defaultStyle;
        elements.defaultLanguage.value = config.defaultLanguage;
        elements.autoSubmit.checked = config.autoSubmit;
        renderCustomStyles();
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
            eyeIcon.innerHTML = isPassword 
                ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>'
                : '<path d="m1 1 22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.71 6.71a10.6 10.6 0 0 0-4.71 5.29s4 8 11 8c1.59 0 3.1-.29 4.29-.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17.29 17.29A10.6 10.6 0 0 0 22 12s-4-8-11-8c-1.59 0-3.1.29-4.29.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 9a3 3 0 1 0 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
        });

        // Test connection
        elements.testConnection.addEventListener('click', testAPIConnection);

        // Custom style management
        elements.addCustomStyle.addEventListener('click', showCustomStyleModal);
        elements.saveCustomStyle.addEventListener('click', saveCustomStyleHandler);
        elements.cancelCustomStyle.addEventListener('click', hideCustomStyleModal);

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
        elements.aiModel.addEventListener('change', (e) => config.aiModel = e.target.value);
        elements.defaultStyle.addEventListener('change', (e) => config.defaultStyle = e.target.value);
        elements.defaultLanguage.addEventListener('change', (e) => config.defaultLanguage = e.target.value);
        elements.autoSubmit.addEventListener('change', (e) => config.autoSubmit = e.target.checked);
    }

    async function testAPIConnection() {
        const button = elements.testConnection;
        const originalText = button.innerHTML;
        
        // Show loading state
        button.disabled = true;
        button.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            测试中...
        `;

        try {
            const response = await fetch(`${config.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    model: config.aiModel,
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
            success: 'border-green-200 bg-green-50 text-green-800',
            error: 'border-red-200 bg-red-50 text-red-800',
            warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
            info: 'border-blue-200 bg-blue-50 text-blue-800'
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
    }

    function saveCustomStyleHandler() {
        const name = elements.customStyleName.value.trim();
        const description = elements.customStyleDescription.value.trim();

        if (!name) {
            showStatusMessage('请输入风格名称', 'warning');
            return;
        }

        // Check for duplicate names
        if (config.customStyles.some(style => style.name === name)) {
            showStatusMessage('该风格名称已存在', 'warning');
            return;
        }

        // Add new custom style
        config.customStyles.push({
            id: Date.now().toString(),
            name,
            description
        });

        renderCustomStyles();
        hideCustomStyleModal();
        showStatusMessage(`已添加自定义风格: ${name}`, 'success');
    }

    function renderCustomStyles() {
        const container = elements.customStylesList;
        container.innerHTML = '';

        config.customStyles.forEach(style => {
            const styleElement = document.createElement('div');
            styleElement.className = 'flex items-center justify-between p-2 rounded border border-border bg-muted/50';
            styleElement.innerHTML = `
                <div>
                    <div class="font-medium text-sm">${escapeHtml(style.name)}</div>
                    ${style.description ? `<div class="text-xs text-muted-foreground">${escapeHtml(style.description)}</div>` : ''}
                </div>
                <button class="delete-style text-muted-foreground hover:text-destructive" data-id="${style.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8,6V4a2,2 0 0 1 2,-2h4a2,2 0 0 1 2,2V6m3,0v14a2,2 0 0 1-2,2H7a2,2 0 0 1-2,-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            `;

            // Add delete event listener
            styleElement.querySelector('.delete-style').addEventListener('click', (e) => {
                const styleId = e.currentTarget.dataset.id;
                deleteCustomStyle(styleId);
            });

            container.appendChild(styleElement);
        });
    }

    function deleteCustomStyle(styleId) {
        config.customStyles = config.customStyles.filter(style => style.id !== styleId);
        renderCustomStyles();
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