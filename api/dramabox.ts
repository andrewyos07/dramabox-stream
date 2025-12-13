import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dramaboxServerApi } from "./lib/dramaboxServer.js";

type Action =
  | "search"
  | "detail"
  | "unlock"
  | "chapterVideo"
  | "allChapterUrls";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Method not allowed" });
    return;
  }

  const action = (req.query?.action || req.body?.action) as Action | undefined;
  if (!action) {
    res.status(400).json({ success: false, message: "Action is required" });
    return;
  }

  try {
    switch (action) {
      case "search": {
        const keyword = req.body?.keyword;
        if (!keyword) {
          res
            .status(400)
            .json({ success: false, message: "Keyword is required" });
          return;
        }
        const data = await dramaboxServerApi.searchBook(keyword);
        res.status(200).json({ success: true, data });
        return;
      }
      case "detail": {
        const id = req.body?.id;
        if (!id) {
          res.status(400).json({ success: false, message: "ID is required" });
          return;
        }
        const data = await dramaboxServerApi.getBookDetail(id);
        res.status(200).json({ success: true, data });
        return;
      }
      case "unlock": {
        const { bookId, chapterIdList } = req.body ?? {};
        if (!bookId || !Array.isArray(chapterIdList) || chapterIdList.length === 0) {
          res.status(400).json({
            success: false,
            message: "bookId and chapterIdList are required",
          });
          return;
        }
        const data = await dramaboxServerApi.batchUnlockEpisode(
          bookId,
          chapterIdList
        );
        res.status(200).json({ success: true, data });
        return;
      }
      case "chapterVideo": {
        const { bookId, chapterId, quality } = req.body ?? {};
        if (!bookId || !chapterId) {
          res.status(400).json({
            success: false,
            message: "bookId and chapterId are required",
          });
          return;
        }
        const data = await dramaboxServerApi.getChapterVideoUrl(
          bookId,
          chapterId,
          quality
        );
        res.status(200).json({ success: true, data });
        return;
      }
      case "allChapterUrls": {
        const { bookId, quality } = req.body ?? {};
        if (!bookId) {
          res
            .status(400)
            .json({ success: false, message: "bookId is required" });
          return;
        }
        const data = await dramaboxServerApi.getAllChapterUrls(
          bookId,
          quality
        );
        res.status(200).json({ success: true, data });
        return;
      }
      default: {
        res.status(400).json({ success: false, message: "Unknown action" });
        return;
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    const status = error instanceof Error && error.name === "UnlockError" ? 403 : 500;
    res.status(status).json({ success: false, message });
  }
}

