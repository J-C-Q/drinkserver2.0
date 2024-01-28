"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaPaypal } from "react-icons/fa";
interface PayButtonProps {
  label: string;
  href: string;
}
export const PayButton = ({ href, label }: PayButtonProps) => {
  return (
    <Button
      variant="secondary"
      className="font-normal mx-auto bg-[linear-gradient(110deg,#fbbf24,45%,#fde68a,55%,#fbbf24)] bg-[length:200%_100%] animate-shimmer delay-1000 active:animate-shimmer transition-colors hover:animate-shimmer hover:delay-0"
      size="sm"
      asChild
    >
      <a href={href} target="_blank" className="font-semibold">
        <FaPaypal className="h-5 w-5" />
        <span className="ml-1">{label}</span>
      </a>
    </Button>
  );
};
