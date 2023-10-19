import {FastifyInstance} from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from 'zod';
import {hash, compare} from 'bcryptjs';
import { authenticated } from '../plugins/authenticated';
import axios from 'axios';

export async function socialNetworkRoutes(fastify: FastifyInstance){
    fastify.post('/publication/new', async (request, reply) => {
        const requestProps = z.object({
            userId: z.string(),
            type: z.string(),
            origin: z.string(),
            description: z.string().optional(),
            images: z.string().optional(),
            additionalData: z.string().optional(),
        });

        const {userId, type, origin, description, images, additionalData} = requestProps.parse(request.body);

        const publication = await prisma.publication.create({
            data:{
                userId,
                type,
                origin,
                description,
                images,
                additionalData
            }
        });

        return reply.status(201).send({publication})
    });

    fastify.get('/publications/get-all', {onRequest: [authenticated]}, async (request, reply) => {
        const publications = await prisma.publication.findMany({
            orderBy:{
                createdAt: 'desc'
            },
            include:{
                CommentsPublication: true,
                LikesPublication: true
            }
        });

        return {publications}
    });

    // Rotas de likes
    fastify.get('/publications/:userId', {onRequest: [authenticated]}, async (request, reply) => {
        const requestProps = z.object({
            userId: z.string(),
        });

        const {userId} = requestProps.parse(request.params);

        const publications = await prisma.publication.findMany({
            where:{
                userId
            },
            orderBy:{
                createdAt: 'desc'
            },
            include:{
                CommentsPublication: true,
                LikesPublication: true
            }
        });

        return {publications}
    });

    fastify.get('/publication/:publiId', {onRequest: [authenticated]}, async (request, reply) => {
        const requestProps = z.object({
            publiId: z.string(),
        });

        const {publiId} = requestProps.parse(request.params);

        const publication = await prisma.publication.findUnique({
            where:{
                id: publiId,
            },
            include:{
                CommentsPublication: true,
                LikesPublication: true
            }
        });

        return {publication}
    });

    fastify.post('/publication/like', {onRequest: [authenticated]}, async (request, reply) => {
        const requestProps = z.object({
            idPubli: z.string(),
            userData: z.string(),
            userId: z.string(),
            ownerId: z.string().optional(),
        });

        const {idPubli, userData, userId, ownerId} = requestProps.parse(request.body);

        const likeExist = await prisma.likePublication.findFirst({
            where:{
                publicationId: idPubli,
                userId
            }
        });

        if(likeExist){
            return reply.status(500).send({error: 'User is liked publi'});
        }

        const like = await prisma.likePublication.create({
            data:{
                publicationId: idPubli,
                userData,
                userId
            }
        });

        const ownerPubli = await prisma.user.findUnique({
            where:{
                id: ownerId
            }
        });

        if(ownerPubli?.AndroidPushId){
            let idsForPush = [];
            idsForPush.push(ownerPubli.AndroidPushId);
            const userLike = JSON.parse(userData);

            await axios.post('https://onesignal.com/api/v1/notifications',{
                app_id: process.env.ONESIGNAL_APP_ID,
                include_player_ids: idsForPush,
                data:{
                    foo: `${userLike?.name} curtiu sua publicação`,
                    publiId: idPubli,
                },
                // headings:{
                //     en: `${userLike?.name} curtiu sua publicação`
                // },
                contents:{
                    en: `${userLike?.name} curtiu sua publicação`
                },
            },{
                headers:{
                    'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}` 
                }
            })
        }


        return reply.status(201).send(like);
    });

    fastify.delete('/publication/like/:idPubli/:userId', {onRequest: [authenticated]}, async (request, reply) => {
        const requestProps = z.object({
            idPubli: z.string(),
            userId: z.string()
        });

        const {idPubli, userId} = requestProps.parse(request.params);

        const like = await prisma.likePublication.findFirst({
            where:{
                userId,
                publicationId: idPubli
            }
        })

        await prisma.likePublication.delete({
            where: {
                id: like?.id
            }
        })

        return reply.status(201).send();
    });

    fastify.get('/publication/like/:idPubli', {onRequest: [authenticated]}, async (request, reply) => {
        const requestProps = z.object({
            idPubli: z.string(),
        });

        const {idPubli} = requestProps.parse(request.params);

        const likes = await prisma.likePublication.findMany({
            where:{
                publicationId: idPubli,
            }
        });

        return reply.status(201).send(likes);
    });

    fastify.get('/check-liked/:userId/:publiId', {onRequest: [authenticated]}, async (request, reply) => {
        const requestProps = z.object({
            userId: z.string(),
            publiId: z.string(),
        });

        const {userId, publiId} = requestProps.parse(request.params);

        const liked = await prisma.likePublication.findFirst({
            where:{
                userId,
                publicationId: publiId,
            }
        });

        if(liked){
            return reply.status(200).send({liked: true});
        }else{
            return reply.status(200).send({liked: false});
        }
    });

    //Rotas de seguidores

    fastify.post('/follow', {onRequest: [authenticated]}, async (request, reply) => {
        const requestProps = z.object({
            userId: z.string(),
            userToFollowId: z.string(),
        });

        const {userId, userToFollowId} = requestProps.parse(request.body);

        const followExists = await prisma.followers.findFirst({
            where:{
                userId: userToFollowId,
                followerId: userId
            }
        });

        if(followExists){
            return reply.status(500).send({error: 'User is follow'})
        }

        await prisma.followers.create({
            data:{
                userId: userToFollowId,
                followerId: userId
            }
        });

        await prisma.following.create({
            data:{
                userId,
                followerId: userToFollowId
            }
        });

        const userRequest = await prisma.user.findUnique({
            where:{
                id: userId
            }
        });

        const userToFollow = await prisma.user.findUnique({
            where: {
                id: userToFollowId
            }
        });

        if(userToFollow?.AndroidPushId){
            let idsForPush = [];
            idsForPush.push(userToFollow.AndroidPushId);

            const user = await JSON.stringify(userRequest);

            await axios.post('https://onesignal.com/api/v1/notifications',{
                app_id: process.env.ONESIGNAL_APP_ID,
                include_player_ids: idsForPush,
                data:{
                    foo: `${userRequest?.name} começou a seguir você`,
                    type: 'new-follower',
                    user
                },
                contents:{
                    en: `${userRequest?.name} começou a seguir você`
                },
            },{
                headers:{
                    'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}` 
                }
            })
        }

        return reply.status(201).send();
    });

    fastify.delete('/unfollow', {onRequest: [authenticated]}, async (request, reply) => {
        const requestProps = z.object({
            userId: z.string(),
            userToFollowId: z.string(),
        });

        const {userId, userToFollowId} = requestProps.parse(request.body);
        
        const followerItem = await prisma.followers.findFirst({
            where:{
                userId,
                followerId: userToFollowId
            }
        });
        await prisma.followers.delete({
            where:{
                id: followerItem?.id
            }
        });

        const followingItem = await prisma.following.findFirst({
            where:{
                userId: userToFollowId,
                followerId: userId
            }
        }) 

        await prisma.following.delete({
            where:{
                id: followingItem?.id
            }
        });

        return reply.status(201).send();
    });

    fastify.get('/followers/:userId', {onRequest: [authenticated]}, async (request, reply) => {
        const requestProps = z.object({
            userId: z.string(),
        });

        const {userId} = requestProps.parse(request.params);

        const followers = await prisma.followers.findMany({
            where:{
                userId
            }
        });

        const following = await prisma.following.findMany({
            where:{
                userId
            }
        });

        return {
            followers,
            following
        }
    });

    fastify.get('/check-following/:userId/:userToFollowId', {onRequest: [authenticated]}, async (request, reply) => {
        const requestProps = z.object({
            userId: z.string(),
            userToFollowId: z.string(),
        });

        const {userId, userToFollowId} = requestProps.parse(request.params);

        const following = await prisma.following.findFirst({
            where:{
                userId,
                followerId: userToFollowId
            }
        });

        if(following){
            return reply.status(200).send({following: true});
        }else{
            return reply.status(200).send({following: false});
        }
    });

    //Rotas dos comentários
    fastify.post('/publication/comment', {onRequest: [authenticated]}, async (request, reply) => {
        const requestProps = z.object({
            text: z.string(),
            userData: z.string(),
            userId: z.string(),
            publicationId: z.string(),
            ownerId: z.string().optional()
        });

        const {text, userData, userId, publicationId, ownerId} = requestProps.parse(request.body);

        const comment = await prisma.commentPublication.create({
            data:{
                text,
                userData,
                userId,
                publicationId
            }
        });

        const ownerPubli = await prisma.user.findUnique({
            where:{
                id: ownerId
            }
        });

        if(ownerPubli?.AndroidPushId){
            let idsForPush = [];
            idsForPush.push(ownerPubli.AndroidPushId);
            const userComment = JSON.parse(userData);

            await axios.post('https://onesignal.com/api/v1/notifications',{
                app_id: process.env.ONESIGNAL_APP_ID,
                include_player_ids: idsForPush,
                data:{
                    foo: `${userComment?.name} comentou na sua publicação`,
                    publiId: publicationId,
                },
                // headings:{
                //     en: `${userComment?.name} comentou na sua publicação`
                // },
                contents:{
                    en: `${userComment?.name} comentou na sua publicação`
                },
            },{
                headers:{
                    'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}` 
                }
            })
        }

        return reply.status(201).send({comment});
    });

    fastify.get('/comments/:publicationId', {onRequest: [authenticated]}, async (request, reply) => {
        const requestProps = z.object({
            publicationId: z.string(),
        });

        const {publicationId} = requestProps.parse(request.params);

        const comments = await prisma.commentPublication.findMany({
            where:{
                publicationId
            }
        });

        return reply.status(200).send({comments});
    });
}