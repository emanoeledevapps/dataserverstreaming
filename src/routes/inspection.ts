import {FastifyInstance} from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from 'zod';
import { authenticated } from '../plugins/authenticated';
import axios from 'axios';

export async function inspectionRoutes(fastify: FastifyInstance){
    fastify.post('/inspections', async (request, reply) => {
        const createInspectionProps = z.object({
            inspectionId: z.string(),
            createdBy: z.string(),
            createdAt: z.string(),
            propertyData: z.string(),
            userWallet: z.string()
        });
    
        const {inspectionId, createdBy, createdAt, propertyData, userWallet} = createInspectionProps.parse(request.body);
    
        await prisma.inspection.create({
            data:{
                inspectionId,
                createdBy,
                createdAt,
                propertyData,
                userWallet
            }
        });

        const producerData = await prisma.user.findFirst({
            where:{
                wallet: createdBy.toUpperCase(),
            }
        });

        const inspectorData = await prisma.user.findFirst({
            where:{
                wallet: userWallet.toUpperCase(),
            }
        });

        if(producerData?.AndroidPushId && producerData?.AndroidPushId !== ''){
            let idsForPush = [];
            idsForPush.push(producerData.AndroidPushId);

            await axios.post('https://onesignal.com/api/v1/notifications',{
                app_id: process.env.ONESIGNAL_APP_ID,
                include_player_ids: idsForPush,
                data:{
                    foo: `${inspectorData?.name} Aceitou sua inspeção`,
                    type: 'accept-inspection'
                },
                // headings:{
                //     en: `${inspectorData?.name} Aceitou sua inspeção`
                // },
                contents:{
                    en: `${inspectorData?.name} Aceitou sua inspeção`
                },
            },{
                headers:{
                    'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}` 
                }
            })
        }
    
        return reply.status(201).send()
    });

    fastify.get('/inspections/:activistWallet', async (request, reply) => {
        const reqParams = z.object({
            activistWallet: z.string()
        })

        const {activistWallet} = reqParams.parse(request.params);

        const inspections = await prisma.inspection.findMany({
            where: {
                userWallet: activistWallet.toUpperCase()
            }
        })

        return {inspections}
    });

    fastify.get('/categories', async (request, reply) => {
        const categories = await prisma.category.findMany({
            include:{
                SubCategory: true,
            }
        })
        return {categories}
    });

    fastify.get('/subCategories', async (request, reply) => {
        const subCategories = await prisma.subCategory.findMany({
            orderBy:{
                order: 'asc'
            },
            select:{
                aguaValue: true,
                bioValue: true,
                carbonValue: true,
                soloValue: true,
                category: true,
                description: true,
                id:true,
                placeholder: true,
                title: true,
                type: true,
                unity: true,
                insumoCategory: true,
                proofPhoto: true
            }
        })
        return {subCategories}
    });

    fastify.put('/update-category', async (request, reply) => {
        const updateProps = z.object({
            id: z.string(),
            carbon: z.string(),
            agua: z.string(),
            bio: z.string(),
            solo: z.string()
        })

        const {id, carbon, agua, bio, solo} = updateProps.parse(request.body);

        const category = await prisma.subCategory.findUnique({
            where:{
                id
            }
        })

        if(!category){
            return reply.status(400).send()
        }
        
        await prisma.subCategory.update({
            where: {
                id
            },
            data:{
                carbonValue: carbon,
                aguaValue: agua,
                soloValue: solo,
                bioValue: bio
            }
        })

        return reply.status(200).send()
    })

    fastify.put('/inspections/:inspectionId/finishInspection', {onRequest: [authenticated]},async (request, reply) => {
        const createInspectionParams = z.object({
            inspectionId: z.string()
        });

        const createInspectionBody = z.object({
            resultIndices: z.string(),
            resultCategories: z.string(),
            biodversityIndice: z.string(),
            proofPhoto: z.string(),
            zones: z.string().optional(),
            method: z.string().optional()
        });
    
        const {proofPhoto, resultCategories, resultIndices, biodversityIndice, zones} = createInspectionBody.parse(request.body);
        const {inspectionId} = createInspectionParams.parse(request.params);
    
        await prisma.inspection.update({
            where:{
                inspectionId
            },
            data:{
                proofPhoto,
                resultCategories,
                resultIdices: resultIndices,
                status: 2,
                biodversityIndice,
                zones: zones,
                methodType: 'sintrop'
            }
        })
    
        return reply.status(201).send()
    });

    fastify.put('/inspections/:inspectionId/update-result-indices', async (request, reply) => {
        const createInspectionParams = z.object({
            inspectionId: z.string()
        });

        const createInspectionBody = z.object({
            resultIndices: z.string(),
        });
    
        const {resultIndices} = createInspectionBody.parse(request.body);
        const {inspectionId} = createInspectionParams.parse(request.params);
    
        await prisma.inspection.update({
            where:{
                inspectionId
            },
            data:{
                resultIdices: resultIndices
            }
        })
    
        return reply.status(201).send()
    });

    fastify.get('/inspection/:inspectionId', async (request, reply) => {
        const createInspectionParams = z.object({
            inspectionId: z.string()
        });
        const {inspectionId} = createInspectionParams.parse(request.params);
        
        const inspection = await prisma.inspection.findFirst({
            where:{
                inspectionId
            }
        })
        return {inspection}
    });

    fastify.get('/inspections/method/:method', async (request, reply) => {
        const inspectionParams = z.object({
            method: z.string()
        });
        const {method} = inspectionParams.parse(request.params);
        
        const inspections = await prisma.inspection.findMany({
            where:{
                methodType: method
            }
        })
        return {inspections}
    });

    fastify.get('/inspections/finished-inspections', async (request, reply) => {
        const inspections = await prisma.inspection.findMany({
            where:{
                status: 2
            }
        })
        return {inspections}
    });

    fastify.put('/update-result', async (request, reply) => {
        const updateProps = z.object({
            id: z.string(),
            result: z.string()
        })

        const {id, result} = updateProps.parse(request.body);

        
        
        await prisma.inspection.update({
            where: {
                inspectionId: id
            },
            data:{
                resultInspection: result
            }
        })

        return reply.status(200).send()
    })
}