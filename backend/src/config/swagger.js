import swaggerJSDoc from "swagger-jsdoc"

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Oti Internship API",
            version: "1.0.0",
        },
        servers: [
            {
                url: "http://localhost:4000/api",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["./docs/openapi.yaml"],
}

export const swaggerSpec = swaggerJSDoc(options)