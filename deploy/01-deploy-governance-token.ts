import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { networkConfig, developmentChains } from "../hardhat-helper-config"
import verify from "../utils/verify"
import { ethers } from "hardhat"

const deployGovernanceToken: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const MAX_SUPPLY = ethers.utils.parseUnits("1000000")

    const blockConfirmations = developmentChains.includes(network.name)
        ? 1
        : networkConfig[network.name]["blockConfirmations"]

    log("Deploying Governance Token....")
    const governanceToken = await deploy("GovernanceToken", {
        from: deployer,
        args: [MAX_SUPPLY],
        log: true,
        waitConfirmations: blockConfirmations,
    })
    log(`Deployed Governance Token to ${governanceToken.address}`)

    await delegate(governanceToken.address, deployer)

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(governanceToken.address, [])
    }
}

const delegate = async (governanceTokenAddress: string, delegatedAccount: string) => {
    const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress)
    // delegates the voting power of the delegatedAccount
    const tx = await governanceToken.delegate(delegatedAccount)
    await tx.wait(1)
    // numCheckpoints essentially establishes how much voting power delegatedAccount has
    console.log(`Checkpoints ${await governanceToken.numCheckpoints(delegatedAccount)}`)
}

export default deployGovernanceToken
