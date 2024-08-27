"use client";
import { tokenProvider } from "@/actions/stream.actions";
import Loader from "@/components/Loader";
import { useUser } from "@clerk/nextjs";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { ReactNode, useEffect, useState } from "react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return; // Wait until user data is loaded

    if (!user) {
      setError("User data is not available.");
      return;
    }

    if (!apiKey) {
      setError("Stream API key is missing.");
      return;
    }

    try {
      const client = new StreamVideoClient({
        apiKey,
        user: {
          id: user.id,
          name: user.username || user.id,
          image: user.imageUrl,
        },
        tokenProvider,
      });

      setVideoClient(client);
    } catch (err) {
      setError("Failed to initialize Stream Video Client.");
      console.error(err);
    }
  }, [user, isLoaded]);

  if (error) return <div className="error">{error}</div>;
  if (!videoClient) return <Loader />;

  return (
    <>
      <StreamVideo client={videoClient}>{children}</StreamVideo>
      <style jsx>{`
        .str-video__video-placeholder__avatar {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px; /* Adjust size as needed */
          height: 60px; /* Adjust size as needed */
          border-radius: 50%;
          background-color: pink; /* Adjust color as needed */
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          text-align: center;
          line-height: 60px; /* Adjust line-height to match the height */
        }
      `}</style>
    </>
  );
};

export default StreamVideoProvider;
