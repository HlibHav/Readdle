import { FileItem } from '../state/store';
import { generateId } from './utils';

export function seedDemoFiles(): FileItem[] {
  return [
    {
      id: generateId(),
      name: 'Q4_Financial_Report_2024.pdf',
      originalName: 'financial-report-q4-2024.pdf',
      type: 'pdf',
      size: 2048576,
      tags: ['financial', 'report', '2024'],
      folder: 'Documents',
      addedDate: new Date('2024-01-15'),
      url: 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDQgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9Db250ZW50cyA2IDAgUgo+PgplbmRvYmoKNiAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVApxCjU5NSA4NDIgVGQKL0YxIDEyIFRmCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovQ291bnQgMQovS2lkcyBbNSAwIFJdCj4+CmVuZG9iagoxIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyAzIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvQ3JlYXRvcgo+PgplbmRvYmoKOCAwIG9iago8PAovVHlwZSAvTWV0YWRhdGEKPDwKL1R5cGUgL01ldGFkYXRhCi9EZXNjcmlwdGlvbiA8RGF0ZT4KPj4KPj4KZW5kb2JqCjcgMCBvago8PAovVHlwZSAvQ3JlYXRvcgo+PgplbmRvYmoKeHJlZgowIDkKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMTc0IDAwMDAwIG4gCjAwMDAwMDAyNzMgMDAwMDAgbiAKMDAwMDAwMDM0OCAwMDAwMCBuIAowMDAwMDAwNDk1IDAwMDAwIG4gCjAwMDAwMDA1NzQgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA5Ci9Sb290IDEgMCBSCi9JbmZvIDggMCBSCj4+CnN0YXJ0eHJlZgo2NDMKJSVFT0Y=',
    },
    {
      id: generateId(),
      name: 'Team_Meeting_Notes_2024-01-15.txt',
      originalName: 'meeting-notes.txt',
      type: 'text',
      size: 2048,
      tags: ['meeting', 'notes', 'team'],
      folder: 'Documents',
      addedDate: new Date('2024-01-15'),
      content: `Team Meeting Notes - January 15, 2024

Attendees: John, Sarah, Mike, Lisa

Agenda:
1. Q4 Review
2. Q1 Planning
3. Budget Discussion
4. New Features

Key Points:
- Q4 targets exceeded by 15%
- New product launch scheduled for March
- Budget approved for additional hires
- Customer feedback very positive

Action Items:
- John: Prepare Q1 roadmap
- Sarah: Review budget allocation
- Mike: Research new technologies
- Lisa: Schedule customer interviews

Next Meeting: January 22, 2024`,
    },
    {
      id: generateId(),
      name: 'Invoice_Acme_Corp_2024-01-10.pdf',
      originalName: 'invoice-12345.pdf',
      type: 'pdf',
      size: 1024000,
      tags: ['invoice', 'acme', '2024'],
      folder: 'Documents',
      addedDate: new Date('2024-01-10'),
      url: 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDQgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9Db250ZW50cyA2IDAgUgo+PgplbmRvYmoKNiAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVApxCjU5NSA4NDIgVGQKL0YxIDEyIFRmCihJbnZvaWNlKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9Db3VudCAxCi9LaWRzIFs1IDAgUl0KPj4KZW5kb2JqCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDMgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9DcmVhdG9yCj4+CmVuZG9iago4IDAgb2JqCjw8Ci9UeXBlIC9NZXRhZGF0YQo8PAovVHlwZSAvTWV0YWRhdGEKL0Rlc2NyaXB0aW9uIDxEYXRlPgo+Pgo+PgplbmRvYmoKNyAwIG9iago8PAovVHlwZSAvQ3JlYXRvcgo+PgplbmRvYmoKeHJlZgowIDkKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMTc0IDAwMDAwIG4gCjAwMDAwMDAyNzMgMDAwMDAgbiAKMDAwMDAwMDM0OCAwMDAwMCBuIAowMDAwMDAwNDk1IDAwMDAwIG4gCjAwMDAwMDA1NzQgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA5Ci9Sb290IDEgMCBSCi9JbmZvIDggMCBSCj4+CnN0YXJ0eHJlZgo2NDMKJSVFT0Y=',
    },
    {
      id: generateId(),
      name: 'Screenshot_2024-01-12.png',
      originalName: 'screenshot.png',
      type: 'image',
      size: 512000,
      tags: ['screenshot', 'ui'],
      folder: 'Images',
      addedDate: new Date('2024-01-12'),
      url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    },
    // Browser-related documents
    {
      id: generateId(),
      name: 'Article_7_Best_Web_Browsers_2025.pdf',
      originalName: 'best-web-browsers-2025.pdf',
      type: 'pdf',
      size: 7208960, // 6.87 MB
      tags: ['web browsers', 'reviews'],
      folder: 'Downloads',
      addedDate: new Date('2024-09-24'),
      url: 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDQgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9Db250ZW50cyA2IDAgUgo+PgplbmRvYmoKNiAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVApxCjU5NSA4NDIgVGQKL0YxIDEyIFRmCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovQ291bnQgMQovS2lkcyBbNSAwIFJdCj4+CmVuZG9iagoxIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyAzIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvQ3JlYXRvcgo+PgplbmRvYmoKOCAwIG9iago8PAovVHlwZSAvTWV0YWRhdGEKPDwKL1R5cGUgL01ldGFkYXRhCi9EZXNjcmlwdGlvbiA8RGF0ZT4KPj4KPj4KZW5kb2JqCjcgMCBvago8PAovVHlwZSAvQ3JlYXRvcgo+PgplbmRvYmoKeHJlZgowIDkKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMTc0IDAwMDAwIG4gCjAwMDAwMDAyNzMgMDAwMDAgbiAKMDAwMDAwMDM0OCAwMDAwMCBuIAowMDAwMDAwNDk1IDAwMDAwIG4gCjAwMDAwMDA1NzQgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA5Ci9Sb290IDEgMCBSCi9JbmZvIDggMCBSCj4+CnN0YXJ0eHJlZgo2NDMKJSVFT0Y=',
      content: `The 7 Best Web Browsers for 2025: A Comprehensive Review

Introduction
Web browsers have evolved significantly in 2024, with new features, improved performance, and enhanced security becoming the norm. This comprehensive review examines the top 7 web browsers that are leading the market in 2025.

1. Google Chrome
Chrome continues to dominate the browser market with its extensive extension ecosystem, fast performance, and seamless integration with Google services. The browser's V8 JavaScript engine provides excellent performance for web applications.

Key Features:
- Advanced tab management
- Built-in translation
- Extensive extension library
- Cross-platform synchronization
- Advanced security features

2. Mozilla Firefox
Firefox remains a strong contender with its focus on privacy and open-source development. The browser offers excellent customization options and strong privacy protections.

Key Features:
- Enhanced Tracking Protection
- Container tabs for privacy
- Extensive customization
- Open-source development
- Strong performance

3. Microsoft Edge
Edge has made significant improvements since switching to Chromium, offering excellent performance and integration with Microsoft services.

Key Features:
- Chromium-based engine
- Microsoft services integration
- Collections feature
- Vertical tabs
- Built-in PDF reader

4. Safari
Apple's Safari continues to excel on macOS and iOS with its focus on privacy, performance, and battery life optimization.

Key Features:
- Privacy-focused design
- Excellent battery life
- iCloud synchronization
- Native Apple integration
- Fast performance

5. Opera
Opera offers unique features like built-in VPN, ad blocker, and cryptocurrency wallet, making it appealing to power users.

Key Features:
- Built-in VPN
- Ad blocker
- Cryptocurrency wallet
- Workspaces
- Flow feature

6. Brave
Brave focuses on privacy and rewards users with cryptocurrency for viewing ads, offering a unique approach to web browsing.

Key Features:
- Privacy-first design
- Built-in ad blocker
- BAT cryptocurrency rewards
- Tor integration
- Fast performance

7. Vivaldi
Vivaldi targets power users with extensive customization options and unique features like tab stacking and notes.

Key Features:
- Extensive customization
- Tab stacking
- Built-in notes
- Command palette
- Advanced bookmark management

Conclusion
Each browser offers unique advantages depending on user needs. Chrome excels for general use, Firefox for privacy, Safari for Apple users, and specialized browsers like Opera and Brave for specific use cases.`,
    },
    {
      id: generateId(),
      name: 'Article_7_Best_Web_Browsers_2025.pdf',
      originalName: 'best-web-browsers-2025-productivity.pdf',
      type: 'pdf',
      size: 7208960, // 6.87 MB
      tags: ['web browsers', 'productivity'],
      folder: 'Downloads',
      addedDate: new Date('2024-09-24'),
      url: 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDQgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9Db250ZW50cyA2IDAgUgo+PgplbmRvYmoKNiAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVApxCjU5NSA4NDIgVGQKL0YxIDEyIFRmCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovQ291bnQgMQovS2lkcyBbNSAwIFJdCj4+CmVuZG9iagoxIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyAzIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvQ3JlYXRvcgo+PgplbmRvYmoKOCAwIG9iago8PAovVHlwZSAvTWV0YWRhdGEKPDwKL1R5cGUgL01ldGFkYXRhCi9EZXNjcmlwdGlvbiA8RGF0ZT4KPj4KPj4KZW5kb2JqCjcgMCBvago8PAovVHlwZSAvQ3JlYXRvcgo+PgplbmRvYmoKeHJlZgowIDkKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMTc0IDAwMDAwIG4gCjAwMDAwMDAyNzMgMDAwMDAgbiAKMDAwMDAwMDM0OCAwMDAwMCBuIAowMDAwMDAwNDk1IDAwMDAwIG4gCjAwMDAwMDA1NzQgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA5Ci9Sb290IDEgMCBSCi9JbmZvIDggMCBSCj4+CnN0YXJ0eHJlZgo2NDMKJSVFT0Y=',
      content: `The 7 Best Web Browsers for Productivity in 2025

Productivity-Focused Browser Review
This article focuses on how different web browsers can enhance your productivity in 2025, examining features that help users work more efficiently.

Productivity Features Comparison:
- Tab management capabilities
- Extension ecosystems
- Built-in tools and utilities
- Cross-device synchronization
- Performance optimization

Chrome for Productivity:
- Extensive extension library
- Google Workspace integration
- Advanced tab groups
- Built-in task manager
- Seamless cloud sync

Firefox for Productivity:
- Container tabs for organization
- Pocket integration
- Advanced bookmark management
- Developer tools
- Customizable interface

Edge for Productivity:
- Microsoft 365 integration
- Collections for research
- Vertical tabs
- Built-in PDF tools
- Office integration

Safari for Productivity:
- Handoff between devices
- iCloud tabs
- Reading list
- Apple ecosystem integration
- Energy efficiency

Opera for Productivity:
- Workspaces for organization
- Built-in messengers
- Flow for cross-device sharing
- VPN for secure browsing
- Ad blocker for distraction-free work

Brave for Productivity:
- Privacy-focused browsing
- Built-in ad blocker
- Fast loading times
- Tor integration for security
- BAT rewards system

Vivaldi for Productivity:
- Tab stacking and tiling
- Built-in notes and calendar
- Command palette
- Advanced customization
- Power user features

Productivity Tips:
1. Use tab groups to organize work
2. Leverage built-in tools
3. Sync across devices
4. Use extensions wisely
5. Optimize for your workflow

Conclusion:
The best browser for productivity depends on your specific needs and workflow. Chrome offers the most comprehensive ecosystem, Firefox provides excellent customization, and specialized browsers like Opera and Vivaldi offer unique productivity features.`,
    },
    {
      id: generateId(),
      name: 'Article_7_Best_Web_Browsers_2025.pdf',
      originalName: 'best-web-browsers-2025-technology.pdf',
      type: 'pdf',
      size: 7208960, // 6.87 MB
      tags: ['web browsers', 'technology'],
      folder: 'Downloads',
      addedDate: new Date('2024-09-24'),
      url: 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDQgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9Db250ZW50cyA2IDAgUgo+PgplbmRvYmoKNiAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVApxCjU5NSA4NDIgVGQKL0YxIDEyIFRmCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovQ291bnQgMQovS2lkcyBbNSAwIFJdCj4+CmVuZG9iagoxIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyAzIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvQ3JlYXRvcgo+PgplbmRvYmoKOCAwIG9iago8PAovVHlwZSAvTWV0YWRhdGEKPDwKL1R5cGUgL01ldGFkYXRhCi9EZXNjcmlwdGlvbiA8RGF0ZT4KPj4KPj4KZW5kb2JqCjcgMCBvago8PAovVHlwZSAvQ3JlYXRvcgo+PgplbmRvYmoKeHJlZgowIDkKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMTc0IDAwMDAwIG4gCjAwMDAwMDAyNzMgMDAwMDAgbiAKMDAwMDAwMDM0OCAwMDAwMCBuIAowMDAwMDAwNDk1IDAwMDAwIG4gCjAwMDAwMDA1NzQgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA5Ci9Sb290IDEgMCBSCi9JbmZvIDggMCBSCj4+CnN0YXJ0eHJlZgo2NDMKJSVFT0Y=',
      content: `The 7 Best Web Browsers: Technology Deep Dive 2025

Technical Analysis of Modern Web Browsers
This comprehensive technical review examines the underlying technologies, performance metrics, and architectural innovations in the top web browsers of 2025.

Browser Engine Technologies:
- Chromium (Blink/V8) - Chrome, Edge, Opera, Brave
- Gecko - Firefox
- WebKit - Safari
- Custom implementations

Performance Benchmarks:
- JavaScript execution speed
- Memory usage optimization
- Rendering performance
- Network efficiency
- Battery life impact

Security Technologies:
- Sandboxing implementations
- Process isolation
- Encryption standards
- Privacy protection mechanisms
- Malware detection

Web Standards Compliance:
- HTML5 support
- CSS3 features
- JavaScript ES2025
- WebAssembly performance
- Progressive Web App support

Innovation Areas:
- AI-powered features
- Machine learning integration
- Advanced privacy controls
- Cross-platform synchronization
- Performance optimization

Chrome Technology:
- V8 JavaScript engine
- Blink rendering engine
- Multi-process architecture
- Advanced security sandboxing
- Machine learning integration

Firefox Technology:
- Gecko rendering engine
- SpiderMonkey JavaScript engine
- Quantum project innovations
- Enhanced privacy features
- Customizable architecture

Edge Technology:
- Chromium-based foundation
- Microsoft-specific optimizations
- Windows integration
- Enterprise features
- Performance enhancements

Safari Technology:
- WebKit engine
- JavaScriptCore
- Metal rendering
- Privacy-focused design
- Apple Silicon optimization

Opera Technology:
- Chromium-based with custom features
- Built-in VPN technology
- Ad blocking algorithms
- Cryptocurrency integration
- Cross-platform synchronization

Brave Technology:
- Chromium-based privacy focus
- BAT token system
- Tor integration
- Advanced ad blocking
- Privacy-preserving analytics

Vivaldi Technology:
- Chromium-based customization
- Advanced UI framework
- Tab management algorithms
- Built-in application features
- Power user optimizations

Future Technology Trends:
- WebAssembly advancements
- AI integration
- Enhanced privacy
- Cross-platform unification
- Performance optimization

Conclusion:
Browser technology continues to evolve rapidly, with each major browser offering unique technological advantages. The choice depends on specific technical requirements and use cases.`,
    },
    {
      id: generateId(),
      name: 'Article_7_Best_Web_Browsers_2025.pdf',
      originalName: 'best-web-browsers-2025-year.pdf',
      type: 'pdf',
      size: 7208960, // 6.87 MB
      tags: ['web browsers', '2025'],
      folder: 'Downloads',
      addedDate: new Date('2024-09-24'),
      url: 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDQgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9Db250ZW50cyA2IDAgUgo+PgplbmRvYmoKNiAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVApxCjU5NSA4NDIgVGQKL0YxIDEyIFRmCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovQ291bnQgMQovS2lkcyBbNSAwIFJdCj4+CmVuZG9iagoxIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyAzIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvQ3JlYXRvcgo+PgplbmRvYmoKOCAwIG9iago8PAovVHlwZSAvTWV0YWRhdGEKPDwKL1R5cGUgL01ldGFkYXRhCi9EZXNjcmlwdGlvbiA8RGF0ZT4KPj4KPj4KZW5kb2JqCjcgMCBvago8PAovVHlwZSAvQ3JlYXRvcgo+PgplbmRvYmoKeHJlZgowIDkKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMTc0IDAwMDAwIG4gCjAwMDAwMDAyNzMgMDAwMDAgbiAKMDAwMDAwMDM0OCAwMDAwMCBuIAowMDAwMDAwNDk1IDAwMDAwIG4gCjAwMDAwMDA1NzQgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA5Ci9Sb290IDEgMCBSCi9JbmZvIDggMCBSCj4+CnN0YXJ0eHJlZgo2NDMKJSVFT0Y=',
      content: `The 7 Best Web Browsers for 2025: Year in Review

2025 Browser Market Analysis
This comprehensive analysis examines the web browser landscape in 2025, highlighting the key developments, market trends, and user preferences that have shaped the industry.

Market Share Analysis:
- Chrome: 65% market share
- Safari: 19% market share
- Edge: 11% market share
- Firefox: 3% market share
- Other browsers: 2% market share

Key Trends in 2025:
- Privacy-first browsing
- AI-powered features
- Cross-platform synchronization
- Performance optimization
- Enhanced security

User Behavior Changes:
- Increased mobile browsing
- Privacy consciousness
- Performance expectations
- Feature customization
- Security awareness

Browser Innovation Highlights:
- AI integration in Chrome
- Enhanced privacy in Firefox
- Microsoft 365 integration in Edge
- Apple ecosystem optimization in Safari
- Unique features in Opera and Brave

Performance Improvements:
- Faster JavaScript execution
- Reduced memory usage
- Better battery life
- Improved rendering speed
- Enhanced network efficiency

Security Enhancements:
- Advanced sandboxing
- Improved malware protection
- Enhanced encryption
- Privacy-focused features
- Secure authentication

User Experience Improvements:
- Better tab management
- Enhanced customization
- Improved accessibility
- Streamlined interfaces
- Cross-device synchronization

Industry Impact:
- Web standards evolution
- Developer tool improvements
- Extension ecosystem growth
- Privacy regulation compliance
- Performance optimization

Future Outlook:
- Continued AI integration
- Enhanced privacy features
- Cross-platform unification
- Performance improvements
- Security enhancements

Conclusion:
2025 has been a transformative year for web browsers, with significant improvements in privacy, performance, and user experience. The competition continues to drive innovation across all major browsers.`,
    },
    {
      id: generateId(),
      name: 'Article_Best_Web_Browsers_.pdf',
      originalName: 'best-web-browsers-reviews.pdf',
      type: 'pdf',
      size: 7208960, // 6.87 MB
      tags: ['web browsers', 'reviews'],
      folder: 'Downloads',
      addedDate: new Date('2024-09-25'),
      content: `Best Web Browsers: Comprehensive Reviews and Comparisons

In-Depth Browser Reviews
This comprehensive review provides detailed analysis of the best web browsers available, examining their strengths, weaknesses, and suitability for different user types.

Review Methodology:
- Performance testing
- Feature comparison
- Security analysis
- User experience evaluation
- Privacy assessment

Chrome Review:
Strengths:
- Extensive extension ecosystem
- Fast performance
- Excellent developer tools
- Cross-platform sync
- Regular updates

Weaknesses:
- High memory usage
- Privacy concerns
- Google dependency
- Resource intensive
- Limited customization

Firefox Review:
Strengths:
- Strong privacy protection
- Open-source development
- Excellent customization
- Good performance
- Independent development

Weaknesses:
- Smaller extension library
- Some compatibility issues
- Less frequent updates
- Limited mobile features
- Smaller market share

Edge Review:
Strengths:
- Chromium-based performance
- Microsoft integration
- Good security features
- Built-in tools
- Regular updates

Weaknesses:
- Limited customization
- Microsoft ecosystem dependency
- Smaller extension library
- Privacy concerns
- Limited cross-platform features

Safari Review:
Strengths:
- Excellent privacy features
- Great battery life
- Apple ecosystem integration
- Fast performance
- Clean interface

Weaknesses:
- Limited to Apple devices
- Smaller extension library
- Less customization
- Limited cross-platform sync
- Apple dependency

Opera Review:
Strengths:
- Unique built-in features
- Good performance
- Built-in VPN
- Ad blocker
- Cryptocurrency wallet

Weaknesses:
- Smaller user base
- Limited extension library
- Some compatibility issues
- Privacy concerns
- Limited customization

Brave Review:
Strengths:
- Privacy-focused design
- Built-in ad blocker
- Fast performance
- BAT rewards
- Tor integration

Weaknesses:
- Smaller extension library
- Limited customization
- Cryptocurrency dependency
- Smaller user base
- Limited features

Vivaldi Review:
Strengths:
- Extensive customization
- Power user features
- Built-in tools
- Good performance
- Unique interface

Weaknesses:
- Steep learning curve
- Smaller user base
- Limited extension library
- Resource intensive
- Complex interface

Recommendations:
- General users: Chrome or Edge
- Privacy-focused users: Firefox or Brave
- Apple users: Safari
- Power users: Vivaldi
- Unique features: Opera

Conclusion:
Each browser offers unique advantages and disadvantages. The best choice depends on individual needs, preferences, and use cases.`,
    },
    {
      id: generateId(),
      name: 'Invoice_The_7_best_web_in_2025_Za',
      originalName: 'invoice-web-browsers-2025.pdf',
      type: 'pdf',
      size: 7208960, // 6.87 MB
      tags: ['web browsers', 'technology'],
      folder: 'Downloads',
      addedDate: new Date('2024-09-24'),
      content: `Invoice: The 7 Best Web Browsers in 2025 - Technology Analysis

Invoice Document for Web Browser Technology Review
This document serves as an invoice and technical analysis for the comprehensive review of the 7 best web browsers in 2025.

Service Details:
- Comprehensive browser analysis
- Performance benchmarking
- Security evaluation
- Feature comparison
- User experience assessment

Technical Specifications:
- Analysis of 7 major browsers
- Performance metrics evaluation
- Security feature assessment
- Privacy protection analysis
- Cross-platform compatibility review

Deliverables:
- Detailed browser comparisons
- Performance benchmark results
- Security analysis reports
- Feature comparison matrices
- User experience evaluations

Technology Focus Areas:
- Browser engine analysis
- JavaScript performance
- Memory usage optimization
- Security implementation
- Privacy protection mechanisms

Billing Information:
- Service: Web Browser Technology Analysis
- Period: 2025
- Scope: 7 Major Browsers
- Deliverables: Comprehensive Reports
- Status: Completed

Technical Analysis Summary:
The analysis covers Chrome, Firefox, Edge, Safari, Opera, Brave, and Vivaldi, examining their technological foundations, performance characteristics, and unique features.

Key Findings:
- Chromium-based browsers dominate performance
- Privacy-focused browsers gain market share
- AI integration becomes standard
- Cross-platform synchronization improves
- Security features enhance across all browsers

Conclusion:
This comprehensive analysis provides valuable insights into the current state of web browser technology in 2025, helping users make informed decisions about their browser choice.`,
    },
    // Test document for Assessment search
    {
      id: generateId(),
      name: 'Assessment_Guide_2025.pdf',
      originalName: 'assessment-guide.pdf',
      type: 'pdf',
      size: 1024000,
      tags: ['assessment', 'guide', '2025'],
      folder: 'Documents',
      addedDate: new Date('2024-01-20'),
      url: 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDQgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9Db250ZW50cyA2IDAgUgo+PgplbmRvYmoKNiAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVApxCjU5NSA4NDIgVGQKL0YxIDEyIFRmCihBc3Nlc3NtZW50KSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9Db3VudCAxCi9LaWRzIFs1IDAgUl0KPj4KZW5kb2JqCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDMgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9DcmVhdG9yCj4+CmVuZG9iago4IDAgb2JqCjw8Ci9UeXBlIC9NZXRhZGF0YQo8PAovVHlwZSAvTWV0YWRhdGEKL0Rlc2NyaXB0aW9uIDxEYXRlPgo+Pgo+PgplbmRvYmoKNyAwIG9iago8PAovVHlwZSAvQ3JlYXRvcgo+PgplbmRvYmoKeHJlZgowIDkKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMTc0IDAwMDAwIG4gCjAwMDAwMDAyNzMgMDAwMDAgbiAKMDAwMDAwMDM0OCAwMDAwMCBuIAowMDAwMDAwNDk1IDAwMDAwIG4gCjAwMDAwMDA1NzQgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA5Ci9Sb290IDEgMCBSCi9JbmZvIDggMCBSCj4+CnN0YXJ0eHJlZgo2NDMKJSVFT0Y=',
      content: `Assessment Guide 2025

Comprehensive Assessment Strategies

This guide provides detailed information about various assessment methods and best practices for 2025.

Key Topics:
- Formative Assessment
- Summative Assessment
- Peer Assessment
- Self Assessment
- Digital Assessment Tools

Assessment Types:
1. Diagnostic Assessment
2. Formative Assessment
3. Summative Assessment
4. Authentic Assessment
5. Performance Assessment

Best Practices:
- Clear learning objectives
- Multiple assessment methods
- Timely feedback
- Student involvement
- Technology integration

Conclusion:
Effective assessment is crucial for student learning and development. This guide provides comprehensive strategies for implementing various assessment methods in educational settings.`,
    },
  ];
}
