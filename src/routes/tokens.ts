import {FastifyInstance} from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from 'zod';

export async function tokensRoutes(fastify: FastifyInstance){
    fastify.get('/tokens-burned', async (request, reply) => {
        const tokensBurned = await prisma.tokensBurned.findMany();
        
        return {tokensBurned}
    })

    fastify.post('/tokens-burned', async (request, reply) => {
        const updateProps = z.object({
            wallet: z.string(),
            tokens: z.number(),
            transactionHash: z.string(),
            carbon: z.number(),
            water: z.number(),
            bio: z.number(),
            soil: z.number()
        });

        const {wallet, tokens, transactionHash, carbon, water, bio, soil} = updateProps.parse(request.body);

        await prisma.tokensBurned.create({
            data:{
                wallet: wallet.toUpperCase(),
                tokens,
                transactionHash,
                carbon,
                water,
                bio, 
                soil
            }
        });

        return reply.status(201).send();
    })

    fastify.get('/tokens-burned/by-wallet/:wallet', async (request, reply) => {
        const paramsProps = z.object({
            wallet: z.string()
        });

        const {wallet} = paramsProps.parse(request.params);

        const tokensBurned = await prisma.tokensBurned.findMany({
            where:{
                wallet: wallet.toUpperCase()
            },
        })

        return {tokensBurned};
    })

    fastify.get('/tokens-burned/by-hash/:transactionHash', async (request, reply) => {
        const paramsProps = z.object({
            transactionHash: z.string()
        });

        const {transactionHash} = paramsProps.parse(request.params);

        const tokensBurned = await prisma.tokensBurned.findMany({
            where:{
                transactionHash
            },
        })

        return {tokensBurned};
    })
}