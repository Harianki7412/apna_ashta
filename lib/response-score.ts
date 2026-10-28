import { connectDB } from "./mongodb";
import { Conversation } from "@/models/Conversation";

export interface ResponseScore {
  avgHours: number | null;
  totalReplies: number;
  totalInquiries: number;
  responseRate: number; // 0-100
  label: string;
  emoji: string;
  color: "success" | "warning" | "danger" | "gray";
}

/**
 * Calculate average response time for an owner
 * across all their conversations.
 *
 * Logic:
 * 1. Find all conversations where this user is a participant
 * 2. For each message from the OTHER person (tenant),
 *    find the NEXT message from this user (owner reply)
 * 3. Calculate time difference
 * 4. Average all response times
 */
export async function getOwnerResponseScore(
  ownerId: string,
): Promise<ResponseScore> {
  try {
    await connectDB();

    const convos = await Conversation.find({
      participants: ownerId,
    })
      .select("messages participants")
      .lean();

    if (!convos.length) {
      return {
        avgHours: null,
        totalReplies: 0,
        totalInquiries: 0,
        responseRate: 0,
        label: "New owner",
        emoji: "🆕",
        color: "gray",
      };
    }

    let totalResponseTimeMs = 0;
    let responseCount = 0;
    let inquiryCount = 0;

    for (const convo of convos) {
      const messages = convo.messages || [];

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i] as any;

        // Is this message from someone OTHER than the owner?
        // (i.e., a tenant inquiry)
        if (msg.sender.toString() !== ownerId) {
          inquiryCount++;

          // Find the next message from the owner (their reply)
          for (let j = i + 1; j < messages.length; j++) {
            const nextMsg = messages[j] as any;

            if (nextMsg.sender.toString() === ownerId) {
              const inquiryTime = new Date(msg.createdAt).getTime();
              const replyTime = new Date(nextMsg.createdAt).getTime();
              const diff = replyTime - inquiryTime;

              // Ignore responses > 48h (owner probably didn't see it for days)
              // Ignore negative diffs (data errors)
              if (diff > 0 && diff < 48 * 60 * 60 * 1000) {
                totalResponseTimeMs += diff;
                responseCount++;
              }
              break; // Only count the FIRST reply
            }
          }
        }
      }
    }

    // No replies yet
    if (responseCount === 0) {
      return {
        avgHours: null,
        totalReplies: 0,
        totalInquiries: inquiryCount,
        responseRate: 0,
        label: inquiryCount > 0 ? "Hasn't replied yet" : "No inquiries yet",
        emoji: "💤",
        color: "gray",
      };
    }

    const avgHours = totalResponseTimeMs / (responseCount * 60 * 60 * 1000);
    const responseRate = Math.round((responseCount / inquiryCount) * 100);

    let label: string;
    let emoji: string;
    let color: "success" | "warning" | "danger" | "gray";

    if (avgHours < 1) {
      label = "⚡ Replies within an hour";
      emoji = "⚡";
      color = "success";
    } else if (avgHours < 3) {
      label = "⚡ Replies within 3 hours";
      emoji = "⚡";
      color = "success";
    } else if (avgHours < 12) {
      label = "🕐 Replies same day";
      emoji = "🕐";
      color = "warning";
    } else if (avgHours < 24) {
      label = "🕐 Replies within a day";
      emoji = "🕐";
      color = "warning";
    } else {
      label = "🐢 Slow responder";
      emoji = "🐢";
      color = "danger";
    }

    return {
      avgHours: Math.round(avgHours * 10) / 10,
      totalReplies: responseCount,
      totalInquiries: inquiryCount,
      responseRate,
      label,
      emoji,
      color,
    };
  } catch (e) {
    console.error("[getOwnerResponseScore]", e);
    return {
      avgHours: null,
      totalReplies: 0,
      totalInquiries: 0,
      responseRate: 0,
      label: "New owner",
      emoji: "🆕",
      color: "gray",
    };
  }
}
