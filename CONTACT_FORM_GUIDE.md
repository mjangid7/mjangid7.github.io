# Contact Form Analytics Guide

## How It Works
The contact form now stores all submissions locally in the browser's localStorage, similar to how the visit analytics work. No external email service is needed!

## Viewing Contact Submissions

### Method 1: Browser Console Commands
Open your browser's Developer Tools (F12 or Cmd+Option+I) and use these commands in the Console:

```javascript
// View all contact submissions
getContactSubmissions()

// Get a formatted summary of all submissions
showContactSummary()

// Access the global contact object
window.portfolioContacts
```

### Method 2: Direct localStorage Access
In the console, you can also directly access:
```javascript
// Raw data from localStorage
localStorage.getItem('portfolio_contact_submissions')

// Parsed JSON data
JSON.parse(localStorage.getItem('portfolio_contact_submissions'))
```

## What Data Is Stored
Each submission includes:
- **id**: Unique identifier
- **timestamp**: ISO timestamp
- **date**: Human-readable date
- **time**: Human-readable time
- **name**: Full name
- **email**: Email address
- **company**: Company/organization (if provided)
- **project**: Project type (if selected)
- **timeline**: Preferred timeline (if selected)
- **message**: The message content

## Example Output
```javascript
📧 CONTACT SUBMISSIONS SUMMARY
==================================================
📩 Submission 1:
   Name: John Doe
   Email: john@example.com
   Company: ABC Corp
   Project: AI Platform Development
   Timeline: 1-2 weeks
   Date: 9/10/2025 at 2:30:15 PM
   Message: Looking for help with AI platform...
   ----------------------------------------
```

## Data Persistence
- Data is stored in the browser's localStorage
- Persists across browser sessions
- Only visible to you when you inspect the site
- Data is cleared if user clears browser data

## Privacy & Security
- No data is sent to external services
- All data stays in the visitor's browser
- You can only see submissions when inspecting your own site
- Each visitor's submissions are stored separately in their browser

## Tips
- Check submissions regularly using the console commands
- Copy important submissions to your preferred note-taking app
- Consider setting up email notifications later if needed
