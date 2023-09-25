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
            }
        });

        return {transactions}
    })
}