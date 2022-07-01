import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import {
    networkConfig,
    developmentChains,
    VOTING_DELAY,
    VOTING_PERIOD,
    QUORUM_PERCENTAGE,
} from "../hardhat-helper-config"
import verify from "../utils/verify"

const deployGovernorContract: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const governanceToken = await get("GovernanceToken")
    const timeLock = await get("TimeLock")

    const blockConfirmations = developmentChains.includes(network.name)
        ? 1
        : networkConfig[network.name]["blockConfirmations"]

    log("Deploying Governor Contract...")

    const governorContract = await deploy("GovernorContract", {
        from: deployer,
        args: [
            governanceToken.address,
            timeLock.address,
            VOTING_DELAY,
            VOTING_PERIOD,
            QUORUM_PERCENTAGE,
        ],
        log: true,
        waitConfirmations: blockConfirmations,
    })
    log(`Deployed Governor Contract to ${governorContract.address}`)

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(governorContract.address, [])
    }
}

export default deployGovernorContract
