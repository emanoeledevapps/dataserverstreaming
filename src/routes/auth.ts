import {FastifyInstance} from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from 'zod';
import {hash, compare} from 'bcryptjs';

export async function authRoutes(fastify: FastifyInstance){
    fastify.post('/users', async (request, reply) => {
        const createUserProps = z.object({
            name: z.string(),
            wallet: z.string(),
            userType: z.number(),
            geoLocation: z.string().optional(),
            propertyGeolocation: z.string().optional(),
            password: z.string().optional(),
            imgProfileUrl: z.string().optional(),
            address: z.string().optional(),
            level: z.number(),
            origin: z.string().optional()
        });
    
        const {name, wallet, userType, geoLocation, propertyGeolocation, password, imgProfileUrl, address, level, origin} = createUserProps.parse(request.body);

        const userExists = await prisma.user.findUnique({
            where:{
                wallet: String(wallet).toUpperCase(),
            }
        })

        if(userExists) {
            return reply.status(500).send({
                error: 'User already exists'
            });
        }

        const passwordHash = await hash(String(password), 8)
    
        await prisma.user.create({
            data:{
                name,
                wallet: String(wallet).toUpperCase(),
                userType,
                geoLocation,
                propertyGeolocation,
                password: String(passwordHash),
                imgProfileUrl,
                address,
                level
            }
        });

        if(origin === 'externo'){
            await prisma.transactionQueue.create({
                data:{
                    wallet: String(wallet).toUpperCase(),
                    type: 'register',
                    finished: false
                }
            })
        }
    
        return reply.status(201).send()
    })

    fastify.post('/login', async (request, reply) => {
        const createUserProps = z.object({
            wallet: z.string(),
            password: z.string()
        });
    
        const {wallet, password} = createUserProps.parse(request.body);

        const user = await prisma.user.findFirst({
            where:{
                wallet: String(wallet).toUpperCase(),
                onBlockchain: true
            }
        })

        if(!user) {
            return reply.status(400).send({
                message: 'User not found',
            })
        }

        const passwordCorrect = await compare(String(password), String(user?.password));
        if(!passwordCorrect) {
            return reply.status(400).send({
                message: 'Password incorrect',
            })
        }
        
        const token = fastify.jwt.sign({
            wallet: wallet
        }, {
            sub: wallet,
            expiresIn: '60 days'
        })

        return token;
    })

    fastify.put('/auth/update-password', async (request, reply) => {
        const updateProps = z.object({
            wallet: z.string(),
            password: z.string()
        })

        const {wallet, password} = updateProps.parse(request.body);

        const passwordHash = await hash(password, 8)

        await prisma.user.update({
            where:{
                wallet: wallet.toUpperCase()
            },
            data:{
                password: passwordHash
            }
        })

        return reply.status(200).send();
    })
}