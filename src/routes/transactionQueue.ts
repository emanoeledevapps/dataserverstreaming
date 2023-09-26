import {FastifyInstance} from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from 'zod';
import {hash, compare} from 'bcryptjs';

export async function transactionQueueRoutes(fastify: FastifyInstance){
    fastify.get('/transactions-open/:wallet', async (request, reply) => {
        const requestProps = z.object({
            wallet: z.string()
        });

        const {wallet} = requestProps.parse(request.params);

        const transactions = await prisma.transactionQueue.findMany({
            where:{
                wallet: wallet.toUpperCase(),
                finished: false
            }
        });

        return {transactions}
    });

    fastify.put('/transactions-open/finish', async (request, reply) => {
        const requestProps = z.object({
            id: z.string(),
        });

        const {id} = requestProps.parse(request.body);

        await prisma.transactionQueue.update({
            where:{
                id
            },
            data:{
                finished: true
            }
        });

        return reply.status(200).send()
    })
}