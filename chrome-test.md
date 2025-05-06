# Testing the CrossDebate Platform in Chrome

This guide provides instructions for testing the CrossDebate platform using Chrome browser.

## Prerequisites

- Chrome browser installed (latest version recommended)
- Project built locally
- Development server running

## Getting Started

1. **Start the development server**
   ```
   npm run dev
   ```
   or whatever command starts your local server

2. **Open Chrome**
   - Navigate to `http://localhost:3000` (or whatever port your app is using)

3. **Open Chrome DevTools**
   - Press F12 or right-click and select "Inspect"
   - Navigate to the following tabs as needed:
     - Elements: For inspecting HTML/CSS
     - Console: For JavaScript errors and logs
     - Network: For API requests and responses
     - Application: For local storage, session storage, etc.

## Chrome-Specific Testing

### Responsive Testing
1. Open DevTools (F12)
2. Click the "Toggle device toolbar" icon (or press Ctrl+Shift+M)
3. Select different device presets or set custom dimensions

### Performance Testing
1. Open DevTools
2. Navigate to the "Performance" tab
3. Click the record button and interact with the application
4. Stop recording to analyze results

### Accessibility Testing
1. Open DevTools
2. Navigate to the "Lighthouse" tab
3. Check the "Accessibility" checkbox
4. Click "Generate report"

### Cross-Browser Testing
For comparing with other browsers, consider using:
- Edge (Chromium-based)
- Firefox
- Safari (if available)

## Common Issues & Solutions

- **CORS Issues**: Enable CORS in your development server or use a CORS browser extension
- **Cache Problems**: Use Incognito mode or disable cache in DevTools (Network tab)
- **Mobile Rendering Issues**: Test with actual devices when possible, not just emulation

## Automated Testing with Chrome

For automated testing, consider setting up:
- Puppeteer
- Cypress
- Selenium WebDriver

Each has specific setup instructions for Chrome integration.
