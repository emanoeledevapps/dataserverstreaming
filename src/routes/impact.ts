import {FastifyInstance} from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from 'zod';
import {GetBalanceContractDevelopersPool, GetBalanceContractProducerPool} from '../plugins/web3';

export async function impactRoutes(fastify: FastifyInstance){
    fastify.get('/network-impact', async (request, reply) => {
        const impact = await prisma.impact.findMany();
        
        return {impact}
    });

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
    });

    fastify.get('/impact-per-token', async (request, reply) => {
        const totalBalanceProducers = 750000000000000000000000000;
        const totalBalanceDevelopers = 15000000000000000000000000;

        const impact = await prisma.impact.findFirst({
            where:{
                id: '1',
            }
        });

        const balanceProducers = await GetBalanceContractDevelopersPool();
        const balanceDevelopers = await GetBalanceContractDevelopersPool();

        const sacProducers = totalBalanceProducers - Number(balanceProducers);
        const sacDevelopers = totalBalanceDevelopers - Number(balanceDevelopers);
        const totalSac = sacProducers + sacDevelopers;

        const carbon = Number(impact?.carbon) / (totalSac / 10 ** 18);
        const bio = Number(impact?.bio) / (totalSac / 10 ** 18);
        const water = Number(impact?.agua) / (totalSac / 10 ** 18);
        const soil = Number(impact?.solo) / (totalSac / 10 ** 18);

        return reply.status(200).send({
            impact:{
                carbon,
                bio,
                water,
                soil
            }
        })

    })
}