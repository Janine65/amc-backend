import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        version: 'v1.0.0',
        title: 'Auto-Moto-Club Swissair Applikation',
        description: 'Implementation of Swagger with TypeScript'
    },
    servers: [
        {
            url: 'http://localhost:8080',
            description: ''
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
            }
        }
    }
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./src/controllers/auth.controller.ts',
    './src/controllers/user.controller.ts',
    './src/controllers/adresse.controller.ts',
    './src/controllers/anlass.controller.ts'
];

swaggerAutogen({openapi: '3.0.0'})(outputFile, endpointsFiles, doc);