DOCUMENTACIÓN
1. Introducción
El presente informe describe el desarrollo de una aplicación web denominada “Tienda-de-Suplementos”. El objetivo del proyecto es construir un sistema full-stack funcional que implemente:
• Frontend: HTML, CSS y JavaScript
• Backend: Node.js con Express
• Arquitectura: MVC
• Base de datos: MongoDB Atlas
• Autenticación: JWT
• Carrito persistente y sistema de pedidos (Checkout)
• Documentación de API: OpenAPI + Swagger
• Medidas de seguridad: Helmet, sanitización XSS, validaciones
La aplicación permite visualizar productos, registrarse, iniciar sesión, gestionar carritos, realizar pedidos y trabajar con una API REST segura y bien estructurada.
2. Descripción general del sistema
La aplicación consiste en una tienda online de suplementos deportivos. Su funcionamiento se basa en una API REST consumida desde un frontend estático.
2.1 Funcionalidades principales
Gestión de productos (CRUD)
• Crear productos
• Consultar productos
• Editar productos
• Eliminar productos
Gestión de usuarios
• Registro
• Login
• Perfil protegido (JWT)
• Actualización y eliminación
Sistema de carrito
• Añadir productos
• Actualizar cantidades
• Eliminar productos del carrito
• Carrito persistente por usuario
• Vaciar carrito
Sistema de pedidos (Checkout)
• Validación de stock
• Cálculo de total
• Actualización del stock real
• Registro de pedido en base de datos
• Eliminación automática del carrito
Frontend interactivo
El frontend, ubicado en /public, consume la API mediante fetch(), mostrando:
• Productos
• Detalles del producto
• Formulario de login
• Registro
• Carrito
• Checkout
3. Arquitectura del sistema
La arquitectura usada sigue el patrón MVC (Modelo-Vista-Controlador):
3.1 Modelos
Definen la estructura de los datos en la base de datos mediante esquemas de Mongoose.
• cartModel.js
• checkoutModels.js
• productModel.js
• userModel.js
3.2 Controladores
Implementan la lógica del código con la definición de los métodos de su tipo de datos:
• Crear un producto
• Registrar un usuario
• Validar login
• Actualizar productos
3.3 Rutas
Conectan las peticiones HTTP con los controladores.
Ejemplos:
• /api/products
• /api/users/register
• /api/users/login
• /api/cart
• /api/checkout
3.4 Servidor
Configura:
• Express
• Helmet (seguridad)
• CORS
• JSON y URL encoded
• Conexión a MongoDB
• Carga de rutas
• Documentación Swagger
• Archivos estáticos del frontend
4. Base de datos
4.1 Conexión
La aplicación utiliza MongoDB Atlas, una base de datos NoSQL orientada a documentos, ideal por su flexibilidad y escalabilidad.
La URL de conexión se define en el archivo .env mediante:
MONGO_URL=mongodb+srv://MLD:L6YJi46CypkKtBQL@cluster0.qctadoq.mongodb.net/store?appName=Cluster0
La conexión se realiza a través del archivo db.js:
mongoose.connect(process.env.MONGO_URI)
4.2 Modelos principales
Producto:
{name: String, price: Number, category: String, description: String, stock: Number,
image: String, createdAt: Date, updatedAt: Date}
Usuario:
{username: String, password: String, email: String}
Carrito:
{userId: uuid, items: [{product, quantity}]}
Pedido:
{user: String, ítems: object}
5. Endpoints de la API
6. Seguridad
Se integraron varias medidas:
Helmet
Protege encabezados HTTP.
Sanitización XSS (xss)
Evita inserciones de scripts maliciosos en:
• register
• login
• updateUser
• createProduct
Hash de contraseñas
bcryptjs con salt de 10 rondas.
JWT
Protege rutas como /api/users/profile, /api/cart, /api/checkout.
Validación de ObjectId
Evita ataques NoSQL Injection.
7. Despliegue
El backend se desplegó en Render.com, configurando:
• Root Directory: backend
• Build Command: npm install
• Start Command: npm start
• Variables de entorno
• Conexión a Mongo Atlas
Render genera una URL pública para consumir la API desde el frontend.
8. Conclusión
El proyecto cumple los objetivos planteados:
• API REST completa y segura
• Arquitectura MVC bien separada
• Persistencia real en MongoDB Atlas
• Carrito funcional + Checkout real con actualización de stock
• Autenticación JWT
• Documentación profesional
• Frontend dinámico consumiendo la API
• Buenas prácticas de seguridad