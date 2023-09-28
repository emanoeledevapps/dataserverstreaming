import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { delationRoutes } from './routes/delation';
import { userRoutes } from './routes/user';
import { inspectionRoutes } from './routes/inspection';
import { authRoutes } from './routes/auth';
import { blogRoutes } from './routes/blog';
import { impactRoutes } from './routes/impact';
import { tokensRoutes } from './routes/tokens';
import { feedbackRoutes } from './routes/feedback';
import { profileRoutes } from './routes/profile';
import { notificationRoutes } from './routes/notification';
import { quoteRoutes } from './routes/quote';
import { transactionQueueRoutes } from './routes/transactionQueue';
import { socialNetworkRoutes } from './routes/socialNetwork';

const app = fastify();
app.register(cors, {
    origin: true
});

app.register(userRoutes);
app.register(profileRoutes);
app.register(delationRoutes);
app.register(inspectionRoutes);
app.register(authRoutes);
app.register(blogRoutes);
app.register(impactRoutes);
app.register(tokensRoutes);
app.register(feedbackRoutes);
app.register(notificationRoutes);
app.register(quoteRoutes);
app.register(transactionQueueRoutes);
app.register(socialNetworkRoutes);

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