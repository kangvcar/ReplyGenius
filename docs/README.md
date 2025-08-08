# ReplyGenius Landing Page

Modern landing page for ReplyGenius Chrome Extension with privacy policy.

## Features

- 🎨 Modern, responsive design
- 🔒 Comprehensive privacy policy
- 📱 Mobile-friendly interface
- ⚡ Fast loading with optimized assets
- 🎯 SEO optimized
- 🚀 Automated GitHub Pages deployment

## Structure

```
docs/
├── index.html          # Main landing page
├── privacy.html        # Privacy policy page
├── styles.css          # Main stylesheet
├── script.js           # Interactive functionality
├── icons/              # Extension icons
└── README.md           # This file
```

## Deployment

This site is automatically deployed to GitHub Pages from the `docs/` folder.

### Manual Setup
1. Go to repository Settings > Pages
2. Select "Deploy from a branch"
3. Choose `main` branch and `/docs` folder
4. Save settings

### Custom Domain Setup (Optional)
1. Add CNAME file with your domain
2. Configure DNS records
3. Enable HTTPS in GitHub Pages settings

## Local Development

1. Clone the repository
2. Navigate to `docs/` folder
3. Start a local server:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```
4. Open http://localhost:8000

## Customization

### Colors and Branding
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #3b82f6;
    --secondary-color: #64748b;
    /* ... other variables */
}
```

### Content Updates
- Main content: Edit `index.html`
- Privacy policy: Edit `privacy.html`
- Styles: Modify `styles.css`
- Functionality: Update `script.js`

## Performance

- Optimized images and icons
- Minimal JavaScript footprint
- CSS optimized for fast rendering
- Lazy loading for images
- Smooth animations with CSS transforms

## SEO Features

- Semantic HTML structure
- Open Graph meta tags
- Twitter Card support
- Structured data ready
- Fast Core Web Vitals scores

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

This landing page is part of the ReplyGenius project.