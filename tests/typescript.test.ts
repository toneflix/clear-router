import { H3, H3Event, HTTPError, getRouterParams } from 'h3';
import type { HttpContext, RouteInfo } from '../types';
import { beforeEach, describe, expect, test } from 'vitest';
import express, { NextFunction, Request, Response, Router } from 'express';

import { H3App } from 'types/h3';
import { NextFunction as H3NextFunction } from '../types/h3';
import H3Routes from '../src/h3/routes';
import Routes from '../src/express/routes';
import request from 'supertest';

// Import the actual CommonJS implementation

describe('Express Routing - TypeScript', () => {
    let app: express.Application;
    let router: Router;

    beforeEach(() => {
        Routes.routes = [];
        Routes.prefix = '';
        Routes.groupMiddlewares = [];
        Routes.globalMiddlewares = [];

        app = express();
        router = Router();
        app.use(express.json());
    });

    const setupApp = async (): Promise<void> => {
        await Routes.apply(router);
        app.use(router);
    };

    test('should work with TypeScript types', async () => {
        Routes.get('/typescript', ({ req, res }: HttpContext) => {
            res.json({ typed: true, path: req.path });
        });

        await setupApp();

        const response = await request(app).get('/typescript');
        expect(response.body.typed).toBe(true);
    });

    test('should type check route info', async () => {
        Routes.get('/info', ({ res }: HttpContext) => {
            res.send('ok')
        });
        Routes.post('/create', ({ res }: HttpContext) => {
            res.send('created')
        });

        const routes: RouteInfo[] = Routes.allRoutes();
        expect(routes[0].path).toBe('/info');
        expect(routes[0].handlerType).toBe('function');
        expect(routes[1].methods).toContain('post');
    });

    test('should type check controller', async () => {
        class UserController {
            static index ({ res }: HttpContext): void {
                res.json({ users: [] });
            }

            static show ({ req, res }: HttpContext): void {
                res.json({ id: req.params.id });
            }
        }

        Routes.get('/users', [UserController, 'index']);
        Routes.get('/users/:id', [UserController, 'show']);

        await setupApp();

        const response = await request(app).get('/users');
        expect(response.body.users).toEqual([]);

        const showResponse = await request(app).get('/users/123');
        expect(showResponse.body.id).toBe('123');
    });

    test('should handle typed middleware', async () => {
        const authMiddleware = (
            req: Request,
            res: Response,
            next: NextFunction
        ): void => {
            (req as any).authenticated = true;
            next();
        };

        Routes.post('/auth', ({ req, res }: HttpContext) => {
            res.json({ auth: (req as any).authenticated });
        }, [authMiddleware]);

        await setupApp();

        const response = await request(app).post('/auth');
        expect(response.body.auth).toBe(true);
    });

    test('should handle async TypeScript handlers', async () => {
        Routes.get('/async-ts', async ({ res }: HttpContext) => {
            await new Promise<void>(resolve => setTimeout(resolve, 10));
            res.json({ success: true });
        });

        await setupApp();

        const response = await request(app).get('/async-ts');
        expect(response.body.success).toBe(true);
    });

    test('should type check grouped routes', async () => {
        Routes.group('/api', () => {
            Routes.get('/status', ({ res }: HttpContext) => {
                res.json({ status: 'operational' });
            });
        });

        await setupApp();

        const response = await request(app).get('/api/status');
        expect(response.body.status).toBe('operational');
    });

    test('should handle typed error in middleware', async () => {
        const errorMiddleware = (
            req: Request,
            res: Response,
            next: NextFunction
        ): void => {
            next(new Error('Middleware error'));
        };

        Routes.get('/error-mw', ({ res }: HttpContext) => {
            res.send('ok');
        }, [errorMiddleware]);

        await setupApp();

        app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            res.status(500).json({ error: err.message });
        });

        const response = await request(app).get('/error-mw');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Middleware error');
    });
});


describe('H3 Routing - TypeScript', () => {
    let app: H3
    let router: H3App

    beforeEach(() => {
        H3Routes.routes = [];
        H3Routes.prefix = '';
        H3Routes.groupMiddlewares = [];
        H3Routes.globalMiddlewares = [];

        app = new H3();
    });

    const setupApp = () => {
        router = H3Routes.apply(app);
    };

    test('should work with TypeScript types', async () => {
        H3Routes.get('/typescript', (ctx) => {
            return { typed: true, path: ctx.url.pathname };
        });

        setupApp();

        const response = await router
            .fetch(new global.Request(new URL('http://localhost/typescript')))
            .then(res => res.json())
        expect(response.typed).toBe(true);
    });

    test('should type check route info', async () => {
        H3Routes.get('/info', (ctx) => {
            ctx.res.status = 200;
            ctx.res.statusText = "OK";
        });
        H3Routes.post('/create', (ctx) => {
            ctx.res.status = 201;
            ctx.res.statusText = "Created";
        });

        const routes: RouteInfo[] = H3Routes.allRoutes();
        expect(routes[0].path).toBe('/info');
        expect(routes[0].handlerType).toBe('function');
        expect(routes[1].methods).toContain('post');
    });

    test('should type check controller', async () => {
        class UserController {
            static index () {
                return { users: [] };
            }

            static show (ctx: H3Event) {
                return { id: getRouterParams(ctx).id };
            }
        }

        H3Routes.get('/users', [UserController, 'index']);
        H3Routes.get('/users/:id', [UserController, 'show']);

        setupApp();

        const response = await router
            .fetch(new global.Request(new URL('http://localhost/users')))
            .then(res => res.json())
        expect(response.users).toEqual([]);

        const showResponse = await router
            .fetch(new global.Request(new URL('http://localhost/users/123')))
            .then(res => res.json())
        expect(showResponse.id).toBe('123');
    });

    test('should handle typed middleware', async () => {
        const authMiddleware = (
            evt: H3Event,
            next: H3NextFunction
        ): void => {
            evt.res.headers.set("Authorization", "Bearer token");
            next();
        };

        H3Routes.post('/auth', async (event) => {
            return { auth: event.res.headers.get("Authorization") === "Bearer token" };
        }, [authMiddleware]);

        setupApp();

        const response = await router
            .fetch(new global.Request(new URL('http://localhost/auth'), { method: 'POST' }))
            .then(res => res.json())
        expect(response.auth).toBe(true);
    });

    test('should handle async TypeScript handlers', async () => {
        H3Routes.get('/async-ts', async () => {
            await new Promise<void>(resolve => setTimeout(resolve, 10));
            return { success: true }
        });

        setupApp();

        const response = await router
            .fetch(new global.Request(new URL('http://localhost/async-ts'), { method: 'GET' }))
            .then(res => res.json())
        expect(response.success).toBe(true);
    });

    test('should type check grouped routes', async () => {
        H3Routes.group('/api', () => {
            H3Routes.get('/status', () => {
                return { status: 'operational' };
            });
        });

        setupApp();

        const response = await router
            .fetch(new global.Request(new URL('http://localhost/api/status'), { method: 'GET' }))
            .then(res => res.json())
        expect(response.status).toBe('operational');
    });

    test('should handle typed error in middleware', async () => {
        const errorMiddleware = (): void => {
            throw new HTTPError("Middleware error", { status: 500 });
        };

        H3Routes.get('/error-mw', () => {
            return 'ok';
        }, [errorMiddleware]);

        setupApp();

        const response = await router
            .fetch(new global.Request(new URL('http://localhost/error-mw'), { method: 'GET' }))
        expect(response.status).toBe(500);
        expect(await response.json()).toMatchObject({
            "message": "Middleware error",
            "status": 500,
        });
    });
});