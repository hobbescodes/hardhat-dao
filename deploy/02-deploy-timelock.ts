import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { developmentChains, MIN_DELAY, networkConfig } from "../hardhat-helper-config"
import verify from "../utils/verify"
import { ethers } from "hardhat"

const deployTimeLock: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const blockConfirmations = developmentChains.includes(network.name)
        ? 1
        : networkConfig[network.name]["blockConfirmations"]

    log("Deploying Timelock....")

    const timeLock = await deploy("TimeLock", {
        from: deployer,
        args: [MIN_DELAY, [], []],
        log: true,
        waitConfirmations: blockConfirmations,
    })
    log(`Deployed TimeLock to ${timeLock.address}`)

    if (!developmentChains.includes(network.name)) {
        await verify(timeLock.address, [ethers.utils.parseUnits("1000000")])
    }
}

export default deployTimeLock
