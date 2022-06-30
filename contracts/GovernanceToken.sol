// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GovernanceToken is ERC20Votes {
    uint256 private s_maxSupply;

    constructor(uint256 _maxSupply) ERC20("GovernanceToken", "GT") ERC20Permit("GovernanceToken") {
        s_maxSupply = _maxSupply;
        _mint(msg.sender, s_maxSupply);
    }

    function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20Votes) {
        super._burn(account, amount);
    }

    function getMaxSupply() public view returns (uint256) {
        return s_maxSupply;
    }
}