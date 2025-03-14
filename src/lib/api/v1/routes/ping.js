import { exampleMiddleware, authenticateToken, setStdRespHeaders } from "../middleware/index.js";

const getPing = (req, res) => { 
    console.log("PING JS -> WORKING PING NEW!");
    return res.status(200).send('pong'); 
}

export default {
    getPing: [
        exampleMiddleware,
        setStdRespHeaders,
        authenticateToken,
        getPing
    ]
};