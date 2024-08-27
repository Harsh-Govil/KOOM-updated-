import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface HomeCardProps {
  className?: string;
  img: string;
  title: string;
  description: string;
  handleClick?: () => void;
}

const HomeCard: React.FC<HomeCardProps> = ({
  className,
  img,
  title,
  description,
  handleClick,
}) => {
  return (
    <section
      className={cn(
        "relative bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 px-5 py-7 flex flex-col justify-between w-full xl:max-w-[270px] min-h-[260px] rounded-xl cursor-pointer hover:shadow-2xl transition-shadow duration-300 border border-gray-700",
        className
      )}
      onClick={handleClick}
    >
      {/* Card Image Container */}
      <div className="flex items-center justify-center bg-gray-600 rounded-full p-4 shadow-lg ">
        <Image src={img} alt="Card Image" width={40} height={40} />
      </div>

      {/* Title and Description */}
      <div className="flex flex-col gap-3 mt-5">
        <h1 className="text-2xl font-bold text-green">{title}</h1>
        <p className="text-md text-gray-300">{description}</p>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 rounded-xl bg-black opacity-10 transition-opacity duration-300 group-hover:opacity-20"></div>
    </section>
  );
};

export default HomeCard;
