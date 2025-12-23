# Strapi Plugin Redirects

A powerful Strapi plugin for managing URL redirects directly from the admin panel. Create, update, and track redirects with hit counters, bulk import capabilities, and seamless integration with your Strapi application.

## Features

- 🎯 **Easy Redirect Management**: Create, edit, and delete redirects from the Strapi admin panel
- 📊 **Hit Tracking**: Monitor redirect usage with built-in hit counters
- 📥 **Bulk Import**: Import multiple redirects at once via CSV
- 🔍 **Path Lookup**: Fast redirect lookup API endpoint
- 🎨 **Modern UI**: Built with Strapi Design System for a consistent admin experience
- 🔒 **Type Safe**: Full TypeScript support
- ⚡ **Performance**: Optimized for fast redirect resolution

## Installation

```bash
npm install @strapi/plugin-redirects
# or
yarn add @strapi/plugin-redirects
```

## Configuration

The plugin is automatically enabled after installation. No additional configuration is required.

### Optional: Enable in `config/plugins.ts`

```typescript
export default {
  'custom-redirects-plugin': {
    enabled: true,
  },
};
```

## Usage

### Admin Panel

1. Navigate to the **Redirects** section in your Strapi admin panel sidebar
2. Click **Create Redirect** to add a new redirect
3. Fill in the redirect details:
   - **From**: The source URL path (e.g., `/old-page`)
   - **To**: The destination URL path (e.g., `/new-page`)
   - **Type**: Redirect type (currently supports 301 - Moved Permanently)

### Bulk Import

1. Click **Import CSV** button
2. Upload a CSV file with the following format:
   ```csv
   from,to,type
   /old-page-1,/new-page-1,moved_permanently_301
   /old-page-2,/new-page-2,moved_permanently_301
   ```
3. The plugin will import all valid redirects and report any skipped entries

### API Endpoints

#### Lookup Redirect

```http
GET /api/custom-redirects-plugin/find?from=/old-page
```

**Response:**

```json
{
  "from": "/old-page",
  "to": "/new-page",
  "type": "moved_permanently_301"
}
```

#### Admin API Endpoints

All admin endpoints require authentication:

- `GET /api/custom-redirects-plugin/redirects` - List all redirects
- `GET /api/custom-redirects-plugin/redirects/:id` - Get a single redirect
- `POST /api/custom-redirects-plugin/redirects` - Create a redirect
- `PUT /api/custom-redirects-plugin/redirects/:id` - Update a redirect
- `DELETE /api/custom-redirects-plugin/redirects/:id` - Delete a redirect
- `POST /api/custom-redirects-plugin/redirects/bulk-delete` - Delete multiple redirects
- `POST /api/custom-redirects-plugin/redirects/bulk-import` - Bulk import redirects

### Implementing Redirects in Your Application

To actually perform the redirects in your frontend application, you'll need to implement middleware or a route handler that checks for redirects. Here's an example:

#### Next.js Example

```typescript
// middleware.ts or pages/_middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Call your Strapi API to check for redirects
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/custom-redirects-plugin/find?from=${path}`
  );

  if (response.ok) {
    const redirect = await response.json();
    return NextResponse.redirect(
      new URL(redirect.to, request.url),
      parseInt(redirect.type.split('_')[1]) // Extract status code
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
```

#### Express.js Example

```javascript
app.use(async (req, res, next) => {
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/custom-redirects-plugin/find?from=${req.path}`
  );

  if (response.ok) {
    const redirect = await response.json();
    return res.redirect(parseInt(redirect.type.split('_')[1]), redirect.to);
  }

  next();
});
```

## Content Type

The plugin creates a `redirect` content type with the following fields:

- `from` (string, required, unique): Source URL path
- `to` (string, required): Destination URL path
- `type` (enumeration, required): Redirect type (currently only `moved_permanently_301`)
- `hits` (integer, default: 0): Number of times the redirect has been used

## Requirements

- Strapi v5.27.0 or higher
- Node.js 18.x or 20.x
- npm 6.0.0 or higher

## Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Watch for changes
npm run watch

# Verify the plugin
npm run verify
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/MoveoTech/strapi-plugin-redirects-urls/issues) page.

## Changelog

### 1.0.0

- Initial release
- Basic redirect management
- Hit tracking
- Bulk import via CSV
- Admin panel UI
