import { Router } from "express";
import productManager from "../ProductManager.js"

const router = Router();

router.get("/", (req, res) => {
    // Obtener la lista de productos
    const products = productManager.getProducts();
    res.render("home", { products });
});

router.get("/realtimeproducts", (req, res) => {
    // Obtener la lista de productos en tiempo real
    const products = productManager.getProducts();
    res.render("realTimeProducts", { products });
});

export default router;