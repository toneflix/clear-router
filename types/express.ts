import type { NextFunction, Request, Response } from 'express';

import type { ControllerHandler } from './basic';

/**
 * HTTP context passed to route handlers
 */
export interface HttpContext {
    req: Request;
    res: Response;
    next: NextFunction;
}

/**
 * Route handler function type
 */
export type RouteHandler = (ctx: HttpContext) => any | Promise<any>;

/**
 * Handler can be either a function or controller reference
 */
export type Handler = RouteHandler | ControllerHandler;

/**
 * Middleware function type
 */
export type Middleware = (req: Request, res: Response, next: NextFunction) => any | Promise<any>;