import { config } from 'dotenv';
config();
import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import data from './data.js';
import {tool} from '@langchain/core/tools'
import {z} from 'zod'
import {MemorySaver} from '@langchain/langgraph'
import { vectorStore,addYTVideoToVectorStore } from './embeddings.js';



const retrievalTool = tool(async({query},{configurable : { video_id }})=>{
    const retrievedDocs = await vectorStore.similaritySearch(query,3,{ video_id}
);
    const serializedDocs = retrievedDocs.map((doc)=> doc.pageContent).join('\n')
    console.log(video_id)
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
const memorySaver = new MemorySaver()

const agent = createReactAgent({
    llm,
    tools: [retrievalTool],
    checkpointer : memorySaver
});
const video_id = "CPu3e9__7W8"


const results = await agent.invoke({
    messages: [{ role: 'user', content: 'provide me the video summary in 100 words'}]
},{configurable : {thread_id : 1,video_id}});





console.log(results.messages.at(-1)?.content)



