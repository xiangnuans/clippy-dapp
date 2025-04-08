"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Home, ShoppingBag, User } from "lucide-react";

// 进度步骤组件
function ProgressSteps({ currentStep }: { currentStep: number }) {
  const steps = ["Lockking", "Submitting", "Processing", "Formatting"];

  return (
    <div className="relative flex justify-between items-center w-full mb-8">
      {/* 进度线 - 背景 */}
      <div className="absolute h-[2px] bg-[#2C2D31] left-0 right-0 top-[7px]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3A3B40] to-transparent" />
      </div>

      {/* 进度线 - 活动 */}
      <div
        className="absolute h-[2px] bg-indigo-500 left-0 top-[7px] transition-all duration-500"
        style={{
          width: `${(currentStep / (steps.length - 1)) * 100}%`,
          boxShadow: "0 0 8px rgba(99, 102, 241, 0.5)",
        }}
      />

      {steps.map((step, index) => (
        <div key={step} className="flex flex-col items-center gap-2">
          <div className="relative">
            <div
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "bg-indigo-500 ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#141416]"
                  : index < currentStep
                  ? "bg-indigo-500/50 border border-indigo-500"
                  : "bg-[#2C2D31] border border-[#3A3B40]"
              }`}
            />
            {index === currentStep && (
              <div className="absolute -inset-1 bg-indigo-500/20 rounded-full animate-pulse" />
            )}
          </div>
          <span
            className={`text-xs transition-colors ${
              index === currentStep
                ? "text-white"
                : index < currentStep
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}

// 交易记录组件
function TransactionRecord() {
  const records = [
    { time: "2 days ago", type: "NFT #8", amount: "Reminted" },
    { time: "2 days ago", type: "Ethereum → BNB Chain", amount: "0.375 x" },
    { time: "2 days ago", type: "1 NFT #9", amount: "0.399hb979" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium mb-4">
        Transaction Record and Data Query
      </h2>
      <div className="space-y-3">
        {records.map((record, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 border-b border-gray-800"
          >
            <span className="text-gray-400">{record.time}</span>
            <span className="text-white">{record.type}</span>
            <span className="text-gray-400">{record.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 底部导航组件
function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#141416] border-t border-gray-800">
      <div className="max-w-md mx-auto px-5 h-full">
        <div className="flex justify-between items-center h-full">
          <button className="flex flex-col items-center justify-center gap-1">
            <Home className="w-5 h-5 text-gray-500" />
            <span className="text-xs text-gray-500">Home</span>
          </button>

          <button className="flex flex-col items-center justify-center gap-1">
            <ShoppingBag className="w-5 h-5 text-indigo-500" />
            <span className="text-xs text-indigo-500">Market</span>
          </button>

          <button className="flex flex-col items-center justify-center gap-1">
            <User className="w-5 h-5 text-gray-500" />
            <span className="text-xs text-gray-500">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CrossChainStatusPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [transactionId] = useState("0xc8bd...1a8");
  const [blockNumber] = useState("1,099");

  useEffect(() => {
    // 模拟进度更新
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < 3) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white pb-20">
      <div className="py-8">
        <div className="max-w-md mx-auto px-5">
          <div className="space-y-8">
            {/* 标题 */}
            <h1 className="text-2xl font-medium">
              Signature Generation and Validation
            </h1>

            {/* 进度部分 */}
            <div className="bg-[#141416] rounded-xl p-6 space-y-6">
              <ProgressSteps currentStep={currentStep} />

              <div className="space-y-4">
                <p className="text-gray-400">
                  Your NFT is being transferred to the receiver chain.
                  <span className="text-indigo-400 ml-2 cursor-pointer">
                    Transaction info
                  </span>
                </p>

                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Transaction ID</p>
                    <p className="text-white">{transactionId}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Block</p>
                    <p className="text-white">{blockNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 交易记录 */}
            <TransactionRecord />

            {/* 下一步按钮 */}
            <Button
              variant="primary"
              onClick={() => router.push("/dashboard")}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  );
}
