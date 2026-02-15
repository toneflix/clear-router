# Toneflix Clear Router

Laravel-style routing system for Express.js in JavaScript. Clean route definitions, middleware support, and controller bindings with full TypeScript support.

## Installation

```bash
npm install clear-router
```

OR

```bash
pnpm add clear-router
```

OR

```bash
yarn add clear-router
```

## Features

- Simple and clean route declarations (get, post, put, delete, patch, options, head)
- Grouped routes with prefix
- Middleware stack: per-route and group-level
- Controller-method pair as route handler
- Supports HttpContext style handlers: { req, res, next }
- Auto-binds controller methods
- Full CommonJS, ESM, and TypeScript support
- Error handling delegated to Express
- Route inspection with allRoutes method
- Fully Express-compatible

## Quick Start

### CommonJS

```javascript
const express = require('express');
const Routes = require('clear-router');

const app = express();
const router = express.Router();

Router.get('/hello', ({ res }) => {
  res.send('Hello World');
});

Router.apply(router);
app.use(router);

app.listen(3000);
```

### ESM

```javascript
import express from 'express';
import Router from 'clear-router';

const app = express();
const router = express.Router();

Router.get('/hello', ({ res }) => {
  res.send('Hello World');
});

await Router.apply(router);
app.use(router);

app.listen(3000);
```

### TypeScript

```typescript
import express from 'express';
import Router from 'clear-router';

const app = express();
const router = express.Router();

Router.get('/hello', ({ res }) => {
  res.send('Hello World');
});

await Router.apply(router);
app.use(router);

app.listen(3000);
```

## Usage Examples

### Basic Route

```javascript
Router.get('/hello', ({ res }) => {
  res.send('Hello World');
});
```

### With Middleware

```javascript
const authMiddleware = (req, res, next) => {
  // auth logic
  next();
};

Router.post('/secure', ({ res }) => res.send('Protected'), [authMiddleware]);
```

### Controller Binding

```javascript
class UserController {
  static index({ res }) {
    res.send('User List');
  }
}

Router.get('/users', [UserController, 'index']);
```

Class-based handlers will auto-bind to static or instance methods.

### Grouped Routes

```javascript
Router.group('/admin', () => {
  Router.get('/dashboard', ({ res }) => res.send('Admin Panel'));
});
```

With middleware:

```javascript
Router.group(
  '/secure',
  () => {
    Router.get('/data', ({ res }) => res.send('Secure Data'));
  },
  [authMiddleware],
);
```

### Global Middleware Scope

```javascript
Router.middleware([authMiddleware], () => {
  Router.get('/profile', ({ res }) => res.send('My Profile'));
});
```

### Multiple HTTP Methods

```javascript
Router.add(['get', 'post'], '/handle', ({ req, res }) => {
  res.send(`Method: ${req.method}`);
});
```

### Inspecting Routes

```javascript
Router.get('/hello', ({ res }) => res.send('Hello'));
Router.post('/world', ({ res }) => res.send('World'));

const allRoutes = Router.allRoutes();
console.log(allRoutes);
// Output:
// [
//   { methods: ['get'], path: '/hello', middlewareCount: 0, handlerType: 'function' },
//   { methods: ['post'], path: '/world', middlewareCount: 0, handlerType: 'function' }
// ]
```

## API Reference

See [API.md](API.md) for complete API documentation.

## Error Handling

All errors during route execution are automatically passed to Express error handling middleware using `next(error)`. You can define your error handler:

```javascript
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});
```

## Middleware Execution Order

```
[ Global Middleware ] → [ Group Middleware ] → [ Route Middleware ]
```

## Handler Execution

- If function: executed directly
- If [Controller, 'method']: auto-instantiated (if needed), method is called

## Testing

```bash
npm test              # Run all tests
npm run test:cjs      # Test CommonJS
npm run test:esm      # Test ESM
npm run test:ts       # Test TypeScript
```

See [TESTING.md](TESTING.md) for detailed testing guide.

## Examples

```bash
npm run example       # CommonJS example
npm run example:esm   # ESM example
npm run example:ts    # TypeScript example
```

Check `example/` directory for full working demos.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## Requirements

- Node.js >= 14.0.0
- Express >= 5.0.0

## License

MIT License © 2026 Refkinscallv

## Author

Refkinscallv <refkinscallv@gmail.com>

## Repository

https://github.com/refkinscallv/express-routing
