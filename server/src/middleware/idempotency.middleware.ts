import { Request, Response, NextFunction } from "express";
import { IdempotencyRecord } from "../models/idempotency.model";

export const idempotencyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const idempotencyKey = req.headers["idempotency-key"] as string;

  if (!idempotencyKey) {
    // If no key is provided, we just proceed as normal (or we could enforce it)
    return next();
  }

  try {
    // Check if we already processed this exact request
    const existingRecord = await IdempotencyRecord.findOne({ key: idempotencyKey });

    if (existingRecord) {
      // If we did, intercept and immediately return the cached response
      console.log(`[Idempotency] Intercepted retry for key: ${idempotencyKey}`);
      return res.status(existingRecord.statusCode || 200).json(existingRecord.responseBody);
    }

    // We haven't processed this. We need to patch the res.json method so we can cache the response before it sends.
    const originalJson = res.json.bind(res);

    // Override res.json
    res.json = (body: any) => {
      // Save it asynchronously in the background so we don't block the response
      IdempotencyRecord.create({
        key: idempotencyKey,
        requestPath: req.originalUrl,
        responseBody: body,
        statusCode: res.statusCode
      }).catch(err => {
        // If it fails (e.g. race condition where another request with same key just inserted it), 
        // it's fine, we still return the response. In a perfect world we would lock BEFORE executing the controller.
        // But for this simple middleware, capturing it post-execution is standard for non-transactional routers.
        console.error("[Idempotency] Failed to cache response:", err.message);
      });

      return originalJson(body);
    };

    next();
  } catch (error) {
    next(error);
  }
};
