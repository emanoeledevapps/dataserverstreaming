import Web3 from "web3";
import SintropContractJson from '../abis/Sintrop.json';
import ProducerContractJson from '../abis/ProducerContract.json';
import InspectorContractJson from '../abis/InspectorContract.json';
import ResearcherContractJson from '../abis/ResearcherContract.json';
import DeveloperContractJson from '../abis/DeveloperContract.json';
import ProducerPoolContractJson from '../abis/ProducerPool.json';
import DevelopersPoolContractJson from '../abis/DeveloperPool.json';
import RcTokenContractJson from '../abis/RcToken.json';
import SupporterContractJson from '../abis/SupporterContract.json';
import InspectorPoolContractJson from '../abis/InspectorPool.json';
import ResearcherPoolContractJson from '../abis/ResearcherPool.json';

//initializing contract

const provider = `https://sepolia.infura.io/v3/e46d8ac23f55416a9c93c0efa005450a`
const web3 = new Web3(provider);

const sintropContractAddress = '0x92f3606B7Cb0BAabD21a400f745f1Fd22E6352c3';
const producerContractAddress = '0x96e79BB32124Ee4Cd61399E1959898990D3153ca';
const inspectorContractAddress = '0x1EF8403A2241F933DC9C159d87dBf54B17efE369';
const researcherContractAddress = '0xDe3794d71Ae604D6e54C0841760fD55f2022e2c4';
const developerContractAddress = '0xDc9228762f3d5f503A30C1889E988c5727be29dE';
const producerPoolContractAddress = '0xBED5CB25c85CF2c2e1Bf72Ec07ce75323A70e3d0';
const developersPoolContractAddress = '0x2Dfe9759A6186c00C7ACC15f843c106e80704eb5';
const RcTokenContractAddress = '0x8e1d1e636a5f8a7237fa6fddbd4ba8299371095c';
const supporterContractAddress = '0x31e883c3f18C92F42fD93CffE1fe207E7a078180';
const inspectorPoolContractAddress = '0xa444cAAd6bC2C877bBD3b90B19446ADC0c19357F';
const researcherPoolContractAddress = '0xBea7C40e5c27bbDECd83455B8CbeE8Fc57bd04E4';

const SintropContract = new web3.eth.Contract(SintropContractJson, sintropContractAddress);
const ProducerContract = new web3.eth.Contract(ProducerContractJson, producerContractAddress);
const InspectorContract = new web3.eth.Contract(InspectorContractJson, inspectorContractAddress);
const ResearcherContract = new web3.eth.Contract(ResearcherContractJson, researcherContractAddress);
const DeveloperContract = new web3.eth.Contract(DeveloperContractJson, developerContractAddress);
const ProducerPoolContract = new web3.eth.Contract(ProducerPoolContractJson, producerPoolContractAddress);
const DevelopersPoolContract = new web3.eth.Contract(DevelopersPoolContractJson, developersPoolContractAddress);
const RcTokenContract = new web3.eth.Contract(RcTokenContractJson, RcTokenContractAddress);
const SupporterContract = new web3.eth.Contract(SupporterContractJson, supporterContractAddress);
const InspectorPoolContract = new web3.eth.Contract(InspectorPoolContractJson, inspectorPoolContractAddress);
const ResearcherPoolContract = new web3.eth.Contract(ResearcherPoolContractJson, researcherPoolContractAddress);

export const GetCurrentBlockNumber = async () => {
    const response = await web3.eth.getBlockNumber();
    return Number(String(response).replace('n',''))
}

export const GetInspections = async () => {
    const response = await SintropContract.methods.getInspections().call({from: sintropContractAddress});
    console.log(response)
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
                status,
                validationsCount: Number(String(response[i]?.validationsCount).replace('n','')),
                inspectedAtEra: Number(String(response[i]?.inspectedAtEra).replace('n','')),
                invalidatedAt: Number(String(response[i]?.invalidatedAt).replace('n','')),
                invalidatedAtTimestamp: Number(String(response[i]?.invalidatedAtTimestamp).replace('n','')),
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
        status,
        validationsCount: Number(String(response?.validationsCount).replace('n','')),
        inspectedAtEra: Number(String(response?.inspectedAtEra).replace('n','')),
        invalidatedAt: Number(String(response?.invalidatedAt).replace('n','')),
        invalidatedAtTimestamp: Number(String(response?.invalidatedAtTimestamp).replace('n','')),
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

//Pool inspetores
export const GetTokensPerEraInspectorPool = async () => {
    const response = await InspectorPoolContract.methods.tokensPerEra().call({from: inspectorPoolContractAddress})
    const tokens = Number(String(response).replace('n',''));
    return tokens;
}

export const GetCurrentEraContractInspectorPool = async () => {
    const response = await InspectorPoolContract.methods.currentContractEra().call({from: inspectorPoolContractAddress})
    const era = Number(String(response).replace('n',''));
    return era;
}

export const GetBalanceContractInspectorPool = async () => {
    const response = await InspectorPoolContract.methods.balance().call({from: inspectorPoolContractAddress});
    const balance = Number(String(response).replace('n',''));
    return balance;
}

//Pool pesquisadores
export const GetTokensPerEraResearcherPool = async () => {
    const response = await ResearcherPoolContract.methods.tokensPerEra().call({from: researcherPoolContractAddress})
    const tokens = Number(String(response).replace('n',''));
    return tokens;
}

export const GetCurrentEraContractResearcherPool = async () => {
    const response = await ResearcherPoolContract.methods.currentContractEra().call({from: researcherPoolContractAddress})
    const era = Number(String(response).replace('n',''));
    return era;
}

export const GetBalanceContractResearcherPool = async () => {
    const response = await ResearcherPoolContract.methods.balance().call({from: researcherPoolContractAddress});
    const balance = Number(String(response).replace('n',''));
    return balance;
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

export const GetBalanceUser = async (wallet: string) => {
    const response = await RcTokenContract.methods.balanceOf(wallet).call({from: RcTokenContractAddress})
    const balance = Number(String(response).replace('n',''));
    return balance;
}

//pesquisadores
export const GetResearches = async () => {
    const researches = await ResearcherContract.methods.getWorks().call();

    let newArray = [];

    for(var i = 0; i < researches.length; i++) {
        const data = {
            id: Number(String(researches[i].id).replace('n','')),
            createdBy: researches[i].createdBy,
            title: researches[i].title,
            thesis: researches[i].thesis,
            file: researches[i].file,
            createdAtTimeStamp: Number(String(researches[i].createdAtTimeStamp).replace('n',''))
        }
        newArray.push(data);
    }

    return newArray; 
}

export const GetBalanceETH = async (wallet: string) => {
    const response = await web3.eth.getBalance(wallet);
    
    const balance = Number(String(response).replace('n','')) / 10**18;
    return balance
}

//validations
export const GetValidationsInspection = async (id: string) => {
    const response = await SintropContract.methods.validations(1).call({from: sintropContractAddress})
    console.log(response);
    const balance = Number(String(response).replace('n',''));
    return balance;
}