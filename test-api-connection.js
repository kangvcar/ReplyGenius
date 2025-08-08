// Test script for API connection functionality
// Run this in the browser console on the extension popup to test

console.log('Testing ReplyGenius API connection...');

// Test the chrome.runtime.sendMessage functionality
chrome.runtime.sendMessage({
    type: 'API_REQUEST',
    config: {
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'test-key' // Replace with actual key for real testing
    },
    payload: {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
    },
    endpoint: 'chat/completions'
}, (response) => {
    if (chrome.runtime.lastError) {
        console.error('Runtime error:', chrome.runtime.lastError.message);
    } else {
        console.log('API response:', response);
    }
});