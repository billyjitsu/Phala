import dynamic from "next/dynamic";
import Image from "next/image";
import { ConnectButton, connectorsForWallets } from "@rainbow-me/rainbowkit";
import heroImage from "../images/push-up.webp";

import backDropImage from "../images/pull.webp";
import hater from "../images/Hater.jpg";
import believer from "../images/Believer.jpg";
import { getAccount, fetchBalance, readContract, writeContract, waitForTransaction } from "@wagmi/core";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import LoadingScreen from "./Loading";

import type {
  UseContractReadConfig,
  UsePrepareContractWriteConfig,
  UseContractWriteConfig,
  UseContractEventConfig,
} from "wagmi";
// import EscrowContract from "../contract/escrow.json";

const Intro = () => {
  const { address, isConnected } = getAccount();
  const [loading, setLoading] = useState<boolean>(false);
  const [eventHappened, setEventHappened] = useState<boolean>(false);
  const [minted, setMinted] = useState<boolean>(false);
  const [fullHater, setHater] = useState<boolean>(false);

  const ESCROWCONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  const contractConfig = {
    address: ESCROWCONTRACT,
    abi: EscrowContract.abi,
  };

  const deposityBounty = async () => {
    // const parsedEth = ethers.utils.parseEther(amountEth.toString()) || 0;
    // console.log(parsedEth.toString());
    // if (addressIsConnected) {
      try {
        const { hash } = await writeContract({
          ...contractConfig,
         // chainId,
          functionName: "depositPayment",
          value: parsedEth,
          account: connectedAddress,
        });
        setLoading(true);
        const data = await waitForTransaction({
          hash,
        });
        // await getUpdatedBalances();
        setLoading(false);
      } catch (error) {
        console.log(error);
      // }
  };

  
  const handleWithdrawEth = async (amountSta) => {
    const parsedSta = ethers.utils.parseEther(amountSta.toString()) || "0";

    const uintSta = ethers.BigNumber.from(parsedSta);
    console.log(uintSta);
    if (addressIsConnected) {
      try {
        setIsLoading(true);
        const { hash: hashApproveSpend } = await writeContract({
          address: contractAddress,
          abi,
          chainId,
          functionName: "approve",
          args: [contractAddress, uintSta],
          account: connectedAddress,
        });

        const tx1 = await waitForTransaction({
          hash: hashApproveSpend,
        });

        const { hash: hashReclaimEth } = await writeContract({
          address: contractAddress,
          abi,
          chainId,
          functionName: "reclaimEth",
          args: [uintSta],
          account: connectedAddress,
        });

        const tx2 = await waitForTransaction({
          hash: hashReclaimEth,
        });

        await getUpdatedBalances();
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Connect wallet to update blockchain data");
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
            <div className="relative flex w-full h-screen content-center items-center justify-center md:h-screen z-10 bg-gradient-to-b from-black  to-slate-300">
              <div>
                {
                  <Image
                    src={backDropImage}
                    alt="heroBanner"
                    layout="fill"
                    objectFit="cover"
                    priority
                  />
                }
                {/* objectFit='cover' or 'contain' */}
              </div>
              {/*Old code */}
              {/* <div className="m-auto  pt-14 md:pt-0 ml-auto mr-auto md:ml-24 md:mr-10">
              <div>
                {<Image src={heroImage} alt="heroBanner" width={350} />}
              </div>
            </div> */}
              <div className="container relative mx-auto p-16 md:p-0">
                <div className="flex flex-col  items-center justify-center -mt-6 md:mt-0 sm:-ml-0 md:-ml-12">
                  <div className="text-center md:text-left md:ml-16 space-x-2 space-y-5">
                    {!loading && !minted && (
                      <>
                        <h1 className="text-3xl md:text-5xl font-bold text-center text-white ">
                          The Krinza{" "}
                          <span className="line-through text-red-500">10</span>{" "}
                          1 Push-Up Challenge <br></br>
                        </h1>
                        {!eventHappened && (
                          <h1 className="text-md md:text-2xl text-center text-white">
                            Choose your side:
                          </h1>
                        )}
                        {eventHappened && (
                          <h1 className="text-md md:text-2xl text-center text-white">
                            Claim your prize:
                          </h1>
                        )}
                      </>
                    )}

                    <div className="flex flex-col max-w-s items-center text-center">
                      {/* {!loading && isConnected && !eventHappened && !minted && (
                        <ChooseSideButton
                          contractConfig={contractConfig}
                          setLoading={setLoading}
                          setMinted={setMinted}
                          setHater={setHater}
                        />
                      )} */}
                      {/* {isConnected && eventHappened && !minted && (
                        <ClaimPrizeButton
                          contractConfig={contractConfig}
                          setLoading={setLoading}
                        />
                      )} */}
                      {!isConnected && (
                        <>
                          <ConnectButton />
                        </>
                      )}
                    </div>
                    {minted && (
                      <div className="flex flex-col items-center text-center">
                        {fullHater ? (
                          <>
                            <p className="text-white text-center">
                              What a Hater!!!
                            </p>
                            <Image
                              src={hater}
                              alt="nft"
                              width={300}
                              priority
                              className="mb-5"
                            />
                          </>
                        ) : (
                          <>
                            <p className="text-white text-center">
                              A true believer, a friend of the people
                            </p>
                            <Image
                              src={believer}
                              alt="nft"
                              width={300}
                              priority
                              className="mb-5"
                            />
                          </>
                        )}

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
