import express from 'express';
import handlebars from 'express-handlebars';
import viewsRouter from '../src/routes/views.router.js';
import { Server } from 'socket.io';
import { __dirname } from './utils.js';
import productManager from './ProductManager.js';


const app = express();
const PORT = 8080;

//Usar :

//http://localhost:8080/api/views Lista de Productos
//http://localhost:8080/api/views/realtimeproducts Productos en tiempo real

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// Handlebars
app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')
app.set("views", __dirname + "/views");

app.use('/', viewsRouter)

// Iniciar el servidor
const httpServer = app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});

const socketServer = new Server(httpServer);

// Connection -- Disconnect
socketServer.on("connection", (socket) => {
    console.log(`Cliente conectado ${socket.id}`);
    socket.emit('productsUpdate', productManager.getProducts());

    socket.on("disconnect", () => {
        console.log(`Cliente desconectado ${socket.id}`);
    });
    socket.on("newPrice", (value) => {
        socketServer.emit('priceUpdate', value);
    });

    socket.on('createProduct', (product) => {
        try {
            productManager.addProduct(
                product.title,
                product.description,
                product.price,
                product.thumbnail,
                product.code,
                product.stock,
                0,
                ""
            );
    
            const updatedProducts = productManager.getProducts();
            const newProductId = productManager.getNextID() - 1;
            const newProduct = productManager.getProductById(newProductId);
    
            socketServer.emit('productsUpdate', updatedProducts);
            socketServer.emit('newProduct', newProduct);
        } catch (error) {
            socket.emit('createProductError', error.message);
        }
    });
    
    socket.on('deleteProduct', (productId) => {
        productManager.deleteProduct(productId);
        const updatedProducts = productManager.getProducts();
    
        socketServer.emit('productsUpdate', updatedProducts);
        socketServer.emit('productDeleted', productId);
    });
});