import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { developmentChains, networkConfig } from "../hardhat-helper-config"
import verify from "../utils/verify"
import { ethers } from "hardhat"

const deployBox: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()

    const blockConfirmations = developmentChains.includes(network.name)
        ? 1
        : networkConfig[network.name]["blockConfirmations"]

    log("Deploying Box...")
    const box = await deploy("Box", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: blockConfirmations,
    })

    const timeLock = await ethers.getContract("TimeLock")
    const boxContract = await ethers.getContractAt("Box", box.address)
    const transferOwnershipTx = await boxContract.transferOwnership(timeLock.address)
    await transferOwnershipTx.wait(1)

    log("YOU DID IT!!!!")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(box.address, [])
    }
}

export default deployBox
