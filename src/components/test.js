const getReplies = async (channel, ts) => {
    const params = new URLSearchParams({
      limit: '1000',
      channel,
      ts,
    });
   
    const res = await fetch(`https://slack.com/api/conversations.replies?${params.toString()}`, {
        method: "GET", 
        headers: {
            "Authorization": "Bearer xoxb-71317409943-3325425383202-Xojudvr8nDogSBotCSmTFLaS"
        }
    });
    const json = await res.json();
   
    return {
      response: json,
      replies: json.messages
    };
};
   
const {replies} = await getReplies(inputData.channel, inputData.threadTs || inputData.ts);

const formattedMessages = replies.map((reply) => `
    ${reply.user || `[Unknown Slack user: ${reply.user}]`}:
    ${reply.text}
    `.trim());

output = {
    replies: JSON.stringify(replies),
    formatted: formattedMessages.join('\n\n'),
};