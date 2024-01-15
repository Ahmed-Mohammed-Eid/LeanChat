/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        URL: "https://leanapi.gooadmin.art",
        SOCKET_URL: "wss://leanapi.gooadmin.art",
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /\.(mp3|ogg|wav)$/i,
            use: [
                {
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                    },
                },
            ],
        });
        return config;
    },
};

module.exports = nextConfig;
