import {FastifyInstance} from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from 'zod';
import axios from 'axios'

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

        const userFrom = await prisma.user.findFirst({
            where:{
                wallet: from?.toUpperCase()
            }
        })

        if(group === 'devs'){
            let developersPushId = [];

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

                if(developers[i].AndroidPushId){
                    developersPushId.push(developers[i].AndroidPushId);
                }
            }

            if(developersPushId.length > 0){
                await axios.post('https://onesignal.com/api/v1/notifications',{
                    app_id: process.env.ONESIGNAL_APP_ID,
                    include_player_ids: developersPushId,
                    data:{
                        foo: `${userFrom?.name} criou uma nova task`,
                        type: 'new-task',
                    },
                    contents:{
                        en: `${userFrom?.name} criou uma nova task`
                    },
                },{
                    headers:{
                        'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}` 
                    }
                })
            }

            return reply.status(200).send();
        }

        if(group === 'inspectors'){
            let idsForPush = [];

            const userData = await prisma.user.findFirst({
                where:{
                    wallet: from?.toUpperCase(),
                }
            });

            const inspectors = await prisma.user.findMany({
                where: {
                    userType: 2,
                }
            });

            for(var i = 0; i < inspectors.length; i++){
                if(inspectors[i].AndroidPushId){
                    if(inspectors[i].AndroidPushId !== ''){
                        idsForPush.push(inspectors[i].AndroidPushId);
                    }
                }
                await prisma.notification.create({
                    data:{
                        for: inspectors[i].wallet,
                        from: from?.toUpperCase(),
                        type,
                        data
                    }
                })
            }

            //Push onesignal
            if(type === 'request-inspection'){
                await axios.post('https://onesignal.com/api/v1/notifications',{
                    app_id: process.env.ONESIGNAL_APP_ID,
                    include_player_ids: idsForPush,
                    data:{
                        foo: `${userData?.name} solicitou uma nova inspeção`,
                        type: "request-inspection"
                    },
                    // headings:{
                    //     en: `${userData?.name} solicitou uma inspeção`
                    // },
                    contents:{
                        en: `${userData?.name} solicitou uma nova inspeção`
                    },
                },{
                    headers:{
                        'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}` 
                    }
                })
            }

            return reply.status(200).send();
        }

        if(type === 'accept-inspection'){
            let idsForPush = [];
            
            const producerData = await prisma.user.findFirst({
                where: {
                    wallet: to.toUpperCase()
                }
            });

            const inspectorData = await prisma.user.findFirst({
                where: {
                    wallet: from?.toUpperCase()
                }
            });

            if(producerData?.AndroidPushId){
                idsForPush.push(producerData.AndroidPushId);

                await axios.post('https://onesignal.com/api/v1/notifications',{
                    app_id: process.env.ONESIGNAL_APP_ID,
                    include_player_ids: idsForPush,
                    data:{
                        foo: `${inspectorData?.name} aceitou sua inspeção`,
                        type: "accept-inspection"
                    },
                    // headings:{
                    //     en: `${inspectorData?.name} solicitou uma inspeção`
                    // },
                    contents:{
                        en: `${inspectorData?.name} aceitou sua inspeção`
                    },
                },{
                    headers:{
                        'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}` 
                    }
                })

            }

        }

        if(type === 'finalize-inspection'){
            let idsForPush = [];
            const additionalData = JSON.parse(data);

            const producerData = await prisma.user.findFirst({
                where: {
                    wallet: to.toUpperCase()
                }
            });

            const inspectorData = await prisma.user.findFirst({
                where: {
                    wallet: from?.toUpperCase()
                }
            });

            if(producerData?.AndroidPushId){
                idsForPush.push(producerData.AndroidPushId);

                await axios.post('https://onesignal.com/api/v1/notifications',{
                    app_id: process.env.ONESIGNAL_APP_ID,
                    include_player_ids: idsForPush,
                    data:{
                        foo: `${inspectorData?.name} finalizou sua inspeção na Blockchain`,
                        type: "finalize-inspection",
                        inspectionId: additionalData?.inspectionId
                    },
                    // headings:{
                    //     en: `${inspectorData?.name} solicitou uma inspeção`
                    // },
                    contents:{
                        en: `${inspectorData?.name} finalizou sua inspeção na Blockchain`
                    },
                },{
                    headers:{
                        'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}` 
                    }
                })

            }

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