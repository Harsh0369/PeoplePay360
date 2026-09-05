import { Response } from 'express';
import { ApiResponse, OffsetPagination, CursorPagination } from '../types/api-response.type';

export class ResponseUtil {
    static success<T>(
        res: Response,
        message: string,
        data?: T,
        statusCode = 200
    ): Response<ApiResponse<T>> {
        return res.status(statusCode).json({
            success: true,
            message,
            ...(data !== undefined && data !== null && { data }),
        });
    }

    static paginatedOffset<T>(
        res: Response,
        message: string,
        data: T,
        offsetPagination: OffsetPagination
    ): Response<ApiResponse<T>> {
        return res.status(200).json({
            success: true,
            message,
            data,
            offsetPagination,
        });
    }

    static paginatedCursor<T>(
        res: Response,
        message: string,
        data: T,
        cursorPagination: CursorPagination
    ): Response<ApiResponse<T>> {
        return res.status(200).json({
            success: true,
            message,
            data,
            cursorPagination,
        });
    }

    static error(
        res: Response,
        message: string,
        statusCode = 400,
        error?: string
    ): Response<ApiResponse<null>> {
        return res.status(statusCode).json({
            success: false,
            message,
            ...(error && { error }),
        });
    }
}
