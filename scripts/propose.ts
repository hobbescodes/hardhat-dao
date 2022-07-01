import { ethers, network } from "hardhat"
import {
    developmentChains,
    FUNC_TO_CALL,
    NEW_STORE_VALUE,
    PROPOSAL_DESCRIPTION,
    VOTING_DELAY,
    proposalsFile,
} from "../hardhat-helper-config"
import moveBlocks from "../utils/move-blocks"
import * as fs from "fs"

const propose = async (args: any[], functionToCall: string, proposalDescription: string) => {
    const governor = await ethers.getContract("GovernorContract")
    const box = await ethers.getContract("Box")

    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
    // console.log(encodedFunctionCall)
    console.log(`Proposing ${functionToCall} on ${box.address} with ${args}`)
    console.log(`Proposal Description: \n ${proposalDescription}`)
    const proposeTx = await governor.propose(
        [box.address],
        [0],
        [encodedFunctionCall],
        proposalDescription
    )

    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_DELAY + 1, 1000)
    }

    const proposeTxReceipt = await proposeTx.wait(1)

    const proposalId = proposeTxReceipt.events[0].args.proposalId
    console.log(`Proposed with proposal ID:\n  ${proposalId}`)

    const proposalState = await governor.state(proposalId)
    const proposalSnapShot = await governor.proposalSnapshot(proposalId)
    const proposalDeadline = await governor.proposalDeadline(proposalId)

    let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf-8"))
    proposals[network.config.chainId!.toString()].push(proposalId.toString())
    fs.writeFileSync(proposalsFile, JSON.stringify(proposals))

    // The state of the proposal. 1 is not passed. 0 is passed.
    console.log(`Current Proposal State: ${proposalState}`)
    // What block # was the snapshot taken for the proposal
    console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
    // The block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`)
}

propose([NEW_STORE_VALUE], FUNC_TO_CALL, PROPOSAL_DESCRIPTION)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

export default propose
