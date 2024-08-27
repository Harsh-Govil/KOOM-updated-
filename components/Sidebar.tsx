"use client";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <section className="sticky top-0 left-0 h-screen w-64 bg-gray-800 p-4 pt-12 text-white shadow-lg lg:w-72 flex-col justify-between">
      <div className="flex flex-col gap-8">
        {sidebarLinks.map((link) => {
          const isActive =
            pathname === link.route || pathname.startsWith(`${link.route}/`);
          return (
            <Link href={link.route} key={link.label}>
              <div
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg transition-all duration-300",
                  {
                    "bg-blue-700 hover:bg-blue-800": isActive,
                    "bg-gray-700 hover:bg-gray-600": !isActive,
                  }
                )}
              >
                <Image
                  src={link.imgURL}
                  alt={link.label}
                  width={34}
                  height={34}
                  className="transition-transform duration-300"
                />
                <p className="text-lg font-medium">{link.label}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Sidebar;
