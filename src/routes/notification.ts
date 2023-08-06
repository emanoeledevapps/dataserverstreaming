import {FastifyInstance} from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from 'zod';

export async function notificationRoutes(fastify: FastifyInstance){
    fastify.get('/notifications/:walletUser', async (request, reply) => {
        const notificationProps = z.object({
            walletUser: z.string(),
        })

        const {walletUser} = notificationProps.parse(request.params);

        const notifications = await prisma.user.findUnique({
            where:{
                wallet: walletUser.toUpperCase(),
            },
            select:{
                Notifications:{
                    orderBy:{
                        createdAt: 'desc'
                    }
                }
            }
        })

        return {notifications}
    })

    fastify.post('/notifications/send', async (request, reply) => {
        const notificationProps = z.object({
            from: z.string().optional(),
            for: z.string(),
            type: z.string(),
            data: z.string(),
            group: z.string().optional()
        })

        const {from, for: to, type, data, group} = notificationProps.parse(request.body);

        if(group === 'devs'){
            const developers = await prisma.user.findMany({
                where: {
                    userType: 4,
                }
            })

            for(var i = 0; i < developers.length; i++){
                await prisma.notification.create({
                    data:{
                        for: developers[i].wallet,
                        from: from?.toUpperCase(),
                        type,
                        data
                    }
                })
            }

            return reply.status(200).send();
        }

        const notification = await prisma.notification.create({
            data:{
                for: to.toUpperCase(),
                from: from?.toUpperCase(),
                type,
                data
            }
        })

        return reply.status(201).send({notification});
    });

    fastify.put('/notifications/visualized', async (request, reply) => {
        const notificationProps = z.object({
            id: z.string()
        })

        const {id} = notificationProps.parse(request.body);

        const notification = await prisma.notification.update({
            where:{
                id
            },
            data:{
                visualized: true
            }
        })

        return reply.status(200).send({notification})
    })

    fastify.put('/notifications/all-visualized', async (request, reply) => {
        const notificationProps = z.object({
            walletUser: z.string()
        })

        const {walletUser} = notificationProps.parse(request.body);

        const notification = await prisma.notification.updateMany({
            where:{
                for: walletUser.toUpperCase(),
            },
            data:{
                visualized: true
            }
        })

        return reply.status(200).send({notification})
    })

    fastify.delete('/notifications/delete/:id', async (request, reply) => {
        const notificationProps = z.object({
            id: z.string()
        })

        const {id} = notificationProps.parse(request.params);

        await prisma.notification.delete({
            where:{
                id
            }
        })

        return reply.status(200).send()
    })

    fastify.delete('/notifications/all-delete/:walletUser', async (request, reply) => {
        const notificationProps = z.object({
            walletUser: z.string()
        })

        const {walletUser} = notificationProps.parse(request.params);

        await prisma.notification.deleteMany({
            where:{
                for: walletUser.toUpperCase()
            }
        })

        return reply.status(200).send()
    })
}