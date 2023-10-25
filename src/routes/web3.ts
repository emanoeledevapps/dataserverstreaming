import {FastifyInstance} from 'fastify';
import { prisma } from '../lib/prisma';
import {z} from 'zod';
import { authenticated } from '../plugins/authenticated';
import { 
    GetInspections, 
    GetProducers, 
    GetInspectors, 
    GetResearchers, 
    GetDevelopers,
    GetTokensPerEraProducersPool,
    GetCurrentEraContractProducerPool,
    GetBalanceContractProducerPool,
    GetBalanceContractDevelopersPool,
    GetEraContractDevelopersPool,
    GetTokensPerEraDevelopersPool,
    GetTokensPerEraInspectorPool,
    GetCurrentEraContractInspectorPool,
    GetBalanceContractInspectorPool,
    GetTokensPerEraResearcherPool,
    GetCurrentEraContractResearcherPool,
    GetBalanceContractResearcherPool,
    GetCertificateTokens,
    GetSupporters,
    GetSupporter,
    GetCurrentBlockNumber,
    GetInspection,
    GetIsa,
    GetProducer,
    GetResearches
} from '../plugins/web3';

export async function web3Routes(fastify: FastifyInstance){
    fastify.get('/web3/all-inspections', async (request, reply) => {
        const response = await GetInspections();
        
        return reply.status(200).send({inspections: response});
    });

    fastify.get('/web3/inspection/:id', async (request, reply) => {
        const requestProps = z.object({
            id: z.string()
        });

        const {id} = requestProps.parse(request.params);

        const inspection = await GetInspection(id);
        const isaData = await GetIsa(id);

        const userData = await prisma.user.findFirst({
            where:{
                wallet: String(inspection?.createdBy).toUpperCase()
            }
        });

        const inspectionApiData = await prisma.inspection.findFirst({
            where:{
                inspectionId: id
            }
        });
        
        return reply.status(200).send({
            inspection,
            isaData,
            userData,
            inspectionApiData
        })
    });

    fastify.get('/web3/inspection/isas/:id', async (request, reply) => {
        const requestProps = z.object({
            id: z.string()
        });

        const {id} = requestProps.parse(request.params);

        const isaData = await GetIsa(id);
        
        return reply.status(200).send({
            isaData
        })
    });

    fastify.get('/web3/history-inspections', async (request, reply) => {
        const response = await GetInspections();
        const blockNumber = await GetCurrentBlockNumber();
        
        let newArray = [];
        for(var i = 0; i < response.length; i++){
            const status = Number(String(response[i]?.status).replace('n',''))

            const data = {
                id: Number(String(response[i]?.id).replace('n','')),
                createdBy: response[i]?.createdBy,
                acceptedBy: response[i]?.acceptedBy,
                isaScore: Number(String(response[i]?.isaScore).replace('n','')),
                createdAt: Number(String(response[i]?.createdAt).replace('n','')),
                createdAtTimestamp: Number(String(response[i]?.createdAtTimestamp).replace('n','')),
                acceptedAt: Number(String(response[i]?.acceptedAt).replace('n','')),
                acceptedAtTimestamp: Number(String(response[i]?.acceptedAtTimestamp).replace('n','')),
                inspectedAtTimestamp: Number(String(response[i]?.inspectedAtTimestamp).replace('n','')),
                status
            }

            if(status === 1){
                if(Number(response[i]?.acceptedAt) + Number(process.env.BLOCKS_TO_EXPIRE_ACCEPTED_INSPECTION) < Number(blockNumber)){
                    newArray.push({
                        ...data,
                        status: 3
                    });
                }
            }

            if(status === 2){
                newArray.push(data);
            }
        }

        let ranking = newArray.map(item => item ).sort((a, b) => b.inspectedAtTimestamp - a.inspectedAtTimestamp);

        return reply.status(200).send({inspections: ranking})
    });

    fastify.get('/web3/blocks-to-expire/:id', async (request, reply) => {
        const requestProps = z.object({
            id: z.string(),
        });

        const {id} = requestProps.parse(request.params);

        const response = await GetInspection(id);
        const blockNumber = await GetCurrentBlockNumber();
        
        const expiresIn = (Number(response.acceptedAt) + Number(process.env.BLOCKS_TO_EXPIRE_ACCEPTED_INSPECTION)) - Number(blockNumber);        

        return reply.status(200).send({expiresIn})
    });

    fastify.get('/web3/era-info', async (request, reply) => {
        const blockNumber = await GetCurrentBlockNumber();
        const blocksPerEra = 192000;
        const startBlock = 4513319;

        const era2Start = startBlock + (blocksPerEra * 1);
        const era3Start = startBlock + (blocksPerEra * 2);

        let eraAtual = 1;
        let nextEraIn = era2Start - blockNumber

        return reply.status(200).send({
            eraAtual,
            nextEraIn
        })
    });

    fastify.get('/web3/manage-inspections', async (request, reply) => {
        const response = await GetInspections();
        const blockNumber = await GetCurrentBlockNumber();
        
        let newArray = [];
        for(var i = 0; i < response.length; i++){
            const status = Number(String(response[i]?.status).replace('n',''))

            const data = {
                id: Number(String(response[i]?.id).replace('n','')),
                createdBy: response[i]?.createdBy,
                acceptedBy: response[i]?.acceptedBy,
                isaScore: Number(String(response[i]?.isaScore).replace('n','')),
                createdAt: Number(String(response[i]?.createdAt).replace('n','')),
                createdAtTimestamp: Number(String(response[i]?.createdAtTimestamp).replace('n','')),
                acceptedAt: Number(String(response[i]?.acceptedAt).replace('n','')),
                acceptedAtTimestamp: Number(String(response[i]?.acceptedAtTimestamp).replace('n','')),
                inspectedAtTimestamp: Number(String(response[i]?.inspectedAtTimestamp).replace('n','')),
                status
            }

            if(status === 0){
                newArray.push(data)
            }
            if(status === 1){
                if(Number(response[i]?.acceptedAt) + Number(process.env.BLOCKS_TO_EXPIRE_ACCEPTED_INSPECTION) < Number(blockNumber)){
                    
                }else{
                    newArray.push(data);
                }
            }
        }

        let ranking = newArray.map(item => item ).sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp);

        return reply.status(200).send({inspections: ranking})
    });

    fastify.get('/web3/producers', async (request, reply) => {
        const response = await GetProducers();
        
        let newArray = [];
        for(var i = 0; i < response.length; i++){
            const data = {
                id: Number(String(response[i]?.id).replace('n','')),
                producerWallet: response[i]?.producerWallet,
                userType: Number(String(response[i]?.userType).replace('n','')),
                certifiedArea: Number(String(response[i]?.certifiedArea).replace('n','')),
                name: response[i]?.name,
                proofPhoto: response[i]?.proofPhoto,
                recentInspection: response[i]?.recentInspection,
                totalInspections: Number(String(response[i]?.totalInspections).replace('n','')),
                lastRequestAt: Number(String(response[i]?.lastRequestAt).replace('n','')),
                isa:{
                    isaScore: Number(String(response[i]?.isa?.isaScore).replace('n','')),
                    isaAverage: Number(String(response[i]?.isa?.isaAverage).replace('n','')),
                    sustainable: response[i]?.isa?.sustainable
                },
                propertyAddress: {
                    coordinate: response[i]?.propertyAddress?.coordinate
                },
                pool:{
                    currentEra: Number(String(response[i]?.pool?.currentEra).replace('n','')),
                }
            }

            newArray.push(data);
        }

        let ranking = newArray.map(item => item ).sort((a, b) => b.isa.isaScore - a.isa.isaScore);

        return reply.status(200).send({producers: ranking})
    });

    fastify.get('/web3/inspectors', async (request, reply) => {
        const response = await GetInspectors();
        
        let newArray = [];
        for(var i = 0; i < response.length; i++){
            const data = {
                id: Number(String(response[i]?.id).replace('n','')),
                inspectorWallet: response[i]?.inspectorWallet,
                userType: Number(String(response[i]?.userType).replace('n','')),
                name: response[i]?.name,
                proofPhoto: response[i]?.proofPhoto,
                totalInspections: Number(String(response[i]?.totalInspections).replace('n','')),
                giveUps: Number(String(response[i]?.giveUps).replace('n','')),
                lastAcceptedAt: Number(String(response[i]?.lastAcceptedAt).replace('n','')),
                inspectorAddress: {
                    coordinate: response[i]?.activistAddress?.coordinate
                },
            }

            newArray.push(data);
        }

        let ranking = newArray.map(item => item ).sort((a, b) => b.totalInspections - a.totalInspections);

        return reply.status(200).send({inspectors: ranking})
    });

    fastify.get('/web3/researchers', async (request, reply) => {
        const response = await GetResearchers();
        
        let newArray = [];
        for(var i = 0; i < response.length; i++){
            const data = {
                id: Number(String(response[i]?.id).replace('n','')),
                researcherWallet: response[i]?.researcherWallet,
                userType: Number(String(response[i]?.userType).replace('n','')),
                name: response[i]?.name,
                proofPhoto: response[i]?.proofPhoto,
                publishedWorks: Number(String(response[i]?.publishedWorks).replace('n','')),
            }

            newArray.push(data);
        }

        let ranking = newArray.map(item => item ).sort((a, b) => b.publishedWorks - a.publishedWorks);

        return reply.status(200).send({researchers: ranking})
    });

    fastify.get('/web3/developers', async (request, reply) => {
        const response = await GetDevelopers();
    
        let newArray = [];
        for(var i = 0; i < response.length; i++){
            const data = {
                id: Number(String(response[i]?.id).replace('n','')),
                developerWallet: response[i]?.developerWallet,
                userType: Number(String(response[i]?.userType).replace('n','')),
                name: response[i]?.name,
                proofPhoto: response[i]?.proofPhoto,
                createdAt: Number(String(response[i]?.createdAt).replace('n','')),
                pool:{
                    level: Number(String(response[i]?.pool?.level).replace('n','')),
                    currentEra: Number(String(response[i]?.pool?.currentEra).replace('n','')),
                }
            }

            newArray.push(data);
        }

        let ranking = newArray.map(item => item ).sort((a, b) => b.pool.level - a.pool.level);
        
        return reply.status(200).send({developers: ranking})
    });

    fastify.get('/web3/investors', async (request, reply) => {
        const response = await GetSupporters();
       
        let newArray = [];
        for(var i = 0; i < response.length; i++){
            const resTokens = await GetCertificateTokens(response[i]?.supporterWallet);

            const data = {
                id: Number(String(response[i]?.id).replace('n','')),
                investorWallet: response[i]?.supporterWallet,
                userType: Number(String(response[i]?.userType).replace('n','')),
                name: response[i]?.name,
                tokensBurned: Number(Number(String(resTokens).replace('n','')) / 10 ** 18)
            }

            newArray.push(data);
        }

        let ranking = newArray.map(item => item ).sort((a, b) => b.tokensBurned - a.tokensBurned);

        return reply.status(200).send({investors: ranking})
    });

    //pools

    fastify.get('/web3/pool-producers-data', async (request, reply) => {
        const response1 = await GetTokensPerEraProducersPool();
        const response2 = await GetCurrentEraContractProducerPool();
        const balanceContract = await GetBalanceContractProducerPool();

        const tokensPerEra = Number(String(response1).replace('n',''));
        const currentEraContract = Number(String(response2).replace('n',''));

        return reply.status(200).send({
            tokensPerEra: Number(tokensPerEra / 10 ** 18).toFixed(0),
            currentEraContract,
            balanceContract: Number(balanceContract / 10 ** 18).toFixed(0)
        })
    });

    fastify.get('/web3/pool-developers-data', async (request, reply) => {
        const response1 = await GetTokensPerEraDevelopersPool();
        const response2 = await GetEraContractDevelopersPool();
        const balanceContract = await GetBalanceContractDevelopersPool();

        const tokensPerEra = Number(String(response1).replace('n',''));
        const currentEraContract = Number(String(response2).replace('n',''));
        

        return reply.status(200).send({
            tokensPerEra: Number(tokensPerEra / 10 ** 18).toFixed(0),
            currentEraContract,
            balanceContract: Number(balanceContract / 10 ** 18).toFixed(0)
        })
    });

    fastify.get('/web3/pool-inspectors-data', async (request, reply) => {
        const tokensPerEra = await GetTokensPerEraInspectorPool();
        const currentEraContract = await GetCurrentEraContractInspectorPool();
        const balanceContract = await GetBalanceContractInspectorPool();

        return reply.status(200).send({
            tokensPerEra: Number(tokensPerEra / 10 ** 18).toFixed(0),
            currentEraContract,
            balanceContract: Number(balanceContract / 10 ** 18).toFixed(0)
        })
    });

    fastify.get('/web3/pool-researchers-data', async (request, reply) => {
        const tokensPerEra = await GetTokensPerEraResearcherPool();
        const currentEraContract = await GetCurrentEraContractResearcherPool();
        const balanceContract = await GetBalanceContractResearcherPool();

        return reply.status(200).send({
            tokensPerEra: Number(tokensPerEra / 10 ** 18).toFixed(0),
            currentEraContract,
            balanceContract: Number(balanceContract / 10 ** 18).toFixed(0)
        })
    });

    //Contribuição
    fastify.get('/web3/contributions/:walletUser', async (request, reply) => {
        const requestProps = z.object({
            walletUser: z.string(),
        });

        const {walletUser} = requestProps.parse(request.params);

        const investor = await GetSupporter(walletUser);
        
        const response1 = await GetCertificateTokens(walletUser);
        

        const tokensBurned = Number(String(response1).replace('n',''));
        

        return reply.status(200).send({
            tokensBurned: Number(tokensBurned / 10 ** 18).toFixed(0),
            linkQrCode: `https://v5-sintrop.netlify.app/account-investor/${walletUser.toLowerCase()}`
        })
    });

    fastify.get('/web3/producer-data/:walletUser', async (request, reply) => {
        const requestProps = z.object({
            walletUser: z.string(),
        });

        const {walletUser} = requestProps.parse(request.params);

        const producer = await GetProducer(walletUser.toLowerCase());
        const inspections = await GetInspections();
        const inspectionsFinished = inspections.filter(item => item.status === 2);
        const inspectionsUser = inspectionsFinished.filter(item => String(item.createdBy).toLowerCase() === walletUser.toLowerCase());

        let totalCarbon = 0;
        let totalWater = 0;
        let totalBio = 0;
        let totalSoil = 0;

        for(var i = 0; i < inspectionsUser.length; i++){

            const inspectionId = inspectionsUser[i].id;
            const response = await GetIsa(String(inspectionId));

            totalCarbon += Number(response?.carbon?.indicator);
            totalWater += Number(response?.water?.indicator);
            totalBio += Number(response?.bio?.indicator);
            totalSoil += Number(response?.soil?.indicator);
        }

        return reply.status(200).send({
            producer,
            totalCarbon, 
            totalWater, 
            totalBio, 
            totalSoil,
            linkQrCode: `https://v5-sintrop.netlify.app/account-producer/${walletUser}`
        })
    });

    //pesquisadores
    fastify.get('/web3/researches', async (request, reply) => {
        const response = await GetResearches();

        let order = response.map(item => item ).sort((a, b) => b.createdAtTimeStamp - a.createdAtTimeStamp);
        
        return reply.status(200).send({researches: order});
    });
}