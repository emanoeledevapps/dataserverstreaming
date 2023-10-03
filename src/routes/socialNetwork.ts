import {FastifyInstance} from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from 'zod';
import {hash, compare} from 'bcryptjs';
import { authenticated } from '../plugins/authenticated';

export async function socialNetworkRoutes(fastify: FastifyInstance){
    fastify.post('/publication/new', {onRequest: [authenticated]}, async (request, reply) => {
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

    fastify.post('/publication/like', {onRequest: [authenticated]}, async (request, reply) => {
        const requestProps = z.object({
            idPubli: z.string(),
            userData: z.string(),
            userId: z.string()
        });

        const {idPubli, userData, userId} = requestProps.parse(request.body);

        const like = await prisma.likePublication.create({
            data:{
                publicationId: idPubli,
                userData,
                userId
            }
        });

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

    fastify.post('/follow', {onRequest: [authenticated]}, async (request, reply) => {
        const requestProps = z.object({
            userId: z.string(),
            userToFollowId: z.string(),
        });

        const {userId, userToFollowId} = requestProps.parse(request.body);

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
    })
}