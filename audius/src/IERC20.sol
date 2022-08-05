pragma solidity ^0.8.0;

interface IERC20 {
    function balanceOf(address who) external view returns (uint256 amount);
}
