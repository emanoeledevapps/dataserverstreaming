import {FastifyInstance} from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from 'zod';
import {hash, compare} from 'bcryptjs';

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

    fastify.get('/publications/get-all', async (request, reply) => {
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

    fastify.post('/publication/like', async (request, reply) => {
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

    fastify.delete('/publication/like/:idPubli/:userId', async (request, reply) => {
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

    fastify.get('/publication/like/:idPubli', async (request, reply) => {
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

}