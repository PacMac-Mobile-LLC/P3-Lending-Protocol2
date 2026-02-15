import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';
import { LoanService } from '../services/loanService';
import { ApiResponse } from '../types/api';

const isValidUUIDv4 = (id: string) => uuidValidate(id) && uuidVersion(id) === 4;

const LoanRequestSchema = z.object({
    user_id: z.string().refine(isValidUUIDv4, { message: "Invalid User ID format" }),
    amount: z.number().positive().max(100000),
    duration: z.number().int().min(1).max(365) // Days
});

export const LoanController = {
    /**
     * POST /api/loans/request
     * Gated entry point for new loan requests.
     */
    requestLoan: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Body Validation
            const validatedData = LoanRequestSchema.parse(req.body);

            // 2. Service Execution (contains internal Verification Gate)
            const loan = await LoanService.createLoanRequest(
                validatedData.user_id,
                validatedData.amount,
                validatedData.duration
            );

            // 3. Success Response
            const response: ApiResponse = {
                success: true,
                data: loan
            };

            return res.status(201).json(response);
        } catch (error: any) {
            // Zod errors are handled in errorHandler, but we can catch specific domain errors here if needed
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: error.errors[0]?.message || 'Invalid request body'
                });
            }

            // Check for specific rejection messages to return better status codes
            if (error.message.includes('blocked for protocol integrity')) {
                return res.status(403).json({ success: false, error: error.message });
            }

            if (error.message.includes('exceeds max cap')) {
                return res.status(400).json({ success: false, error: error.message });
            }

            next(error);
        }
    }
};
