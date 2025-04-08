"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// 六边形 NFT 图标组件
function HexagonIcon() {
  return (
    <div className="relative h-12 w-12 flex items-center justify-center">
      {/* 背景六边形 */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="absolute h-full w-full text-[#3730A3]/20"
      >
        <path
          d="M4.5 7.5C4.5 6.88406 4.74364 6.29338 5.17157 5.86545L7.86545 3.17157C8.29338 2.74364 8.88406 2.5 9.5 2.5H14.5C15.1159 2.5 15.7066 2.74364 16.1345 3.17157L18.8284 5.86545C19.2564 6.29338 19.5 6.88406 19.5 7.5V12.5C19.5 13.1159 19.2564 13.7066 18.8284 14.1345L16.1345 16.8284C15.7066 17.2564 15.1159 17.5 14.5 17.5H9.5C8.88406 17.5 8.29338 17.2564 7.86545 16.8284L5.17157 14.1345C4.74364 13.7066 4.5 13.1159 4.5 12.5V7.5Z"
          fill="currentColor"
          strokeWidth="1"
          stroke="currentColor"
        />
      </svg>
      {/* 前景六边形 */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="relative h-6 w-6 text-[#3730A3]"
      >
        <path
          d="M4.5 7.5C4.5 6.88406 4.74364 6.29338 5.17157 5.86545L7.86545 3.17157C8.29338 2.74364 8.88406 2.5 9.5 2.5H14.5C15.1159 2.5 15.7066 2.74364 16.1345 3.17157L18.8284 5.86545C19.2564 6.29338 19.5 6.88406 19.5 7.5V12.5C19.5 13.1159 19.2564 13.7066 18.8284 14.1345L16.1345 16.8284C15.7066 17.2564 15.1159 17.5 14.5 17.5H9.5C8.88406 17.5 8.29338 17.2564 7.86545 16.8284L5.17157 14.1345C4.74364 13.7066 4.5 13.1159 4.5 12.5V7.5Z"
          fill="currentColor"
          strokeWidth="1"
          stroke="currentColor"
        />
      </svg>
    </div>
  );
}

// 加载动画组件
function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative h-12 w-12 mb-3">
        <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-indigo-600 rounded-full border-t-transparent animate-spin" />
      </div>
      <span className="text-white/80 text-sm">{message}</span>
    </div>
  );
}

// 骨架屏组件
function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center space-x-2">
        <div className="h-5 w-5 bg-gray-700 rounded" />
        <div className="h-5 w-24 bg-gray-700 rounded" />
      </div>

      {/* Select NFT Section Skeleton */}
      <div className="space-y-4">
        <div className="h-7 w-24 bg-gray-700 rounded" />
        <div className="h-[72px] bg-gray-700/50 rounded-xl p-4 flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-gray-600" />
          <div className="space-y-2">
            <div className="h-5 w-20 bg-gray-600 rounded" />
            <div className="h-4 w-16 bg-gray-600 rounded" />
          </div>
        </div>
      </div>

      {/* Transfer To Section Skeleton */}
      <div className="space-y-4">
        <div className="h-7 w-28 bg-gray-700 rounded" />
        <div className="h-[56px] bg-gray-700/50 rounded-xl p-4 flex items-center justify-between">
          <div className="h-5 w-24 bg-gray-600 rounded" />
          <div className="h-5 w-5 bg-gray-600 rounded" />
        </div>
      </div>

      {/* Button Skeleton */}
      <div className="h-12 bg-gray-700/50 rounded-lg" />
    </div>
  );
}

export default function CrossChainPage() {
  const router = useRouter();
  const [isTransferring, setIsTransferring] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    setIsTransferring(true);
    // 模拟转账过程
    setTimeout(() => {
      setIsTransferring(false);
      router.push("/cross-chain/status");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white py-8">
      <div className="max-w-md mx-auto px-5">
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-white/80 hover:text-white mb-6"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Cross-Chain</span>
              </button>
            </div>

            {/* Select NFT Section */}
            <div className="mb-8 space-y-4">
              <h2 className="text-lg font-medium">Select NFT</h2>
              <div
                className="bg-[#141416] rounded-xl p-4 flex items-center space-x-4 cursor-pointer hover:bg-[#1a1a1f] transition-colors"
                onClick={() => {}}
              >
                <HexagonIcon />
                <div>
                  <div className="font-medium">My NFT</div>
                  <div className="text-sm text-white/60">#1234</div>
                </div>
              </div>
            </div>

            {/* Transfer To Section */}
            <div className="mb-8 space-y-4">
              <h2 className="text-lg font-medium">Transfer To</h2>
              <div
                className="bg-[#141416] rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#1a1a1f] transition-colors"
                onClick={() => {}}
              >
                <span className="font-medium">Ethereum</span>
                <ChevronRight className="h-5 w-5 text-white/60" />
              </div>
            </div>

            {isTransferring ? (
              <LoadingSpinner message="Transferring..." />
            ) : (
              /* Next Button */
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={isTransferring}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Next
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
