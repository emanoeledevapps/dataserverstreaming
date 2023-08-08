import {FastifyInstance} from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from 'zod';

export async function quoteRoutes(fastify: FastifyInstance){
    fastify.get('/quotes', async (request, reply) => {
        const quotes = await prisma.quote.findMany({
            orderBy:{
                createdAt: 'asc'
            }
        })

        return {quotes}
    })

    fastify.put('/quotes/reserve', async (request, reply) => {
        const updateProps = z.object({
            quantQuote: z.number(),
            investorData: z.string()
        })

        const {quantQuote, investorData} = updateProps.parse(request.body);

        const quotes = await prisma.quote.findMany();
        const quotesAvaliable = quotes.filter(item => item.reservedBy === null);

        for(var i = 0; i < quantQuote; i++){
            await prisma.quote.update({
                where:{
                    id: quotesAvaliable[i].id
                },
                data:{
                    reservedBy: investorData
                }
            })
        }

        return reply.status(200).send();
    })
}