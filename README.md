<div align="center">
<h1>Strapi Redirects & SEO Manager</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/strapi-plugin-redirect-urls">
    <img src="https://img.shields.io/npm/v/strapi-plugin-redirect-urls.svg" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.com/package/strapi-plugin-redirect-urls">
    <img src="https://img.shields.io/npm/dm/strapi-plugin-redirect-urls.svg" alt="Monthly Downloads" />
  </a>
  <img src="https://img.shields.io/badge/Strapi-v5-purple" alt="Supports Strapi v5" />
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License" />
</p>

<p>
  <b>Don't lose traffic during migrations.</b> Manage URL redirects, track hit counts, and bulk import 301 redirects directly from your Strapi Admin Panel.
</p>

</div>

<br />

> [!NOTE]  
> **Compatible with Strapi v5.** This plugin is designed to work seamlessly with the latest Strapi Design System and API.

---

## ✨ Features

- 🎯 **Visual Management**: Create, edit, and delete redirects effortlessly via the Admin Panel.
- 📊 **Analytics & Tracking**: Built-in hit counters to see which redirects are actually being used.
- 📥 **Bulk CSV Import**: Migrating from another CMS? Import thousands of redirects in seconds.
- ⚡ **High Performance**: Optimized lookup algorithm designed for minimal latency on frontend requests.
- 🛡️ **Type-Safe**: Full TypeScript support for reliable development.
- 🎨 **Native Feel**: Built with the new Strapi 5 Design System for a consistent UI.

<img width="1499" height="764" alt="image" src="https://github.com/user-attachments/assets/07005fb2-0ad9-40f8-b51d-aac93225202e" />

<img width="837" height="395" alt="image" src="https://github.com/user-attachments/assets/e5377176-86ca-4d16-ab18-2f9f5ee4ee80" />

<img width="830" height="554" alt="image" src="https://github.com/user-attachments/assets/6f7cef55-abe6-410e-bd1e-89efc53ca274" />




## 🔧 Installation

```bash
npm install strapi-plugin-redirect-urls
# or
yarn add strapi-plugin-redirect-urls
```

## ⚙️ Configuration
The plugin is enabled by default. However, if you need to strictly define it, add the following to your config/plugins.ts file:

```bash
export default {
  // Note: The key must match the plugin name defined in your package.json
  'custom-redirects-plugin': {
    enabled: true,
  },
};

```


## 🚀 Usage
Managing Redirects via Admin Panel
1.Navigate to the Redirects section in your Strapi admin panel sidebar.
2.Click Create Redirect.
3.Fill in the details:
  *  From: The source URL path (e.g., /old-blog/post-1).
  *  To: The destination URL path (e.g., /blog/new-post-1).
  *  Type: Select 301 Moved Permanently (Standard for SEO).

## 📂 Bulk Import via CSV
Perfect for site migrations. Your CSV file must follow this format:

```bash
from,to,type
/old-about,/about,moved_permanently_301
/products/old-item,/shop/item-123,moved_permanently_301
```

1.Click the Import CSV button in the plugin dashboard.
2.Upload your file.
3.The system will process the file and report any skipped entries.


## 💻 Frontend Integration
To make the redirects work, your frontend needs to query Strapi before rendering a 404 page.

API Endpoint
GET /api/custom-redirects-plugin/find?from=/old-page

Response:
```bash
{
  "from": "/old-page",
  "to": "/new-page",
  "type": "moved_permanently_301"
}
```

Example: Next.js Middleware (App Router)
This is the most performant way to handle redirects in Next.js (Edge Runtime).

```bash
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  try {
    // 1. Check Strapi for a matching redirect
    const response = await fetch(
      `${process.env.STRAPI_URL}/api/custom-redirects-plugin/find?from=${path}`,
      { 
        method: 'GET',
        headers: {
            // Add Authorization header if your endpoint is private
            // 'Authorization': `Bearer ${process.env.API_TOKEN}` 
        },
        next: { revalidate: 60 } // Optional: Cache result for 60 seconds
      }
    );

    if (response.ok) {
      const redirect = await response.json();
      const status = parseInt(redirect.type.split('_')[1]) || 301;
      
      // 2. Perform the redirect
      return NextResponse.redirect(new URL(redirect.to, request.url), status);
    }
  } catch (error) {
    // Fail silently so the site doesn't crash if Strapi is down
    console.error('Redirect lookup failed:', error);
  }

  return NextResponse.next();
}

export const config = {
  // Exclude static files, images, and API routes from the check
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
```

Example: Express.js

```bash
app.use(async (req, res, next) => {
  try {
    const response = await fetch(
      `${process.env.STRAPI_URL}/api/custom-redirects-plugin/find?from=${req.path}`
    );

    if (response.ok) {
      const redirect = await response.json();
      const statusCode = parseInt(redirect.type.split('_')[1]) || 301;
      return res.redirect(statusCode, redirect.to);
    }
  } catch (err) {
    // Proceed to normal routing if lookup fails
  }
  
  next();
});
```

## 🏗️ Data Structure
The plugin creates a Redirect content type with the following schema:
<img width="567" height="195" alt="image" src="https://github.com/user-attachments/assets/35869286-9020-4e7a-b484-ab8514e4a0b0" />



## 📦 Requirements
* Strapi: v5.27.0 or higher
* Node.js: 18.x or 20.x

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
  1. Fork the repository
  2. Create your feature branch (git checkout -b feature/AmazingFeature)
  3. Commit your changes (git commit -m 'Add some AmazingFeature')
  4. Push to the branch (git push origin feature/AmazingFeature)
  5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support
For issues and feature requests, please use the GitHub Issues page.
