interface ShareData {
  title: string;
  text: string;
  url: string;
}

export const useShare = () => {
  const share = async ({ title, text, url }: ShareData) => {
    // 1️⃣ Native Share (Preferred)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch (error) {
        console.error("Share cancelled or failed", error);
      }
    }

    // 2️⃣ Fallback – Copy link
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard");
    } catch {
      alert("Unable to share");
    }
  };

  return { share };
};
