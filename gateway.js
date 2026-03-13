const fastify = require('fastify')({ logger: true });
const { ShelbyClient } = require('@shelby-xyz/sdk');
const geoip = require('geoip-lite');
require('dotenv').config();

const shelby = new ShelbyClient({ apiKey: process.env.SHELBY_API_KEY });

fastify.get('/route-model/:modelId', async (request, reply) => {
    const { modelId } = request.params;
    const ip = request.ip || '8.8.8.8'; // Giả lập IP người dùng
    const geo = geoip.lookup(ip);

    console.log(`🌍 Request from: ${geo ? geo.country : 'Unknown'} | IP: ${ip}`);

    try {
        // Tận dụng Single Global Namespace của Shelby
        // Gateway sẽ trả về URL tối ưu nhất dựa trên hạ tầng sợi quang DoubleZero
        const modelUrl = await shelby.getOptimizedUrl(modelId, {
            region: geo ? geo.region : 'global',
            highPriority: true
        });

        return {
            status: "Success",
            endpoint: modelUrl,
            location: geo ? geo.city : 'Global Node',
            network: "Shelby DoubleZero Fiber"
        };
    } catch (error) {
        reply.status(500).send({ error: "Gateway routing failed" });
    }
});

fastify.listen({ port: 3000, host: '0.0.0.0' }, () => {
    console.log('🚀 Shelby AI Gateway is orchestrating requests at port 3000');
});
