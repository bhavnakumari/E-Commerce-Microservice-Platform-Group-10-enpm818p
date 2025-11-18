# Storefront Quick Start Guide

## 🎉 What's Been Built

A complete React-based e-commerce storefront with a **Spotify-like dark theme** that integrates with all your microservices.

## 🎨 Features Implemented

### User Experience
- ✅ Beautiful Spotify-inspired dark theme with green accents
- ✅ Responsive design with sidebar navigation
- ✅ Product browsing with search and category filters
- ✅ Shopping cart with quantity management
- ✅ Complete checkout flow with payment integration
- ✅ User authentication (login/register)
- ✅ Order history and tracking
- ✅ User profile management

### Technical Features
- ✅ Full TypeScript implementation
- ✅ React Context API for state management (Auth & Cart)
- ✅ React Router for navigation
- ✅ Tailwind CSS for styling
- ✅ Axios for API communication
- ✅ Docker support with multi-stage build
- ✅ NGINX configuration for production

## 🚀 Quick Start

### Development Mode

1. **Install dependencies:**
   ```bash
   cd /Users/pranavraveendran/Desktop/E-Commerce-Microservice-Platform-Group-10-enpm818p/ecommerce-eks/services/storefront
   npm install
   ```

2. **Start the dev server:**
   ```bash
   npm start
   ```

   Opens at http://localhost:3000

### Production Build

```bash
npm run build
```

Builds optimized production files in the `build/` directory.

### Docker Deployment

```bash
# Build the Docker image
docker build -t storefront .

# Run the container
docker run -p 3000:80 storefront
```

Access at http://localhost:3000

## 🔌 API Integration

The storefront connects to these microservices (configured in `.env`):

| Service | Port | Purpose |
|---------|------|---------|
| Users | 8083 | Authentication & profiles |
| Products | 8001 | Product catalog |
| Inventory | 8002 | Stock management |
| Orders | 8084 | Order processing |
| Payments | 8003 | Payment processing |

## 🧪 Testing

### Test Payment Card

Use this card for testing checkout:
- **Card Number**: `4242424242424242`
- **Expiry**: `12/2030`
- **CVV**: `123`

This will result in **APPROVED** payment. Any other card will be **DECLINED**.

## 📁 Project Structure

```
storefront/
├── src/
│   ├── components/         # UI components (Sidebar, ProductCard, Login, Register)
│   ├── pages/             # Route pages (Home, Products, Cart, Checkout, etc.)
│   ├── context/           # React Context (Auth, Cart)
│   ├── services/          # API integration layer
│   ├── types/             # TypeScript type definitions
│   └── App.tsx            # Main app with routing
├── public/                # Static assets
├── Dockerfile             # Multi-stage Docker build
├── nginx.conf             # NGINX configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── .env                   # API URLs configuration
```

## 🎯 Key Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with featured products |
| `/products` | Products | Browse all products with filters |
| `/products/:id` | Product Detail | Individual product page |
| `/cart` | Cart | Shopping cart |
| `/checkout` | Checkout | Payment and order confirmation |
| `/orders` | Orders | Order history |
| `/profile` | Profile | User profile & settings |
| `/login` | Login | User login |
| `/register` | Register | New user registration |

## 🎨 Design System

### Colors (Spotify Theme)
- **Primary Green**: `#1DB954` - Buttons, accents
- **Black**: `#000000` - Main background
- **Dark Gray**: `#121212` - Secondary background
- **Card Gray**: `#181818` - Card backgrounds
- **Light Gray**: `#282828` - Hover states
- **Text Gray**: `#B3B3B3` - Secondary text

### Components
- Rounded corners for cards and buttons
- Hover transitions on interactive elements
- Consistent spacing using Tailwind utilities
- Emoji icons for visual appeal (can be replaced with actual icons)

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
REACT_APP_USERS_API=http://localhost:8083
REACT_APP_PRODUCTS_API=http://localhost:8001
REACT_APP_INVENTORY_API=http://localhost:8002
REACT_APP_ORDERS_API=http://localhost:8084
REACT_APP_PAYMENTS_API=http://localhost:8003
```

For production, update these to your service URLs.

## 🐛 Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure your backend services allow requests from the frontend origin.

### API Connection
Make sure all backend microservices are running before starting the storefront.

### Build Issues
If you encounter build errors, try:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 Next Steps

1. **Start all backend services** using Docker Compose
2. **Launch the storefront** with `npm start`
3. **Create a test user** via the register page
4. **Add some products** (if not already seeded)
5. **Test the complete flow** from browsing to checkout

## 🎓 Development Tips

### Adding New Features
- Components go in `src/components/`
- Pages go in `src/pages/`
- API calls go in `src/services/`
- Types go in `src/types/`

### State Management
- Auth state managed in `AuthContext`
- Cart state managed in `CartContext`
- Both persist to localStorage

### Styling
- Use Tailwind utility classes
- Custom colors available as `spotify-*` (e.g., `bg-spotify-green`)
- Responsive with `md:`, `lg:`, `xl:` prefixes

## 🚢 Deployment

The storefront is ready for deployment:

1. **Docker**: Use the provided Dockerfile
2. **Static Hosting**: Upload the `build/` folder to any static host
3. **CDN**: Serve `build/` through a CDN like Cloudflare

Make sure to update the `.env` file with production API URLs before building!

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
