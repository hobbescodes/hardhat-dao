import {
    developmentChains,
    proposalsFile,
    PROPOSAL_INDEX,
    VOTING_PERIOD,
} from "../hardhat-helper-config"
import * as fs from "fs"
import { ethers, network } from "hardhat"
import moveBlocks from "../utils/move-blocks"

const main = async (proposalIndex: number) => {
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf-8"))
    const proposalId = proposals[network.config.chainId!][proposalIndex]
    // 0 = Against, 1 = For, 2 = Abstain
    const voteWay = 1
    const reason = "the wood chuck chucks a lot of wood"
    await vote(proposalId, voteWay, reason)
}

export const vote = async (proposalId: string, voteWay: number, reason: string) => {
    console.log("Voting...")
    const governor = await ethers.getContract("GovernorContract")
    // TODO: implement castVoteWithSig, which involves metatransactions (snapshot + Chainlink)
    const voteTxResponse = await governor.castVoteWithReason(proposalId, voteWay, reason)
    const voteTxReceipt = await voteTxResponse.wait(1)
    console.log(voteTxReceipt.events[0].args.reason)
    const initialProposalState = await governor.state(proposalId)
    console.log(`Initial Proposal State: ${initialProposalState}`)
    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1)
    }
    const updatedProposalState = await governor.state(proposalId)
    console.log(`Current Proposal State: ${updatedProposalState}`)
    console.log("Voted!")
}

main(PROPOSAL_INDEX)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
