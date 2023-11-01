import {FastifyInstance} from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from 'zod';

export async function configRoutes(fastify: FastifyInstance){
    fastify.get('/link_checkout', async (request, reply) => {
        return {
            linkCheckout: process.env.LINK_CHECKOUT
        }
    })

    fastify.get('/config_app', async (request, reply) => {

        const config = await prisma.config.findFirst({ 
            where: {
                id: '1'
            }
        })

        return reply.status(200).send({config})
    })
}