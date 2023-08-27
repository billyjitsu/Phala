import dynamic from "next/dynamic";
import Image from "next/image";
import { ConnectButton, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  getAccount,
  fetchBalance,
  readContract,
  writeContract,
  waitForTransaction,
} from "@wagmi/core";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import LoadingScreen from "./Loading";

import WethContract from "../contracts/weth.json";
import JobContract from "../contracts/job.json";

const Intro = () => {
  const { address, isConnected } = getAccount();
  const [loading, setLoading] = useState<boolean>(false);
  const [eventHappened, setEventHappened] = useState<boolean>(false);
  const [minted, setMinted] = useState<boolean>(false);

  const JOBCONTRACT = "0x8b5045b3f256eE98eDC46E0f611717F6B7ceFfdD";
  const WETHCONTRACT = "0x9292b8A52D33476dD26D46F0F21a91ae324F936A";

  const contractConfig = {
    address: JOBCONTRACT,
    abi: JobContract.abi,
  };

  const withdrawBounty = async () => {
    try {
      setLoading(true);
      const { hash } = await writeContract({
        ...contractConfig,
        functionName: "withdrawPayment",
        args: [WETHCONTRACT],
      } as unknown as any);
      setLoading(true);
      const data = await waitForTransaction({
        hash,
      });
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const depositBounty = async () => {
    try {
      setLoading(true);
      console.log("approving")
      const { hash: hashApproveSpend } = await writeContract({
        address: WETHCONTRACT,
        abi: WethContract.abi,
        functionName: "approve",
        args: [JOBCONTRACT, 50000000000000000000],
      } as unknown as any);
      console.log('waiting for transaction')
      const tx1 = await waitForTransaction({
        hash: hashApproveSpend,
      });
      console.log('depositin')
      const { hash: hashReclaimEth } = await writeContract({
        ...contractConfig,
        //chainId,
        functionName: "depositPayment",
        args: [WETHCONTRACT],
      } as unknown as any);

      const tx2 = await waitForTransaction({
        hash: hashReclaimEth,
      });

      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // getPastEvents();
  }, []);

  return (
    <div className="bg-black h-screen w-full ">
      <>
        {!loading && (
          <div className="flex flex-col md:flex-row px-5 justify-center lg:mr-16 h-screen w-full">
            <div className="relative flex w-full h-screen content-center items-center justify-center md:h-screen z-10 bg-black">
              <div className="container relative mx-auto p-16 md:p-0">
                <div className="flex flex-col  items-center justify-center -mt-6 md:mt-0 sm:-ml-0 md:-ml-12">
                  <div className="text-center md:text-left md:ml-16 space-x-2 space-y-5">
                    {!loading && !minted && (
                      <>
                        <h1 className="text-3xl md:text-5xl font-bold text-center text-white ">
                          Complete Your Task <br></br>
                          Get Paid
                        </h1>

                        <button
                          className="bg-red-700 hover:bg-red-600 rounded-full px-12 py-2  text-white font-bold"
                          onClick={() => depositBounty()}
                        >
                          Deposit Bounty
                        </button>

                        <button
                          className="bg-red-700 hover:bg-red-600 rounded-full px-12 py-2  text-white font-bold"
                          onClick={() => withdrawBounty()}
                        >
                          Withdraw Bounty
                        </button>
                      </>
                    )}

                    <div className="flex flex-col max-w-s items-center text-center">
                      {!isConnected && (
                        <>
                          <ConnectButton />
                        </>
                      )}
                    </div>
                    {minted && (
                      <div className="flex flex-col items-center text-center">
                        <button
                          className=" bg-red-700 hover:bg-red-600 rounded-full px-12 py-2  text-white font-bold"
                          onClick={() => setMinted(false)}
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Screen */}
        {loading && isConnected && <LoadingScreen />}
      </>
    </div>
  );
};

// export default Intro;
export default dynamic(() => Promise.resolve(Intro), { ssr: false });
