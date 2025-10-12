import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "To-Do List API",
      version: "1.0.0",
      description: "API documentation for To-Do List backend"
    },
  },
  apis: ["./src/routes/*.js"], // đường dẫn chứa comment Swagger
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
