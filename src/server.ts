import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { contentRoutes } from './routes/content';

const app = fastify({logger: true});
app.register(cors, {
    origin: '*',

});

app.register(contentRoutes);

app.register(jwt, {
    secret: process.env.JWT_SECRET_KEY || '123456'
})

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
})
.then(() => {
    console.log('HTTP Server Running!')
})