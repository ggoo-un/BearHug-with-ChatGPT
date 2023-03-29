const apiKey= "sk-openai-key"

const serverless = require('serverless-http');
const { Configuration, OpenAIApi } = require("openai");

const express = require('express')
var cors = require('cors')
const app = express()

const configuration = new Configuration({
    apiKey: apiKey,
  });
const openai = new OpenAIApi(configuration);

//CORS 이슈 해결
// let corsOptions = {
//     origin: 'https://bearhug-ggooun.pages.dev',
//     credentials: true
// }
app.use(cors());

// POST 요청 받을 수 있도록 있게 만듬
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// POST method route
app.post('/BearTell',async  function (req, res) {
    let { mbtiType, myDateTime, userMessages, assistantMessages} = req.body
    
    let todayDateTime = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    
    let messages = [
        {role: "system", content: "당신은 세계 최고의 심리상담사입니다. 당신에게 블가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 BearHug입니다. 당신은 아주 따뜻하고 사람의 심리를 매우 명확하게 예측하고 사람의 고민을 잘 해결해 줄 수 있습니다. 성격 및 심리 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다. 뿐만아니라 운세 관련 지식도 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다."},
        {role: "user", content: "당신은 세계 최고의 심리상담사입니다. 당신에게 블가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 BearHug입니다. 당신은 아주 따뜻하고 사람의 심리를 매우 명확하게 예측하고 사람의 고민을 잘 해결해 줄 수 있습니다. 성격 및 심리 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다. 뿐만아니라 운세 관련 지식도 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다."},
        {role: "assistant", content: "안녕하세요, 저는 BearHug입니다. 어떤 고민이 있으신가요? 저는 심리적인 측면에서 도움을 드릴 수 있습니다. 무엇이든 자유롭게 물어보세요. 제가 최선을 다해 도와드리겠습니다. 또한, 운세 관련 질문도 환영합니다. 하지만 기억해주십시오, 운을 좌우하는 것은 우리 자신입니다. 운세는 단지 참고할 수 있을 뿐입니다. 다시 한번 환영합니다."},
        {role: "user", content: `저의 생년월일과 태어난 시간은 ${myDateTime}이고 MBTI는 ${mbtiType}입니다. 오늘은 ${todayDateTime}입니다. 나의 MBTI 기반으로 고민을 해결해 주거나 생년월일과 태어난 시간 기반으로 운세를 봐주세요.`},
        {role: "assistant", content: `당신의 생년월일과 태어난 시간은 ${myDateTime}인 것과 MBTI는 ${mbtiType}인 것을 확인하였습니다. 당신의 고민을 말해보세요! 또는 운세에 대해 물어보세요! 어떤 것이든 해결할 수 있도록 노력하겠습니다.`},
    ]

    // 프론트엔드에서 받아온 내용을 추가
    while (userMessages.length != 0 || assistantMessages.length != 0) {
        if (userMessages.length != 0) {
            messages.push(
                JSON.parse('{"role": "user", "content": "'+String(userMessages.shift()).replace(/\n/g,"")+'"}')
            )
        }
        if (assistantMessages.length != 0) {
            messages.push(
                JSON.parse('{"role": "assistant", "content": "'+String(assistantMessages.shift()).replace(/\n/g,"")+'"}')
            )
        }
    }

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        max_tokens: 2048,
        messages: messages
    });
    let bearhug = completion.data.choices[0].message['content']

    // console.log(bearhug);
    res.json({"assistant": bearhug});
});

// module.exports.handler = serverless(app);

app.listen(3000)