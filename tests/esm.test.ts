import { H3, H3Event } from "h3";
import { beforeEach, describe, expect, test } from "vitest"

import { H3App } from 'types/h3';
import H3Routes from '../src/h3/routes';
import Routes from "../src/express/routes";
import express from 'express';
import request from 'supertest';

describe('Express Routing - ESM', () => {
    let app: express.Application;
    let router: express.Router;

    beforeEach(() => {
        Routes.routes = [];
        Routes.prefix = '';
        Routes.groupMiddlewares = [];
        Routes.globalMiddlewares = [];

        app = express();
        router = express.Router();
        app.use(express.json());
    });

    const setupApp = async () => {
        await Routes.apply(router);
        app.use(router);
    };

    test('should register GET route with ESM', async () => {
        Routes.get('/esm-test', ({ res }) => {
            res.json({ module: 'esm' });
        });

        await setupApp();

        const response = await request(app).get('/esm-test');
        expect(response.status).toBe(200);
        expect(response.body.module).toBe('esm');
    });

    test('should handle async handlers', async () => {
        Routes.get('/async', async ({ res }) => {
            await new Promise(resolve => setTimeout(resolve, 10));
            res.json({ async: true });
        });

        await setupApp();

        const response = await request(app).get('/async');
        expect(response.body.async).toBe(true);
    });

    test('should support multiple methods', async () => {
        Routes.add(['get', 'post'], '/multi', ({ req, res }) => {
            res.json({ method: req.method });
        });

        await setupApp();

        const getResponse = await request(app).get('/multi');
        expect(getResponse.body.method).toBe('GET');

        const postResponse = await request(app).post('/multi');
        expect(postResponse.body.method).toBe('POST');
    });

    test('should support API resources', async () => {
        class UserController {
            static index ({ res }: { res: express.Response }) {
                return res.json({ users: ['Alice', 'Bob'] });
            }
            static show ({ res }: { res: express.Response }) {
                return res.json({ name: 'Alice' });
            }
            static create ({ res }: { res: express.Response }) {
                return res.status(201).json({ name: 'Alice' });
            }
            static update ({ res }: { res: express.Response }) {
                return res.status(202).json({ name: 'Alice' });
            }
            static destroy ({ res }: { res: express.Response }) {
                return res.status(202).json({ name: 'Alice' });
            }
        }

        Routes.apiResource('/users', UserController);

        setupApp();

        const response = await request(app).get('/users');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ users: ['Alice', 'Bob'] });

        const showResponse = await request(app).get('/users/1');
        expect(showResponse.status).toBe(200);
        expect(showResponse.body).toEqual({ name: 'Alice' });

        const createResponse = await request(app).post('/users');
        expect(createResponse.status).toBe(201);
        expect(createResponse.body).toEqual({ name: 'Alice' });

        const updateResponse = await request(app).put('/users/1');
        expect(updateResponse.status).toBe(202);
        expect(updateResponse.body).toEqual({ name: 'Alice' });

        const destroyResponse = await request(app).delete('/users/1');
        expect(destroyResponse.status).toBe(202);
        expect(destroyResponse.body).toEqual({ name: 'Alice' });
    })

    test('should work with ESM class controllers', async () => {
        class UserController {
            static list ({ res }: { res: express.Response }): void {
                res.json({ users: ['Alice', 'Bob'] });
            }
        }

        Routes.get('/users', [UserController, 'list']);

        await setupApp();

        const response = await request(app).get('/users');
        expect(response.body.users).toHaveLength(2);
    });

    test('should handle grouped routes in ESM', async () => {
        Routes.group('/api', () => {
            Routes.group('/v2', () => {
                Routes.get('/status', ({ res }) => {
                    res.json({ version: 2, status: 'ok' });
                });
            });
        });

        await setupApp();

        const response = await request(app).get('/api/v2/status');
        expect(response.body.version).toBe(2);
    });

    test('should return route information', async () => {
        Routes.get('/info1', ({ res }) => void res.send('ok'));
        Routes.post('/info2', ({ res }) => void res.send('ok'));

        const routes = Routes.allRoutes();
        expect(routes).toHaveLength(2);
        expect(routes[0].handlerType).toBe('function');
    });
});

describe('H3 Routing - ESM', () => {
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

    test('should register GET route with ESM', async () => {
        H3Routes.get('/esm-test', () => {
            return { module: 'esm' };
        });

        setupApp();

        const response = await router
            .fetch(new global.Request(new URL('http://localhost/esm-test')))

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ module: 'esm' });
    });

    test('should handle async handlers', async () => {
        H3Routes.get('/async', async ({ res }) => {
            await new Promise(resolve => setTimeout(resolve, 10));
            return { async: true };
        });

        setupApp();

        const response = await router
            .fetch(new global.Request(new URL('http://localhost/async')))
            .then(res => res.json())
        expect(response.async).toBe(true);
    });

    test('should support multiple methods', async () => {
        H3Routes.add(['get', 'post'], '/multi', ({ req, res }) => {
            return { method: req.method };
        });

        setupApp();

        const getResponse = await router
            .fetch(new global.Request(new URL('http://localhost/multi')))
            .then(res => res.json())
        expect(getResponse.method).toBe('GET');

        const postResponse = await router
            .fetch(new global.Request(new URL('http://localhost/multi'), { method: 'POST' }))
            .then(res => res.json())
        expect(postResponse.method).toBe('POST');
    });

    test('should support API resources', async () => {
        class UserController {
            static index () {
                return { users: ['Alice', 'Bob'] };
            }
            static show () {
                return { name: 'Alice' };
            }
            static create () {
                return global.Response.json({ name: 'Alice' }, { status: 201 });
            }
            static update () {
                return global.Response.json({ name: 'Alice' }, { status: 202 });
            }
            static destroy () {
                return global.Response.json({ name: 'Alice' }, { status: 202 });
            }
        }

        H3Routes.apiResource('/users', UserController);

        setupApp();

        const response = await router.fetch(new global.Request(new URL('http://localhost/users')));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ users: ['Alice', 'Bob'] });

        const showResponse = await router.fetch(new global.Request(new URL('http://localhost/users/1')));
        expect(showResponse.status).toBe(200);
        expect(await showResponse.json()).toEqual({ name: 'Alice' });

        const createResponse = await router.fetch(new global.Request(new URL('http://localhost/users'), { method: 'POST' }));
        expect(createResponse.status).toBe(201);
        expect(await createResponse.json()).toEqual({ name: 'Alice' });

        const updateResponse = await router.fetch(new global.Request(new URL('http://localhost/users/1'), { method: 'PUT' }));
        expect(updateResponse.status).toBe(202);
        expect(await updateResponse.json()).toEqual({ name: 'Alice' });

        const destroyResponse = await router.fetch(new global.Request(new URL('http://localhost/users/1'), { method: 'DELETE' }));
        expect(destroyResponse.status).toBe(202);
        expect(await destroyResponse.json()).toEqual({ name: 'Alice' });
    })

    test('should work with ESM class controllers', async () => {
        class UserController {
            static list () {
                return { users: ['Alice', 'Bob'] };
            }
        }

        H3Routes.get('/users', [UserController, 'list']);

        setupApp();

        const response = await router
            .fetch(new global.Request(new URL('http://localhost/users')))
            .then(res => res.json())
        expect(response.users).toHaveLength(2);
    });

    test('should handle grouped routes in ESM', async () => {
        H3Routes.group('/api', () => {
            H3Routes.group('/v2', () => {
                H3Routes.get('/status', ({ res }) => {
                    return { version: 2, status: 'ok' };
                });
            });
        });

        setupApp();

        const response = await router
            .fetch(new global.Request(new URL('http://localhost/api/v2/status')))
            .then(res => res.json())
        expect(response.version).toBe(2);
    });

    test('should return route information', async () => {
        H3Routes.get('/info1', () => 'ok');
        H3Routes.post('/info2', () => 'ok');

        const routes = Routes.allRoutes();
        expect(routes).toHaveLength(2);
        expect(routes[0].handlerType).toBe('function');
    });
});