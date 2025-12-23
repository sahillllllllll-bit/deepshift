import React from "react";
import { useShare } from "../hooks/useShare";
import { Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  text,
  url,
}) => {
  const { share } = useShare();

  return (
    <button
      onClick={() => share({ title, text, url })}
      aria-label="Share this page"
    >
        <div className="flex items-center gap-2 border border-purple-700 px-3 py-1 rounded-full hover:bg-purple-700"><Share2 />Share</div>
      
     
    </button>
  );
};

export default ShareButton;
