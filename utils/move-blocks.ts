import { network } from "hardhat"

const sleep = (timeInMs: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timeInMs)
    })
}

// this is used when you really want to mimick the actions of a blockchain even while on localhost
const moveBlocks = async (amount: number, sleepAmount = 0) => {
    console.log("Moving blocks...")
    for (let index = 0; index < amount; index++) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        })
        if (sleepAmount) {
            console.log(`sleeping for ${sleepAmount}`)
            await sleep(sleepAmount)
        }
    }
}

export default moveBlocks
