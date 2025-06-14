import { config } from 'dotenv';
config();

import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import data from './data.js';
import { Document } from '@langchain/core/documents';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from "@langchain/openai";
import {tool} from '@langchain/core/tools'
import {z} from 'zod'


const video1 = data[0];
const docs = [
    new Document({
        pageContent: video1.transcript,
        metadata: { video_id: video1.video_id }
    })
];


const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
});
const chunks = await splitter.splitDocuments(docs);


const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY
});


const vectorStore = new MemoryVectorStore(embeddings);
await vectorStore.addDocuments(chunks);

const retrievalTool = tool(async({query})=>{
    const retrievedDocs = await vectorStore.similaritySearch(query,3);
    const serializedDocs = retrievedDocs.map((doc)=> doc.pageContent).join('\n')
    return serializedDocs


},{
    name : 'retrieve',
    description : 'Retrieves the most relevant chunks of text from the transcript of a youtube video',
    schema : z.object({
        query : z.string()
    })
})





const llm = new ChatAnthropic({
    modelName: 'claude-sonnet-4-20250514',
    apiKey: process.env.ANTHROPIC_API_KEY
});


const agent = createReactAgent({
    llm,
    tools: [retrievalTool]
});


const results = await agent.invoke({
    messages: [{ role: 'user', content: 'which language the author is trying to learn?'}]
});
console.log(results.messages.at(-1)?.content)


