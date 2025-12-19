import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import Stripe from 'stripe';
import { createError } from '../../utils/error';
import { errorCode } from '../../../config/errorCode';
import { getUserById } from '../../services/authService';
import { checkUserIfNotExist } from '../../utils/auth';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' });

interface CustomRequest extends Request {
    userId?: number;
}

export const createCheckoutSession = [
    body("products")
        .isArray({ min: 1 })
        .withMessage("Products must be a non-empty array"),
    body("products.*.productId")
        .isInt({ gt: 0 })
        .withMessage("Each product must have a valid productId"),
    body("products.*.quantity")
        .isInt({ gt: 0 })
        .withMessage("Each product must have a quantity greater than 0"),
    body("products.*.unit_price")
        .isInt({ gt: 0 })
        .withMessage("Each product must have a unit_price in cents"),
    body("products.*.name")
        .isString()
        .notEmpty()
        .withMessage("Each product must have a name"),
    body("products.*.image")
        .optional()
        .isString()
        .withMessage("Image must be a string URL"),
    // body("")
    async (req: CustomRequest, res: Response, next: NextFunction) => {

        const errors = validationResult(req).array({ onlyFirstError: true });

        if (errors.length > 0) {
            return next(createError(errors[0].msg, 400, errorCode.invalid));
        }

        const userId = req.userId;
        if (typeof userId !== 'number') {
            return next(createError('User ID is required', 400, errorCode.invalid));
        }
        const user = await getUserById(userId);
        checkUserIfNotExist(user);

        const { products } = req.body;

        const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
            products.map((product: any) => ({
                price_data: {
                    currency: product.currency,
                    unit_amount: product.unit_price, // make sure it's an integer (in cents)
                    product_data: {
                        name: product.name,
                        images: product.image ? [product.image] : [],
                        // images: [product.image],
                    },
                },
                quantity: product.quantity,
            }));


        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: "http://localhost:5173/success",
            cancel_url: "http://localhost:5173/cancel",
            
            metadata: {
                userId: String(userId),
                products: JSON.stringify(
                    products.map((p: { productId: number; quantity: number, unit_price: number, currency: string }) => ({
                        productId: p.productId,
                        quantity: p.quantity,
                        unit_price: p.unit_price,
                        currency: p.currency
                    }))
                ),
            },
            
        });


        res.status(200).json({ id: session.id });
    }
];

export const stripeWebhook = async (
    req: Request,
    res: Response
): Promise<void> => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
    } catch (error: any) {
        console.error('Webhook signature failed:', error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
        return;
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = parseInt(session.metadata?.userId || "0", 10);
        const rawProducts = JSON.parse(session.metadata?.products || "[]");

        console.log(rawProducts)

        const total = rawProducts.reduce((sum: number, p: any) => {
            return sum + p.unit_price * p.quantity;
        }, 0);

        console.log(total)

        console.log(`✅ Payment successful for user ${userId}, product ${JSON.stringify(rawProducts)}`);

        try {
            const order = await prisma.order.create({
                data: {
                    userId,
                    code: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
                    totalPrice: total,
                    products: {
                        create: rawProducts.map((p: any) => ({
                            product: { connect: { id: p.productId } },
                            quantity: p.quantity,
                            price: p.unit_price,
                        })),
                    },
                },
            });

            console.log(`✅ Order created for user ${userId}, order ID: ${order.id}`);
        } catch (err: any) {
            console.error("❌ Failed to create order:", err);
        }
    }

    res.status(200).json({ received: true });
};

