require('dotenv').config();
const rp = require('request-promise');

const sendWebhook = async (ctx) => {
    let options = {
        uri: process.env.WEBHOOK,
        method: "POST",
        headers: {
            "user-agent": "*",
            "content-type": "application/json",
            "accept-encoding": "gzip, br"
        },
        json: {
            embeds: [{
                fields: [
                    {
                        name: "Contract",
                        value: ctx.contract
                    },
                    {
                        name: 'Hash',
                        value: ctx.hash,
                    },
                    {
                        name: 'Tx Fee',
                        value: ctx.txFee,
                    },
                    {
                        name: 'Gas Limit',
                        value: ctx.gasLimit
                    },
                    {
                        name: 'Gas Used',
                        value: ctx.gasUsed
                    },
                    {
                        name: 'Chain ID',
                        value: ctx.chainId
                    }
                ]
            }]
        }
    }
    await rp(options); 
}

module.exports = { sendWebhook };