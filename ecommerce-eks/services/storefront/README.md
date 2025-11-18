# E-Commerce Storefront

A modern, Spotify-themed React storefront for the E-Commerce Microservice Platform.

## Features

- **Spotify-like Dark Theme**: Beautiful, modern UI inspired by Spotify's design
- **Product Catalog**: Browse and search products with category filtering
- **Shopping Cart**: Add items to cart with quantity management
- **User Authentication**: Register and login with secure authentication
- **Checkout Flow**: Complete orders with payment processing
- **Order History**: View past orders and their status
- **User Profile**: Manage user information and shipping address

## Technology Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Context API** for state management

## API Integration

The storefront integrates with the following microservices:

- **Users Service** (Port 8083): User authentication and profile management
- **Products Service** (Port 8001): Product catalog management
- **Inventory Service** (Port 8002): Stock tracking
- **Orders Service** (Port 8084): Order processing
- **Payments Service** (Port 8003): Payment processing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update API URLs in `.env` if needed:
```env
REACT_APP_USERS_API=http://localhost:8083
REACT_APP_PRODUCTS_API=http://localhost:8001
REACT_APP_INVENTORY_API=http://localhost:8002
REACT_APP_ORDERS_API=http://localhost:8084
REACT_APP_PAYMENTS_API=http://localhost:8003
```

### Development

Run the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Building for Production

Build the production bundle:
```bash
npm run build
```

### Docker

Build and run with Docker:
```bash
docker build -t storefront .
docker run -p 3000:80 storefront
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   ├── ProductCard.tsx
│   ├── Login.tsx
│   └── Register.tsx
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Products.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── OrderSuccess.tsx
│   ├── Orders.tsx
│   └── Profile.tsx
├── context/            # React Context providers
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── services/           # API service layers
│   ├── api.ts
│   ├── usersApi.ts
│   ├── productsApi.ts
│   ├── inventoryApi.ts
│   ├── ordersApi.ts
│   └── paymentsApi.ts
├── types/              # TypeScript type definitions
│   └── index.ts
└── App.tsx            # Main app component with routing
```

## Features Guide

### User Authentication

1. **Register**: Create a new account with email, password, and shipping address
2. **Login**: Authenticate with email and password
3. **Logout**: Clear session and return to home page

### Shopping

1. **Browse Products**: View all products or filter by category
2. **Search**: Search products by name or description
3. **Product Details**: View detailed information about a product
4. **Add to Cart**: Add products to shopping cart with desired quantity

### Checkout

1. **View Cart**: Review items and quantities in cart
2. **Update Cart**: Change quantities or remove items
3. **Checkout**: Enter payment information (use test card: 4242424242424242)
4. **Order Confirmation**: View order details after successful checkout

### Account Management

1. **Profile**: View and manage user information
2. **Order History**: View past orders and their status
3. **Shipping Address**: Update shipping address in profile

## Test Credentials

For testing payments, use the following test card:
- **Card Number**: 4242424242424242
- **Expiry**: Any future date (e.g., 12/2030)
- **CVV**: Any 3 digits (e.g., 123)

## Design System

### Colors

- **Black**: #000000 - Main background
- **Dark**: #121212 - Secondary background
- **Gray**: #181818 - Card backgrounds
- **Light Gray**: #282828 - Hover states
- **Green**: #1DB954 - Primary actions (Spotify green)
- **Text**: #B3B3B3 - Secondary text

### Typography

- **Headings**: Bold, white color
- **Body**: Regular weight, gray color for secondary text
- **Links**: Green on hover

## Contributing

This storefront is part of the E-Commerce Microservice Platform. For issues or contributions, please refer to the main project repository.

## License

MIT
