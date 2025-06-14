import express from 'express'
import cors from 'cors'
import { agent } from './agent.js';
const app = express();
app.use(express.json())
app.use(cors());

app.get('/',(req,res)=>{

});



app.post('/generate',async(req,res)=>{
    const { query,video_id,thread_id } = req.body;

    const results = await agent.invoke({

    messages: [
        { 
            role: 'user',
            content: query
        }
        ]
    },
    {
        configurable : {thread_id,video_id}
    }
    );


    res.json(results.messages.at(-1)?.content);

})

app.listen(3000)