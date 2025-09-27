import { Router } from "express";

const router = Router();

// Placeholder controllers
router.post("/createWallet", (req, res) => {
    res.json({ message: "Create wallet endpoint" });
});


router.get("/:id/balance", (req, res) => {
    res.json({ message: `Balance for wallet ${req.params.id}` });
});


router.post("/:id/signMessage", (req, res) => {
    res.json({ message: "Sign message endpoint" });
});


router.post("/:id/sendTransaction", (req, res) => {
    res.json({ message: "Send transaction endpoint" });
});


export default router;