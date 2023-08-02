import {FastifyInstance} from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from 'zod';
import { authenticated } from '../plugins/authenticated';

export async function feedbackRoutes(fastify: FastifyInstance){
    fastify.post('/feedback', async (request, reply) => {
        const createFeedbackProps = z.object({
            title: z.string(),
            description: z.string(),
            wallet: z.string(),
            photoHash: z.string(),
            type: z.string(),
            priority: z.number().optional(),
            team: z.number().optional(),
        });
    
        const {title, description, wallet, photoHash, type, priority, team} = createFeedbackProps.parse(request.body);

        const feedbacks = await prisma.feedback.findMany();
    
        const feedback = await prisma.feedback.create({
            data:{
                id: feedbacks.length + 1,
                title,
                description,
                wallet,
                photoHash,
                type,
                priority,
                team
            }
        })
    
        return reply.status(201).send({feedback});
    })

    fastify.get('/feedback', async (request, reply) => {
        const feedbacks = await prisma.feedback.findMany({
            orderBy:{
                createdAt: 'desc'
            },
            include:{
                CommentsFeedback: true
            }
        })

        return {feedbacks}
    })

    fastify.put('/feedback/status', async (request, reply) => {
        const updateFeedbackProps = z.object({
            id: z.number(),
            status: z.number(),
        });
    
        const {id, status} = updateFeedbackProps.parse(request.body);
    
        await prisma.feedback.update({
            where:{
                id
            },
            data:{
                status
            }
        })
    
        return reply.status(200).send();
    })

    fastify.put('/feedback/assign', async (request, reply) => {
        const updateFeedbackProps = z.object({
            id: z.number(),
            wallet: z.string(),
        });
    
        const {id, wallet} = updateFeedbackProps.parse(request.body);
    
        const feedbackUpdated = await prisma.feedback.update({
            where:{
                id
            },
            data:{
                responsible: wallet.toUpperCase()
            }
        })
    
        return reply.status(200).send({feedbackUpdated});
    })
    
    //Comentários feedbacks
    fastify.post('/feedback/comment', async (request, reply) => {
        const createCommentProps = z.object({
            walletAuthor: z.string(),
            comment: z.string(),
            feedbackId: z.number(),
        });
    
        const {walletAuthor, comment, feedbackId} = createCommentProps.parse(request.body);
    
        const createComment = await prisma.commentsFeedback.create({
            data:{
                walletAuthor: walletAuthor.toUpperCase(),
                comment,
                feedbackId
            }
        })
    
        return reply.status(201).send({createComment});
    });

    fastify.get('/feedback/comments/:feedbackId', async (request, reply) => {
        const findCommentProps = z.object({
            feedbackId: z.string()
        });
    
        const {feedbackId} = findCommentProps.parse(request.params);
    
        const comments = await prisma.commentsFeedback.findMany({
            where:{
                feedbackId: Number(feedbackId)
            },
            orderBy:{
                createdAt: 'desc'
            }
        });

        return {comments}
    })

    //Rotas dos faucets (Somente na fase de testes, na mainnet sera removida)
    fastify.post('/request-faucet', async (request, reply) => {
        const requestProps = z.object({
            wallet: z.string(),
        });
    
        const {wallet} = requestProps.parse(request.body);
    
        await prisma.requestFaucet.create({
            data:{
                wallet,
            }
        })
    
        return reply.status(201).send();
    })

    fastify.get('/request-faucet', async (request, reply) => {
        const requests = await prisma.requestFaucet.findMany({
            orderBy:{
                createdAt: 'asc'
            }
        })

        return {requests}
    })

    fastify.put('/request-faucet/status', async (request, reply) => {
        const requestProps = z.object({
            id: z.string(),
            status: z.number(),
        });
    
        const {id, status} = requestProps.parse(request.body);
    
        await prisma.requestFaucet.update({
            where:{
                id
            },
            data:{
                status
            }
        })
    
        return reply.status(200).send();
    })
}