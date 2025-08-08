# Chrome Web Store Screenshots Guide for ReplyGenius

## Screenshot Requirements
- **Size**: 1280x800 or 640x400 pixels
- **Format**: PNG or JPG
- **Count**: 1-5 screenshots
- **Quality**: High resolution, clear text

## Screenshot 1: Extension Popup - Main Configuration
**Filename**: `01_main_configuration.png`

**Content**:
- Show the popup interface with all sections visible
- Fill in sample API configuration (blur the API key)
- Show the welcome screen transition to main config
- Highlight the clean, modern design
- Show a test connection success message

**Text Overlay**: 
```
"Configure your AI service and preferences
✓ Multiple AI models supported
✓ Clean, modern interface
✓ Secure local storage"
```

## Screenshot 2: Twitter Integration
**Filename**: `02_twitter_integration.png`

**Content**:
- Show Twitter/X interface with the AI button visible
- Point out the AI button (🤖) in tweet actions
- Show the button in different states (normal, hover, processing)
- Display on both light and dark Twitter themes if possible
- Show multiple tweets with AI buttons

**Text Overlay**:
```
"Seamless Twitter integration
➤ AI button appears under every tweet
➤ Matches Twitter's native design
➤ Works with all Twitter themes"
```

## Screenshot 3: Reply Generation Process
**Filename**: `03_reply_generation.png`

**Content**:
- Show a before/after of a tweet and generated reply
- Display the processing animation (circular progress)
- Show the notification of successful reply generation
- Include a sample tweet and witty AI-generated response

**Text Overlay**:
```
"Intelligent reply generation
🤖 Analyzes tweet context
✨ Generates witty, relevant responses
⚡ One-click posting or manual review"
```

## Screenshot 4: Reply Styles & Languages
**Filename**: `04_styles_languages.png`

**Content**:
- Show the reply style dropdown with all 8 options
- Display the language selection
- Show custom style creation modal
- Include examples of different reply styles

**Text Overlay**:
```
"8 reply styles • 7 languages
😄 Humorous • 🎯 Professional • ✨ Positive
🌍 Multi-language support
🎭 Create custom styles"
```

## Screenshot 5: Advanced Features
**Filename**: `05_advanced_features.png`

**Content**:
- Show custom style creation interface
- Display auto-submit toggle
- Show API testing feature
- Highlight security features (local storage notice)

**Text Overlay**:
```
"Advanced customization
🎨 Create personalized reply styles  
⚙️ Auto-publish or manual review
🔒 Secure local configuration
🧪 Built-in API testing"
```

## Design Guidelines

### Visual Style
- Use clean, modern design consistent with the extension
- High contrast for readability
- Professional color scheme (blues, whites, grays)
- Clear, readable fonts

### Text Overlays
- Use semi-transparent backgrounds for text
- Keep text concise and benefit-focused
- Use emojis sparingly for visual appeal
- Ensure text doesn't obstruct important UI elements

### Highlighting
- Use subtle arrows or callouts to point to key features
- Highlight buttons and UI elements with subtle glows
- Don't overuse highlighting - focus on 2-3 key elements per screenshot

### Consistency
- Maintain consistent styling across all screenshots
- Use the same overlay style and positioning
- Keep the same Twitter account/theme where possible

## Technical Setup for Screenshots

### Browser Setup
```bash
# Use Chrome with specific window size
chrome --new-window --window-size=1280,800 --disable-web-security --user-data-dir=/tmp/chrome_test
```

### Extension State
- Have sample API key configured (blur it in screenshots)
- Set up attractive custom styles
- Ensure proper error states are not showing
- Use light mode for consistency

### Twitter Content
- Use appropriate, non-controversial tweet examples
- Focus on general topics (tech, life, observations)
- Ensure tweets are appropriate for all audiences
- Use tweets that would generate interesting replies

## Capture Process

1. **Install Extension**: Load from local development
2. **Configure Properly**: Set up API keys and preferences  
3. **Navigate to Twitter**: Open twitter.com or x.com
4. **Position Elements**: Ensure AI buttons are visible
5. **Capture Screenshots**: Use browser's built-in tools or screen capture
6. **Edit for Clarity**: Add text overlays and highlighting
7. **Optimize File Size**: Compress without losing quality

## File Naming Convention
- Use descriptive names with numbers for ordering
- Include the extension name for organization
- Use lowercase with underscores
- Example: `replygenius_01_main_config.png`

## Quality Checklist
- [ ] All text is clearly readable
- [ ] No personal information visible
- [ ] UI elements are properly visible
- [ ] Screenshots represent actual functionality
- [ ] Professional and polished appearance
- [ ] Consistent with brand colors and style
- [ ] File sizes optimized for web
- [ ] All required dimensions met