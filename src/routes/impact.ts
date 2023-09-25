import {FastifyInstance} from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from 'zod';

export async function impactRoutes(fastify: FastifyInstance){
    fastify.get('/network-impact', async (request, reply) => {
        const impact = await prisma.impact.findMany();
        
        return {impact}
    })

    fastify.put('/network-impact', async (request, reply) => {
        const updateProps = z.object({
            carbon: z.number().optional(),
            agua: z.number().optional(),
            bio: z.number().optional(),
            solo: z.number().optional(),
            value: z.number().optional(),
            id: z.string()
        });

        const {carbon, agua, bio, solo, value, id} = updateProps.parse(request.body);

        await prisma.impact.update({
            where:{
                id
            },
            data:{
                carbon,
                agua,
                bio, 
                solo,
                value
            }
        })
    })
}