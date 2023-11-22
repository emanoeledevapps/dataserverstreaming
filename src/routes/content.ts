import {FastifyInstance} from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from 'zod';
import { authenticated } from '../plugins/authenticated';

export async function contentRoutes(fastify: FastifyInstance){
    fastify.get('/content', async (request, reply) => {
        const contents = await prisma.content.findMany();
        
        return reply.send({contents})
    })
}