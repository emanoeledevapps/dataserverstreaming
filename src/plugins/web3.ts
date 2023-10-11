import Web3 from "web3";
import SintropContractJson from '../abis/Sintrop.json';
import ProducerContractJson from '../abis/ProducerContract.json';
import InspectorContractJson from '../abis/InspectorContract.json';
import ResearcherContractJson from '../abis/ResearcherContract.json';
import DeveloperContractJson from '../abis/DeveloperContract.json';
import ProducerPoolContractJson from '../abis/ProducerPool.json';
import DevelopersPoolContractJson from '../abis/DeveloperPool.json';
import RcTokenContractJson from '../abis/RcToken.json';
import SupporterContractJson from '../abis/SupporterContract.json'

//initializing contract

const provider = `https://sepolia.infura.io/v3/e46d8ac23f55416a9c93c0efa005450a`
const web3 = new Web3(provider);

const sintropContractAddress = '0x9f26e5AB2B9C36F9e6a4088380FB13D92dD0d12c';
const producerContractAddress = '0x0Eac8F15B96292507694F5885344fe8D437013a6';
const inspectorContractAddress = '0x34938C273c8C27f46E5ACf4D98AAD5DF4a7130D7';
const researcherContractAddress = '0xf7dF2a28273e47544a4f4F581B41FF349907d153';
const developerContractAddress = '0x23e1fF307094520a878E327516C31A7a02D65ac1';
const producerPoolContractAddress = '0x12dfc8027A2Fc644586e8E2946349053A91A8Ad7';
const developersPoolContractAddress = '0x1a6129DFF9B6dB0475D054fd991e85E1227d10DC';
const RcTokenContractAddress = '0xF6Ac9B2365B1c44Ef221824A02885d4E0e35ECD3';
const supporterContractAddress = '0xc0A8fE26cd04f5CA68C9a56615d416618229085F';

const SintropContract = new web3.eth.Contract(SintropContractJson, sintropContractAddress);
const ProducerContract = new web3.eth.Contract(ProducerContractJson, producerContractAddress);
const InspectorContract = new web3.eth.Contract(InspectorContractJson, inspectorContractAddress);
const ResearcherContract = new web3.eth.Contract(ResearcherContractJson, researcherContractAddress);
const DeveloperContract = new web3.eth.Contract(DeveloperContractJson, developerContractAddress);
const ProducerPoolContract = new web3.eth.Contract(ProducerPoolContractJson, producerPoolContractAddress);
const DevelopersPoolContract = new web3.eth.Contract(DevelopersPoolContractJson, developersPoolContractAddress);
const RcTokenContract = new web3.eth.Contract(RcTokenContractJson, RcTokenContractAddress);
const SupporterContract = new web3.eth.Contract(SupporterContractJson, supporterContractAddress);

export const GetCurrentBlockNumber = async () => {
    const response = await web3.eth.getBlockNumber();
    return Number(String(response).replace('n',''))
}

export const GetInspections = async () => {
    const response = await SintropContract.methods.getInspections().call({from: sintropContractAddress});

    let newArray = [];
    for(var i = 0; i < response.length; i++){
            const status = Number(String(response[i]?.status).replace('n',''));

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

            newArray.push(data);
    }
    return newArray;
}

export const GetInspection = async (id: string) => {
    const response = await SintropContract.methods.getInspection(id).call({from: sintropContractAddress});

    const status = Number(String(response?.status).replace('n',''));

    const data = {
        id: Number(String(response?.id).replace('n','')),
        createdBy: response?.createdBy,
        acceptedBy: response?.acceptedBy,
        isaScore: Number(String(response?.isaScore).replace('n','')),
        createdAt: Number(String(response?.createdAt).replace('n','')),
        createdAtTimestamp: Number(String(response?.createdAtTimestamp).replace('n','')),
        acceptedAt: Number(String(response?.acceptedAt).replace('n','')),
        acceptedAtTimestamp: Number(String(response?.acceptedAtTimestamp).replace('n','')),
        inspectedAtTimestamp: Number(String(response?.inspectedAtTimestamp).replace('n','')),
        status
    }

    return data
}

export const GetIsa = async (inspectionId: string) => {
    let newArrayIsas = [];

    let carbon = {};
    let water = {};
    let soil = {};
    let bio = {};

    const response = await SintropContract.methods.getIsa(inspectionId).call({from: sintropContractAddress})
    
    for(var i = 0; i < response.length; i++) {
        const categoryId = Number(String(response[i]?.categoryId).replace('n',''));

        let data = {
            categoryId,
            isaIndex: Number(String(response[i]?.isaIndex).replace('n','')),
            report: response[i]?.report,
            indicator: Number(String(response[i]?.indicator).replace('n','')),
        }

        if(categoryId === 1){
            carbon = data;
        }

        if(categoryId === 2){
            bio = data;
        }

        if(categoryId === 3){
            water = data;
        }

        if(categoryId === 4){
            soil = data;
        }
    }
    
    return {carbon, soil, water, bio};
}

export const GetProducers = async () => {
    const producers = await ProducerContract.methods.getProducers().call()
    return producers;
}

export const GetProducer = async (wallet: string) => {
    const producer = await ProducerContract.methods.getProducer(wallet).call();
    
    const data = {
        id: Number(String(producer?.id).replace('n','')),
        producerWallet: producer?.producerWallet,
        userType: Number(String(producer?.userType).replace('n','')),
        certifiedArea: Number(String(producer?.certifiedArea).replace('n','')),
        name: producer?.name,
        proofPhoto: producer?.proofPhoto,
        recentInspection: producer?.recentInspection,
        totalInspections: Number(String(producer?.totalInspections).replace('n','')),
        lastRequestAt: Number(String(producer?.lastRequestAt).replace('n','')),
        isa: {
            isaScore: Number(String(producer?.isa?.isaScore).replace('n','')),
            isaAverage: Number(String(producer?.isa?.isaAverage).replace('n','')),
            sustainable: producer?.isa?.sustainable
        },
        propertyAddress: {
            coordinate: producer?.propertyAddress?.coordinate
        },
        pool: { 
            currentEra: Number(String(producer?.pool?.currentEra).replace('n','')) 
        }
    }

    return data;
}

export const GetInspectors = async () => {
    const inspectors = await InspectorContract.methods.getInspectors().call()
    return inspectors;
}

export const GetResearchers = async () => {
    const researchers = await ResearcherContract.methods.getResearchers().call()
    return researchers; 
}

export const GetDevelopers = async () => {
    const developers = await DeveloperContract.methods.getDevelopers().call()
    return developers;
}

export const GetSupporters = async () => {
    const supporters = await SupporterContract.methods.getSupporters().call()
    return supporters;
}

//Pool producers
export const GetTokensPerEraProducersPool = async () => {
    const response = await ProducerPoolContract.methods.tokensPerEra().call({from: producerPoolContractAddress})
    return response;
}

export const GetCurrentEraContractProducerPool = async () => {
    const response = await ProducerPoolContract.methods.currentContractEra().call({from: producerPoolContractAddress})
    return response;
}

export const GetBalanceContractProducerPool = async () => {
    const response = await ProducerPoolContract.methods.balance().call({from: producerPoolContractAddress});
    const balance = Number(String(response).replace('n',''));
    return balance;
}

//Pool developers
export const GetBalanceContractDevelopersPool = async () => {
    const response = await DevelopersPoolContract.methods.balance().call({from: developersPoolContractAddress})
    const balance = Number(String(response).replace('n',''));
    return balance;
}

export const GetEraContractDevelopersPool = async () => {
    const response = await DevelopersPoolContract.methods.currentContractEra().call({from: developersPoolContractAddress})
    return response;
}

export const GetTokensPerEraDevelopersPool = async () => {
    const response = await DevelopersPoolContract.methods.TOKENS_PER_ERA().call({from: developersPoolContractAddress})
    return response;
}

//Contribuições
export const GetCertificateTokens = async (wallet : string) => {
    const response = await RcTokenContract.methods.certificate(wallet).call({from: RcTokenContractAddress})
    return response;
}

export const GetSupporter = async (walletAdd: string) => {
    const supporter = await SupporterContract.methods.getSupporter(walletAdd).call()
    return supporter;
}