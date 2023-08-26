// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@api3/contracts/v0.8/interfaces/IProxy.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PhatRollupAnchor.sol";

contract TestLensApiConsumerContract is PhatRollupAnchor, Ownable {
    event ResponseReceived(uint reqId, string pair, uint256 value);
    event ErrorReceived(uint reqId, string pair, uint256 errno);

    uint constant TYPE_RESPONSE = 0;
    uint constant TYPE_ERROR = 2;
    uint public testValue = 0;
    uint public thresholdpayment1 = 0;
    uint public thresholdpayment2 = 0;
    uint public thresholdpayment3 = 0;
    uint public thresholdbonus = 0;

    uint public thresholdFollowers1 = 0;
    uint public thresholdFollowers2 = 0;
    uint public thresholdFollowers3 = 0;

    address public USDCdAPIProxy;
    address public ETHdAPIProxy;

    mapping(uint => string) requests;
    uint nextRequest = 1;

    constructor(address phatAttestor) {
        _grantRole(PhatRollupAnchor.ATTESTOR_ROLE, phatAttestor);
    }

    function setAttestor(address phatAttestor) public {
        _grantRole(PhatRollupAnchor.ATTESTOR_ROLE, phatAttestor);
    }

    function request(string calldata profileId) public {
        // assemble the request
        uint id = nextRequest;
        requests[id] = profileId;
        _pushMessage(abi.encode(id, profileId));
        nextRequest += 1;
    }

    // For test
    function malformedRequest(bytes calldata malformedData) public {
        uint id = nextRequest;
        requests[id] = "malformed_req";
        _pushMessage(malformedData);
        nextRequest += 1;
    }

    function _onMessageReceived(bytes calldata action) internal override {
        require(action.length == 32 * 3, "cannot parse action");
        (uint respType, uint id, uint256 data) = abi.decode(
            action,
            (uint, uint, uint256)
        );
        if (respType == TYPE_RESPONSE) {
            emit ResponseReceived(id, requests[id], data);
            delete requests[id];
            testValue = 1;
        } else if (respType == TYPE_ERROR) {
            emit ErrorReceived(id, requests[id], data);
            delete requests[id];
        }
    }

    //Price Oracles
    function setDapiProxy(address _usdc, address _eth) external onlyOwner {
        USDCdAPIProxy = _usdc;
        ETHdAPIProxy = _eth;
    }

    function readDapi(address _dapiProxy) public view returns (uint256) {
        (int224 value, ) = IProxy(_dapiProxy).read();
        uint256 price = uint224(value);
        return price;
    }

    function depositPayment(address _token) public {
        //apply thresholds
        thresholdpayment1 = 10e18;
        thresholdpayment2 = 10e18;
        thresholdpayment3 = 10e18;
        thresholdbonus = 10e18;

        thresholdFollowers1 = 1;
        thresholdFollowers2 = 2;
        thresholdFollowers3 = 3;

        uint payment = (thresholdpayment1 + thresholdpayment2 + thresholdpayment3 + thresholdbonus);

        //Must approve token before depositing
        try IERC20(_token).transferFrom(msg.sender, address(this), payment) {}
        catch {
            revert("deposit failed");
        }
    }

    function withdrawPayment(address _token, uint256 payment) public {
        //calcuate payouts and thresholds
        try IERC20(_token).transferFrom(msg.sender, address(this), payment) {}
        catch {
            revert("withdraw failed");
        }
    }
    
    // Check the followers
    function checkFollowers() public returns(uint) {
        //if follows meet a certain threshold, set a boolean to true
    }

    // put requirements
    function putRequirements() public {
        // put requirements for the profile
        uint followerCount = checkFollowers();
        if (followerCount > thresholdFollowers3) {
            // set the threshold
        }else if (followerCount > thresholdFollowers2) {
            // set the threshold
        }else if (followerCount > thresholdFollowers1) {
            // set the threshold
        }else {
            // set the threshold
        }

        //
        // Mapping from address to a bool array that indicates which thresholds have been claimed
        // mapping(address => bool[3]) public claimedThresholds;

        // Mapping from address to total amount earned
        mapping(address => uint256) public totalEarned;

        // put requirements
        function putRequirements() public {
        // put requirements for the profile
        uint followerCount = checkFollowers();
        uint256 rewardAmount = 10e18;  // Let's say 10 dollars in the appropriate unit (wei, for example)
    
        if (followerCount > thresholdFollowers3 && !claimedThresholds[msg.sender][2]) {
        // If the threshold is met and hasn't been claimed yet
        claimedThresholds[msg.sender][2] = true;
        totalEarned[msg.sender] += rewardAmount;
        } else if (followerCount > thresholdFollowers2 && !claimedThresholds[msg.sender][1]) {
        claimedThresholds[msg.sender][1] = true;
        totalEarned[msg.sender] += rewardAmount;
        } else if (followerCount > thresholdFollowers1 && !claimedThresholds[msg.sender][0]) {
        claimedThresholds[msg.sender][0] = true;
        totalEarned[msg.sender] += rewardAmount;
        }
    
     // At this point, totalEarned[msg.sender] contains the total amount earned by the user.

    }

    // calculate the value of eth
    function calculatePayout(uint256 _payment) public view returns(uint256) {
        uint256 ETHUSDCPrice = readDapi(ETHdAPIProxy);
       // uint256 USDCUSDPrice = readDapi(USDCdAPIProxy);
        uint256 requiredPayout = (_payment / ETHUSDCPrice);
        return requiredPayout;
    }
}
