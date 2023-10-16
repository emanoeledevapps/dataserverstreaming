import {FastifyInstance} from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from 'zod';

export async function configRoutes(fastify: FastifyInstance){
    fastify.get('/link_checkout', async (request, reply) => {
        return {
            linkCheckout: process.env.LINK_CHECKOUT
        }
    })
}