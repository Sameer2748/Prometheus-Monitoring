import type { NextFunction, Request, Response } from "express";

export function  TimeTookMiddleware (req:Request, res:Response, next:NextFunction) {
const startTime = Date.now();
next();
const EndTime = Date.now();
console.log(`Time TOok ${EndTime-startTime} ms for method ${req.method} for Route ${req.route.path}`);

}