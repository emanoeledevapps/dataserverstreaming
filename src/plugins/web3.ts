import Web3 from "web3";
import SintropContractJson from '../abis/Sintrop.json';
import ProducerContractJson from '../abis/ProducerContract.json';
import InspectorContractJson from '../abis/InspectorContract.json';
import ResearcherContractJson from '../abis/ResearcherContract.json';
import DeveloperContractJson from '../abis/DeveloperContract.json';
import ProducerPoolContractJson from '../abis/ProducerPool.json';
import DevelopersPoolContractJson from '../abis/DeveloperPool.json';
import SacTokenContractJson from '../abis/SacToken.json';
import InvestorContractJson from '../abis/InvestorContract.json'

//initializing contract

const provider = `https://sepolia.infura.io/v3/e46d8ac23f55416a9c93c0efa005450a`
const web3 = new Web3(provider);

const sintropContractAddress = '0x6ff3e655a639e35d9194228aa42879ae7ddf7dd8';
const producerContractAddress = '0x693161f1e90270ba156179128f49c285c89447e7';
const inspectorContractAddress = '0xa289fabc5764f91ac56575f7f048038faa3d059d';
const researcherContractAddress = '0x5c5553b494cc350f1a31e1f91832a3ed19df1627';
const developerContractAddress = '0x0c9aa6894d586fbfd246b7633cde1ced544120f4';
const producerPoolContractAddress = '0x0751c7e08e53a55a1ed24fe1467d9a0ceb8ef95e';
const developersPoolContractAddress = '0x5703e8a25a6bcd2a989f28a3cfd39cfc9ae06718';
const SACTokenContractAddress = '0xF8033Bbfe9c645F52d170DDD733274371E75369F';
const investorContractAddress = '0x8014eef23614d357010685787690d3e7c2cfcc30';

const SintropContract = new web3.eth.Contract(SintropContractJson, sintropContractAddress);
const ProducerContract = new web3.eth.Contract(ProducerContractJson, producerContractAddress);
const InspectorContract = new web3.eth.Contract(InspectorContractJson, inspectorContractAddress);
const ResearcherContract = new web3.eth.Contract(ResearcherContractJson, researcherContractAddress);
const DeveloperContract = new web3.eth.Contract(DeveloperContractJson, developerContractAddress);
const ProducerPoolContract = new web3.eth.Contract(ProducerPoolContractJson, producerPoolContractAddress);
const DevelopersPoolContract = new web3.eth.Contract(DevelopersPoolContractJson, developersPoolContractAddress);
const SACTokenContract = new web3.eth.Contract(SacTokenContractJson, SACTokenContractAddress);
const InvestorContract = new web3.eth.Contract(InvestorContractJson, investorContractAddress);

export const GetCurrentBlockNumber = async () => {
    const response = await web3.eth.getBlockNumber();
    return Number(String(response).replace('n',''))
}

export const GetInspections = async () => {
    const response = await SintropContract.methods.getInspections().call({from: sintropContractAddress})
    return response
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

export const GetInspectors = async () => {
    const inspectors = await InspectorContract.methods.getActivists().call()
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

export const GetInvestors = async () => {
    const investors = await InvestorContract.methods.getInvestors().call()
    return investors;
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
    const response = await ProducerPoolContract.methods.balance().call({from: producerPoolContractAddress})
    return response;
}

//Pool developers
export const GetBalanceContractDevelopersPool = async () => {
    const response = await DevelopersPoolContract.methods.balance().call({from: developersPoolContractAddress})
    return response;
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
    const response = await SACTokenContract.methods.certificate(wallet).call({from: SACTokenContractAddress})
    return response;
}

export const GetInvestor = async (walletAdd: string) => {
    const investor = await InvestorContract.methods.getInvestor(walletAdd).call()
    return investor;
}