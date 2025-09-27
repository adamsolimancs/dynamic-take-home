import { Router } from "express";
// import config from "../config.js";

import {
    HttpError,
    createWallet,
    getBalance,
    listWallets,
    sendTransaction,
    signMessage,
} from "../services/walletService.js";

const router = Router();

// Higher order function to catch errors in async route handlers
const handle = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (err) {
        if (err instanceof HttpError) {
            return res.status(err.status).json({ message: err.message });
        }
        return next(err);
    }
};

router.get(
    "/",
    handle(async (_req, res) => {
        res.json({ wallets: listWallets() });
    }),
);

router.post(
    "/create",
    handle(async (req, res) => {
        const wallet = createWallet(req.body?.label);
        res.status(201).json(wallet);
    }),
);

router.get(
    "/:id/balance",
    handle(async (req, res) => {
        const balance = await getBalance(req.params.id);
        res.json({ balance });
    }),
);

router.post(
    "/:id/signMessage",
    handle(async (req, res) => {
        const { message } = req.body ?? {};
        const signedMessage = await signMessage(req.params.id, message);
        res.json({ signedMessage });
    }),
);

router.post(
    "/:id/sendTransaction",
    handle(async (req, res) => {
        const { to, amount } = req.body ?? {};
        const transactionHash = await sendTransaction(req.params.id, to, amount);
        res.json({ transactionHash });
    }),
);

export default router;