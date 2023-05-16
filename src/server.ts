import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { delationRoutes } from './routes/delation';
import { userRoutes } from './routes/user';
import { inspectionRoutes } from './routes/inspection';
import { authRoutes } from './routes/auth';
import { blogRoutes } from './routes/blog';
import { impactRoutes } from './routes/impact';

const app = fastify();
app.register(cors, {
    origin: true
});
app.register(userRoutes);
app.register(delationRoutes);
app.register(inspectionRoutes);
app.register(authRoutes);
app.register(blogRoutes);
app.register(impactRoutes);

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