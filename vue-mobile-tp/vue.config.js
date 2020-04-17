module.exports = {
    css: {
        loaderOptions: {
            postcss: {
                plugins: [
                    require("postcss-pxtorem")({
                        rootValue: 100,
                        propList: ["*"],
                        minPixelValue: 0,
                        exclude: /node_modules/i
                    })
                ]
            }
        }
    }
};