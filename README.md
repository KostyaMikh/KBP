# KBP Catalog Website

A futuristic dark-themed catalog website for KBP (Kostya's Best Presentations).

## Features

- **Homepage**: Welcome page with animated glitch text effect and two main action buttons
- **Catalog Page**: Browse presentations filtered by language and school subject
- **Order Page**: Direct link to Telegram for ordering custom presentations
- **Futuristic Dark Design**: Animated starfield background, cyber-style buttons, and neon accents

## Pages

1. **index.html** - Homepage with welcoming message and navigation buttons
2. **catalog.html** - Presentation catalog with filtering by language and subject
3. **order.html** - Order page with Telegram contact information

## Setup Instructions

1. **Add Your Logo**: Replace `logo.png` with your actual KBP logo image (the one you provided)
   - Save your logo as `logo.png` in the root directory
   - Recommended size: 200-300px width for best display

2. **Update Telegram Link**: 
   - Open `order.html`
   - Find the line: `<a href="https://t.me/your_telegram_username" target="_blank" class="telegram-button">`
   - Replace `your_telegram_username` with your actual Telegram username or group link

3. **Open the Website**:
   - Simply open `index.html` in your web browser
   - No server required - it's a static website

## Customization

### Adding More Presentations
Edit `catalog.html` and add new cards following this template:

```html
<div class="catalog-card" data-language="english" data-subject="mathematics">
    <div class="card-header">
        <span class="card-badge">English</span>
        <span class="card-badge subject">Mathematics</span>
    </div>
    <h3>Your Title</h3>
    <p>Your description</p>
    <div class="card-footer">
        <span class="slides-count">XX slides</span>
    </div>
</div>
```

### Changing Colors
Edit `styles.css` and modify the CSS variables at the top:

```css
:root {
    --primary-color: #00f3ff;
    --secondary-color: #ff006e;
    --accent-color: #8b5cf6;
    --bg-dark: #0a0a0f;
    --bg-card: #1a1a2e;
}
```

## Technologies Used

- HTML5
- CSS3 (with animations and gradients)
- Vanilla JavaScript (for catalog filtering)

## Browser Compatibility

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## License

© 2026 KBP — Kostya's Best Presentations. All rights reserved.
